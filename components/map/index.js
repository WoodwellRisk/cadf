import { useThemeUI } from 'theme-ui'
import { Map as MapContainer, Fill, Line } from '@carbonplan/maps'
import ForecastData from './forecast-data'
import PointQuery from './point-query'
import LayerOrder from './layer-order'
// import Router from './router'
import ZoomReset from './zoom-reset'
import ZoomHelper from './zoom-helper'

import useStore from '../store/index'

const Map = () => {
  const { theme } = useThemeUI()
  const center = useStore((state) => state.center)
  const mapCenter = useStore((state) => state.mapCenter)

  const zoom = useStore((state) => state.zoom)
  const maxZoom = useStore((state) => state.maxZoom)
  const bounds = useStore((state) => state.bounds)

  const variable = useStore((state) => state.variable)
  const confidence = useStore((state) => state.confidence)
  const band = useStore((state) => state.band)()
  const time = useStore((state) => state.time)

  const showLandOutline = useStore((state) => state.showLandOutline)
  const showLakes = useStore((state) => state.showLakes)
  const showCountriesOutline = useStore((state) => state.showCountriesOutline)
  const showStatesOutline = useStore((state) => state.showStatesOutline)
  const showCharts = useStore((store) => store.showCharts)

  const sx = {
    label: {
      fontFamily: 'mono',
      letterSpacing: 'mono',
      textTransform: 'uppercase',
      fontSize: [1, 1, 1, 2],
      mt: [3],
    },
  }

  return (
    <MapContainer zoom={zoom} center={center} maxBounds={bounds} minZoom={1} maxZoom={maxZoom} >
      <Fill
        id={'ocean'}
        color={theme.rawColors.hinted}
        source={'https://storage.googleapis.com/drc-drought-forecast/vector/ocean'}
        variable={'ocean'}
      />

      {/* <Fill
          id={'land'}
          color={theme.rawColors.muted}
          source={'https://storage.googleapis.com/drc-drought-forecast/vector/land'}
          variable={'land'}
        /> */}

      {showCountriesOutline && (
        <Line
          id={'countries'}
          color={theme.rawColors.primary}
          source={'https://storage.googleapis.com/drc-drought-forecast/vector/countries'}
          variable={'countries'}
          width={showStatesOutline && zoom > 2.5 ? 1.5 : 1}
        />
      )}

      {showStatesOutline && (
        <Line
          id={'states'}
          color={theme.rawColors.secondary}
          source={'https://storage.googleapis.com/drc-drought-forecast/vector/states'}
          variable={'states'}
          width={zoom < 4 ? 0.5 : 1}
        />
      )}

      {showLakes && (
        <Fill
          id={'lakes-fill'}
          color={theme.rawColors.background}
          source={'https://storage.googleapis.com/drc-drought-forecast/vector/lakes'}
          variable={'lakes'}
        />
      )}

      {showLakes && (
        <Line
          id={'lakes'}
          color={theme.rawColors.primary}
          source={'https://storage.googleapis.com/drc-drought-forecast/vector/lakes'}
          variable={'lakes'}
          width={1}
        />
      )}

      <ForecastData
        key={`time-${variable}-${confidence}`}
        id={'forecast'}
        source={'https://storage.googleapis.com/drc-drought-forecast/vector'}
        band={band}
        time={time}
        showCharts={showCharts}
        borderColor={theme.rawColors.secondary}
      />

      {/* {showCharts && (
        <PointQuery key={`point-query-${showCharts}`} />
      )} */}

      {showLandOutline && (
        <Line
          id={'land'}
          color={theme.rawColors.primary}
          source={'https://storage.googleapis.com/drc-drought-forecast/vector/land'}
          variable={'land'}
          width={1}
        />
      )}

      {/* 
          Could look at comparing the maps directly instead of toggling between them:
            - https://github.com/maplibre/maplibre-gl-compare
          Could also try and clip output by geometry masks: 
            - https://turfjs.org/docs/api/pointsWithinPolygon
            - https://turfjs.org/docs/api/booleanIntersects
        */}

      <ZoomReset />

      <ZoomHelper />

      {/* <Router /> */}

      <LayerOrder />

    </MapContainer>
  )
}

export default Map