import { useEffect, useRef } from 'react'
import { useMapbox } from '@carbonplan/maps'
import { v4 as uuidv4 } from 'uuid'

import { arrayRange, updatePaintProperty } from './utils'
import useStore from '../store/index'

const ForecastData = ({ id, source, band, time, showCharts, borderColor, minZoom = null, maxZoom = null }) => {

    const { map } = useMapbox()
    const removed = useRef(false)

    const sourceIdRef = useRef()
    const layerIdRef = useRef()

    const clim = useStore((state) => state.clim)()
    const setThresholds = useStore((state) => state.setThresholds)
    const colormap = useStore((state) => state.colormap)()
    const borderWidth = 0.5
    const zoom = useStore((state) => state.zoom)
    const zoomChange = 4.5
    const setPlotData = useStore((state) => state.setPlotData)
    const filterCoordinates = useStore((state) => state.filterCoordinates)
    const setFilterCoordinates = useStore((state) => state.setFilterCoordinates)

    const min = clim[0]
    const max = clim[1]
    const range = max - min;
    const nBins = 11
    const binWidth = range / nBins;
    let thresholds = arrayRange(min + binWidth, max + binWidth, binWidth)
    setThresholds(thresholds)

    useEffect(() => {
        if (showCharts) {

            if (filterCoordinates.length != 0) {

                console.log(filterCoordinates)

                let features = map.querySourceFeatures('forecast', {
                    sourceLayer: 'drought',
                    filter: [
                        'all',
                        // ['==', 'band', band],
                        // ['==', 'coords', JSON.stringify(filterCoordinates)],
                        ['==', 'x', filterCoordinates[0]],
                        ['==', 'y', filterCoordinates[1]],
                    ],
                });

                let plotData = {
                    'coordinates': filterCoordinates,
                    'time': [],
                    'percent_5': [],
                    'percent_20': [],
                    'percent_50': [],
                    'percent_80': [],
                    'percent_95': [],
                    'precip_5': [],
                    'precip_20': [],
                    'precip_50': [],
                    'precip_80': [],
                    'precip_95': [],
                }

                features.forEach((feature) => {
                    plotData['time'].push(feature.properties['time']),

                        plotData['percent_5'].push(feature.properties['percent_5']),
                        plotData['percent_20'].push(feature.properties['percent_20']),
                        plotData['percent_50'].push(feature.properties['percent_50']),
                        plotData['percent_80'].push(feature.properties['percent_80']),
                        plotData['percent_95'].push(feature.properties['percent_95']),

                        plotData['precip_5'].push(feature.properties['precip_5']),
                        plotData['precip_20'].push(feature.properties['precip_20']),
                        plotData['precip_50'].push(feature.properties['precip_50']),
                        plotData['precip_80'].push(feature.properties['precip_80']),
                        plotData['precip_95'].push(feature.properties['precip_95'])
                })

                // sometimes the features are repeated at the boundaries of tiles, so we need to only keep the first 6 of each
                // https://github.com/mapbox/mapbox-gl-js/issues/3147
                Object.keys(plotData).forEach((key, index) => {
                    plotData[key] = plotData[key].slice(0, 6)
                });

                setPlotData(plotData)
            }
        }
    }, [filterCoordinates])

    useEffect(() => {
        map.on('remove', () => {
            removed.current = true
        })
    }, [])

    useEffect(() => {
        sourceIdRef.current = id || uuidv4()
        const { current: sourceId } = sourceIdRef
        if (!map.getSource(sourceId)) {
            map.addSource(sourceId, {
                type: 'vector',
                tiles: [`${source}/drought/{z}/{x}/{y}.pbf`],
                // type: 'geojson',
                // data: `${source}/drought.geojson`,
            })
            if (minZoom) {
                map.getSource(sourceId).minzoom = minZoom
            }
            if (maxZoom) {
                map.getSource(sourceId).maxzoom = maxZoom
            }
        }
    }, [id])

    useEffect(() => {
        layerIdRef.current = uuidv4()

        const { current: layerId } = layerIdRef
        const { current: sourceId } = sourceIdRef

        if (!map.getLayer(layerId)) {
            map.addLayer({
                id: layerId,
                type: 'circle',
                source: sourceId,
                // 'source-layer': variable,
                'source-layer': 'drought',
                layout: { visibility: 'visible' },
                paint: {
                    'circle-color': [
                        'case',
                        ['<', ['get', band], thresholds[0]], colormap[0],
                        ['all', ['>=', ['get', band], thresholds[0]], ['<', ['get', band], thresholds[1]]], colormap[1],
                        ['all', ['>=', ['get', band], thresholds[1]], ['<', ['get', band], thresholds[2]]], colormap[2],
                        ['all', ['>=', ['get', band], thresholds[2]], ['<', ['get', band], thresholds[3]]], colormap[3],
                        ['all', ['>=', ['get', band], thresholds[3]], ['<', ['get', band], thresholds[4]]], colormap[4],
                        ['all', ['>=', ['get', band], thresholds[4]], ['<', ['get', band], thresholds[5]]], colormap[5],
                        ['all', ['>=', ['get', band], thresholds[5]], ['<', ['get', band], thresholds[6]]], colormap[6],
                        ['all', ['>=', ['get', band], thresholds[6]], ['<', ['get', band], thresholds[7]]], colormap[7],
                        ['all', ['>=', ['get', band], thresholds[7]], ['<', ['get', band], thresholds[8]]], colormap[8],
                        ['all', ['>=', ['get', band], thresholds[8]], ['<', ['get', band], thresholds[9]]], colormap[9],
                        colormap[10] // else greater than 90
                    ],
                    'circle-opacity': 1.0,
                    'circle-radius': [
                        // https://docs.mapbox.com/style-spec/reference/expressions/
                        'interpolate', ['linear'], ['zoom'],
                        2, 1,
                        3, 2,
                        4, 3,
                        zoomChange, ['get', 'agree'],
                        5, ['^', 1.75, ['get', 'agree']],
                        5.5, ['^', 1.825, ['get', 'agree']],
                        6, ['^', 2, ['get', 'agree']],
                        6.5, ['^', 2.25, ['get', 'agree']],
                        7, ['^', 2.75, ['get', 'agree']],

                    ],
                    // https://docs.mapbox.com/help/glossary/layout-paint-property/
                    'circle-stroke-color': borderColor,
                    'circle-stroke-width': 0,
                },
                'filter': [
                    'all',
                    ['==', 'time', time],
                    ['>=', band, 0]
                ],
            })
        }

        return () => {
            if (!removed.current) {
                if (map.getLayer(layerId)) {
                    map.removeLayer(layerId)
                }
            }
        }
    }, [])

    useEffect(() => {
        const { current: layerId } = layerIdRef;

        map.setFilter(layerId, ['all', ['>=', band, 0], ['==', 'time', time]])
    }, [band, time])

    useEffect(() => {
        if (zoom < zoomChange) {
            updatePaintProperty(map, layerIdRef, 'circle-stroke-width', 0)
        } else {
            let layers = map.getStyle().layers
            let forecast = layers.filter((layer) => layer.source == 'forecast')[0]
            if (forecast.paint['circle-stroke-color'] != borderWidth) {
                updatePaintProperty(map, layerIdRef, 'circle-stroke-width', borderWidth)
            }

        }
    }, [zoom])


    // https://docs.mapbox.com/mapbox-gl-js/example/popup-on-hover/
    // https://docs.mapbox.com/mapbox-gl-js/example/queryrenderedfeatures/
    // we could also make an on click event to get the time series for the charts box
    map.on('mouseenter', layerIdRef.current, (event) => {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('click', layerIdRef.current, (event) => {

        const roundToNearest025 = (num) => {
            return Math.round(num * 4) / 4;
        }

        let coordinates = [event.lngLat.lng, event.lngLat.lat].map(xy => roundToNearest025(xy))
        setFilterCoordinates(coordinates)
    })

    map.on('mouseleave', layerIdRef.current, (event) => {
        map.getCanvas().style.cursor = 'default';
    });

    return null
}

export default ForecastData