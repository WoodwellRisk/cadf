'use client';

import { useEffect, useRef } from 'react'
import { Box } from 'theme-ui'
import { alpha } from '@theme-ui/color'
import * as d3 from 'd3'

import useStore from '../store/index'

export default function DotChart() {

    const containerRef = useRef(null);

    const variable = useStore((state) => state.variable)
    const dates = useStore((state) => state.dates)
    const confidenceArray = useStore((state) => state.confidenceArray)
    const thresholds = useStore((state) => state.thresholds)
    const colormap = useStore((state) => state.colormap)()
    const plotData = useStore((state) => state.plotData)
    const gintoUri = useStore((state) => state.gintoUri)

    // function that (re)draws the chart whenever the container size changes.
    function drawChart() {
        const container = containerRef.current;
        if (!container) return;

        const varMax = variable == 'percent' ? 100 : 300
        const xAxisTitle = variable == 'percent' ? 'Percentile' : 'Precipitation (mm)'

        const colorScale = d3.scaleThreshold()
            .domain(thresholds)
            .range(colormap);

        // Clear any previous SVG (important on resize).
        d3.select(container).selectAll('svg').remove();

        const width = container.clientWidth;
        const height = container.clientHeight;

        const paddingTop = 20;
        const paddingLeft = 45;
        const paddingBottom = 40;
        const paddingRight = 20;
        const extraPaddingX = 10;
        const paddingXLabel = 5

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
        `

        // this is the container svg
        const svg = d3
            .select(container)
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('id', 'dot-chart');


        svg.append('style')
            .attr('type', 'text/css')
            .html(`<![CDATA[${css}]]>`);

        // this ensures that the svg or png has a white background
        svg.append('rect')
            .attr('width', '100%')
            .attr('height', '100%')
            .style('fill', 'background');

        // x axis
        const xScale = d3.scaleLinear()
            .domain([0, varMax])
            .range([paddingLeft, width - paddingRight - extraPaddingX]);   // leave space for y‑axis labels

        const xAxis = d3.axisBottom(xScale);
        if (variable == 'percent') {
            xAxis.tickValues([0, 25, 50, 75, 100]);
        } else {
            xAxis.tickValues([0, 50, 100, 150, 200, 250, 300]);
        }

        svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(${extraPaddingX}, ${height - paddingBottom})`) // align with bottom padding
            .call(xAxis)

        svg.append('text')
            .attr('class', 'x-axis-label')
            .attr('x', (width + paddingLeft) / 2)
            .attr('y', height - paddingXLabel)
            .style('text-anchor', 'middle')
            .style('font-size', '0.75rem')
            .text(xAxisTitle)

        // y axis
        let datesJS = dates.map(t => {
            let [year, month, day] = t.split('-')
            return new Date(year, parseInt(month) - 1, day)
        })
        const formatDate = d3.timeFormat('%m-%Y');
        const formattedDates = datesJS.map(formatDate);

        const yScale = d3.scaleBand()
            .domain(formattedDates.map(d => d)) // format as YYYY‑MM‑DD
            .range([0, height - paddingBottom - paddingXLabel])   // top & bottom padding
            .paddingInner(0.3);

        const yAxis = d3.axisLeft(yScale);
        yAxis.tickSize(0)

        svg.append('g')
            .attr('class', 'y-axis')
            .attr('transform', `translate(${paddingLeft}, 0)`) // same left offset used in xScale range
            .call(yAxis)
            .select('.domain').remove();

        if (plotData && Object.keys(plotData).length != 0) {
            // the data for plotting each line or row on the dot chart
            const data = formattedDates.map((date, idx) => ({
                date: date,
                x: confidenceArray.map((confidence) => {
                    let val = plotData[`${variable}_${confidence}`][idx]
                    return val > varMax ? varMax : val
                })
            }));

            svg.append('g')
                .selectAll('line')
                .data(data)
                .enter()
                .append('line')
                .attr('class', 'hline')
                .attr('x1', d => xScale(d3.min(d.x)) + extraPaddingX)
                .attr('x2', d => xScale(d3.max(d.x)) + extraPaddingX)
                .attr('y1', d => yScale(d.date) + yScale.bandwidth() / 2)
                .attr('y2', d => yScale(d.date) + yScale.bandwidth() / 2)
                .attr('stroke', alpha('#1b1e23', 0.3))
                .attr('stroke-width', 2)
                .attr('stroke-linecap', 'round')


            // the data for plotting each point on the dot chart
            const tidyPoints = []
            Object.values(data).forEach(row => {
                row.x.forEach((val, idx) => {
                    tidyPoints.push({ date: row.date, x: val > varMax ? varMax : val, confidence: confidenceArray[idx] })
                })
            })

            const circles = svg.append('g').attr('class', 'circles')
            circles.selectAll('circle')
                .data(tidyPoints)
                .join(enter =>
                    enter.append('circle')
                        .attr('cx', d => xScale(d.x) + extraPaddingX)
                        .attr('cy', d => yScale(d.date) + yScale.bandwidth() / 2)
                        .attr('r', 4)
                        .attr('fill', d => colorScale(d.x))
                        .attr('stroke', '#1b1e23')
                        .attr('stroke-width', 0.5),
                )
        }
    }

    useEffect(() => {
        drawChart();
    }, [variable, plotData]);

    return (
        <Box
            as='svg'
            id={'chart'}
            ref={containerRef}
            preserveAspectRatio='xMidYMid meet'
            sx={{
                width: '100%',
                height: '100%',
            }}
        />
    )
}