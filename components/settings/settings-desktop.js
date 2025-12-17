import { Box } from 'theme-ui'

import Settings from './settings'

export default function DesktopSettingsContainer() {

    return (
        <Box as='div' id='settings-container-desktop'
            sx={{
                borderColor: 'primary',
                borderStyle: 'solid',
                borderWidth: '1px',
                backgroundColor: 'background',
                // opacity: 0.75
            }}
        >
            <Settings />
        </Box>
    )

}