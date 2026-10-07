"use client";

import { useEffect, useState } from "react";

export interface PublicLocation {
  id: string;
  name: string;
  slug: string;
  city?: string;
  state?: string;
  region?: string;
}

// In-memory module cache so across all components on a page we only fetch once
let cachedLocations: PublicLocation[] | null = null;
let fetchPromise: Promise<PublicLocation[]> | null = null;

export function fetchPublicLocations(): Promise<PublicLocation[]> {
  if (cachedLocations && cachedLocations.length > 0) {
    return Promise.resolve(cachedLocations);
  }
  if (fetchPromise) {
    return fetchPromise;
  }

  fetchPromise = fetch("/api/locations")
    .then((res) => {
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    })
    .then((data) => {
      if (data?.success && Array.isArray(data.locations) && data.locations.length > 0) {
        cachedLocations = data.locations;
        return data.locations as PublicLocation[];
      }
      return cachedLocations || [];
    })
    .catch(() => cachedLocations || [])
    .finally(() => {
      fetchPromise = null;
    });

  return fetchPromise;
}

export function useLocations(initial?: PublicLocation[]) {
  const [locations, setLocations] = useState<PublicLocation[]>(() => {
    if (initial && initial.length > 0) {
      if (!cachedLocations) cachedLocations = initial;
      return initial;
    }
    return cachedLocations || [];
  });
  const [loading, setLoading] = useState<boolean>(
    (!initial || initial.length === 0) && (!cachedLocations || cachedLocations.length === 0)
  );

  useEffect(() => {
    let mounted = true;
    fetchPublicLocations().then((list) => {
      if (mounted && list && list.length > 0) {
        setLocations(list);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return { locations, loading };
}
