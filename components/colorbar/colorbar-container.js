import { Box } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { Colorbar as ColorbarComponent } from '@carbonplan/components';

import { useStore } from '../store/index';

export default function Colorbar() {
  const isWide = useBreakpointIndex() > 0;

  const colormap = useStore((state) => state.colormap);
  const clim = useStore((state) => state.clim);
  const colorbarLabel = useStore((state) => state.colorbarLabel);
  const colorbarUnits = useStore((state) => state.colorbarUnits);

  const sx = {
    container: {
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
    colorbar: {
      width: '100%',
      display: 'inline-block',
      px: [2],
      my: 'auto',
    },
  };

  return (
    <Box id="colorbar-container" sx={sx['container']}>
      <ColorbarComponent
        sx={sx['colorbar']}
        sxClim={{ fontSize: [1, 1, 1, 2], pt: [1] }}
        width="100%"
        colormap={colormap}
        label={colorbarLabel}
        units={colorbarUnits}
        clim={clim}
        horizontal
        bottom
        discrete
      />
    </Box>
  );
}
