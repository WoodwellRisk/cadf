'use client';

import { useRef, useMemo } from 'react';
import { Box } from 'theme-ui';
import * as d3 from 'd3';

import { clamp } from './utils';
import { arrayRange, useStore } from '../store/index';

export default function Dot() {
  const containerRef = useRef(null);

  const variable = useStore((state) => state.variable);
  const leadDates = useStore((state) => state.forecastLeadDates);
  const leadIndex = useStore((state) => state.leadIndex);
  const sliding = useStore((state) => state.leadSliding);
  const confidenceArray = useStore((state) => state.confidenceArray);
  const confidence = useStore((state) => state.confidence);
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
  const width = 320;
  const height = 270;
  const inset = 20; // used for pushing the x and y axes ticks inward
  const tickSize = 5;

  const marginLeft = 65;
  const marginRight = 5;
  const marginTop = 0;
  const marginBottom = 55;

  const x0 = marginLeft + inset;
  const x1 = width - marginRight - inset;
  const y0 = marginTop + inset;
  const y1 = height - marginBottom - inset;

  // x axis
  const xTicks =
    variable === 'percentile' ? d3.range(min, max + 25, 25) : d3.range(min, max + 50, 50);
  const xScale = d3.scaleLinear().domain([min, max]).range([x0, x1]); // leave space for y‑axis labels
  const xAxisLabel = variable === 'percentile' ? 'Percentile' : 'Precipitation (mm)';

  // y axis
  let datesJS = leadDates.map((t) => {
    let [year, month, day] = t.split('-');
    return new Date(year, parseInt(month) - 1, day);
  });
  const formatDate = d3.timeFormat('%m-%Y');
  const formattedDates = datesJS.map(formatDate);

  // reverse the yTicks so that d3.scaleBand() plots
  // the dates in the correct order
  const yTicks = [5, 4, 3, 2, 1, 0];
  // const yTicks = [0, 1, 2, 3, 4, 5]
  const yTickLabels = formattedDates; //.slice(0, 6);
  const yScale = d3.scalePoint().domain(yTicks).range([y1, y0]).padding(0.3);
  const yAxisLabel = 'Target date';

  // compute values for rectangle that highlights lead date time step
  const rectangleHorizontalStart = xScale(min) - 5;
  const rectangleWidth = xScale(max) - xScale(min) + 10;
  const rectangleHeight = yScale.step();
  const rectangleVerticalCenter = yScale(leadIndex - 1) - rectangleHeight / 2;
  const highlightTimestep = leadIndex >= 1 && leadIndex <= yTicks.length;

  const hasData = Boolean(variable && plotData?.[variable]?.[confidence] && leadDates.length > 0);

  // function that (re)draws the chart whenever the container size changes.
  const chartData = useMemo(() => {
    if (!containerRef.current || !hasData) return null;

    console.log(plotData);

    // format data
    // the data for plotting each line or row on the dot chart
    // our data starts out like this:
    // 5: Object { "2025-10-01": (1) […], "2025-11-01": (1) […], "2025-12-01": (1) […], … }
    // 20: Object { "2025-10-01": (1) […], "2025-11-01": (1) […], "2025-12-01": (1) […], … }
    // 50: Object { "2025-10-01": (1) […], "2025-11-01": (1) […], "2025-12-01": (1) […], … }
    // 80: Object { "2025-10-01": (1) […], "2025-11-01": (1) […], "2025-12-01": (1) […], … }​
    // 95: Object { "2025-10-01": (1) […], "2025-11-01": (1) […], "2025-12-01": (1) […], … }

    // then we filter it for max values so it looks like:
    // 0: Object { date: "10-2025", x: (5) […] }
    // 1: Object { date: "11-2025", x: (5) […] }
    // 2: Object { date: "12-2025", x: (5) […] }
    // 3: Object { date: "01-2026", x: (5) […] }
    // 4: Object { date: "02-2026", x: (5) […] }
    // 5: Object { date: "03-2026", x: (5) […] }
    const flatData = leadDates.map((date, idx) => {
      let [year, month, day] = date.split('-');
      let formattedDate = `${month}-${year}`;

      let values = confidenceArray.map((confidence) => {
        let val = plotData?.[variable]?.[confidence]?.[date]?.[0];
        return clamp(val, min, max);
      });

      // skip plotting this date entirely if all values are NaN across confidence levels
      const allInvalid = values.every((v) => v === null || Number.isNaN(v));

      return {
        date: formattedDate,
        dateIndex: idx,
        x: values,
        isValid: !allInvalid,
      };
    });

    // the data for plotting each point on the dot chart
    // a flatted version of the `data` array
    // 0: Object { date: "10-2025", x: ..., confidence: 5 }
    // 1: Object { date: "10-2025", x: ..., confidence: 20 }
    // 2: Object { date: "10-2025", x: ..., confidence: 50 }
    // 3: Object { date: "10-2025", x: ..., confidence: 80 }
    // 4: Object { date: "10-2025", x: ..., confidence: 95 }
    // 5: Object { date: "11-2025", x: ..., confidence: 5 }
    // 6: Object { date: "11-2025", x: ..., confidence: 20 }
    // 7: Object { date: "11-2025", x: ..., confidence: 50 }
    // 8: Object { date: "11-2025", x: ..., confidence: 80 }
    // 9: Object { date: "11-2025", x: ..., confidence: 95 }
    const tidyPoints = [];
    flatData.forEach((row) => {
      if (!row.isValid) return;
      row.x.forEach((val, idx) => {
        if (val === null || Number.isNaN(val)) return;
        tidyPoints.push({
          date: row.date,
          dateIndex: row.dateIndex,
          x: val,
          confidence: confidenceArray[idx],
        });
      });
    });

    /* horizontal lines */
    let lines = flatData
      .filter((d) => d.isValid)
      .map((d, idx) => {
        const x1 = xScale(d3.min(d.x));
        const x2 = xScale(d3.max(d.x));
        const y = yScale(d.dateIndex);
        const lineColor = 'rgba(27, 30, 35, 0.3)';
        const lineWidth = 2;

        return (
          <g key={`line-${idx}`} className={'y-axis-lines'}>
            <line
              key={`line-${idx}`}
              className={'hline'}
              x1={x1}
              x2={x2}
              y1={y}
              y2={y}
              // stroke={alpha('muted', 0.3)}
              stroke={lineColor}
              strokeWidth={lineWidth}
              strokeLinecap={'round'}
            />
          </g>
        );
      });

    let points = tidyPoints.map((d, idx) => {
      const cx = xScale(d.x);
      const cy = yScale(d.dateIndex);
      const r = 4;
      const size = r + 2;
      const fillColor = colorScale(d.x);
      const borderWidth = 0.5;
      const borderColor = '#1b1e23';

      if (d.confidence === '50' || d.confidence === 50) {
        return (
          <polygon
            key={`diamond-${idx}`}
            points={`${cx},${cy - size} ${cx + size},${cy} ${cx},${cy + size} ${cx - size},${cy}`}
            fill={fillColor}
            stroke={borderColor}
            strokeWidth={borderWidth}
          />
        );
      } else {
        return (
          <circle
            key={`circle-${idx}`}
            cx={cx}
            cy={cy}
            r={r}
            fill={fillColor}
            stroke={borderColor}
            strokeWidth={borderWidth}
          />
        );
      }
    });

    return (
      <g key={'dot-data-container'} id="dot-data-container">
        {lines}
        {points}
      </g>
    );
  }, [hasData, plotData, min, max]);

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
      <svg id={'dot-chart'} width={'100%'} height={'100%'}>
        {gintoUri && <style type="text/css">{fontCSS}</style>}

        {/* this ensures that the svg or png has a white background */}
        <rect width={'100%'} height={'100%'} fill={'background'} />

        <g id={'x-axis'} transform={`translate(0, ${y1 + inset})`}>
          {/* axis line */}
          <line
            key={`x-axis-line`}
            x1={x0}
            y1={0}
            x2={x1}
            y2={0}
            stroke={'currentColor'}
            fill={'none'}
          />

          {xTicks.map((value, idx) => (
            <g key={`tick-${idx}`} className={'x-axis-tick'}>
              <line
                key={`tick-line-${idx}`}
                x1={xScale(value)}
                y1={0}
                x2={xScale(value)}
                y2={tickSize}
                stroke="currentColor"
              />
              <text
                key={`tick-label-${idx}`}
                x={xScale(value)}
                y={0}
                style={{
                  fontSize: '0.625rem',
                  textAnchor: 'middle',
                  transform: 'translateY(1rem)',
                  fontFamily: 'ginto-normal',
                }}
              >
                {variable === 'total' && value === max ? `\u2265${value}` : value}
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
              {xAxisLabel}
            </text>
          </g>
        </g>

        <g id={'y-axis'} transform={`translate(${marginLeft}, 0)`}>
          {/* date labels */}
          {yTickLabels.map((label, idx) => {
            return (
              <g key={`date-label-${idx}`} className={'y-axis-labels'}>
                <text
                  key={`y-label-${idx}`}
                  x={0}
                  y={yScale(idx)}
                  textAnchor={'end'}
                  dominantBaseline={'middle'}
                  dy={'0.1em'}
                  fontSize={'0.625rem'}
                  fontFamily={'ginto-normal'}
                >
                  {label || ''}
                </text>
              </g>
            );
          })}

          <g id={'y-axis-label'}>
            <text
              key={`y-label`}
              x={-tickSize - 32}
              y={(y0 + y1) / 2}
              transform={`rotate(-90, ${-tickSize - 32}, ${(y0 + y1) / 2})`}
              textAnchor={'middle'}
              dy={-13}
              fontSize={'0.75rem'}
              fontFamily={'ginto-normal'}
            >
              {yAxisLabel}
            </text>
          </g>
        </g>

        {/* box that highlights timestep behind chart data */}
        {highlightTimestep && (
          <g id="lead-date-highlight">
            <rect
              key={`lead-date-rectangle-${leadIndex}`}
              x={rectangleHorizontalStart}
              width={rectangleWidth}
              y={rectangleVerticalCenter}
              height={rectangleHeight}
              fill={'rgba(27, 30, 35, 0.08)'}
              opacity={sliding ? 1 : 0}
              style={{ transition: 'opacity .15s' }}
            />
          </g>
        )}

        {/* points representing values at confidence levels for each lead date */}
        {chartData}
      </svg>
    </Box>
  );
}
