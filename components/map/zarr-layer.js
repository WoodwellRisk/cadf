import { useEffect, useRef, useState } from 'react';
import { makeColormap } from '@carbonplan/colormaps';
import { ZarrLayer as ZarrDataLayer } from '@carbonplan/zarr-layer';
import { useMap } from './map-provider';
import { useMapView } from './use-map-view';
import { useStore } from '../store/index';

const ZarrLayer = ({ id, source, variable, opacity }) => {
  const zarrLayerRef = useRef(null);
  const removed = useRef(false);
  const { map } = useMap();
  const { zoom, center } = useMapView();

  // const band = useStore(state => state.band)()
  // const clim = useStore(state => state.clim)()
  // const colormap = useStore(state => state.colormap)()
  const historicalDate = useStore((state) => state.historicalDate);
  // const timePeriod = useStore(state => state.timePeriod)

  useEffect(() => {
    if (!zarrLayerRef.current) return;

    console.log(zoom);
    if (zoom < 4.5) zarrLayerRef.current.setUniforms({ u_zoom: zoom });
    if (zoom >= 4.5) zarrLayerRef.current.setUniforms({ u_zoom: zoom });
  }, [zoom]);

  const customFrag = `
    const float TILE_SIZE = 256.0;

    uniform float u_zoom;
    const float ZOOM_THRESHOLD = 4.5;
    // 0 at low zooms, 5% of a pixel width at medium / high zooms
    float borderWidth = (u_zoom >= ZOOM_THRESHOLD) ? 0.1 : 0.0;

    // recalculate the texture and color
    // https://github.com/carbonplan/zarr-layer/tree/main?tab=readme-ov-file#ndvi-example
    // band / variable name
    float dataVal = perc;
    // Handle NaN/Fill values (optional, but good practice)
    if (isnan(dataVal)) {
      fragColor.a = 0.0;
      return;
    }

    // normalize the data
    float norm = (dataVal - clim.x) / (clim.y - clim.x);
    
    // sample the colormap
    vec4 c = texture(colormap, vec2(clamp(norm, 0.0, 1.0), 0.5));
    
    // base color with opacity
    vec4 baseColor = vec4(c.rgb, opacity);

    // assuming pix_coord is 0.0 to 1.0
    vec2 texelSize = 1.0 / vec2(TILE_SIZE);
    
    // calculate the center of the current pixel in normalized space
    // floor(pix_coord / texelSize) gives the pixel index (0 to 255)
    // + 0.5 gives the center of that pixel
    vec2 pixelIndex = floor(pix_coord * TILE_SIZE) + 0.5;
    vec2 texelCenter = pixelIndex / TILE_SIZE;
    
    float dist = distance(pix_coord, texelCenter);
    // half the width of one pixel
    float maxDist = 0.5 * texelSize.x;
    
    // radius settings
    // circle fills 85% of the pixel
    float radiusFactor = 0.85;
    float outerRadius = maxDist * radiusFactor;
    float innerRadius = maxDist * (radiusFactor - borderWidth);
    
    // make area outside of the circle transparent
    if (dist > outerRadius) {
      fragColor.a = 0.0;
      return;
    }
    
    // keep original color inside circle
    if (dist <= innerRadius) {
      fragColor = baseColor;
    } 
    // add black border around circles
    // set rgb to black, keep the alpha from the base shader
    else {
      fragColor = vec4(0.0, 0.0, 0.0, opacity);
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
      uniforms: { u_zoom: zoom },
      customFrag: customFrag,
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
