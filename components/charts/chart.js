import { useEffect } from 'react'
import { Box } from 'theme-ui'

import { fontToDataUri } from './utils'
import useStore from '../store/index'

export const Chart = ({ children }) => {

    const setGintoUri = useStore((state) => state.setGintoUri)
    const setGemeliUri = useStore((state) => state.setGemeliUri)

    // change the path later on
    useEffect(() => {
        fontToDataUri('https://storage.googleapis.com/risk-maps/media/fonts/ginto-normal-regular.ttf').then(fontUri => setGintoUri(fontUri))
        fontToDataUri('https://storage.googleapis.com/risk-maps/media/fonts/gemeli-mono-regular.ttf').then(fontUri => setGemeliUri(fontUri))
    }, [])

    return (
        <Box
            as='div'
            sx={{
                flex: '1 1 auto',
                m: [1],
                position: 'relative',
            }}
        >
            {children}
        </Box>
    )
}

export default Chart