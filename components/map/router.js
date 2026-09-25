import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { usePathname } from 'next/navigation';

import { useMap } from './map-provider';
import { useStore } from '../store/index';

const Router = () => {
  const { map } = useMap();
  const router = useRouter();
  const pathname = usePathname();

  const [mapReady, setMapReady] = useState(false);

  const defaultZoom = useStore((state) => state.initialZoom);
  const minZoom = useStore((state) => state.minZoom);
  const maxZoom = useStore((state) => state.maxZoom);
  const setZoom = useStore((state) => state.setZoom);

  const bounds = useStore((state) => state.bounds);
  const defaultCenter = useStore((state) => state.initialCenter);
  const setCenter = useStore((state) => state.setCenter);

  const variableArray = useStore((state) => state.variableArray);
  const variable = useStore((state) => state.variable);
  const setVariable = useStore((state) => state.setVariable);
  // const confidence = useStore((state) => state.confidence);
  // const setConfidence = useStore((state) => state.setConfidence);
  // const setConfidenceIdx = useStore((state) => state.setConfidenceIdx);

  const getInitialLayer = useCallback((url) => {
    let initialLayer;
    let tempLayer = url.searchParams.get('layer');

    if (tempLayer != null && typeof tempLayer == 'string' && variableArray.includes(tempLayer)) {
      initialLayer = tempLayer;
    } else {
      initialLayer = 'percent';
    }

    url.searchParams.set('layer', initialLayer);
    return initialLayer;
  });

  const getInitialZoom = useCallback((url) => {
    let tempZoom = url.searchParams.get('zoom');
    const parsed = tempZoom != null ? parseFloat(tempZoom) : NaN;
    const isValid = !Number.isNaN(parsed) && parsed >= minZoom && parsed <= maxZoom;
    const initialZoom = isValid ? parsed : defaultZoom;

    url.searchParams.set('zoom', initialZoom);
    return initialZoom;
  });

  const getInitialCenter = useCallback((url) => {
    const tempCenter = url.searchParams.get('center');
    const parsed = tempCenter != null ? tempCenter.split(',').map(parseFloat) : null;

    const [west, south, east, north] = bounds;

    const isValid =
      parsed != null &&
      parsed.length === 2 &&
      parsed.every((d) => !Number.isNaN(d)) &&
      parsed[0] >= west &&
      parsed[0] <= east &&
      parsed[1] >= south &&
      parsed[1] <= north;

    const initialCenter = isValid ? parsed : defaultCenter;

    url.searchParams.set('center', initialCenter.join(','));
    return initialCenter;
  });

  useEffect(() => {
    const handleLoad = () => {
      setMapReady(true);
    };

    // check if page is already fully loaded
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      // page is still loading, attach listener
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  useEffect(() => {
    if (!map || !mapReady) return;

    const url = new URL(window.location.href);
    // verifySearchParams(url);
    let savedVariable = getInitialLayer(url);
    let savedZoom = getInitialZoom(url);
    let savedCenter = getInitialCenter(url);

    if (savedCenter[0] == 28.5 && savedCenter[1] == -1) {
      savedZoom = 3;
      url.searchParams.set('zoom', 3);
    }

    setVariable(savedVariable);
    setZoom(savedZoom);
    setCenter(savedCenter);

    map.easeTo({
      center: savedCenter,
      zoom: savedZoom,
      duration: 0,
    });

    router.replace(
      `${pathname}?layer=${url.searchParams.get('layer')}&zoom=${url.searchParams.get(
        'zoom'
      )}&center=${url.searchParams.get('center')}`
    );

    // prevent back button
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event
    window.history.pushState(null, null, url);
    window.onpopstate = () => window.history.go(1);
  }, [map, mapReady]);

  useEffect(() => {
    if (!map) return;

    const handleMoveEnd = () => {
      const newZoom = parseFloat(map.getZoom().toFixed(2));
      const newCenter = [
        parseFloat(map.getCenter().lng.toFixed(2)),
        parseFloat(map.getCenter().lat.toFixed(2)),
      ];

      setZoom(newZoom);
      setCenter(newCenter);

      if (router.isReady) {
        const url = new URL(window.location.href);
        url.searchParams.set('zoom', newZoom);
        url.searchParams.set('center', newCenter);
        router.replace(
          `${pathname}?layer=${url.searchParams.get('layer')}&zoom=${url.searchParams.get(
            'zoom'
          )}&center=${url.searchParams.get('center')}`
        );
      }
    };

    map.on('moveend', handleMoveEnd);

    return () => {
      map.off('moveend', handleMoveEnd);
    };
  }, [map, router.isReady, pathname]);

  useEffect(() => {
    if (router.isReady) {
      const url = new URL(window.location.href);
      url.searchParams.set('layer', variable);

      router.replace(
        `${pathname}?layer=${url.searchParams.get('layer')}&zoom=${url.searchParams.get(
          'zoom'
        )}&center=${url.searchParams.get('center')}`
      );
    }
  }, [variable]);

  return null;
};

export default Router;
