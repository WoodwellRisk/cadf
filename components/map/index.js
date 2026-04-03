import { Box, useThemeUI } from 'theme-ui';
import { useState, useEffect } from 'react';
import { Slider } from '@carbonplan/components';

import MapProvider from './map-provider';
import Basemap from './basemap';
import Fill from './fill';
import Line from './line';
import ForecastLayer from './forecast-layer';
import ZarrLayer from './zarr-layer';
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

  const showLandOutline = useStore((state) => state.showLandOutline);
  const showLakes = useStore((state) => state.showLakes);
  const showCountriesOutline = useStore((state) => state.showCountriesOutline);
  const showStatesOutline = useStore((state) => state.showStatesOutline);
  const showCharts = useStore((store) => store.showCharts);

  useEffect(() => {
    let opacity = timePeriod == 'historical' ? 1 : 0;
    setOpacity(opacity);
  }, [timePeriod]);

  return (
    <MapProvider>
      <Basemap />

      {/* <ZarrLayer
        id={'historical'}
        source={`https://storage.googleapis.com/drought-monitor/zarr/viz/h3-${maxHistoricalDate}.zarr`}
        variable={band}
        opacity={opacity}
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

      {showCountriesOutline && (
        <Line
          id={'countries'}
          color={theme.rawColors.primary}
          source={'https://storage.googleapis.com/cadf/vector/countries'}
          variable={'countries'}
          width={showStatesOutline && zoom > 2.5 ? 1.5 : 1}
        />
      )}

      {showStatesOutline && (
        <Line
          id={'states'}
          color={theme.rawColors.secondary}
          source={'https://storage.googleapis.com/cadf/vector/states'}
          variable={'states'}
          width={zoom < 4 ? 0.5 : 1}
        />
      )}

      {showLakes && (
        <Fill
          id={'lakes-fill'}
          color={theme.rawColors.background}
          source={'https://storage.googleapis.com/cadf/vector/lakes'}
          variable={'lakes'}
        />
      )}

      {showLakes && (
        <Line
          id={'lakes'}
          color={theme.rawColors.primary}
          source={'https://storage.googleapis.com/cadf/vector/lakes'}
          variable={'lakes'}
          width={1}
        />
      )}

      {showLandOutline && (
        <Line
          id={'land'}
          color={theme.rawColors.primary}
          source={'https://storage.googleapis.com/cadf/vector/land'}
          variable={'land'}
          width={1}
        />
      )}

      <ZoomReset />

      <LayerOrder />
    </MapProvider>
  );
};
