"use client";

import { useEffect, useRef, useState } from "react";

const LocationMap = ({
  showMap,
  formData,
  setFormData,
  mapRef,
  markerRef,
  mapInstanceRef,
  fetchLocationName,
  getCurrentLocation,
  setShowMap,
  coordinateField,
  locationField,
}) => {
  const leafletLoaded = useRef(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window !== "undefined" && !leafletLoaded.current) {
        if (!window.L) {
          const linkEl = document.createElement("link");
          linkEl.rel = "stylesheet";
          linkEl.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          linkEl.integrity =
            "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
          linkEl.crossOrigin = "";
          document.head.appendChild(linkEl);

          await new Promise((resolve) => setTimeout(resolve, 100));

          const scriptEl = document.createElement("script");
          scriptEl.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          scriptEl.integrity =
            "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
          scriptEl.crossOrigin = "";
          document.body.appendChild(scriptEl);

          await new Promise((resolve) => {
            scriptEl.onload = resolve;
          });
        }
        leafletLoaded.current = true;
        initializeMap();
      }
    };

    if (showMap) {
      loadLeaflet();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [showMap]);

  useEffect(() => {
    if (
      markerRef.current &&
      formData[`${coordinateField}_latitude`] &&
      formData[`${coordinateField}_longitude`]
    ) {
      const lat = Number.parseFloat(formData[`${coordinateField}_latitude`]);
      const lng = Number.parseFloat(formData[`${coordinateField}_longitude`]);

      if (!isNaN(lat) && !isNaN(lng)) {
        markerRef.current.setLatLng([lat, lng]);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView(
            [lat, lng],
            mapInstanceRef.current.getZoom()
          );
        }
      }
    }
  }, [
    formData[`${coordinateField}_latitude`],
    formData[`${coordinateField}_longitude`],
  ]);

  const initializeMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const defaultLat = formData[`${coordinateField}_latitude`]
      ? Number.parseFloat(formData[`${coordinateField}_latitude`])
      : 8.9456;
    const defaultLng = formData[`${coordinateField}_longitude`]
      ? Number.parseFloat(formData[`${coordinateField}_longitude`])
      : 125.5456;

    const L = window.L;
    const map = L.map(mapRef.current).setView([defaultLat, defaultLng], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const marker = L.marker([defaultLat, defaultLng], {
      draggable: true,
    }).addTo(map);

    marker.on("dragend", async (e) => {
      const position = marker.getLatLng();
      setFormData({
        ...formData,
        [`${coordinateField}_latitude`]: position.lat.toFixed(6),
        [`${coordinateField}_longitude`]: position.lng.toFixed(6),
      });

      try {
        setIsLoadingLocation(true);
        await fetchLocationName(position.lat, position.lng, locationField);
      } finally {
        setIsLoadingLocation(false);
      }
    });

    map.on("click", async (e) => {
      marker.setLatLng(e.latlng);
      setFormData({
        ...formData,
        [`${coordinateField}_latitude`]: e.latlng.lat.toFixed(6),
        [`${coordinateField}_longitude`]: e.latlng.lng.toFixed(6),
      });

      try {
        setIsLoadingLocation(true);
        await fetchLocationName(e.latlng.lat, e.latlng.lng, locationField);
      } finally {
        setIsLoadingLocation(false);
      }
    });

    markerRef.current = marker;
    mapInstanceRef.current = map;

    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  };

  const handleGetCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      await getCurrentLocation();
    } finally {
      setIsLoadingLocation(false);
    }
  };

  return (
    <div className="sm:col-span-2">
      <label className="block mb-1 text-sm font-medium text-gray-700">
        Location Map
      </label>
      <div className="flex flex-col space-y-2">
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setShowMap(!showMap)}
            className="px-4 py-2 font-medium text-white rounded-md bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {showMap ? "Hide Map" : "Show Map"}
          </button>
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={isLoadingLocation}
            className={`px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isLoadingLocation ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isLoadingLocation ? (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Getting Location...
              </span>
            ) : (
              "Get Current Location"
            )}
          </button>
        </div>

        {showMap && (
          <div className="map-container" style={{ height: "300px" }}>
            <div className="map-coordinates">
              <span className="font-medium">Coordinates:</span>{" "}
              {formData[`${coordinateField}_latitude`]},{" "}
              {formData[`${coordinateField}_longitude`]}
            </div>
            <div className="w-full h-full" ref={mapRef}></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationMap;
