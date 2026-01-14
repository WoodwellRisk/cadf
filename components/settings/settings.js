import { useCallback, useEffect } from 'react'
import { Box } from 'theme-ui'
import { useBreakpointIndex } from '@theme-ui/match-media'
import { alpha } from '@theme-ui/color'
import { Slider } from '@carbonplan/components'

import Info from '../view/info'
import useStore from '../store/index'

export default function Settings() {
  const isWide = useBreakpointIndex() > 0

  const setVariable = useStore((state) => state.setVariable)
  const confidenceArray = useStore((state) => state.confidenceArray)
  const setConfidence = useStore((state) => state.setConfidence)
  const variableIdx = useStore((state) => state.variableIdx)
  const setVariableIdx = useStore((state) => state.setVariableIdx)
  const confidenceIdx = useStore((state) => state.confidenceIdx)
  const setConfidenceIdx = useStore((state) => state.setConfidenceIdx)
  const setTime = useStore((state) => state.setTime)
  const dates = useStore((state) => state.dates)
  const sliderIndex = useStore((state) => state.sliderIndex)
  const setSliderIndex = useStore((state) => state.setSliderIndex)
  const setSliding = useStore((state) => state.setSliding)

  const sx = {
    'settings-container': {
      width: '100%',
      py: isWide ? 2 : 1,
      px: [3],
      mb: [2],
    },
    title: {
      mt: [4],
      mb: [1],
      justifyContent: 'space-between',
      alignItems: 'center',
      alignText: 'center',
      fontSize: isWide ? 2 : 1,
      letterSpacing: 'smallcaps',
      textTransform: 'uppercase',
    },
    subtitle: {
      color: 'gray',
      fontSize: isWide ? '0.9rem' : '0.75rem',
      mt: 1,
      mb: 1,
    },
    'data-description': {
      fontSize: '0.875rem',
      color: 'primary',
    },
    'data-source': {
      mt: 2,
    },
    'button': {
      alignContent: 'center', 
      justifyContent: 'center',
      textAlign: 'center',
      borderRightWidth: '1px',
      borderRightStyle: 'solid',
      borderRightColor: 'primary',
      '&:last-child': {
        borderRightWidth: '0px',
      },
    },
    'options-container': {
      width: '100%',
      height: isWide ? '2.5rem' : '2rem',
      display: 'grid',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'primary',
    },
    'variable-container': {
      gridTemplateColumns: 'repeat(2, 1fr)',
      '&:hover > .var-selection': {
        cursor: 'pointer',
      },
    },
    'confidence-container': {
        gridTemplateColumns: 'repeat(5, 1fr)',
        '&:hover > .confidence-level': {
          cursor: 'pointer',
        },
    },
    'time-slider': { 
      width: '100%', 
      mt: 3, 
      mb: 3    
    },
    'slider-labels-container': {
      textAlign: 'center',
    },
  }

  const handleVariableChange = useCallback((event) => {
    let newIdx = event.target.getAttribute('data-idx')
    setVariableIdx(newIdx)

    let variable = event.target.innerHTML == 'Water balance' ? 'percent' : event.target.innerHTML == 'Precipitation' ? 'precip' : null
    if (variable != null) {
      setVariable(variable)
    }
  })

  const handleConfidenceChange = useCallback((event) => {
    let newIdx = event.target.getAttribute('data-idx')
    setConfidenceIdx(newIdx)

    let confidence = String(event.target.innerHTML).replace('%', '')
    if (confidenceArray.includes(confidence)) {
      setConfidence(confidence)
    }
  })

  let variableLabels = ['Water balance', 'Precipitation']
  let variableOptions = variableLabels.map((label, idx) => {
    return (
      <Box 
        as='div'
        key={idx}
        data-idx={idx}
        role='button'
        className='var-selection'
        onClick={handleVariableChange}
        sx={{...sx['button'], bg: (idx == variableIdx) ? alpha('muted', 0.5) : 'background' }} 
      >
        {label}
      </Box>
    )
  })

  let confidenceLabels = ['5%', '20%', '50%', '80%', '95%']
  let confidenceOptions = confidenceLabels.map((label, idx) => {
    return (
      <Box 
        as='div'
        key={idx}
        data-idx={idx}
        role='button'
        className='confidence-selection'
        onClick={handleConfidenceChange}
        sx={{...sx['button'], bg: (idx == confidenceIdx) ? alpha('muted', 0.5) : 'background' }} 
      >
        {label}
      </Box>
    )
  })

  const handleMouseDown = useCallback(() => {
    setSliding(true)
  }, [sliderIndex])

  const handleMouseUp = useCallback(() => {
    setSliding(false)
  }, [sliderIndex])

  useEffect(() => {
    setTime(dates[sliderIndex])
  }, [sliderIndex])

  return (
    <>
      <Box sx={sx['settings-container']}>
        <Box sx={{ mt: -3 }} id='var-container'>
          <Box as='div' sx={sx.title} id='var-title'>
            Layers <Info>Select either percentile or precipitation.</Info>
          </Box>

          <Box 
              as='div'
              id={'variable-container'}
              sx={{...sx['options-container'], ...sx['variable-container']}}
            >
              {variableOptions}
          </Box>

          <Box id='confidence-layers'>
            <Box as='div' sx={sx.title} id='confidence-title'>
              Confidence level <Info>Select a confidence level to view.</Info>
            </Box>

            <Box 
              as='div'
              id={'confidence-level-container'}
              sx={{...sx['options-container'], ...sx['confidence-container']}}
            >
              {confidenceOptions}
            </Box>
          </Box>

          <Box id='time-slider-container'>
            <Box sx={{...sx.title, mb: [2]}}>Forecast date: {dates[sliderIndex]}</Box>
            <Box sx={sx.subtitle}>Months into future:</Box>
            <Slider
              id={'time-slider'}
              sx={sx['time-slider']}
              value={sliderIndex}
              onChange={(e) => setSliderIndex(e.target.value)}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              min={0}
              max={5}
              step={1}
            />

            <Box sx={sx['slider-labels-container']}>
              <Box
                sx={{
                  display: 'inline-block',
                  float: 'left',
                }}
              >
                0
              </Box>

              <Box
                sx={{
                  display: 'inline-block',
                  ml: 'auto',
                  mr: 'auto',
                  color: 'secondary',
                  transition: '0.2s',
                }}
              >
                {sliderIndex}
              </Box>

              <Box
                sx={{
                  float: 'right',
                  display: 'inline-block',
                }}
              >
                5
              </Box>
            </Box>
          </Box>

        </Box>
      </Box>

    </>
  )
}