'use client';

import { useRef, useEffect, useMemo } from 'react';
import { Box, Spinner } from 'theme-ui';
import * as d3 from 'd3';

import { arrayRange, getDifferenceInMonths, useStore } from '../store/index';

function getXTicks(minDate, maxDate) {
  const difference = getDifferenceInMonths(minDate, maxDate) - 1;
  const numYears = (difference - 1) / 12;
  let dateFormatter = null;

  if (numYears <= 1) {
    // show ticks every month for <= 1 year of data
    dateFormatter = d3.timeMonth;
  } else if (difference <= 24) {
    // show ticks at quarterly intervals for 1–2 years of data
    dateFormatter = d3.timeMonth.every(3);
  } else {
    // show ticks for every january for 2+ years of data
    dateFormatter = d3.timeYear;
  }

  return dateFormatter.range(new Date(minDate), new Date(maxDate));
}

export default function Timeseries() {
  const containerRef = useRef(null);

  const variable = useStore((state) => state.variable);
  const historicalDates = useStore((state) => state.historicalDates);
  // these dates could also be derived from plotData, which might be better when filtering data
  const minDate = historicalDates.at(0);
  const maxDate = historicalDates.at(-1);
  const historicalSliderIndex = useStore((state) => state.historicalSliderIndex);
  const date = historicalDates.at(historicalSliderIndex);
  const sliding = useStore((state) => state.sliding);
  const colormap = useStore((state) => state.colormap)();
  const plotData = useStore((state) => state.plotData);
  const queryStatus = useStore((state) => state.queryStatus);
  const gintoUri = useStore((state) => state.gintoUri);

  const varMax = variable === 'percentile' ? 100 : 300;
  const yAxisTitle = variable === 'percentile' ? 'Percentile' : 'Precipitation (mm)';

  const min = 0;
  const max = varMax;
  const range = max - min;
  const nBins = 11;
  const binWidth = range / nBins;
  let thresholds = arrayRange(min + binWidth, max + binWidth, binWidth);
  const colorScale = d3.scaleThreshold().domain(thresholds).range(colormap);

  // chart layout
  const width = 310;
  const height = 270;
  const paddingBottom = 35;
  const paddingTop = 10;
  const paddingLeft = 50;
  const paddingRight = 10;
  const extraPaddingX = 10;
  const extraPaddingY = 10;
  const xTickPadding = 10;
  const yTickPadding = 10;
  const paddingYLabel = 10;

  // x axis
  const xDomain = [new Date(minDate), new Date(maxDate)];
  const xScale = d3
    .scaleTime()
    .domain(xDomain)
    .range([paddingLeft + xTickPadding, width - paddingRight - extraPaddingX]);

  const xTicks = getXTicks(minDate, maxDate);
  // const xAxis = d3.axisBottom(xScale).tickValues(xTicks)

  // y axis
  const yScale = d3
    .scaleLinear()
    .domain([0, varMax])
    .range([height - paddingBottom - extraPaddingY - yTickPadding, paddingTop + yTickPadding]);

  const yTicks =
    variable === 'percentile' ? [0, 25, 50, 75, 100] : [0, 50, 100, 150, 200, 250, 300];
  // const yAxis = d3.axisLeft(yScale).tickValues(yTicks)

  const hasData = Boolean(variable && plotData?.[variable]);

  // function that (re)draws the chart whenever the container size changes.
  const chartData = useMemo(() => {
    if (!hasData) return null;

    // convert data from {date: [value]} to {[date, value]} format,
    // which many d3 methods expect.
    const timeseriesArray = historicalDates
      .filter((d) => plotData?.[variable][d])
      .map((d) => [new Date(d), plotData?.[variable][d][0]]);

    // the formatted data that we are going to use for the plot
    // differs for each variable
    let data;

    if (variable === 'percentile') {
      // compute bar width from the closest pair of adjacent bars
      const positions = timeseriesArray.map(([date]) => xScale(new Date(date)));
      const minDelta = positions.length > 1 ? d3.min(d3.pairs(positions, (a, b) => b - a)) : 5;
      const barWidth = minDelta * 1.0; // thin bars

      data = timeseriesArray.map(([date, value]) => {
        const x = xScale(new Date(date));
        const y0 = yScale(50);
        const y1 = yScale(value);

        return (
          <rect
            key={`bar-${date}`}
            x={x - barWidth / 2} // center on the date
            y={Math.min(y0, y1)} // top of the bar
            width={barWidth}
            height={Math.abs(y0 - y1)}
            fill={value >= 50 ? '#64bac5' : '#ef7071'}
            stroke="none"
          />
        );
      });
    } else if (variable === 'total') {
      const lineGenerator = d3
        .line()
        .defined((d) => !isNaN(d[1])) // skip missing/gap points
        .x((d) => xScale(new Date(d[0])))
        .y((d) => yScale(d[1]))
        .curve(d3.curveMonotoneX);

      data = (
        <path
          key={'line-path'}
          id="line-path"
          d={lineGenerator(timeseriesArray)}
          fill="none"
          stroke="black"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    } else {
      data = null;
    }

    return (
      <g key={'timeseries-data-container'} id="timeseries-data-container">
        {data}
      </g>
    );
  }, [hasData, plotData, variable]);

  return (
    <Box
      id={'chart'}
      ref={containerRef}
      preserveAspectRatio="xMidYMid meet"
      sx={{
        width: '100%',
        height: '100%',
      }}
    >
      {/* this is the container svg */}
      <svg id={'timeseries-chart'} width={'100%'} height={'100%'}>
        {gintoUri && (
          <style type="text/css">
            {`
                            @font-face {
                                font-family: 'ginto-normal';
                                src: url('${gintoUri}') format('truetype');
                            }
                        `}
          </style>
        )}

        {/* this ensures that the svg or png has a white background */}
        <rect width={'100%'} height={'100%'} fill={'background'} />

        {/* 
            this is a more concise way of adding the x-axis line and ticks,
            but it makes it harder to manually control the style of certain elements
        */}
        {/* 
            <g 
                id={'x-axis'} 
                transform={`translate(${paddingLeft}, ${height - paddingBottom - extraPaddingY})`}
                ref={(node) => {
                    if (node) {
                        d3.select(node)
                            .call(xAxis.tickFormat(d3.timeFormat('%b %y')))
                            .selectAll('.tick text')
                            .style('font-family', 'ginto-normal');
                    }
                }}
            /> 
        */}

        <g
          id={'x-axis'}
          transform={`translate(${paddingLeft}, ${height - paddingBottom - extraPaddingY})`}
        >
          {/* axis line */}
          <line
            key={`x-axis-line`}
            x1={0}
            y1={0}
            x2={width - paddingRight - paddingLeft}
            y2={0}
            stroke={'currentColor'}
            fill={'none'}
          />
        </g>

        <g id={'x-axis-label'}>
          <text
            key={`x-label`}
            x={(width + paddingLeft) / 2}
            y={height - 15}
            textAnchor={'middle'}
            fontSize={'0.75rem'}
            fontFamily={'ginto-normal'}
          >
            {'Time'}
          </text>
        </g>

        {/* x-axis tick labels */}
        {xTicks.map((date, idx) => (
          <g key={`x-tick-${idx}`} className={'x-axis-tick'}>
            <line
              key={`x-tick-line-${idx}`}
              x1={xScale(date)}
              y1={height - paddingBottom - extraPaddingY}
              x2={xScale(date)}
              y2={height - paddingBottom - extraPaddingY / 2}
              stroke={'currentColor'}
              fill={'none'}
            />
            <text
              key={`x-tick-label-${idx}`}
              x={xScale(date)}
              y={height - paddingBottom + extraPaddingY / 2}
              textAnchor={'middle'}
              fontSize={'0.625rem'}
              fontFamily={'ginto-normal'}
            >
              {/* Jan 2023 */}
              {/* {d3.timeFormat('%b %Y')(date)}  */}
              {/* 01-23 */}
              {/* {d3.timeFormat('%m-%y')(date)} */}
              {/* Jan 23 */}
              {d3.timeFormat('%b %y')(date)}
            </text>
          </g>
        ))}

        <g id={'y-axis'} transform={`translate(${paddingLeft}, 0)`}>
          {/* axis line */}
          <line
            key={`y-axis-line`}
            x1={0}
            y1={paddingTop}
            x2={0}
            y2={height - paddingBottom - extraPaddingY}
            stroke={'currentColor'}
            fill={'none'}
          />

          <g id={'y-axis-label'}>
            <text
              key={`y-label`}
              x={-20}
              y={height / 2}
              transform={`rotate(270, ${-35}, ${height / 2})`}
              textAnchor={'middle'}
              fontSize={'0.75rem'}
              fontFamily={'ginto-normal'}
            >
              {yAxisTitle}
            </text>
          </g>

          {yTicks.map((value, idx) => (
            <g key={`y-tick-${idx}`}>
              <line
                key={`y-tick-line-${idx}`}
                x1={0}
                y1={yScale(value)}
                x2={-5}
                y2={yScale(value)}
                stroke={'currentColor'}
                fill={'none'}
              />
              <text
                key={`y-tick-label-${idx}`}
                x={-15}
                y={yScale(value)}
                dy={'0.05em'}
                textAnchor={'middle'}
                dominantBaseline={'middle'}
                fontSize={'0.625rem'}
                fontFamily={'ginto-normal'}
              >
                {value}
              </text>
            </g>
          ))}
        </g>

        {chartData}

        <g id="date-value-tracker">
          <line
            //add line tracking time slider date
            key={'historical-date-line'}
            id={'historical-date-line'}
            x1={xScale(new Date(date))}
            x2={xScale(new Date(date))}
            y1={paddingTop}
            y2={height - paddingBottom - extraPaddingY}
            stroke={'#808080'}
            strokeWidth={1.5}
            strokeDasharray={'4'}
            fill={'none'}
            opacity={sliding ? 1 : 0}
            style={{ transition: 'opacity .15s' }}
          />

          {plotData && plotData[variable] && plotData[variable][date] && (
            <circle
              // add circle tracking value at time slider date
              key={`historical-date-circle`}
              id={`historical-date-circle`}
              cx={xScale(new Date(date))}
              cy={yScale(plotData[variable][date][0])}
              r={4}
              stroke={'#1b1e23'}
              strokeWidth={0.5}
              opacity={sliding ? 1 : 0}
              style={{ transition: 'opacity .15s' }}
            />
          )}
        </g>
      </svg>

      {queryStatus === 'loading' && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Spinner size={35} strokeWidth={3} />
        </Box>
      )}
    </Box>
  );
}
