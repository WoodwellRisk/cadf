import { useState, useCallback, useEffect } from 'react';
import { Box, Button, IconButton, Input, Select, Slider, Text } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { alpha } from '@theme-ui/color';

import { Info } from '../view/index';
import { useStore } from '../store/index';

export default function Settings() {
  const isWide = useBreakpointIndex() > 0;

  // shared variables
  const setVariable = useStore((state) => state.setVariable);
  const variableIdx = useStore((state) => state.variableIdx);
  const sliding = useStore((state) => state.sliding);
  const setSliding = useStore((state) => state.setSliding);
  const validMonths = useStore((state) => state.validMonths);
  const validYears = useStore((state) => state.validYears);
  const timePeriod = useStore((state) => state.timePeriod);
  const setTime = useStore((state) => state.setTime);

  // historical
  const maxHistoricalDate = useStore((state) => state.maxHistoricalDate);
  const historicalDates = useStore((state) => state.historicalDates);
  const historicalSliderIndex = useStore((state) => state.historicalSliderIndex);
  const setHistoricalSliderIndex = useStore((state) => state.setHistoricalSliderIndex);
  const showTimeError = useStore((state) => state.showTimeError);
  const setShowTimeError = useStore((state) => state.setShowTimeError);

  // forecast
  const setForecastDate = useStore((state) => state.setForecastDate);
  const forecastDates = useStore((state) => state.forecastDates);
  const forecastSliderIndex = useStore((state) => state.forecastSliderIndex);
  const setForecastSliderIndex = useStore((state) => state.setForecastSliderIndex);
  const leadArray = useStore((state) => state.leadArray);
  const setLead = useStore((state) => state.setLead);
  const leadIndex = useStore((state) => state.leadIndex);
  const setLeadIndex = useStore((state) => state.setLeadIndex);
  const leadDates = useStore((state) => state.leadDates);
  // const confidenceArray = useStore((state) => state.confidenceArray);
  // const setConfidence = useStore((state) => state.setConfidence);
  // const confidenceIdx = useStore((state) => state.confidenceIdx);
  // const setConfidenceIdx = useStore((state) => state.setConfidenceIdx);

  // time slider
  const sliderDates = timePeriod == 'historical' ? historicalDates : forecastDates;
  const sliderIndex = timePeriod == 'historical' ? historicalSliderIndex : forecastSliderIndex;
  const setSliderIndex =
    timePeriod == 'historical' ? setHistoricalSliderIndex : setForecastSliderIndex;
  const maxSliderIndex = sliderDates.length - 1;
  const minSliderYear = Number(sliderDates.at(0).split('-')[0]);
  const maxSliderYear = Number(sliderDates.at(-1).split('-')[0]);

  const [defaultSkipYear, defaultSkipMonth, _] = maxHistoricalDate.split('-');
  const [skipMonth, setSkipMonth] = useState(defaultSkipMonth);
  const [skipYear, setSkipYear] = useState(defaultSkipYear);

  const sx = {
    'settings-container': {
      width: '100%',
      py: isWide ? 2 : 1,
      px: 3,
      // mb: timePeriod == 'historical' ? 2 : 4,
      mb: 2,
    },
    title: {
      mt: 4,
      mb: 1,
      fontSize: isWide ? 2 : 1,
      letterSpacing: 'smallcaps',
      textTransform: 'uppercase',
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
    'difference-container': {
      gridTemplateColumns: 'repeat(1, 1fr)',
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
    'time-slider-labels-container': {
      textAlign: 'center',
      pb: timePeriod != 'historical' ? 4 : 2,
    },
    'lead-slider-labels-container': {
      textAlign: 'center',
      pb: 1,
    },
    'skip-button': {
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
    },
    'time-error': {
      color: 'red',
      outlineWidth: '1px',
      outlineStyle: 'solid',
      outlineColor: 'red',
      mt: 4,
      py: 2,
      textAlign: 'center',
    },
  };

  useEffect(() => {
    if (timePeriod == 'historical') {
      if (!sliding) setTime(historicalDates.at(sliderIndex));
    } else {
      if (!sliding) setTime(forecastDates.at(sliderIndex));
    }
  }, [sliderIndex, sliding]);

  // every time the forecast 'init date' position changes,
  // we want to reset the lead time or 'target date' back to the starting position
  useEffect(() => {
    setLeadIndex(1);
    if (!sliding) setForecastDate(forecastDates.at(forecastSliderIndex));
  }, [forecastSliderIndex, sliding]);

  useEffect(() => {
    if (!sliding) setLead(leadIndex);
  }, [leadIndex, sliding]);

  const handleVariableChange = useCallback(
    (event) => {
      const variable =
        event.target.innerHTML == 'Percentiles'
          ? 'percentile'
          : event.target.innerHTML == 'Monthly totals'
            ? 'total'
            : event.target.innerHTML == 'Relative bias'
              ? 'bias'
              : null;
      if (variable != null) setVariable(variable); // store validates + syncs variableIdx
    },
    [setVariable]
  );

  // const handleConfidenceChange = useCallback((event) => {
  //   let newIdx = event.target.getAttribute('data-idx');
  //   setConfidenceIdx(newIdx);

  //   let confidence = parseInt(String(event.target.innerHTML).replace('%', ''));
  //   if (confidenceArray.includes(confidence)) {
  //     setConfidence(confidence);
  //   }
  // });

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

  let differenceLabel = ['Relative bias'];
  let differenceOptions = differenceLabel.map((label, idx) => {
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

  // let confidenceLabels = ['5%', '20%', '50%', '80%', '95%'];
  // let confidenceOptions = confidenceLabels.map((label, idx) => {
  //   return (
  //     <Box
  //       as="div"
  //       key={idx}
  //       data-idx={idx}
  //       role="button"
  //       className="confidence-selection"
  //       onClick={handleConfidenceChange}
  //       sx={{ ...sx['button'], bg: idx == confidenceIdx ? alpha('muted', 0.5) : 'background' }}
  //     >
  //       {label}
  //     </Box>
  //   );
  // });

  const handleSkipClick = useCallback(() => {
    let tempSliderIndex = historicalDates.indexOf(`${skipYear}-${skipMonth}-01`);
    if (tempSliderIndex != -1) {
      setShowTimeError(false);
      setHistoricalSliderIndex(tempSliderIndex);
      setTime(historicalDates.at(tempSliderIndex));
    } else {
      setShowTimeError(true);
    }
  });

  return (
    <>
      <Box sx={sx['settings-container']}>
        {/* {isWide && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }} id="hide-settings-container">
            <IconButton
              aria-label="hide desktop settings container"
              // onClick={() => setShowDesktopSettings(false)}
              sx={{
                float: 'right',
                stroke: 'primary',
                cursor: 'pointer',
                width: 24,
                height: 24,
              }}
            >
              <X />
            </IconButton>
          </Box>
        )} */}

        <Box sx={{ mt: -3 }} id="var-container">
          <Box as="div" sx={sx.title} id="var-title">
            Layers{' '}
            <Info>
              View precipitation either as a percentile (%) or monthly total (mm). You can also view
              the difference between forecasted and historical precipitation totals, normalized by
              observed climatology (%).
            </Info>
          </Box>

          {(timePeriod == 'historical' || timePeriod == 'forecast') && (
            <Box
              as="div"
              id={'variable-container'}
              sx={{ ...sx['options-container'], ...sx['variable-container'] }}
            >
              {variableOptions}
            </Box>
          )}

          {timePeriod == 'difference' && (
            <Box
              as="div"
              id={'difference-container'}
              sx={{ ...sx['options-container'], ...sx['difference-container'] }}
            >
              {differenceOptions}
            </Box>
          )}

          {/* {timePeriod == 'forecast' && (
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
          )} */}

          <Box id="time-slider-container">
            <Box sx={{ ...sx.title, mb: [2] }}>
              {`${timePeriod == 'historical' ? 'Date' : 'Initialization'}: 
                ${sliderDates.at(sliderIndex)}`}
            </Box>

            <Slider
              key={'time-slider'}
              id={'time-slider'}
              sx={sx['time-slider']}
              value={sliderIndex}
              onChange={(e) => setSliderIndex(e.target.value)}
              onMouseDown={() => setSliding(true)}
              onMouseUp={() => setSliding(false)}
              onPointerUp={() => setSliding(false)}
              min={0}
              max={maxSliderIndex}
              step={1}
            />

            <Box sx={sx['time-slider-labels-container']}>
              <Box
                sx={{
                  display: 'inline-block',
                  float: 'left',
                }}
              >
                {minSliderYear}
              </Box>

              <Box
                sx={{
                  float: 'right',
                  display: 'inline-block',
                }}
              >
                {maxSliderYear}
              </Box>
            </Box>
          </Box>

          {timePeriod != 'historical' && (
            <>
              <Box sx={{ ...sx.title }}>{`Prediction: ${leadDates.at(leadIndex - 1)}`}</Box>

              <Slider
                key={'lead-slider'}
                id={'lead-slider'}
                sx={sx['time-slider']}
                value={leadIndex}
                onChange={(e) => setLeadIndex(Number(e.target.value))}
                onMouseDown={() => setSliding(true)}
                onMouseUp={() => setSliding(false)}
                onPointerUp={() => setSliding(false)}
                min={1}
                max={leadArray.length}
                step={1}
              />
            </>
          )}

          {timePeriod == 'historical' && (
            <>
              <Box id={'skip-title-container'} sx={{ ...sx.title, mb: 2 }}>
                <Text sx={{ fontSize: 1, flexBasis: isWide ? '100%' : 'auto', mb: 1 }}>
                  Jump to:
                </Text>
              </Box>
              <Box
                id={'skip-buttons-container'}
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'flex-start',
                  gap: 3,
                  alignItems: 'center',
                  alignText: 'center',
                }}
              >
                <Select
                  id={'month-skip-select'}
                  className={'skip-select'}
                  sx={{ height: '100%', px: 3 }}
                  defaultValue={defaultSkipMonth}
                  onChange={(e) => setSkipMonth(e.target.value)}
                >
                  {validMonths.map((month, idx) => {
                    return (
                      <option key={idx} value={month}>
                        {month}
                      </option>
                    );
                  })}
                </Select>

                <Select
                  id={'year-skip-select'}
                  className={'skip-select'}
                  sx={{ height: '100%', px: 3 }}
                  defaultValue={defaultSkipYear}
                  onChange={(e) => setSkipYear(e.target.value)}
                >
                  {validYears.map((year, idx) => {
                    return (
                      <option key={idx} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </Select>

                <Button onClick={handleSkipClick} sx={sx['skip-button']}>
                  <Text>go</Text>
                </Button>
              </Box>
            </>
          )}

          {showTimeError && (
            <Box sx={sx['time-error']}>
              <Text sx={{ fontSize: '15px', mx: 2 }}>
                Select a time less than: {maxHistoricalDate}
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}
