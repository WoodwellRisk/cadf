import { Box, IconButton, Text } from 'theme-ui'
import { alpha } from '@theme-ui/color'
import { QuestionCircle, X } from '@carbonplan/icons'

import MenuIcon from '../icons/menu-icon'
import useStore from '../store/index'

export default function Header() {
    const showMenu = useStore((state) => state.showMenu)
    const setShowMenu = useStore((state) => state.setShowMenu)
    const showAbout = useStore((state) => state.showAbout)
    const setShowAbout = useStore((state) => state.setShowAbout)

    return (
        <Box as='div' id='header' sx={{bg: alpha('muted', 0.5)}}>
            <Box as='div' id='org-name-container'>
                <Text id='org-name-text'>Woodwell Climate</Text>
            </Box>

            <Box as='div' id='header-settings-container'>
                {/* <Dimmer aria-label='Change theme to light or dark' /> */}

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