import { useEffect, useRef } from 'react'
import { Box, useColorMode } from 'theme-ui'
import { useBreakpointIndex } from '@theme-ui/match-media'

import Meta from './meta'
import { Header, Loading, Menu } from '../components/view/index'
import { DesktopSettings, MobileSettings } from '../components/settings/index'
import Map from '../components/map/index'
import About from '../components/about/index'
import { Colorbar } from '../components/colorbar/index'
import { ChartContainer, DotChart, DownloadChartButton } from '../components/charts/index'

import useStore from '../components/store/index'

export default function Index() {
  const isWide = useBreakpointIndex() > 0
  const [colorMode, setColorMode] = useColorMode()
  const container = useRef(null)

  const showCharts = useStore((store) => store.showCharts)
  const setShowCharts = useStore((store) => store.setShowCharts)
  const plotData = useStore((store) => store.plotData)

  useEffect(() => {
    setColorMode('light')
  }, [])

  useEffect(() => {
    if(!isWide && showCharts) {
      setShowCharts(false)
    }
  }, [isWide])

  return (
    <>
      <Meta />

      <Box as='div' id='container-grid'>
        <Header />

        <Box as='div' id='main-container' ref={container}>
          <Loading />

          <Map />

          {isWide && (
            <DesktopSettings />
          )}

          {isWide && showCharts && (
            <>
             {/* 
               The ChartContainer component places the chart on the page.
               The Chart component ensures good padding and margins, plus loads the fonts that individual charts will need.
               Then individual charts are returned as SVGs that span the entire width and height of the ChartContainer component.
             */}
              <ChartContainer>
                <DotChart />
              </ChartContainer>

             {plotData && Object.keys(plotData).length > 0 && (
              <DownloadChartButton />
             )}
            </>

          )}

          {!isWide && (
            <MobileSettings />
          )}

          <Colorbar />

          <Menu />

          <About />

        </Box>

      </Box>
    </>
  )
}