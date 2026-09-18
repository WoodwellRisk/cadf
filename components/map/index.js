import { useThemeUI } from 'theme-ui';

import MapProvider from './map-provider';
import Basemap from './basemap';
import Fill from './fill';
import Line from './line';
import { HistoricalRaster, ForecastRaster } from './raster/index';
import { PointQuery } from './query/index';
import Router from './router';
import ZoomReset from './zoom-reset';
import LayerOrder from './layer-order';
import { useStore } from '../store/index';

export const Map = () => {
  const { theme } = useThemeUI();

  const zoom = useStore((state) => state.zoom);
  const timePeriod = useStore((state) => state.timePeriod);
  const setRaster = useStore((state) => state.setRaster);

  const showLandLayer = useStore((state) => state.showLandLayer);
  const showLakesLayer = useStore((state) => state.showLakesLayer);
  const showCountriesLayer = useStore((state) => state.showCountriesLayer);
  const showStatesLayer = useStore((state) => state.showStatesLayer);
  const showCharts = useStore((store) => store.showCharts);

  return (
    <MapProvider>
      <Basemap />

      {/* {showCountriesLayer && (
        <Fill
          id={'countries-fill'}
          color={theme.rawColors.primary}
          source={'https://storage.googleapis.com/cadf/vector/countries'}
          variable={'countries'}
        />
      )} */}

      {timePeriod == 'historical' && <HistoricalRaster id={`raster`} setRaster={setRaster} />}
      {timePeriod == 'forecast' && <ForecastRaster id={`raster`} setRaster={setRaster} />}

      {showLakesLayer && (
        <>
          <Fill
            id={'lakes-fill'}
            color={theme.rawColors.hinted}
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

      <Fill
        id={'ocean'}
        color={theme.rawColors.hinted}
        source={'https://storage.googleapis.com/cadf/vector/ocean'}
        variable={'ocean'}
      />

      {showStatesLayer && (
        <Line
          id={'states'}
          color={theme.rawColors.secondary}
          source={'https://storage.googleapis.com/cadf/vector/states'}
          variable={'states'}
          width={zoom < 4 ? 0.5 : 1}
        />
      )}

      {showCountriesLayer && (
        <Line
          id={'countries'}
          color={theme.rawColors.primary}
          source={'https://storage.googleapis.com/cadf/vector/countries'}
          variable={'countries'}
          width={showStatesLayer && zoom > 2.5 ? 1.5 : 1}
        />
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

      {showCharts && <PointQuery />}

      <Router />

      <ZoomReset />

      <LayerOrder />
    </MapProvider>
  );
};
