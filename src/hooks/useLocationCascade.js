import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/axios';

function normalizeList(res) {
  const data = res.data?.data ?? res.data ?? [];
  return Array.isArray(data) ? data : [];
}

/**
 * Country → governorate → city → region cascade (same as register).
 * @param {{ enabled?: boolean }} options — set enabled false to skip fetches (e.g. read-only view)
 */
export default function useLocationCascade({ enabled = true } = {}) {
  const [countries, setCountries] = useState([]);
  const [governorates, setGovernorates] = useState([]);
  const [cities, setCities] = useState([]);
  const [regions, setRegions] = useState([]);

  const [selectedCountry, setSelectedCountryState] = useState('');
  const [selectedGovernorate, setSelectedGovernorateState] = useState('');
  const [selectedCity, setSelectedCityState] = useState('');
  const [regionId, setRegionIdState] = useState('');

  const [governoratesLoading, setGovernoratesLoading] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [regionsLoading, setRegionsLoading] = useState(false);

  const hydratingRef = useRef(false);
  const pendingRegionIdRef = useRef('');

  const clearPendingRegion = useCallback(() => {
    pendingRegionIdRef.current = '';
  }, []);

  const setSelectedCountry = useCallback((value) => {
    clearPendingRegion();
    setSelectedCountryState(value);
  }, [clearPendingRegion]);

  const setSelectedGovernorate = useCallback((value) => {
    clearPendingRegion();
    setSelectedGovernorateState(value);
  }, [clearPendingRegion]);

  const setSelectedCity = useCallback((value) => {
    clearPendingRegion();
    setSelectedCityState(value);
  }, [clearPendingRegion]);

  const setRegionId = useCallback((value) => {
    clearPendingRegion();
    setRegionIdState(value);
  }, [clearPendingRegion]);

  useEffect(() => {
    if (!enabled) return;
    const fetchCountries = async () => {
      try {
        const res = await api.get('/locations/countries');
        setCountries(normalizeList(res));
      } catch {
        setCountries([{ id: 1, name: 'Egypt' }]);
      }
    };
    fetchCountries();
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !selectedCountry || hydratingRef.current) return;

    const fetchGovernorates = async () => {
      setGovernoratesLoading(true);
      try {
        const res = await api.get(`/locations/countries/${selectedCountry}/governorates`);
        setGovernorates(normalizeList(res));
        setCities([]);
        setRegions([]);
        setSelectedGovernorateState('');
        setSelectedCityState('');
        setRegionIdState('');
        clearPendingRegion();
      } catch {
        setGovernorates([]);
      } finally {
        setGovernoratesLoading(false);
      }
    };
    fetchGovernorates();
  }, [enabled, selectedCountry, clearPendingRegion]);

  useEffect(() => {
    if (!enabled || !selectedGovernorate || hydratingRef.current) return;

    const fetchCities = async () => {
      setCitiesLoading(true);
      try {
        const res = await api.get(`/locations/governorates/${selectedGovernorate}/cities`);
        setCities(normalizeList(res));
        setRegions([]);
        setSelectedCityState('');
        setRegionIdState('');
        clearPendingRegion();
      } catch {
        setCities([]);
      } finally {
        setCitiesLoading(false);
      }
    };
    fetchCities();
  }, [enabled, selectedGovernorate, clearPendingRegion]);

  useEffect(() => {
    if (!enabled || !selectedCity || hydratingRef.current) return;

    const fetchRegions = async () => {
      setRegionsLoading(true);
      try {
        const res = await api.get(`/locations/cities/${selectedCity}/regions`);
        const list = normalizeList(res);
        setRegions(list);
        if (pendingRegionIdRef.current) {
          const pending = pendingRegionIdRef.current;
          const exists = list.some((r) => String(r.id) === pending);
          setRegionIdState(exists ? pending : '');
          pendingRegionIdRef.current = '';
        } else {
          setRegionIdState('');
        }
      } catch {
        setRegions([]);
      } finally {
        setRegionsLoading(false);
      }
    };
    fetchRegions();
  }, [enabled, selectedCity]);

  useEffect(() => {
    const pending = pendingRegionIdRef.current;
    if (!pending || regions.length === 0) return;
    const exists = regions.some((r) => String(r.id) === pending);
    if (exists) {
      setRegionIdState(pending);
      pendingRegionIdRef.current = '';
    }
  }, [regions]);

  const getSnapshot = useCallback(
    () => ({
      selectedCountry,
      selectedGovernorate,
      selectedCity,
      regionId,
    }),
    [selectedCountry, selectedGovernorate, selectedCity, regionId],
  );

  const applySnapshot = useCallback((snapshot) => {
    if (!snapshot) return;
    hydratingRef.current = true;
    pendingRegionIdRef.current = snapshot.regionId ?? '';
    setSelectedCountryState(snapshot.selectedCountry ?? '');
    setSelectedGovernorateState(snapshot.selectedGovernorate ?? '');
    setSelectedCityState(snapshot.selectedCity ?? '');
    setRegionIdState(snapshot.regionId ?? '');
    queueMicrotask(() => {
      hydratingRef.current = false;
    });
  }, []);

  const hydrateFromRegion = useCallback(async (region) => {
    if (!region?.country_id) {
      hydratingRef.current = false;
      pendingRegionIdRef.current = '';
      setSelectedCountryState('');
      setSelectedGovernorateState('');
      setSelectedCityState('');
      setRegionIdState('');
      setGovernorates([]);
      setCities([]);
      setRegions([]);
      return;
    }

    hydratingRef.current = true;
    const targetRegionId = region.id ? String(region.id) : '';
    pendingRegionIdRef.current = targetRegionId;

    try {
      const countryId = String(region.country_id);
      setSelectedCountryState(countryId);

      const govRes = await api.get(`/locations/countries/${countryId}/governorates`);
      setGovernorates(normalizeList(govRes));

      if (region.governorate_id) {
        const governorateId = String(region.governorate_id);
        setSelectedGovernorateState(governorateId);

        const cityRes = await api.get(`/locations/governorates/${governorateId}/cities`);
        setCities(normalizeList(cityRes));
      }

      if (region.city_id) {
        const cityId = String(region.city_id);
        setSelectedCityState(cityId);

        const regRes = await api.get(`/locations/cities/${cityId}/regions`);
        const list = normalizeList(regRes);
        setRegions(list);

        if (targetRegionId) {
          const exists = list.some((r) => String(r.id) === targetRegionId);
          setRegionIdState(exists ? targetRegionId : '');
          if (exists) {
            pendingRegionIdRef.current = '';
          }
        }
      }
    } catch {
      // leave partial state; user can re-pick
    } finally {
      // Delay so any in-flight effects see hydratingRef=true and skip clearing regionId
      queueMicrotask(() => {
        hydratingRef.current = false;
      });
    }
  }, []);

  const resetLocation = useCallback(() => {
    pendingRegionIdRef.current = '';
    setSelectedCountryState('');
    setSelectedGovernorateState('');
    setSelectedCityState('');
    setRegionIdState('');
    setGovernorates([]);
    setCities([]);
    setRegions([]);
  }, []);

  const locationLoading =
    (Boolean(selectedGovernorate) && citiesLoading) || (Boolean(selectedCity) && regionsLoading);

  return {
    countries,
    governorates,
    cities,
    regions,
    selectedCountry,
    selectedGovernorate,
    selectedCity,
    regionId,
    setSelectedCountry,
    setSelectedGovernorate,
    setSelectedCity,
    setRegionId,
    governoratesLoading,
    citiesLoading,
    regionsLoading,
    locationLoading,
    hydrateFromRegion,
    resetLocation,
    getSnapshot,
    applySnapshot,
  };
}
