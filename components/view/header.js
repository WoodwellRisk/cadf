import { useEffect } from 'react'
import { Box, IconButton, Text } from 'theme-ui'
import { alpha } from '@theme-ui/color'
import { useBreakpointIndex } from '@theme-ui/match-media'
import { QuestionCircle, X } from '@carbonplan/icons'

import { ChartIcon, MenuIcon } from '../icons/index'
import useStore from '../store/index'

export default function Header() {
    const isWide = useBreakpointIndex() > 0

    const showMenu = useStore((state) => state.showMenu)
    const setShowMenu = useStore((state) => state.setShowMenu)
    const showAbout = useStore((state) => state.showAbout)
    const setShowAbout = useStore((state) => state.setShowAbout)
    const showCharts = useStore((state) => state.showCharts)
    const setShowCharts = useStore((state) => state.setShowCharts)
    const setPlotData = useStore((state) => state.setPlotData)

    useEffect(() => {
        if(!showCharts) {
            setPlotData({})
        }
    }, [showCharts])

    return (
        <Box 
            as='div' 
            id='header' 
            sx={{position: 'relative', bg: alpha('muted', 0.5)}}
        >
            <Box as='div' id='org-name-container'>
                <Text id='org-name-text'>Woodwell Climate</Text>
            </Box>

            <Box 
                as='div' 
                id='header-settings-container'
                sx={{
                    '#charts-toggle:hover ~ #charts-hover-error': {
                        visibility: (isWide && showMenu) ? 'visible' : 'hidden',
                    }
                }}
            >
                {/* <Dimmer aria-label='Change theme to light or dark' /> */}

                <IconButton
                    key='charts'
                    id={'charts-toggle'}
                    aria-label='Show or hide charts'
                    onClick={() => { setShowCharts(!showCharts) }}
                    disabled={showMenu}
                    sx={{ 
                        // stroke: showMenu ? alpha('primary', 0.75) : 'primary', 
                        stroke: 'primary',
                        cursor: !showMenu ? 'pointer' : 'not-allowed',
                        '&:hover': {
                            stroke: showMenu ? 'red' : 'primary',
                            p: showMenu ? '0.5rem' : 0,
                            outlineWidth: !showMenu ? '0px' : '1px',
                            outlineStyle: 'solid',
                            outlineColor: 'red',
                        }
                    }}
                >
                    { (isWide && (!showCharts || showMenu)) && (<ChartIcon />) }
                    { showCharts && (<X />) }
                </IconButton>

                <Box 
                    as='div'
                    id='charts-hover-error'
                    sx={{
                        visibility: 'hidden',
                        position: 'absolute',
                        zIndex: 40,
                        right: '0.75rem',
                        bottom: '-50%',
                        color: 'white',
                        bg: 'primary',
                        fontSize: '0.9rem',
                        p: [2],
                        borderRadius: '0.5rem',
                    }}
                >
                    Please exit from menu before continuing
                </Box>

                <IconButton
                    key='info'
                    id={'about-button'}
                    aria-label='Read more about how to use the site'
                    onClick={() => { setShowAbout(!showAbout) }}
                    sx={{ stroke: 'primary', cursor: 'pointer' }}
                >
                    { !showAbout && (<QuestionCircle sx={{flexShrink: 0}} />) }
                    { showAbout && (<X />) }
                </IconButton>

                <IconButton
                    key='menu'
                    id={'header-menu'} 
                    aria-label='Find out more about the work Woodwell does'
                    onClick={() => { setShowMenu(!showMenu) }}
                    sx={{ stroke: 'primary', cursor: 'pointer' }}
                >
                    { !showMenu && (<MenuIcon />) }
                    { showMenu && (<X />) }
                </IconButton>

            </Box>
        </Box>
    )

}