import { useEffect, useRef } from 'react';
import { ZarrLayer } from '@carbonplan/zarr-layer';
import { useMap } from '../map-provider';
import { useStore } from '../../store/index';

// This component expects input data in the format:
// Dimensions: {'band': 2, 'stat': 6, 'time': ..., 'lead': 6, 'y': ..., 'x': ...}
// Coordinates:
//   * time         (time) <U10 '2021-01-01' '2021-02-01' ... '2024-12-01'
//   * lead         (lead) int64 1 2 3 4 5 6
//   * y            (y) float64 0.0 0.25 0.5 0.75 1.0 ... 4.25 4.5 4.75 5.0
//   * x            (x) float64 15.0 15.25 15.5 15.75 ... 19.5 19.75 20.0
//   * band         (band) object 'total' 'percentile'
//   * stat         (stat) object '5' '20' '50' '80' '95' 'confidence'
//   * spatial_ref  int64 0
// Data variables:
//     viz     (band, stat, time, lead, y, x)
//     query   (band, stat, time, lead, y, x)

const ForecastRaster = ({ id, setRaster }) => {
  const zarrLayerRef = useRef(null);
  const removed = useRef(false);
  const { map } = useMap();

  const clim = useStore((state) => state.clim)();
  const colormap = useStore((state) => state.colormap)();
  const variable = useStore((state) => state.variable);
  const time = useStore((state) => state.time);
  const lead = useStore((state) => state.lead);
  const source = `https://storage.googleapis.com/cadf/zarr/f-topozarr-3-viz-query.zarr`;

  useEffect(() => {
    if (!map) return;

    map.on('remove', () => {
      removed.current = true;
    });
  }, [map]);

  useEffect(() => {
    if (!map) return;

    const zarrLayer = new ZarrLayer({
      id: id,
      source: source,
      zarrVersion: 3,
      variable: 'viz',
      clim: clim,
      colormap: colormap,
      selector: { band: variable, stat: '50', time: time, lead: lead },
    });

    map.addLayer(zarrLayer);
    zarrLayerRef.current = zarrLayer;
    setRaster(zarrLayer);

    return () => {
      let layerId = id;
      if (map.getLayer(layerId)) map.removeLayer(layerId);
    };
  }, [map]);

  useEffect(() => {
    if (!map || !zarrLayerRef.current) return;
    let layer = zarrLayerRef.current;

    layer.setSelector({ band: variable, stat: '50', time: time, lead: lead });
  }, [map, variable, time, lead]);

  useEffect(() => {
    if (!map || !zarrLayerRef.current) return;
    let layer = zarrLayerRef.current;

    // change clim and colormap without re-rendering raster
    layer.setClim(clim);
    layer.setColormap(colormap);
  }, [map, clim, colormap]);

  return null;
};

export default ForecastRaster;
