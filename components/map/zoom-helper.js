import { useEffect } from 'react'
import { useMapbox } from '@carbonplan/maps'

import useStore from '../store/index'

export default function ZoomHelper() {

    const { map } = useMapbox()
    const setMapCenter = useStore((state) => state.setMapCenter)

    const handleMoveEnd = () => {
        let center = map.getCenter()
        setMapCenter([center['lng'], center['lat']])
    };
    
    const handleZoomEnd = () => {
        let center = map.getCenter()
        setMapCenter([center['lng'], center['lat']])
    };
    
    map.on('moveend', handleMoveEnd);
    map.on('zoomend', handleZoomEnd);

    return null
}