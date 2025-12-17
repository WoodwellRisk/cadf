import { Box } from 'theme-ui'

export default function MenuIcon() {

    return (
        <Box as='svg'
            sx={{
                width: '3.125rem',
                height: '2rem',
                strokeWidth: '1.5',
                flexShrink: 0,
            }}
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 70 35'
        >
            <line x1='15' y1='5' x2='50' y2='5' vectorEffect='non-scaling-stroke' />
            <line x1='15' y1='17.5' x2='50' y2='17.5' vectorEffect='non-scaling-stroke' />
            <line x1='15' y1='30' x2='50' y2='30' vectorEffect='non-scaling-stroke' />
        </Box>
    )
}