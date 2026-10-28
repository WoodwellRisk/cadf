import { create } from 'zustand';

// const MIN_HISTORICAL_DATE = '1991-01-01';
const MIN_HISTORICAL_DATE = '2021-01-01';
const MAX_HISTORICAL_DATE = '2024-12-01';

const MIN_FORECAST_DATE = MIN_HISTORICAL_DATE;
const MAX_FORECAST_DATE = MAX_HISTORICAL_DATE;

const MIN_BIAS_DATE = MIN_HISTORICAL_DATE;
const MAX_BIAS_DATE = MAX_HISTORICAL_DATE;

export const arrayRange = (start, end, step) => {
  let output = [];
  for (let idx = start; idx < end; idx += step) {
    output.push(idx);
  }
  return output;
};

const generateDates = (startDate, monthsRange) => {
  const dates = [];
  const [year, month, day] = startDate.split('-').map(Number);

  monthsRange.forEach((value) => {
    const date = new Date(year, month - 1 + value, day);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${d}`);
  });

  return dates;
};

// the 6 lead-month date labels following an initialization date,
// e.g. '1991-01-01' → ['1991-02-01', ..., '1991-07-01']
export const generateLeadDates = (initializationDate, numLeads = 6) =>
  generateDates(initializationDate, arrayRange(1, numLeads + 1, 1));

// https://stackoverflow.com/a/15158873
export const getDifferenceInMonths = (startDateString, endDateString) => {
  let startDate = new Date(startDateString);
  let endDate = new Date(endDateString);

  if (startDate > endDate) {
    throw new Error('End date must be later than start date.');
  }

  return (
    // the `+ 1` keeps the end date included, which we want
    endDate.getMonth() -
    startDate.getMonth() +
    1 +
    (endDate.getFullYear() - startDate.getFullYear()) * 12
  );
};

const createDates = (name, minDate, maxDate) => {
  let monthsBetweenDates = getDifferenceInMonths(minDate, maxDate);
  let monthsRange = arrayRange(0, monthsBetweenDates, 1);
  let dates = generateDates(minDate, monthsRange);

  return {
    [`${name}Dates`]: dates,
    [`${name}Date`]: maxDate,
    [`${name}SliderIndex`]: dates.length - 1,
  };
};

const createHistoricalDates = () => ({
  ...createDates('historical', MIN_HISTORICAL_DATE, MAX_HISTORICAL_DATE),
  maxHistoricalDate: MAX_HISTORICAL_DATE,
  validHistoricalMonths: arrayRange(1, 13, 1)
    .map(String)
    .map((v) => v.padStart(2, '0')),
  validHistoricalYears: arrayRange(
    Number(MIN_HISTORICAL_DATE.split('-')[0]),
    Number(MAX_HISTORICAL_DATE.split('-')[0]) + 1,
    1
  ).map(String),
});

const createForecastDates = () => ({
  ...createDates('forecast', MIN_FORECAST_DATE, MAX_FORECAST_DATE),
  forecastLeadDates: generateLeadDates(MAX_FORECAST_DATE),
});

const createBiasDates = () => ({
  ...createDates('bias', MIN_BIAS_DATE, MAX_BIAS_DATE),
  biasLeadDates: generateLeadDates(MAX_BIAS_DATE),
});

const AVAILABLE_COLORMAPS = {
  // this is the 'icefire' palette from seaborn, but reversed
  icefire: [
    '#ffd4ac',
    '#f18f51',
    '#d34936',
    '#932e44',
    '#4a252e',
    '#1f1e1e',
    '#302e4a',
    '#4a4fa5',
    '#3885d0',
    '#75b8ce',
    '#bde7db',
  ],
  // this is the RdBu colormap from Matplotlib, but with the central color changed to a different white and the two darkest colors clipped on each end
  redblue: [
    '#a51429',
    '#c94741',
    '#e58368',
    '#f7b799',
    '#fcdfcf',
    '#f6f7f7',
    '#d7e8f1',
    '#a7d0e4',
    '#68abd0',
    '#3783bb',
    '#1c5c9f',
  ],
  // this is the 'redteal' colormap from carbonplan
  redteal: [
    '#F57273',
    '#FB908D',
    '#FFACA9',
    '#FFC8C5',
    '#FFE3E1',
    '#FFFFFF',
    '#E2F1F3',
    '#C4E3E7',
    '#A6D5DB',
    '#87C7D0',
    '#64B9C4',
  ],
  // this is the 'warm' colormap from carbonplan, reversed
  warm: [
    '#FFFFFF',
    '#FFF3BE',
    '#FFE3A1',
    '#FFD391',
    '#FFC187',
    '#FEAF83',
    '#F59F8F',
    '#E8919C',
    '#D884A9',
    '#C379B6',
    '#A771C5',
  ],
  // this is the 'cool' colormap from carbonplan, reversed
  cool: [
    '#FFFFFF',
    '#F1F7BC',
    '#D6EFAF',
    '#B7E6B3',
    '#A5D8C0',
    '#A1C8CB',
    '#9EB8D1',
    '#9EA7D3',
    '#9F96D2',
    '#A384CD',
    '#A771C5',
  ],
};

const COLORMAPS = {
  percentile: AVAILABLE_COLORMAPS['redteal'],
  total: AVAILABLE_COLORMAPS['cool'],
  bias: AVAILABLE_COLORMAPS['redteal'],
};

const CLIMS = {
  percentile: [0.0, 100.0],
  total: [0.0, 300.0],
  bias: [-100.0, 100.0],
};

const COLORBAR_LABELS = {
  percentile: 'Percentile',
  total: 'Monthly total',
  bias: 'Relative bias',
};

const COLORBAR_UNITS = {
  percentile: '(%)',
  total: '(mm)',
  bias: '(%)',
};

export const TIME_PERIOD_BANDS = {
  historical: ['percentile', 'total'],
  forecast: ['percentile', 'total'],
  bias: ['bias'],
};

export const safeValue = (array, value) => {
  return array.includes(value) ? value : array[0];
};

export const useStore = create((set, get) => {
  const appState = (variable, timePeriod) => {
    const variableArray = TIME_PERIOD_BANDS[timePeriod];
    const safeVariable = safeValue(variableArray, variable);

    return {
      variableArray: variableArray,
      variable: safeVariable,
      variableIndex: variableArray.indexOf(safeVariable),
      colormap: COLORMAPS[safeVariable],
      clim: CLIMS[safeVariable],
      colorbarLabel: COLORBAR_LABELS[safeVariable],
      colorbarUnits: COLORBAR_UNITS[safeVariable],
    };
  };

  return {
    // map container state
    initialZoom: 3,
    zoom: 3,
    setZoom: (zoom) => set({ zoom }),

    // minZoom: 1,
    minZoom: 2,
    maxZoom: 7,

    // this is for the initial map load
    initialCenter: [28.5, -1.0],
    center: [28.5, -1.0],
    setCenter: (center) => set({ center }),

    // https://docs.mapbox.com/mapbox-gl-js/example/fitbounds/
    // [west, south, east, north]
    // bounds: [-11.0, -31.5, 64.0, 35.0],
    bounds: [-50.0, -41.5, 95.0, 45.0],

    timePeriod: 'historical',
    ...appState('percentile', 'historical'),

    setTimePeriod: (timePeriod) =>
      set((s) => ({
        timePeriod,
        ...appState(s.variable, timePeriod),
      })),

    setVariable: (variable) =>
      set((s) =>
        TIME_PERIOD_BANDS[s.timePeriod].includes(variable)
          ? { ...appState(variable, s.timePeriod) }
          : {}
      ),

    confidenceArray: ['5', '20', '50', '80', '95'],
    confidence: '50',
    setConfidence: (confidence) => set({ confidence }),
    confidenceIndex: 2,
    setConfidenceIndex: (confidenceIndex) => set({ confidenceIndex }),

    // used for historical date and forecast / bias initialization date slider
    sliding: false,
    setSliding: (sliding) => set({ sliding }),

    // used only for lead time slider
    leadSliding: false,
    setLeadSliding: (leadSliding) => set({ leadSliding }),

    // handle dates
    ...createHistoricalDates(),
    setHistoricalDate: (historicalDate) => set({ historicalDate }),
    setHistoricalSliderIndex: (historicalSliderIndex) => set({ historicalSliderIndex }),

    // this is for the first forecast and error raster sliders' 'initialization' date
    ...createForecastDates(),
    setForecastDate: (forecastDate) =>
      set({ forecastDate, forecastLeadDates: generateLeadDates(forecastDate) }),
    setForecastSliderIndex: (forecastSliderIndex) => set({ forecastSliderIndex }),

    ...createBiasDates(),
    setBiasDate: (biasDate) => set({ biasDate, biasLeadDates: generateLeadDates(biasDate) }),
    setBiasSliderIndex: (biasSliderIndex) => set({ biasSliderIndex }),

    // this is for the secondary forecast slider, 'target' date
    leadArray: [1, 2, 3, 4, 5, 6],
    lead: 1,
    setLead: (lead) => set({ lead }),
    leadIndex: 1,
    setLeadIndex: (leadIndex) => set({ leadIndex }),

    showTimeError: false,
    setShowTimeError: (showTimeError) => set({ showTimeError }),

    historicalRaster: null,
    setHistoricalRaster: (layer) => set({ historicalRaster: layer }),

    forecastRaster: null,
    setForecastRaster: (layer) => set({ forecastRaster: layer }),

    biasRaster: null,
    setBiasRaster: (layer) => set({ biasRaster: layer }),

    showCharts: false,
    setShowCharts: (showCharts) => set({ showCharts }),

    filterCoordinates: [],
    setFilterCoordinates: (filterCoordinates) => set({ filterCoordinates }),

    coords: [15.7, 2.6],
    setCoords: (coords) => set({ coords }),

    plotData: {},
    setPlotData: (plotData) => set({ plotData, queryStatus: 'success' }),
    setQueryStatus: (status) => set({ queryStatus: status }),

    gintoUri: null,
    setGintoUri: (gintoUri) => set({ gintoUri }),

    gemeliUri: null,
    setGemeliUri: (gemeliUri) => set({ gemeliUri }),

    showLandLayer: true,
    setShowLandLayer: (showLandLayer) => set({ showLandLayer }),

    showCountriesLayer: true,
    setShowCountriesLayer: (showCountriesLayer) => set({ showCountriesLayer }),

    showStatesLayer: false,
    setShowStatesLayer: (showStatesLayer) => set({ showStatesLayer }),

    showLakesLayer: true,
    setShowLakesLayer: (showLakesLayer) => set({ showLakesLayer }),

    showDesktopSettings: true,
    setShowDesktopSettings: (showDesktopSettings) => set({ showDesktopSettings }),

    showMobileSettings: false,
    setShowMobileSettings: (showMobileSettings) => set({ showMobileSettings }),

    showAbout: false,
    setShowAbout: (showAbout) => set({ showAbout }),

    showMenu: false,
    setShowMenu: (showMenu) => set({ showMenu }),

    showOverlays: false,
    setShowOverlays: (showOverlays) => set({ showOverlays }),
  };
});
