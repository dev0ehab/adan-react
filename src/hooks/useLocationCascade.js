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

  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedGovernorate, setSelectedGovernorate] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [regionId, setRegionId] = useState('');

  const [governoratesLoading, setGovernoratesLoading] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [regionsLoading, setRegionsLoading] = useState(false);

  const skipResetRef = useRef(false);
  const hydratingRef = useRef(false);

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
    if (!enabled || !selectedCountry) return;
    const fetchGovernorates = async () => {
      setGovernoratesLoading(true);
      try {
        const res = await api.get(`/locations/countries/${selectedCountry}/governorates`);
        setGovernorates(normalizeList(res));
        if (!skipResetRef.current && !hydratingRef.current) {
          setCities([]);
          setRegions([]);
          setSelectedGovernorate('');
          setSelectedCity('');
          setRegionId('');
        }
      } catch {
        setGovernorates([]);
      } finally {
        setGovernoratesLoading(false);
      }
    };
    fetchGovernorates();
  }, [enabled, selectedCountry]);

  useEffect(() => {
    if (!enabled || !selectedGovernorate) return;
    const fetchCities = async () => {
      setCitiesLoading(true);
      try {
        const res = await api.get(`/locations/governorates/${selectedGovernorate}/cities`);
        setCities(normalizeList(res));
        if (!skipResetRef.current && !hydratingRef.current) {
          setRegions([]);
          setSelectedCity('');
          setRegionId('');
        }
      } catch {
        setCities([]);
      } finally {
        setCitiesLoading(false);
      }
    };
    fetchCities();
  }, [enabled, selectedGovernorate]);

  useEffect(() => {
    if (!enabled || !selectedCity) return;
    const fetchRegions = async () => {
      setRegionsLoading(true);
      try {
        const res = await api.get(`/locations/cities/${selectedCity}/regions`);
        setRegions(normalizeList(res));
        if (!skipResetRef.current && !hydratingRef.current) {
          setRegionId('');
        }
      } catch {
        setRegions([]);
      } finally {
        setRegionsLoading(false);
      }
    };
    fetchRegions();
  }, [enabled, selectedCity]);

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
    skipResetRef.current = true;
    setSelectedCountry(snapshot.selectedCountry ?? '');
    setSelectedGovernorate(snapshot.selectedGovernorate ?? '');
    setSelectedCity(snapshot.selectedCity ?? '');
    setRegionId(snapshot.regionId ?? '');
    queueMicrotask(() => {
      skipResetRef.current = false;
    });
  }, []);

  const hydrateFromRegion = useCallback(async (region) => {
    if (!region?.country_id) {
      setSelectedCountry('');
      setSelectedGovernorate('');
      setSelectedCity('');
      setRegionId('');
      setGovernorates([]);
      setCities([]);
      setRegions([]);
      return;
    }

    hydratingRef.current = true;
    skipResetRef.current = true;
    try {
      const countryId = String(region.country_id);
      setSelectedCountry(countryId);

      const govRes = await api.get(`/locations/countries/${countryId}/governorates`);
      setGovernorates(normalizeList(govRes));

      if (region.governorate_id) {
        const governorateId = String(region.governorate_id);
        setSelectedGovernorate(governorateId);

        const cityRes = await api.get(`/locations/governorates/${governorateId}/cities`);
        setCities(normalizeList(cityRes));
      }

      if (region.city_id) {
        const cityId = String(region.city_id);
        setSelectedCity(cityId);

        const regRes = await api.get(`/locations/cities/${cityId}/regions`);
        setRegions(normalizeList(regRes));
      }

      if (region.id) {
        setRegionId(String(region.id));
      }
    } catch {
      // leave partial state; user can re-pick
    } finally {
      skipResetRef.current = false;
      hydratingRef.current = false;
    }
  }, []);

  const resetLocation = useCallback(() => {
    setSelectedCountry('');
    setSelectedGovernorate('');
    setSelectedCity('');
    setRegionId('');
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
