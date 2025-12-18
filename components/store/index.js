import { create } from 'zustand'

const useStore = create((set, get) => ({
    // map container state
    zoom: 3,
    setZoom: (zoom) => set({ zoom }),

    minZoom: 1,
    maxZoom: 7,

    center: [29.00, -1.00],
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
        const {variable, confidence} = get()
        return `${variable}_${confidence}`
    },

    // time: '2024-09-01',
    // setTime: (time) => set({time}),

    // okay, so the issue might be that we are trying to read in a datetime64[ns] object, when we want a string
    forecast: '2025-10-01',
    time: '2025-10-01',
    dates: [
        '2025-10-01',
        '2025-11-01',
        '2025-12-01',
        '2026-01-01',
        '2026-02-01', 
        '2026-03-01',
    ],
    setTime: (time) => set({time}),

    month: 1,
    setMonth: (month) => set({ month }),

    gintoUri: null,
    setGintoUri: (gintoUri) => set({ gintoUri }),

    gemeliUri: null,
    setGemeliUri: (gemeliUri) => set({ gemeliUri }),

    // this is the 'icefire' palette from seaborn, but reversed
    icefire: ['#ffd4ac', '#f18f51', '#d34936', '#932e44', '#4a252e', '#1f1e1e', '#302e4a', '#4a4fa5', '#3885d0', '#75b8ce', '#bde7db'],
    // this is the RdBu colormap from Matplotlib, but with the central color changed to a different white and the two darkest colors clipped on each end
    redblue: ['#a51429', '#c94741', '#e58368', '#f7b799', '#fcdfcf', '#f6f7f7', '#d7e8f1', '#a7d0e4', '#68abd0', '#3783bb', '#1c5c9f'],
    // this is the 'warm' colormap from carbonplan, reversed
    warm: ['#FFFFFF', '#FFF3BE', '#FFE3A1', '#FFD391', '#FFC187', '#FEAF83', '#F59F8F', '#E8919C', '#D884A9', '#C379B6', '#A771C5'],
    // this is the 'cool' colormap from carbonplan, reversed
    cool: ['#FFFFFF', '#F1F7BC', '#D6EFAF', '#B7E6B3', '#A5D8C0', '#A1C8CB', '#9EB8D1', '#9EA7D3', '#9F96D2', '#A384CD', '#A771C5'],
    colormap: () => {
        const {variable, redblue, cool} = get()
        return variable == 'percent' ? redblue : cool
    },

    thresholds: [],
    setThresholds: (thresholds) => set({ thresholds }),

    climRanges: { 
        percent: { min: 0.0, max: 100.0 },
        precip: { min: 0.0, max: 300.0 },
    },
    clim: () => {
        const {climRanges, variable} = get()
        return [climRanges[variable].min, climRanges[variable].max]
    },

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

    sliderIndex: 0,
    setSliderIndex: (sliderIndex) => set({ sliderIndex }),

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

    // sidebar options, also used by the router component
    varTitles: { percent: 'Percentile', precip: 'Precipitation' },
    varTitle: () => {
        const {varTitles, variable} = get()
        return varTitles[variable]
    },

    varDescriptions: {
        percent: 'Percentile',
        precip: 'Precipitation',
    },
    // varDescription: 'Average monthly temperature (degrees C).',
    varDescription: () => {
        const { varDescriptions, variable} = get()
        return varDescriptions[variable]
    },
    setVarDescription: (varDescription) => set({ varDescription }),

    varTags: { percent: true, precip: false },
    setVarTags: (varTags) => set({ varTags }),
    varTagLabels: {percent: 'Percentile', precip: 'Precipitation'},

    confTags: { 5: false, 20: false, 50: true, 80: false, 95: false },
    setConfTags: (confTags) => set({ confTags }),
    confTagLabels: {5: '5%', 20: '20%', 50: '50%', 80: '80%', 95: '95%'},

    defaultLabels: { percent: 'Percentile', precip: 'Precipitation' },
    defaultUnits: { percent: '%', precip: 'mm' },

}))

export default useStore