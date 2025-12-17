'use client';

import { useCallback } from 'react'
import { Box } from 'theme-ui'
import { alpha } from '@theme-ui/color'

// import { fontToDataUri, toDataURL } from './utils'
import useStore from '../store/index'

export default function DownloadChartButton() {

    const variable = useStore((state) => state.variable)

    // Modified from: https://observablehq.com/@mbostock/saving-svg
    const serialize = (svg) => {
        const xmlns = 'http://www.w3.org/2000/xmlns/';
        const xlinkns = 'http://www.w3.org/1999/xlink';
        const svgns = 'http://www.w3.org/2000/svg'

        const fragment = window.location.href + "#";
        const walker = document.createTreeWalker(svg, NodeFilter.SHOW_ELEMENT);
        while (walker.nextNode()) {
            for (const attr of walker.currentNode.attributes) {
                if (attr.value.includes(fragment)) {
                    attr.value = attr.value.replace(fragment, "#")
                }
            }
        }
        svg.setAttributeNS(xmlns, 'xmlns', svgns);
        svg.setAttributeNS(xmlns, 'xmlns:xlink', xlinkns);

        const serializer = new XMLSerializer()
        const string = serializer.serializeToString(svg);
        const blob = new Blob([string], { type: 'image/svg+xml;charset=utf-8' });

        return blob
    }

    const rasterize = (svg) => {
        let resolve, reject;
        const promise = new Promise((y, n) => (resolve = y, reject = n));

        const rect = svg.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        let scale = 5;
        const exportWidth = width * scale;
        const exportHeight = height * scale;

        svg = svg.cloneNode(true);
        svg.setAttribute('width', `${exportWidth}`);
        svg.setAttribute('height', `${exportHeight}`);

        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onerror = () => {
            alert('Failed to load the generated SVG.');
            URL.revokeObjectURL(url);
        };
        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = exportWidth;
            canvas.height = exportHeight;
            const context = canvas.getContext('2d');
            context.scale(scale, scale);
            context?.drawImage(image, 0, 0,);
            context.canvas.toBlob(resolve);
            const pngDataUrl = canvas.toDataURL('image/png');

            const a = document.createElement('a');
            a.href = pngDataUrl;
            a.download = `${variable}.png`;
            a.click();
            a.remove()
        }
        image.src = URL.createObjectURL(serialize(svg, exportWidth, exportHeight));
    }


    const handleChartDownload = useCallback((event) => {
        // we want to query the parent div, then get the first svg we find
        // this makes sure that even when chart types change, we are getting the chart svg
        const chart = document.querySelector('#chart > svg:first-of-type')
        rasterize(chart)
    })

    return (
        <Box
            as='div'
            role='button'
            onClick={handleChartDownload}
            sx={{
                outlineWidth: '1px',
                outlineStyle: 'solid',
                outlineColor: 'primary',
                color: 'primary',
                borderRadius: '0.5rem',
                backgroundColor: 'background',
                position: 'absolute',
                zIndex: 20,
                right: '0.5rem',
                top: '18rem',
                p: [2],
                userSelect: 'none',
                '&:hover': {
                    cursor: 'pointer',
                    outlineWidth: '2px',
                },
                '&:active': {
                    bg: alpha('muted', 0.5),
                },
            }}
        >
            Download chart
        </Box>
    )
}
