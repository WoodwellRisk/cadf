import { create } from 'zustand';

const MIN_HISTORICAL_DATE = '1991-01-01';
const MAX_HISTORICAL_DATE = '2026-02-01';
const INITIAL_FORECAST_DATE = '2025-10-01';

const range = (start, end) => {
  let output = [];
  for (let idx = start; idx < end; idx++) {
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

// https://stackoverflow.com/a/15158873
const getDifferenceInMonths = (startDateString, endDateString) => {
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

const createForecastDates = () => {
  let forecastDate = INITIAL_FORECAST_DATE;
  let monthsRange = range(0, 6);

  return {
    forecastDate: forecastDate,
    forecastMonth: 1,
    forecastDates: generateDates(forecastDate, monthsRange),
    forecastSliderIndex: 0,
  };
};

const createHistoricalDates = () => {
  let minDate = MIN_HISTORICAL_DATE;
  let maxDate = MAX_HISTORICAL_DATE;
  let monthsBetweenDates = getDifferenceInMonths(minDate, maxDate);
  let monthsRange = range(0, monthsBetweenDates);

  return {
    maxHistoricalDate: maxDate,
    historicalDate: maxDate,
    historicalDates: generateDates(minDate, monthsRange),
    historicalSliderIndex: monthsRange.at(-1),
  };
};

export const useStore = create((set, get) => ({
  // map container state
  initialZoom: 3,
  zoom: 3,
  setZoom: (zoom) => set({ zoom }),

  minZoom: 1,
  maxZoom: 7,

  // this is for the initial map load
  initialCenter: [28.5, -1.0],
  center: [28.5, -1.0],
  setCenter: (center) => set({ center }),

  // https://docs.mapbox.com/mapbox-gl-js/example/fitbounds/
  // [west, south, east, north]
  // bounds: [-31.0, -41.5, 74.0, 45.0],
  bounds: [-50.0, -41.5, 95.0, 45.0],

  variableArray: ['percent', 'precip'],
  variable: 'percent',
  setVariable: (variable) => set({ variable }),

  confidenceArray: ['5', '20', '50', '80', '95'],
  confidence: '50',
  setConfidence: (confidence) => set({ confidence }),

  band: () => {
    const { variable, timePeriod, confidence } = get();
    if (timePeriod == 'forecast') return `${variable}_${confidence}`;
    else return variable == 'percent' ? 'perc' : variable;
  },

  opacity: 0,
  setOpacity: (opacity) => set({ opacity }),

  // handle dates
  ...createForecastDates(),
  setForecastMonth: (forecastMonth) => set({ forecastMonth }),
  setForecastDate: (forecastDate) => set({ forecastDate }),
  setForecastSliderIndex: (forecastSliderIndex) => set({ forecastSliderIndex }),

  ...createHistoricalDates(),
  setHistoricalDate: (historicalDate) => set({ historicalDate }),
  setHistoricalSliderIndex: (historicalSliderIndex) => set({ historicalSliderIndex }),

  gintoUri: null,
  setGintoUri: (gintoUri) => set({ gintoUri }),

  gemeliUri: null,
  setGemeliUri: (gemeliUri) => set({ gemeliUri }),

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
  colormap: () => {
    const { variable, redteal, cool } = get();
    return variable == 'percent' ? redteal : cool;
  },

  thresholds: [],
  setThresholds: (thresholds) => set({ thresholds }),

  climRanges: {
    percent: { min: 0.0, max: 100.0 },
    precip: { min: 0.0, max: 300.0 },
  },
  clim: () => {
    const { climRanges, variable } = get();
    return [climRanges[variable].min, climRanges[variable].max];
  },

  timePeriodOptions: { historical: false, forecast: true },
  timePeriod: 'forecast',
  setTimePeriodOptions: (newOptions) => {
    const timePeriod = Object.keys(newOptions).find((key) => newOptions[key] === true);
    set({
      timePeriodOptions: newOptions,
      timePeriod: timePeriod,
    });
  },
  setTimePeriod: (timePeriod) => set({ timePeriod }),

  showCharts: false,
  setShowCharts: (showCharts) => set({ showCharts }),

  filterCoordinates: [],
  setFilterCoordinates: (filterCoordinates) => set({ filterCoordinates }),

  plotData: {},
  setPlotData: (plotData) => set({ plotData }),

  showLandOutline: true,
  setShowLandOutline: (showLandOutline) => set({ showLandOutline }),

  showCountriesOutline: true,
  setShowCountriesOutline: (showCountriesOutline) => set({ showCountriesOutline }),

  showStatesOutline: false,
  setShowStatesOutline: (showStatesOutline) => set({ showStatesOutline }),

  showLakes: true,
  setShowLakes: (showLakes) => set({ showLakes }),

  sliding: false,
  setSliding: (sliding) => set({ sliding }),

  variableIdx: 0,
  setVariableIdx: (variableIdx) => set({ variableIdx }),

  confidenceIdx: 2,
  setConfidenceIdx: (confidenceIdx) => set({ confidenceIdx }),

  showSettings: false,
  setShowSettings: (showSettings) => set({ showSettings }),

  showAbout: false,
  setShowAbout: (showAbout) => set({ showAbout }),

  showMenu: false,
  setShowMenu: (showMenu) => set({ showMenu }),

  showCharts: false,
  setShowCharts: (showCharts) => set({ showCharts }),

  showOverlays: false,
  setShowOverlays: (showOverlays) => set({ showOverlays }),

  defaultLabels: { percent: 'Percentile', precip: 'Monthly total' },
  defaultUnits: { percent: '(%)', precip: '(mm)' },
}));
