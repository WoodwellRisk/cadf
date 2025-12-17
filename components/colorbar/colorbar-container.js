import { Box } from 'theme-ui'
import { useBreakpointIndex } from '@theme-ui/match-media'
import { Colorbar as ColorbarComponent } from '@carbonplan/components'
import { useColormap, useThemedColormap } from '@carbonplan/colormaps'

// import useCustomColormap from '../components/store/use-custom-colormap'
import useStore from '../store/index'

export default function Colorbar() {
    const isWide = useBreakpointIndex() > 0

    const variable = useStore((state) => state.variable)
    // let colormapValues = [
    //     [0.49803922, 0.74901961, 0.96078431],
    //     [0.00000000, 0.52941176, 0.78039216],
    //     [0.00000000, 0.33725490, 0.50980392],
    //     [0.00000000, 0.19215686, 0.29803922],
    //     [0.03529412, 0.09411765, 0.14117647],
    //     [0.14117647, 0.07058824, 0.06666667],
    //     [0.29411765, 0.12549020, 0.11372549],
    //     [0.49803922, 0.23529412, 0.21568627],
    //     [0.76470588, 0.38431373, 0.35686275],
    //     [0.97254902, 0.63529412, 0.61960784],
    // ]
    // const customColormap = colormapValues.map(innerArray => innerArray.map(value => parseInt(value * 256))).slice(0,).reverse();
    // const colormap = (variable == 'percent') ? customColormap : useThemedColormap(colormapName, { count: 10 })
    const colormap = useStore((state) => state.colormap)()
    const clim = useStore((state) => state.clim)()
    const defaultLabels = useStore((state) => state.defaultLabels)
    const defaultUnits = useStore((state) => state.defaultUnits)

    const sx = {
        'container': {
            height: '5rem',
            width: isWide ? '18.75rem' : '100%',
            zIndex: 10,
            position: 'absolute',
            left: isWide ? '0.5rem' : 0,
            top: isWide ? null : 0,
            bottom: isWide ? '0.5rem' : null,
            borderWidth: isWide ? '1px' : 0,
            borderBottomWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'primary',
            borderRadius: isWide ? '0.5rem' : 0,
            bg: 'background',
            alignContent: 'center',
        },
        'colorbar': {
            width: '100%', 
            display: 'inline-block',
            px: [2],
            my: 'auto',
        }
    }

    return (
        <Box id='colorbar-container' sx={sx['container']}>
            <ColorbarComponent
            sx={sx['colorbar']}
            sxClim={{ fontSize: [1, 1, 1, 2], pt: [1] }}
            width='100%'
            colormap={colormap}
            label={defaultLabels[variable]}
            units={defaultUnits[variable]}
            clim={[clim[0].toFixed(2), clim[1].toFixed(2)]}
            horizontal
            bottom
            discrete
            />
        </Box>
    )
}