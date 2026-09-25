import { useEffect, useRef } from 'react';
import { ZarrLayer } from '@carbonplan/zarr-layer';
import { useMap } from '../map-provider';
import { useShallow } from 'zustand/react/shallow';

import { useStore } from '../../store/index';

// This component expects input data in the format:
// Dimensions: {'band': 1, 'time': ..., 'lead': 6, 'y': ..., 'x': ...}
// Coordinates:
//   * time         (time) object '2021-01-01' '2021-02-01' ... '2024-12-01'
//   * lead         (lead) int64 1 2 3 4 5 6
//   * y            (y) float64 0.0 0.25 0.5 0.75 1.0 ... 4.25 4.5 4.75 5.0
//   * x            (x) float64 15.0 15.25 15.5 15.75 ... 19.5 19.75 20.0
//   * band         (band) object 'bias'
//   * spatial_ref  int64 0
// Data variables:
//     viz     (band, time, lead, y, x)
//     query   (band, time, lead, y, x)

const DifferenceRaster = ({ id, opacity, setRaster }) => {
  const vizLayerRef = useRef(null);
  const queryLayerRef = useRef(null);
  const { map } = useMap();

  const variable = useStore((state) => state.variable);
  const clim = useStore(useShallow((state) => state.clim()));
  const colormap = useStore(useShallow((state) => state.colormap()));
  const time = useStore((state) => state.time);
  const lead = useStore((state) => state.lead);
  const source = `https://storage.googleapis.com/cadf/zarr/difference.zarr`;

  useEffect(() => {
    if (!map) return;

    const vizLayer = new ZarrLayer({
      id: `${id}-viz`,
      source: source,
      zarrVersion: 3,
      variable: 'viz',
      clim: clim,
      colormap: colormap,
      opacity: opacity,
      selector: {
        band: variable,
        time: time,
        lead: lead,
      },
    });

    const queryLayer = new ZarrLayer({
      id: `${id}-query`,
      source: source,
      zarrVersion: 3,
      variable: 'query',
      clim: clim,
      colormap: colormap,
      opacity: 0,
      selector: {
        band: variable,
        time: time,
        lead: lead,
      },
    });

    map.addLayer(vizLayer);
    map.addLayer(queryLayer);
    vizLayerRef.current = vizLayer;
    queryLayerRef.current = queryLayer;
    setRaster(queryLayer);

    return () => {
      ['viz', 'query'].forEach((suffix) => {
        const layerId = `${id}-${suffix}`;
        if (map.getLayer(layerId)) map.removeLayer(layerId);
      });
      vizLayerRef.current = null;
      queryLayerRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    if (!map || !vizLayerRef.current) return;
    let layer = vizLayerRef.current;

    layer.setSelector({ band: variable, time: time, lead: lead });
  }, [map, variable, time, lead]);

  useEffect(() => {
    if (!map || !vizLayerRef.current) return;
    let layer = vizLayerRef.current;

    // change clim and colormap without re-rendering raster
    layer.setClim(clim);
    layer.setColormap(colormap);
  }, [map, clim, colormap]);

  useEffect(() => {
    if (!map || !vizLayerRef.current) return;
    let layer = vizLayerRef.current;

    layer.setOpacity(opacity);
  }, [map, opacity]);

  return null;
};

export default DifferenceRaster;
