import { Box } from 'theme-ui'
import { alpha } from '@theme-ui/color'

import Settings from './settings'
import useStore from '../store/index'

export default function MobileSettingsContainer() {

    const showSettings = useStore((state) => state.showSettings)
    const setShowSettings = useStore((state) => state.setShowSettings)

    return (
        <>
            <Box as='div' id='settings-options-mobile'
                sx={{
                    borderColor: 'primary',
                    borderStyle: 'solid',
                    borderWidth: '0px',
                    borderTopWidth: '1px',
                    backgroundColor: 'background',
                    '& :first-child': {
                        color: 'primary',
                        borderStyle: 'solid',
                        borderWidth: 0,
                        borderRightWidth: '1px',
                    },
                }}
            >
                <Box
                    as='div'
                    role='button'
                    onClick={() => { setShowSettings(false) }}
                    sx={{ bg: !showSettings ? alpha('muted', 0.5) : 'background' }}

                >
                    Map
                </Box>

                <Box
                    as='div'
                    role='button'
                    onClick={() => { setShowSettings(true) }}
                    sx={{ bg: showSettings ? alpha('muted', 0.5) : 'background' }}
                >
                    Settings
                </Box>
            </Box>

            {showSettings && (
                <Box 
                    as='div' 
                    id='settings-container-mobile'
                    sx={{
                        borderTopWidth: '1px',
                        borderTopStyle: 'solid',
                        borderTopColor: 'primary',
                        bg: 'background',
                    }}
                >
                    <Settings />
                </Box>
            )}
        </>
    )

}