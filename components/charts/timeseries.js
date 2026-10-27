'use client';

import { useRef, useMemo } from 'react';
import { Box } from 'theme-ui';
import * as d3 from 'd3';

import { clamp } from './utils';
import { getDifferenceInMonths, useStore } from '../store/index';

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
  const clim = useStore((state) => state.clim);
  const [min, max] = clim;
  const plotData = useStore((state) => state.plotData);
  const gintoUri = useStore((state) => state.gintoUri);
  const fontCSS = `@font-face {
                      font-family: 'ginto-normal';
                      src: url('${gintoUri}') format('truetype');
                  }`;

  // chart layout
  const width = 310;
  const height = 270;
  const inset = 10;
  const tickSize = 5;

  const marginLeft = 55;
  const marginRight = 20;
  const marginTop = 15;
  const marginBottom = 55;

  const x0 = marginLeft + inset;
  const x1 = width - marginRight - inset;
  const y0 = marginTop + inset;
  const y1 = height - marginBottom - inset;

  // x axis
  const xTicks = getXTicks(minDate, maxDate);
  const xDomain = [new Date(minDate), new Date(maxDate)];
  const xScale = d3.scaleTime().domain(xDomain).range([x0, x1]);

  // y axis
  const yTicks =
    variable === 'percentile' ? d3.range(min, max + 25, 25) : d3.range(min, max + 50, 50);
  const yScale = d3.scaleLinear().domain([min, max]).range([y1, y0]);
  const yAxisLabel = variable === 'percentile' ? 'Percentile' : 'Precipitation (mm)';

  const lineGenerator = d3
    .line()
    .defined((d) => !isNaN(d[1])) // skip missing / gap points
    .x((d) => xScale(new Date(d[0])))
    .y((d) => yScale(d[1]))
    .curve(d3.curveMonotoneX);

  const hasData = Boolean(variable && plotData?.[variable]);

  // function that (re)draws the chart whenever the container size changes.
  const chartData = useMemo(() => {
    if (!hasData) return null;

    // convert data from {date: [value]} to {[date, value]} format,
    // which many d3 methods expect.
    const timeseriesArray = historicalDates
      .filter((d) => plotData?.[variable][d])
      .map((d) => [new Date(d), plotData?.[variable][d][0]])
      .map(([d, v]) => [d, clamp(v, min, max)])
      .filter(([, v]) => !Number.isNaN(v));

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
        {gintoUri && <style type="text/css">{fontCSS}</style>}

        {/* this ensures that the svg or png has a white background */}
        <rect width={'100%'} height={'100%'} fill={'background'} />

        <g id={'x-axis'} transform={`translate(0, ${y1 + inset})`}>
          {/* axis line */}
          <line
            key={`x-axis-line`}
            x1={marginLeft}
            y1={0}
            x2={width - marginRight}
            y2={0}
            stroke={'currentColor'}
            fill={'none'}
          />

          {/* x-axis tick labels */}
          {xTicks.map((date, idx) => (
            <g key={`x-tick-${idx}`} className={'x-axis-tick'}>
              <line
                key={`x-tick-line-${idx}`}
                x1={xScale(date)}
                y1={0}
                x2={xScale(date)}
                y2={tickSize}
                stroke={'currentColor'}
                fill={'none'}
              />
              <text
                key={`x-tick-label-${idx}`}
                x={xScale(date)}
                y={tickSize + 12}
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

          <g id={'x-axis-label'}>
            <text
              key={`x-label`}
              x={(x0 + x1) / 2}
              y={tickSize + 30}
              textAnchor={'middle'}
              fontSize={'0.75rem'}
              fontFamily={'ginto-normal'}
            >
              {'Time'}
            </text>
          </g>
        </g>

        <g id={'y-axis'} transform={`translate(${marginLeft}, ${0})`}>
          {/* axis line */}
          <line
            key={`y-axis-line`}
            x1={0}
            y1={y0 - inset}
            x2={0}
            y2={y1 + inset}
            stroke={'currentColor'}
            fill={'none'}
          />

          {yTicks.map((value, idx) => (
            <g key={`y-tick-${idx}`}>
              <line
                key={`y-tick-line-${idx}`}
                x1={0}
                y1={yScale(value)}
                x2={-tickSize}
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
                {variable === 'total' && value === max ? `\u2265${value}` : value}
              </text>
            </g>
          ))}

          <g id={'y-axis-label'}>
            <text
              key={`y-label`}
              x={-tickSize - 32}
              y={(y0 + y1) / 2}
              transform={`rotate(-90, ${-tickSize - 32}, ${(y0 + y1) / 2})`}
              textAnchor={'middle'}
              fontSize={'0.75rem'}
              fontFamily={'ginto-normal'}
            >
              {yAxisLabel}
            </text>
          </g>
        </g>

        {chartData}

        <g id="date-value-tracker">
          <line
            //add line tracking time slider date
            key={'historical-date-line'}
            id={'historical-date-line'}
            x1={xScale(new Date(date))}
            x2={xScale(new Date(date))}
            y1={y0 - inset}
            y2={y1 + inset}
            stroke={'#808080'}
            strokeWidth={1.5}
            strokeDasharray={'4'}
            fill={'none'}
            opacity={sliding ? 1 : 0}
            style={{ transition: 'opacity .15s' }}
          />

          {plotData && plotData?.[variable]?.[date] && !isNaN(plotData?.[variable]?.[date]) && (
            <circle
              // add circle tracking value at time slider date
              key={`historical-date-circle`}
              id={`historical-date-circle`}
              cx={xScale(new Date(date))}
              cy={yScale(clamp(plotData?.[variable]?.[date][0], min, max))}
              r={4}
              stroke={'#1b1e23'}
              strokeWidth={0.5}
              opacity={sliding ? 1 : 0}
              style={{ transition: 'opacity .15s' }}
            />
          )}
        </g>
      </svg>
    </Box>
  );
}
