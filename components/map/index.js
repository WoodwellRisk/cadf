import { Box, useThemeUI } from 'theme-ui';
import { useState, useEffect } from 'react';
import { Slider } from '@carbonplan/components';

import MapProvider from './map-provider';
import Basemap from './basemap';
import Fill from './fill';
import Line from './line';
import ForecastLayer from './forecast-layer';
import Raster from './raster';
import Router from './router';
import ZoomReset from './zoom-reset';
import LayerOrder from './layer-order';
import { useStore } from '../store/index';

export const Map = () => {
  const { theme } = useThemeUI();

  const zoom = useStore((state) => state.zoom);
  const variable = useStore((state) => state.variable);
  const timePeriod = useStore((state) => state.timePeriod);
  const confidence = useStore((state) => state.confidence);
  const band = useStore((state) => state.band)();
  const opacity = useStore((store) => store.opacity);
  const setOpacity = useStore((store) => store.setOpacity);
  const forecastDate = useStore((state) => state.forecastDate);
  const maxHistoricalDate = useStore((state) => state.maxHistoricalDate);

  const showLandLayer = useStore((state) => state.showLandLayer);
  const showLakesLayer = useStore((state) => state.showLakesLayer);
  const showCountriesLayer = useStore((state) => state.showCountriesLayer);
  const showStatesLayer = useStore((state) => state.showStatesLayer);
  const showCharts = useStore((store) => store.showCharts);

  useEffect(() => {
    let opacity = timePeriod == 'historical' ? 1 : 0;
    setOpacity(opacity);
  }, [timePeriod]);

  return (
    <MapProvider>
      <Basemap />

      {/* {showCharts && (
        <PointQuery key={`point-query-${showCharts}`} />
      )} */}

      <Fill
        id={'ocean'}
        color={theme.rawColors.hinted}
        source={'https://storage.googleapis.com/cadf/vector/ocean'}
        variable={'ocean'}
      />

      {/* <Fill
        id={'land'}
        color={theme.rawColors.muted}
        source={'https://storage.googleapis.com/cadf/vector/land'}
        variable={'land'}
      /> */}

      {showCountriesLayer && (
        <Line
          id={'countries'}
          color={theme.rawColors.primary}
          source={'https://storage.googleapis.com/cadf/vector/countries'}
          variable={'countries'}
          width={showStatesLayer && zoom > 2.5 ? 1.5 : 1}
        />
      )}

      {showStatesLayer && (
        <Line
          id={'states'}
          color={theme.rawColors.secondary}
          source={'https://storage.googleapis.com/cadf/vector/states'}
          variable={'states'}
          width={zoom < 4 ? 0.5 : 1}
        />
      )}

      {showLakesLayer && (
        <>
          <Fill
            id={'lakes-fill'}
            color={theme.rawColors.background}
            source={'https://storage.googleapis.com/cadf/vector/lakes'}
            variable={'lakes'}
          />

          <Line
            id={'lakes'}
            color={theme.rawColors.primary}
            source={'https://storage.googleapis.com/cadf/vector/lakes'}
            variable={'lakes'}
            width={1}
          />
        </>
      )}

      {showLandLayer && (
        <Line
          id={'land'}
          color={theme.rawColors.primary}
          source={'https://storage.googleapis.com/cadf/vector/land'}
          variable={'land'}
          width={1}
        />
      )}

      {/* <Raster
        id={'historical'}
        source={`https://storage.googleapis.com/water-balance/zarr/viz/wb-h3-${maxHistoricalDate}.zarr`}
        variable={band}
      /> */}

      <ForecastLayer
        key={`${variable}-${confidence}-${opacity}`}
        id={'forecast'}
        source={'https://storage.googleapis.com/cadf/vector'}
        band={band}
        time={forecastDate}
        showCharts={showCharts}
        borderColor={theme.rawColors.secondary}
        opacity={Number(!opacity)}
      />

      <Router />

      <ZoomReset />

      <LayerOrder />
    </MapProvider>
  );
};
