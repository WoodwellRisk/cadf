import { useEffect, useRef, useState } from 'react';
import { makeColormap } from '@carbonplan/colormaps';
import { ZarrLayer as ZarrDataLayer } from '@carbonplan/zarr-layer';
import { useMap } from './map-provider';
import { useStore } from '../store/index';

const ZarrLayer = ({ id, source, variable, opacity }) => {
  const zarrLayerRef = useRef(null);
  const removed = useRef(false);
  const { map } = useMap();

  // const band = useStore(state => state.band)()
  // const clim = useStore(state => state.clim)()
  // const colormap = useStore(state => state.colormap)()
  const historicalDate = useStore((state) => state.historicalDate);
  // const timePeriod = useStore(state => state.timePeriod)

  const customFrag = `
    // --- CONSTANTS ---
    const float TILE_SIZE = 256.0;
    const float BORDER_WIDTH = 0.05; // 5% of a pixel width
    
    // --- GEOMETRY (Assuming pix_coord is 0.0 to 1.0) ---
    vec2 texelSize = 1.0 / vec2(TILE_SIZE);
    
    // Calculate the center of the current pixel in normalized space
    // floor(pix_coord / texelSize) gives the pixel index (0 to 255)
    // + 0.5 gives the center of that pixel
    vec2 texelCenter = (floor(pix_coord / texelSize) + 0.5) * texelSize;
    
    float dist = distance(pix_coord, texelCenter);
    float maxDist = 0.5 * texelSize.x; // Half the width of one pixel
    
    // Radius settings
    float radiusFactor = 0.85; // Circle fills 85% of the pixel
    float outerRadius = maxDist * radiusFactor;
    float innerRadius = maxDist * (radiusFactor - BORDER_WIDTH);
    
    // --- MASKING LOGIC ---
    // 1. OUTSIDE the circle: Make transparent
    if (dist > outerRadius) {
      fragColor.a = 0.0;
      return;
    }
    
    // 2. INSIDE the inner circle: Keep original color
    if (dist <= innerRadius) {
      // Do nothing. fragColor is already set by the base shader.
    } 
    // 3. BORDER: Black
    else {
      // Set RGB to black, keep the alpha from the base shader
      fragColor = vec4(0.0, 0.0, 0.0, fragColor.a);
    }
  `;

  useEffect(() => {
    if (!map) return;

    map.on('remove', () => {
      removed.current = true;
    });
  }, [map]);

  useEffect(() => {
    if (!map) return;

    const zarrLayer = new ZarrDataLayer({
      id: id || 'zarr-layer',
      source: source,
      zarrVersion: 2,
      variable: variable,
      // clim: clim,
      clim: [0, 1],
      // colormap: colormap,
      colormap: makeColormap('redteal', { mode: 'light', count: 255 }),
      opacity: opacity,
      selector: { variable: variable, time: historicalDate },
      // uniforms:
      // customFrag: customFrag,
    });
    map.addLayer(zarrLayer);
    zarrLayerRef.current = zarrLayer;

    return () => {
      let layerId = id || 'zarr-layer';
      if (map.getLayer(layerId)) map.removeLayer(layerId);
    };
  }, [map, id]);

  useEffect(() => {
    if (!map || !zarrLayerRef.current) return;
    let layer = zarrLayerRef.current;

    layer.setSelector({ variable: variable, time: historicalDate });
  }, [map, historicalDate]);

  useEffect(() => {
    if (!map || !zarrLayerRef.current) return;
    let layer = zarrLayerRef.current;

    // layer.setColormap(colormap)
    // layer.setClim(clim)

    layer.setSelector({ variable: variable, time: historicalDate });
  }, [map, variable]);

  useEffect(() => {
    if (!map || !zarrLayerRef.current) return;
    let layer = zarrLayerRef.current;

    layer.setOpacity(opacity);
  }, [map, opacity]);

  return null;
};

export default ZarrLayer;
