import { useEffect } from 'react';

import { useMap } from './map-provider';
import { useStore } from '../store/index';

const LayerOrder = () => {
  const { map } = useMap();
  const showStatesOutline = useStore((state) => state.showStatesOutline);
  const showCountriesOutline = useStore((state) => state.showCountriesOutline);

  useEffect(() => {
    if (!map) return;

    if (showCountriesOutline && showStatesOutline) {
      let layers = map.getStyle().layers;
      let countries = showCountriesOutline
        ? layers.find((layer) => layer.source == 'countries')
        : undefined;
      let states = showStatesLayer ? layers.find((layer) => layer.source == 'states') : undefined;

      if (countries.length != 0) {
        map.moveLayer(states.id, countries.id);
      }
    }
  }, [map, showCountriesOutline, showStatesOutline]);

  return null;
};

export default LayerOrder;
