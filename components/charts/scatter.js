'use client';

import { useRef, useMemo } from 'react';
import { Box } from 'theme-ui';
import * as d3 from 'd3';

import { arrayRange, useStore } from '../store/index';

export default function Scatter() {
  const containerRef = useRef(null);

  const variable = useStore((state) => state.variable);
  const leadArray = useStore((state) => state.leadArray);
  const leadIndex = useStore((state) => state.leadIndex);
  const leadDates = useStore((state) => state.leadDates);
  const sliding = useStore((state) => state.slidingLead);
  const colormap = useStore((state) => state.colormap);
  const clim = useStore((state) => state.clim);
  const plotData = useStore((state) => state.plotData);
  const gintoUri = useStore((state) => state.gintoUri);
  const fontCSS = `@font-face {
                        font-family: 'ginto-normal';
                        src: url('${gintoUri}') format('truetype');
                    }`;

  const [min, max] = clim;
  const range = max - min;
  const nBins = 11;
  const binWidth = range / nBins;
  let thresholds = arrayRange(min + binWidth, max + binWidth, binWidth);
  const colorScale = d3.scaleThreshold().domain(thresholds).range(colormap);

  // chart layout
  const width = 330;
  const height = 270;
  const inset = 10; // used for pushing the x and y axes ticks inward
  const tickSize = 5;

  const marginLeft = 55;
  const marginRight = 30;
  const marginTop = 15;
  const marginBottom = 55;

  const x0 = marginLeft + inset;
  const x1 = width - marginRight - inset;
  const y0 = marginTop + inset;
  const y1 = height - marginBottom - inset;

  // x axis
  let datesJS = leadDates.map((t) => {
    let [year, month, day] = t.split('-');
    return new Date(year, parseInt(month) - 1, day);
  });
  const formatDate = d3.timeFormat('%m-%y');
  const formattedDates = datesJS.map(formatDate);

  const xTicks = [1, 2, 3, 4, 5, 6];
  const xTickLabels = formattedDates.slice(0, 6);
  const xDomain = [xTicks.at(0), xTicks.at(-1)];

  const xScale = d3.scaleLinear().domain(xDomain).range([x0, x1]);

  // y axis
  // const yTicks = d3.ticks(min, max, 7)
  const yTicks = d3.range(min, max + 25, 25);
  const yScale = d3.scaleLinear().domain([min, max]).range([y1, y0]);
  const yAxisLabel = 'Relative bias (%)';

  const lineGenerator = d3
    .line()
    .defined((d) => !isNaN(d[1])) // skip missing / gap points
    .x((d) => xScale(d[0]))
    .y((d) => yScale(d[1]))
    .curve(d3.curveMonotoneX);

  const hasData = Boolean(variable && plotData?.[variable]);

  // function that (re)draws the chart whenever the container size changes.
  const chartData = useMemo(() => {
    if (!hasData) return null;

    // convert data from {lead: [value]} to {[lead, value]} format,
    // which many d3 methods expect.
    const timeseriesArray = leadArray
      .filter((d) => plotData?.[variable]?.[d])
      .map((d) => [d, plotData?.[variable]?.[d][0]]);

    let line = (
      <path
        key={'line-path'}
        id="line-path"
        d={lineGenerator(timeseriesArray)}
        fill="none"
        stroke={'rgba(27, 30, 35, 0.3)'}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );

    let points = timeseriesArray.map(([lead, value]) => {
      let boundedValue = value > max ? max : value < min ? min : value;

      const cx = xScale(lead);
      const cy = yScale(boundedValue);
      const r = 5;
      const color = colorScale(boundedValue);

      return (
        <circle
          key={`circle-${lead}`}
          cx={cx}
          cy={cy}
          r={r}
          fill={color}
          stroke={'#1b1e23'}
          strokeWidth={0.5}
        />
      );
    });

    return (
      <g key={'scatter-data-container'} id="scatter-data-container">
        {line}
        {points}
      </g>
    );
  }, [hasData, plotData]);

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
      <svg id={'scatter-chart'} width={'100%'} height={'100%'}>
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
          {xTicks.map((value, idx) => (
            <g key={`x-tick-${idx}`} className={'x-axis-tick'}>
              <line
                key={`x-tick-line-${idx}`}
                x1={xScale(value)}
                y1={0}
                x2={xScale(value)}
                y2={tickSize}
                stroke={'currentColor'}
                fill={'none'}
              />
              <text
                key={`x-tick-label-${idx}`}
                x={xScale(value)}
                y={tickSize + 12}
                // transform={`rotate(-45, ${-tickSize}, ${(tickSize + 12)})`}
                // textAnchor={'end'}
                textAnchor={'middle'}
                fontSize={'0.625rem'}
                fontFamily={'ginto-normal'}
              >
                {xTickLabels[idx]}
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
              {'Lead date'}
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
                x={-tickSize - 12}
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
            key={'lead-date-line'}
            id={'lead-date-line'}
            x1={xScale(leadIndex)}
            x2={xScale(leadIndex)}
            y1={y0 - inset}
            y2={y1 + inset}
            stroke={'#808080'}
            strokeWidth={1.5}
            strokeDasharray={'4'}
            fill={'none'}
            opacity={sliding ? 1 : 0}
            style={{ transition: 'opacity .15s' }}
          />

          {plotData && plotData[variable] && plotData[variable][leadIndex] && (
            <circle
              // add circle tracking value at time slider date
              key={`lead-date-circle`}
              id={`lead-date-circle`}
              cx={xScale(leadIndex)}
              cy={yScale(plotData[variable][leadIndex][0])}
              r={5}
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
