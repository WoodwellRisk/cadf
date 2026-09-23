import { useEffect, useRef, useState } from 'react';
import { useThemeUI, Box } from 'theme-ui';
import { useMap } from '../map-provider';
import { v4 as uuidv4 } from 'uuid';

// import { queryCoordinates } from './utils';
import { useStore } from '../../store/index';

export default function PointQuery({ key, id }) {
  const { theme } = useThemeUI();
  const { map } = useMap();

  const removed = useRef(false);
  const sourceIdRef = useRef();
  const layerIdRef = useRef();

  const historicalRaster = useStore((state) => state.historicalRaster);
  const forecastRaster = useStore((state) => state.forecastRaster);

  const variableArray = useStore((state) => state.variableArray);
  const confidenceArray = useStore((state) => state.confidenceArray);
  const timePeriod = useStore((state) => state.timePeriod);
  const forecastDate = useStore((state) => state.forecastDate);
  const leadArray = useStore((state) => state.leadArray);
  const leadDates = useStore((state) => state.leadDates);
  const historicalDates = useStore((state) => state.historicalDates);
  const setPlotData = useStore((state) => state.setPlotData);
  const setQueryStatus = useStore((state) => state.setQueryStatus);

  const roundToNearest025 = (num) => {
    return Math.round(num * 4) / 4;
  };

  function toTwoDecimalPlaces(num) {
    return parseFloat(roundToNearest025(num).toFixed(2));
  }

  const queryPoint = { lng: 15.7, lat: 2.6 };
  const [coords, setCoords] = useState([
    toTwoDecimalPlaces(queryPoint['lng']),
    toTwoDecimalPlaces(queryPoint['lat']),
  ]);

  const [coordinates, setCoordinates] = useState([
    `Longitude: ${coords[0]}`,
    `Latitude: ${coords[1]}`,
  ]);

  // https://docs.mapbox.com/mapbox-gl-js/example/drag-a-point/
  const draggablePoint = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: coords,
        },
      },
    ],
  };

  const formatForecastResult = (result, leadDates) => {
    const seriesByBand = {};

    console.log(result);

    variableArray.forEach((bandLabel) => {
      const seriesByStat = {};
      // leaving out 'confidence' in ['5', ..., '95', 'confidence']
      // not needed for dot chart
      confidenceArray.forEach((statLabel) => {
        const seriesByLead = {};
        leadArray.forEach((leadLabel, leadIndex) => {
          const value = result?.[bandLabel]?.[statLabel]?.[leadLabel];
          if (value != null) {
            seriesByLead[leadDates[leadIndex]] = value; // keep the array — dot chart expects it
          }
        });
        seriesByStat[statLabel] = seriesByLead;
      });
      seriesByBand[bandLabel] = seriesByBand[bandLabel] ?? seriesByStat;
      seriesByBand[bandLabel] = seriesByStat;
    });

    return seriesByBand;
  };

  useEffect(() => {
    map.on('remove', () => {
      removed.current = true;
    });
  }, []);

  useEffect(() => {
    sourceIdRef.current = id || uuidv4();
    const { current: sourceId } = sourceIdRef;

    if (!map.getSource(sourceId)) {
      draggablePoint.features[0].geometry.coordinates = coords;

      map.addSource(sourceId, {
        type: 'geojson',
        data: draggablePoint,
      });
    }
  }, [key]);

  useEffect(() => {
    const { current: sourceId } = sourceIdRef;
    layerIdRef.current = uuidv4();
    const { current: layerId } = layerIdRef;

    if (!map.getLayer(layerId)) {
      map.addLayer({
        id: layerId,
        type: 'circle',
        source: sourceId,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 10, 7, 20],
          'circle-color': theme.rawColors.primary,
          'circle-stroke-width': 2,
          'circle-stroke-color': theme.rawColors.primary,
          'circle-opacity': 0.5,
        },
      });
    }

    function onMove(e) {
      const coords = e.lngLat;

      map.getCanvas().style.cursor = 'grabbing';

      draggablePoint.features[0].geometry.coordinates = [coords.lng, coords.lat];
      map.getSource(sourceIdRef.current).setData(draggablePoint);
    }

    function onUp(e) {
      const coords = e.lngLat;
      setCoords([toTwoDecimalPlaces(coords.lng), toTwoDecimalPlaces(coords.lat)]);

      setCoordinates([
        `Longitude: ${toTwoDecimalPlaces(coords.lng)}`,
        `Latitude:   ${toTwoDecimalPlaces(coords.lat)}`,
      ]);

      map.getCanvas().style.cursor = '';
      map.off('mousemove', onMove);
      map.off('touchmove', onMove);
    }

    map.on('mouseenter', layerId, () => {
      map.getCanvas().style.cursor = 'move';
    });

    map.on('mouseleave', layerId, () => {
      map.setPaintProperty(layerId, 'circle-color', theme.rawColors.primary);
      map.getCanvas().style.cursor = '';
    });

    map.on('mouseup', layerId, (e) => {
      e.preventDefault();
      map.getCanvas().style.cursor = 'grab';
      map.on('mousemove', onMove);
      map.once('mouseup', onUp);
      map.setPaintProperty(layerId, 'circle-opacity', 0.5);
    });

    map.on('mousedown', layerId, (e) => {
      map.setPaintProperty(layerId, 'circle-opacity', 1.0);

      e.preventDefault();

      map.getCanvas().style.cursor = 'grab';
      map.on('mousemove', onMove);
      map.once('mouseup', onUp);
    });

    map.on('touchstart', layerId, (e) => {
      if (e.points.length !== 1) return;
      e.preventDefault();
      map.on('touchmove', onMove);
      map.once('touchend', onUp);
    });

    return () => {
      if (!removed.current) {
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId);
        }
      }
    };
  }, []);

  // useEffect(() => {
  //   if (!coords) return;

  //   const abortController = new AbortController();
  //   const { signal } = abortController;

  //   setQueryStatus('loading');

  //   if (timePeriod == 'forecast') {
  //     queryCoordinates(coords, 'forecast', forecastDate, { signal })
  //       .then((result) => {
  //         if (!signal.aborted) setPlotData(result?.data);
  //       })
  //       // .then((result) => console.log(result))
  //       .catch((error) => {
  //         if (error.name !== 'AbortError') {
  //           setQueryStatus('error');
  //           console.error('Error querying forecast raster:', error);
  //         }
  //       });
  //   } else {
  //     queryCoordinates(coords)
  //       .then((result) => {
  //         if (!signal.aborted) setPlotData(result?.data);
  //       })
  //       .catch((error) => {
  //         if (error.name !== 'AbortError') {
  //           setQueryStatus('error');
  //           console.error('Error querying historical raster:', error);
  //         }
  //       });
  //   }

  //   return () => {
  //     abortController.abort(); // cancel pending request on cleanup
  //   };
  // }, [timePeriod, coords, forecastDate]);

  useEffect(() => {
    if (!coords) return;

    const abortController = new AbortController();
    const { signal } = abortController;

    setQueryStatus('loading');

    if (timePeriod == 'forecast') {
      forecastRaster
        .queryData(
          { type: 'Point', coordinates: coords },
          {
            band: variableArray,
            stat: confidenceArray,
            time: forecastDate,
            lead: leadArray,
          }
        )
        .then((result) => {
          if (!signal.aborted) {
            let formatted = formatForecastResult(result.query, leadDates);
            // console.log(formatted)
            setPlotData(formatted);
          }
        })
        .catch((error) => {
          if (error.name !== 'AbortError') {
            setQueryStatus('error');
            console.error('Error querying forecast raster:', error);
          }
        });
    } else {
      historicalRaster
        .queryData(
          { type: 'Point', coordinates: coords },
          {
            band: variableArray,
            time: historicalDates,
          }
        )
        .then((result) => {
          if (!signal.aborted) {
            console.log(result.query);
            // setPlotData(result.query)
          }
        })
        .catch((error) => {
          if (error.name !== 'AbortError') {
            setQueryStatus('error');
            console.error('Error querying historical raster:', error);
          }
        });
    }

    return () => {
      abortController.abort(); // cancel pending request on cleanup
    };
  }, [timePeriod, coords, forecastDate]);

  // const historicalRaster = useStore((state) => state.historicalRaster);
  // const forecastRaster = useStore((state) => state.forecastRaster);

  // const fetchCountrySeries = useCallback(async () => {
  //   if (!historicalRaster || !forecastRaster) return;

  //   try {
  //     setQueryStatus('loading');

  //     // both requests in flight simultaneously — each fetches its own chunks
  //     const [historicalResult, forecastResult] = await Promise.all([
  //       historicalRaster.queryData(selector),
  //       forecastRaster.queryData(selector),
  //     ]);

  //     setQueryStatus('success');
  //     // combine for the chart — e.g., concatenated time axis
  //     setChartData({ historical: historicalResult, forecast: forecastResult });
  //   } catch (error) {
  //     setQueryStatus('error');
  //   }
  // }, [historicalRaster, forecastRaster,]);

  return (
    <Box
      as="div"
      id={'coordinates-container'}
      sx={{
        position: 'absolute',
        right: [2],
        bottom: [50],
        zIndex: 10,
        // width: '8.75rem',
        display: coordinates ? 'block' : 'none',
        color: '#fff',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '0.3rem 0.7rem',
        margin: 0,
        borderWidth: '1px',
        borderColor: 'primary',
        borderStyle: 'solid',
        borderRadius: '0.2rem',
        fontWeight: 'bold',
        fontSize: '0.9rem',
        lineHeight: '1.2rem',
      }}
    >
      {coordinates &&
        coordinates.map((coord, idx) => (
          <p key={idx} style={{ margin: 0 }}>
            {coord}
          </p>
        ))}
    </Box>
  );
}
