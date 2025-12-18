import { Box, Link } from 'theme-ui'

import useStore from '../store/index'

export default function Menu() {
  const showMenu = useStore((state) => state.showMenu)

  const sx = {
    link: {
      fontSize: [4],
      py: [2],
      pr: '0.5rem',
      borderWidth: '0px',
      borderStyle: 'solid',
      borderColor: 'muted',
      borderBottomWidth: '1px',
      textDecoration: 'none',
      '@media (hover: hover) and (pointer: fine)': {
        '&:hover > #arrow': {
          opacity: 1,
        },
      },
      '&:hover': {
        color: 'secondary',
      },
      '&: last-child' : {
        borderBottomWidth: '0',
      },
    }
  }

  return (
    <>
      {showMenu && (
        <Box as='div' id='menu-container'
          sx={{
            borderColor: 'primary',
            borderStyle: 'solid',
            borderWidth: '1px',
            backgroundColor: 'background',
            zIndex: 30,
            position: 'absolute',
            right: '0.5rem',
            top: '0.5rem',
          }}
        >
          <Link
            className={'menu-link'}
            sx={sx.link}
            href='https://www.woodwellclimate.org/research-area/risk/'
            target="_blank"
          >
            About
          </Link>

          <Link
            className={'menu-link'}
            sx={sx.link}
            href='https://woodwellrisk.github.io/'
            target="_blank"
          >
            Research
          </Link>

          <Link
            className={'menu-link'}
            sx={sx.link}
            href='https://github.com/WoodwellRisk'
            target="_blank"
          >
            Code
          </Link>


        </Box>
      )}
    </>
  )
}