import { useEffect, useRef, useState } from 'react'
import { useThemeUI, Box } from 'theme-ui'
import { useMapbox } from '@carbonplan/maps'
// import { circle as Circle, point } from '@turf/turf';
import { v4 as uuidv4 } from 'uuid'

export default function PointQuery({ key, id }) {
  const { theme } = useThemeUI()
  const { map } = useMapbox()

  const removed = useRef(false)
  const sourceIdRef = useRef()
  const layerIdRef = useRef()

  function toFourDecimalPlaces(num) {
    return parseFloat(num.toFixed(4));
  }

  const coords = map.getCenter()
  const center = [coords['lng'], coords['lat']]

  const [coordinates, setCoordinates] = useState([
    `Longitude: ${toFourDecimalPlaces(center[0])}`,
    `Latitude: ${toFourDecimalPlaces(center[1])}`
  ]);

  // https://docs.mapbox.com/mapbox-gl-js/example/drag-a-point/
  const draggablePoint = {
    type: 'FeatureCollection',
    features: [
      // point(center)
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: center,
        }
      }
    ]
  };
  // const draggablePoint = Circle(center, 20, { units: 'kilometers' });
  // const draggablePoint = point(center);
  // console.log(draggablePoint)

  // console.log(center)
  // console.log()

  useEffect(() => {
    map.on('remove', () => {
      removed.current = true
    })
  }, [])

  useEffect(() => {
    sourceIdRef.current = uuidv4()
    const { current: sourceId } = sourceIdRef

    if (!map.getSource(sourceId)) {

      // const coords = map.getCenter()
      // console.log([coords['lng'], coords['lat']])
      // const center = [coords['lng'], coords['lat']]

      // draggablePoint.features[0].geometry.coordinates = center;

      map.addSource(sourceId, {
        type: 'geojson',
        data: draggablePoint,
      })
    }
  }, [key])

  useEffect(() => {
    const { current: sourceId } = sourceIdRef
    layerIdRef.current = uuidv4()
    const { current: layerId } = layerIdRef

    if (!map.getLayer(layerId)) {
      map.addLayer({
        id: layerId,
        type: 'circle',
        source: sourceId,
        paint: {
          'circle-radius': [
            // 'step', ['zoom'],
            'interpolate', ['linear'], ['zoom'],
            5, 10,
            7, 20,
          ],
          'circle-color': theme.rawColors.primary,
          'circle-stroke-width': 2,
          'circle-stroke-color': theme.rawColors.primary,
        }
      })
    }

    function onMove(e) {
      const coords = e.lngLat;

      map.getCanvas().style.cursor = 'grabbing';

      draggablePoint.features[0].geometry.coordinates = [coords.lng, coords.lat];
      map.getSource(sourceIdRef.current).setData(draggablePoint);
    }

    function onUp(e) {
      const coords = e.lngLat;

      setCoordinates([
        `Longitude: ${toFourDecimalPlaces(coords.lng)}`,
        `Latitude:   ${toFourDecimalPlaces(coords.lat)}`
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
      map.setPaintProperty(layerId, 'circle-opacity', 1.0);
    });

    map.on('mousedown', layerId, (e) => {
      map.setPaintProperty(layerId, 'circle-opacity', 0.5);

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
          map.removeLayer(layerId)
        }
      }
    }
  }, [])

  return (
    <Box
      as='div'
      id={'coordinates-container'}
      sx={{
        // width: '150px',
        borderColor: 'primary',
        borderStyle: 'solid',
        borderWidth: '1px',
        borderRadius: '3px',
        color: '#fff',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 10,
        position: 'absolute',
        right: '0.5rem',
        top: '21rem',
        padding: '5px 10px',
        margin: 0,
        display: coordinates ? 'block' : 'none',
        fontWeight: 'bold',
        fontSize: '14px',
        lineHeight: '18px',
        borderRadius: '3px',
      }}
    >
      {coordinates && (
        coordinates.map((coord, idx) => <p key={idx} style={{ margin: 0 }}>{coord}</p>)
      )}
    </Box>
  )
}