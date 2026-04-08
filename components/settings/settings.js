import { useState, useCallback, useEffect } from 'react';
import { Box, Button, Input, Select, Slider, Text } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { alpha } from '@theme-ui/color';

import { Info } from '../view/index';
import { arrayRange, useStore } from '../store/index';

export default function Settings() {
  const isWide = useBreakpointIndex() > 0;

  // shared variables
  const setVariable = useStore((state) => state.setVariable);
  const variableIdx = useStore((state) => state.variableIdx);
  const setVariableIdx = useStore((state) => state.setVariableIdx);
  const timePeriod = useStore((state) => state.timePeriod);
  const setSliding = useStore((state) => state.setSliding);

  // forecast
  const confidenceArray = useStore((state) => state.confidenceArray);
  const setConfidence = useStore((state) => state.setConfidence);
  const confidenceIdx = useStore((state) => state.confidenceIdx);
  const setConfidenceIdx = useStore((state) => state.setConfidenceIdx);
  const forecastDates = useStore((state) => state.forecastDates);
  const setForecastDate = useStore((state) => state.setForecastDate);
  const forecastSliderIndex = useStore((state) => state.forecastSliderIndex);
  const setForecastSliderIndex = useStore((state) => state.setForecastSliderIndex);

  // historical
  const maxHistoricalDate = useStore((state) => state.maxHistoricalDate);
  const historicalDates = useStore((state) => state.historicalDates);
  const setHistoricalDate = useStore((state) => state.setHistoricalDate);
  const historicalSliderIndex = useStore((state) => state.historicalSliderIndex);
  const setHistoricalSliderIndex = useStore((state) => state.setHistoricalSliderIndex);

  const validMonths = arrayRange(1, 12, 1)
    .map(String)
    .map((val) => val.padStart(2, '0'));
  const validYears = arrayRange(1991, 2026, 1).map(String);

  const [defaultSkipYear, defaultSkipMonth, _] = maxHistoricalDate.split('-');
  const [skipMonth, setSkipMonth] = useState(defaultSkipMonth);
  const [skipYear, setSkipYear] = useState(defaultSkipYear);
  const [showTimeError, setShowTimeError] = useState(false);

  console.log(skipMonth, skipYear);

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
      justifyContent: isWide ? 'space-between' : 'flex-start',
      gap: isWide ? 0 : 4,
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
    button: {
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
      mb: 3,
    },
    'slider-labels-container': {
      textAlign: 'center',
      pb: timePeriod == 'forecast' ? 0 : 2,
    },
  };

  const handleVariableChange = useCallback((event) => {
    let newIdx = event.target.getAttribute('data-idx');
    setVariableIdx(newIdx);

    let variable =
      event.target.innerHTML == 'Percentiles'
        ? 'percent'
        : event.target.innerHTML == 'Monthly totals'
          ? 'precip'
          : null;
    if (variable != null) {
      setVariable(variable);
    }
  });

  const handleConfidenceChange = useCallback((event) => {
    let newIdx = event.target.getAttribute('data-idx');
    setConfidenceIdx(newIdx);

    let confidence = String(event.target.innerHTML).replace('%', '');
    if (confidenceArray.includes(confidence)) {
      setConfidence(confidence);
    }
  });

  let variableLabels = ['Percentiles', 'Monthly totals'];
  let variableOptions = variableLabels.map((label, idx) => {
    return (
      <Box
        as="div"
        key={idx}
        data-idx={idx}
        role="button"
        className="var-selection"
        onClick={handleVariableChange}
        sx={{ ...sx['button'], bg: idx == variableIdx ? alpha('muted', 0.5) : 'background' }}
      >
        {label}
      </Box>
    );
  });

  let confidenceLabels = ['5%', '20%', '50%', '80%', '95%'];
  let confidenceOptions = confidenceLabels.map((label, idx) => {
    return (
      <Box
        as="div"
        key={idx}
        data-idx={idx}
        role="button"
        className="confidence-selection"
        onClick={handleConfidenceChange}
        sx={{ ...sx['button'], bg: idx == confidenceIdx ? alpha('muted', 0.5) : 'background' }}
      >
        {label}
      </Box>
    );
  });

  const handleMouseDown = useCallback(() => {
    setSliding(true);
  }, [forecastSliderIndex, historicalSliderIndex]);

  const handleMouseUp = useCallback(() => {
    setSliding(false);
  }, [forecastSliderIndex, historicalSliderIndex]);

  useEffect(() => {
    setForecastDate(forecastDates[forecastSliderIndex]);
  }, [forecastSliderIndex]);

  useEffect(() => {
    setHistoricalDate(historicalDates[historicalSliderIndex]);
  }, [historicalSliderIndex]);

  const handleSkipClick = useCallback(() => {
    let tempSliderIndex = historicalDates.indexOf(`${skipYear}-${skipMonth}-01`);
    if (tempSliderIndex != -1) {
      setShowTimeError(false);
      setHistoricalSliderIndex(tempSliderIndex);
    } else {
      setShowTimeError(true);
    }
  });

  return (
    <>
      <Box sx={sx['settings-container']}>
        <Box sx={{ mt: -3 }} id="var-container">
          <Box as="div" sx={sx.title} id="var-title">
            Layers <Info>View precipitation either as a percentile (%) or monthly total (mm).</Info>
          </Box>

          <Box
            as="div"
            id={'variable-container'}
            sx={{ ...sx['options-container'], ...sx['variable-container'] }}
          >
            {variableOptions}
          </Box>

          {timePeriod == 'forecast' && (
            <Box id="confidence-layers">
              <Box as="div" sx={sx.title} id="confidence-title">
                Confidence level <Info>Select a confidence level to view.</Info>
              </Box>

              <Box
                as="div"
                id={'confidence-level-container'}
                sx={{ ...sx['options-container'], ...sx['confidence-container'] }}
              >
                {confidenceOptions}
              </Box>
            </Box>
          )}

          <Box id="time-slider-container">
            <Box sx={{ ...sx.title, mb: [2] }}>
              {timePeriod == 'forecast'
                ? `Forecast date: ${forecastDates[forecastSliderIndex]}`
                : `Date: ${historicalDates[historicalSliderIndex]}`}
            </Box>

            {timePeriod == 'forecast' && <Box sx={sx.subtitle}>Months into future:</Box>}

            <Slider
              key={timePeriod}
              id={'time-slider'}
              sx={sx['time-slider']}
              value={timePeriod == 'forecast' ? forecastSliderIndex : historicalSliderIndex}
              onChange={(e) =>
                timePeriod == 'forecast'
                  ? setForecastSliderIndex(e.target.value)
                  : setHistoricalSliderIndex(e.target.value)
              }
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              min={0}
              max={timePeriod == 'forecast' ? forecastDates.length - 1 : historicalDates.length - 1}
              step={1}
            />

            <Box sx={sx['slider-labels-container']}>
              <Box
                sx={{
                  display: 'inline-block',
                  float: 'left',
                }}
              >
                {timePeriod == 'forecast'
                  ? 0
                  : new Date(historicalDates.at(0) + 'T00:00:00').getFullYear()}
              </Box>

              {timePeriod == 'forecast' && (
                <Box
                  sx={{
                    display: 'inline-block',
                    ml: 'auto',
                    mr: 'auto',
                    color: 'secondary',
                    transition: '0.2s',
                  }}
                >
                  {forecastSliderIndex}
                </Box>
              )}

              <Box
                sx={{
                  float: 'right',
                  display: 'inline-block',
                }}
              >
                {timePeriod == 'forecast'
                  ? forecastDates.length - 1
                  : new Date(historicalDates.at(-1) + 'T00:00:00').getFullYear()}
              </Box>
            </Box>

            {timePeriod == 'historical' && (
              <Box
                sx={{
                  ...sx.title,
                  display: 'flex',
                  height: '2rem',
                  mb: 0,
                }}
              >
                <Text sx={{ fontSize: 1 }}>Jump to:</Text>
                {/* <Input
                  sx={{ width: '30%' }}
                  type={'number'}
                  min={1}
                  max={12}
                  step={1}
                  defaultValue={2}
                /> */}

                {/* <Input
                  sx={{ width: '20%' }}
                  type={'text'}
                  id={'month-skip-input'}
                  name={'month-input'}
                  list={'months-list'}
                  onChange={(e) => setSkipMonth(e.target.value.padStart(2, '0'))}
                  // placeholder={skipMonth}
                />
                <datalist id='months-list'>
                  {validMonths.map((y, idx) => {
                    return <option key={idx} value={y} />
                  })}
                </datalist> */}

                {/* <Input
                  sx={{ width: '25%' }}
                  type={'text'}
                  id={'year-skip-input'}
                  name={'year-input'}
                  list={'years-list'}
                  onChange={(e) => setSkipYear(e.target.value)}
                  // placeholder={skipYear}
                />
                <datalist id='years-list'>
                  {validYears.map((y, idx) => {
                    return <option key={idx} value={y} />
                  })}
                </datalist> */}

                <Select
                  id={'month-skip-select'}
                  className={'skip-select'}
                  sx={{ height: '100%', px: 3 }}
                  onChange={(e) => setSkipMonth(e.target.value)}
                >
                  {validMonths.map((month, idx) => {
                    if (month == defaultSkipMonth) {
                      return (
                        <option key={idx} value={month} selected>
                          {month}
                        </option>
                      );
                    } else {
                      return (
                        <option key={idx} value={month}>
                          {month}
                        </option>
                      );
                    }
                  })}
                </Select>

                <Select
                  id={'year-skip-select'}
                  className={'skip-select'}
                  sx={{ height: '100%', px: 3 }}
                  onChange={(e) => setSkipYear(e.target.value)}
                >
                  {validYears.map((year, idx) => {
                    if (year == defaultSkipYear) {
                      return (
                        <option key={idx} value={year} selected>
                          {year}
                        </option>
                      );
                    } else {
                      return (
                        <option key={idx} value={year}>
                          {year}
                        </option>
                      );
                    }
                  })}
                </Select>

                <Button
                  onClick={handleSkipClick}
                  sx={{
                    color: 'secondary',
                    bg: 'background',
                    outlineWidth: '1px',
                    outlineStyle: 'solid',
                    outlineColor: 'secondary',
                    letterSpacing: 'smallcaps',
                    textTransform: 'uppercase',
                    '&:hover': {
                      color: 'primary',
                      bg: alpha('muted', 0.5),
                      outlineWidth: '1px',
                      outlineStyle: 'solid',
                      outlineColor: 'primary',
                    },
                    '&:active': {
                      color: 'background',
                      bg: 'primary',
                      outlineWidth: '1px',
                      outlineStyle: 'solid',
                      outlineColor: 'primary',
                    },
                    '&:focus:not(:active)': {
                      color: 'primary',
                      bg: alpha('muted', 0.5),
                      outlineWidth: '1px',
                      outlineStyle: 'solid',
                      outlineColor: 'primary',
                    },
                    '&:focus:not(:hover)': {
                      color: 'secondary',
                      bg: 'background',
                      outlineWidth: '1px',
                      outlineStyle: 'solid',
                      outlineColor: 'secondary',
                    },
                  }}
                >
                  <Text>go</Text>
                </Button>
              </Box>
            )}

            {showTimeError && (
              <Box
                sx={{
                  color: 'red',
                  outlineWidth: '1px',
                  outlineStyle: 'solid',
                  outlineColor: 'red',
                  mt: 4,
                  py: 2,
                  textAlign: 'center',
                }}
              >
                <Text sx={{ fontSize: '15px', mx: 2 }}>
                  Select a time less than: {maxHistoricalDate}
                </Text>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
}
