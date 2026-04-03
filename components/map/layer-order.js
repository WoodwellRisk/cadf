import { useEffect } from 'react';

import { useMap } from './map-provider';
import { useStore } from '../store/index';

const LayerOrder = () => {
  const { map } = useMap();
  const timePeriod = useStore((state) => state.timePeriod);
  const showStatesOutline = useStore((state) => state.showStatesOutline);
  const showCountriesOutline = useStore((state) => state.showCountriesOutline);
  const showCharts = useStore((state) => state.showCharts);
  const band = useStore((state) => state.band)();
  const time = useStore((state) => state.time);
  const opacity = useStore((state) => state.opacity);

  // this method is only partly working
  // when the states layer is turned on after the countries layer,
  // it ends up behind the forecast data
  useEffect(() => {
    if (!map) return;

    if (showCountriesOutline && showStatesOutline) {
      let layers = map.getStyle().layers;
      let states = layers.filter((layer) => layer.source == 'states')[0];
      let countries = layers.filter((layer) => layer.source == 'countries')[0];

      if (countries.length != 0) {
        map.moveLayer(states.id, countries.id);
      }
    }
  }, [map, timePeriod, showStatesOutline]);

  // there is something wrong with this logic, where the forecast layer
  // is put above the land, ocean, states, and countries layers
  // useEffect(() => {
  //     if(!map) return
  //
  //     if (showCountriesOutline || showStatesOutline) {
  //         let layers = map.getStyle().layers;

  //         let states = layers.filter((layer) => layer.source == 'states')[0]
  //         let countries = layers.filter((layer) => layer.source == 'countries')[0]
  //         let forecast = layers.filter((layer) => layer.source == 'forecast')[0]

  //         if (forecast && showStatesOutline) {
  //             map.moveLayer(forecast.id, states.id)
  //         }

  //         if (forecast && showCountriesOutline) {
  //             map.moveLayer(forecast.id, countries.id)
  //         }
  //     }
  // }, [map, timePeriod, showStatesOutline, showCountriesOutline])

  useEffect(() => {
    if (!map) return;

    let layers = map.getStyle().layers;

    let land = layers.filter((layer) => layer.source == 'land')[0];
    let ocean = layers.filter((layer) => layer.source == 'ocean')[0];

    let states = layers.filter((layer) => layer.source == 'states')[0];
    let countries = layers.filter((layer) => layer.source == 'countries')[0];

    let forecast = layers.filter((layer) => layer.source == 'forecast')[0];
    // let historical = layers.filter((layer) => layer.source == 'historical')[0]

    if (forecast) {
      map.moveLayer(forecast.id, ocean.id);
      map.moveLayer(forecast.id, land.id);

      if (states) map.moveLayer(forecast.id, states.id);
      if (countries) map.moveLayer(forecast.id, countries.id);
    }

    // if(historical) {
    //     console.log('Should be true!!!')
    //     map.moveLayer(historical.id, ocean.id)
    //     map.moveLayer(historical.id, land.id)

    //     if(states) map.moveLayer(historical.id, states.id)
    //     if(countries) map.moveLayer(historical.id, countries.id)
    // }

    if (states && countries) {
      map.moveLayer(states.id, countries.id);
    }

    // this hides the points on or outside the land border
    // map.moveLayer(ocean.id, land.id)
  }, [map, timePeriod, band, time, opacity]);

  return null;
};

export default LayerOrder;
