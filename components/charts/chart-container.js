import { Box } from 'theme-ui'
import Chart from './chart'

export default function ChartContainer({children}) {

    return (
        <Box
            as='div'
            id={'chart-container'}
            sx={{
                borderColor: 'primary',
                borderStyle: 'solid',
                borderWidth: '1px',
                backgroundColor: 'background',
                height: '17rem',
                width: '20rem',
                borderRadius: '0.5rem',
                zIndex: 10,
                position: 'absolute',
                right: '0.5rem',
                top: '0.5rem',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                overflowYd: 'hidden',
            }}
        >
            <Chart>
                {children}
            </Chart>
        </Box>
    )
}