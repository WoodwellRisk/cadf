'use client';

import { useEffect, useRef } from 'react';
import { Box } from 'theme-ui';
import { alpha } from '@theme-ui/color';
import * as d3 from 'd3';

import { arrayRange, useStore } from '../store/index';

export default function DotChart() {
  const containerRef = useRef(null);

  const variable = useStore((state) => state.variable);
  const forecastDates = useStore((state) => state.forecastDates);
  const confidenceArray = useStore((state) => state.confidenceArray);
  const thresholds = useStore((state) => state.thresholds);
  const colormap = useStore((state) => state.colormap)();
  const plotData = useStore((state) => state.plotData);
  const gintoUri = useStore((state) => state.gintoUri);

  // function that (re)draws the chart whenever the container size changes.
  function drawChart() {
    const container = containerRef.current;
    if (!container) return;

    if (!variable || !plotData[variable]) return;

    const varMax = variable == 'percent' ? 100 : 300;
    const xAxisTitle = variable == 'percent' ? 'Percentile' : 'Precipitation (mm)';

    const min = 0;
    const max = varMax;
    const range = max - min;
    const nBins = 11;
    const binWidth = range / nBins;
    let thresholds = arrayRange(min + binWidth, max + binWidth, binWidth);
    const colorScale = d3.scaleThreshold().domain(thresholds).range(colormap);

    // Clear any previous SVG (important on resize).
    d3.select(container).selectAll('svg').remove();

    const width = container.clientWidth;
    const height = container.clientHeight;

    const paddingTop = 20;
    const paddingLeft = 45;
    const paddingBottom = 40;
    const paddingRight = 20;
    const extraPaddingX = 10;
    const paddingXLabel = 5;

    let css = `
            @font-face {
                font-family: 'ginto-normal';
                src: url('${gintoUri}') format('truetype');
            }

            .x-axis {
                font-family: 'ginto-normal'
            }

            .x-axis-label {
                font-family: 'ginto-normal'
            }

            .y-axis {
                font-family: 'ginto-normal'
            }
        `;

    // this is the container svg
    const svg = d3
      .select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('id', 'dot-chart');

    svg.append('style').attr('type', 'text/css').html(`<![CDATA[${css}]]>`);

    // this ensures that the svg or png has a white background
    svg.append('rect').attr('width', '100%').attr('height', '100%').style('fill', 'background');

    // x axis
    const xScale = d3
      .scaleLinear()
      .domain([0, varMax])
      .range([paddingLeft, width - paddingRight - extraPaddingX]); // leave space for y‑axis labels

    const xAxis = d3.axisBottom(xScale);
    if (variable == 'percent') {
      xAxis.tickValues([0, 25, 50, 75, 100]);
    } else {
      xAxis.tickValues([0, 50, 100, 150, 200, 250, 300]);
    }

    svg
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(${extraPaddingX}, ${height - paddingBottom})`) // align with bottom padding
      .call(xAxis);

    svg
      .append('text')
      .attr('class', 'x-axis-label')
      .attr('x', (width + paddingLeft) / 2)
      .attr('y', height - paddingXLabel)
      .style('text-anchor', 'middle')
      .style('font-size', '0.75rem')
      .text(xAxisTitle);

    // y axis
    let datesJS = forecastDates.map((t) => {
      let [year, month, day] = t.split('-');
      return new Date(year, parseInt(month) - 1, day);
    });
    const formatDate = d3.timeFormat('%m-%Y');
    const formattedDates = datesJS.map(formatDate);

    const yScale = d3
      .scaleBand()
      .domain(formattedDates.map((d) => d)) // format as YYYY‑MM‑DD
      .range([0, height - paddingBottom - paddingXLabel]) // top & bottom padding
      .paddingInner(0.3);

    const yAxis = d3.axisLeft(yScale);
    yAxis.tickSize(0);

    svg
      .append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${paddingLeft}, 0)`) // same left offset used in xScale range
      .call(yAxis)
      .select('.domain')
      .remove();

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

    if (plotData && plotData[variable] && Object.keys(plotData[variable]).length != 0) {
      // the data for plotting each line or row on the dot chart
      const data = forecastDates.map((date, idx) => {
        let [year, month, day] = date.split('-');
        let formattedDate = `${month}-${year}`;
        let values = confidenceArray.map((confidence) => {
          let val = plotData[variable][confidence][date][0];
          return val > varMax ? varMax : val;
        });

        return {
          date: formattedDate,
          x: values,
        };
      });

      svg
        .append('g')
        .selectAll('line')
        .data(data)
        .enter()
        .append('line')
        .attr('class', 'hline')
        .attr('x1', (d) => xScale(d3.min(d.x)) + extraPaddingX)
        .attr('x2', (d) => xScale(d3.max(d.x)) + extraPaddingX)
        .attr('y1', (d) => yScale(d.date) + yScale.bandwidth() / 2)
        .attr('y2', (d) => yScale(d.date) + yScale.bandwidth() / 2)
        .attr('stroke', alpha('#1b1e23', 0.3))
        .attr('stroke-width', 2)
        .attr('stroke-linecap', 'round');

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
      Object.values(data).forEach((row) => {
        row.x.forEach((val, idx) => {
          tidyPoints.push({
            date: row.date,
            x: val > varMax ? varMax : val,
            confidence: confidenceArray[idx],
          });
        });
      });

      const circles = svg.append('g').attr('class', 'circles');
      circles
        .selectAll('circle')
        .data(tidyPoints)
        .join((enter) =>
          enter
            .append('circle')
            .attr('cx', (d) => xScale(d.x) + extraPaddingX)
            .attr('cy', (d) => yScale(d.date) + yScale.bandwidth() / 2)
            .attr('r', 4)
            .attr('fill', (d) => colorScale(d.x))
            .attr('stroke', '#1b1e23')
            .attr('stroke-width', 0.5)
        );
    }
  }

  useEffect(() => {
    drawChart();
  }, [plotData]);

  return (
    <Box
      as="svg"
      id={'chart'}
      ref={containerRef}
      preserveAspectRatio="xMidYMid meet"
      sx={{
        width: '100%',
        height: '100%',
      }}
    />
  );
}
