import { useCallback, useRef } from 'react'
import { keyframes } from '@emotion/react'
import { IconButton } from 'theme-ui'
import { useBreakpointIndex } from '@theme-ui/match-media'
import { useMapbox } from '@carbonplan/maps'
import { Reset } from '@carbonplan/icons'


import useStore from '../store/index'

const ZoomReset = () => {
    const isWide = useBreakpointIndex() > 0
    const { map } = useMapbox()
    const zoom = useStore((state) => state.zoom)
    const setZoom = useStore((state) => state.setZoom)
    const center = useStore((state) => state.center)
    const setCenter = useStore((state) => state.setCenter)
    const resetButton = useRef(null)

    const initialZoom = 3.00
    // const initialLon = 29.00
    const initialLon = 28.50
    const initialLat = -1.00

    map.on('zoom', () => {
        let zoom = map.getZoom().toFixed(2)
        setZoom(zoom);
    })

    map.on('move', () => {
        let center = map.getCenter()
        setCenter([Math.round(center.lng * 100) / 100, Math.round(center.lat * 100) / 100])
    })

    const spin = keyframes({
        from: {
            transform: 'rotate(0turn)'
        },
        to: {
            transform: 'rotate(1turn)'
        }
    })

    const handleResetClick = useCallback((event) => {
        // reset map
        resetButton.current = event.target
        resetButton.current.classList.add('spin')

        if (zoom != initialZoom || center[0] != initialLon || center[1] != initialLat) {
            map.flyTo({
                center: [initialLon, initialLat],
                zoom: initialZoom,
            })
        }
    })

    const handleAnimationEnd = useCallback(() => {
        resetButton.current.classList.remove('spin')
    })

    return (
        <IconButton
            aria-label='Reset map extent'
            onClick={handleResetClick}
            onAnimationEnd={handleAnimationEnd}
            disabled={zoom == initialZoom && center[0] == initialLon && center[1] == initialLat}
            sx={{
                display: isWide ? 'initial' : 'none',
                stroke: 'primary', 
                color: (zoom == initialZoom && center[0] == initialLon && center[1] == initialLat) ? 'muted' : 'primary',
                cursor: 'pointer',
                position: 'absolute',
                right: '0.5rem',
                bottom: '0.5rem',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'primary',
                bg: 'background',
                '.spin': {
                    animation: `${spin.toString()} 1s`,
                },
            }}
        >
            <Reset sx={{ strokeWidth: 1.75, width: 20, height: 20 }} />
        </IconButton>
    )
}

export default ZoomReset