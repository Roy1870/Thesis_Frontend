"use client";

import { useState, useEffect, useRef } from "react";
import { farmerAPI, livestockAPI, operatorAPI } from "./services/api";
import AddDataHeader from "./add-data/add-data-header";
import MessageDisplay from "./add-data/message-display";
import FarmerInformation from "./add-data/farmer-information";
import OperatorInformation from "./add-data/operator-information";
import RaiserInformation from "./add-data/raiser-information";
import GrowerInformation from "./add-data/grower-information";
import CropInformation from "./add-data/crop-information/crop-information";
import SubmitButton from "./add-data/submit-button";

const AddData = () => {
  const [formData, setFormData] = useState({
    name: "",
    contact_number: "",
    facebook_email: "",
    barangay: "",
    home_address: "",
    farmer_type: "",
    rsbsa_id: "",
    farm_address: "",
    farm_location_longitude: "",
    farm_location_latitude: "",
    market_outlet_location: "",
    buyer_name: "",
    association_organization: "",
    fishpond_location: "",
    operator_location_longitude: "",
    operator_location_latitude: "",
    area_type: "",
    seed_type: "",
    area_harvested: "",
    production: "",
    ave_yield: "",
    month: "",
    high_value_crop: "",
    variety_clone: "",
    cropping_intensity: "",
    quantity: "",
    crop_value: "",
  });

  const [farmerType, setFarmerType] = useState(null);
  const [animals, setAnimals] = useState([
    { animal_type: "", subcategory: "", quantity: "" },
  ]);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [selectedVegetable, setSelectedVegetable] = useState(null);
  const [additionalRiceDetails, setAdditionalRiceDetails] = useState([
    {
      area_type: "",
      seed_type: "",
      area_harvested: "",
      production: "",
      ave_yield: "",
    },
  ]);
  const [additionalSpiceDetails, setAdditionalSpiceDetails] = useState([
    { spices_type: "", quantity: "" },
  ]);
  const [additionalLegumesDetails, setAdditionalLegumesDetails] = useState([
    { legumes_type: "", quantity: "" },
  ]);
  const [additionalBananaDetails, setAdditionalBananaDetails] = useState([
    { banana_type: "", quantity: "" },
  ]);
  const [additionalVegetableDetails, setAdditionalVegetableDetails] = useState([
    { vegetable_type: "", quantity: "", other_vegetable: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });
  const [showMap, setShowMap] = useState(false);
  const [showOperatorMap, setShowOperatorMap] = useState(false);

  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const operatorMapRef = useRef(null);
  const operatorMarkerRef = useRef(null);
  const operatorMapInstanceRef = useRef(null);

  // Add this function near the top of your component, before the useEffect hooks
  const fetchWithCorsProxy = async (url, options = {}) => {
    try {
      // Try direct fetch first (many modern browsers allow this now)
      try {
        const directResponse = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            "User-Agent": "Agricultural Inventory App",
          },
        });

        if (directResponse.ok) {
          return directResponse;
        }
      } catch (directError) {
        console.log("Direct fetch failed, trying alternatives...");
      }

      // Try multiple CORS proxies in sequence
      const corsProxies = [
        "https://corsproxy.io/?",
        "https://api.allorigins.win/raw?url=",
        "https://cors-anywhere.herokuapp.com/",
      ];

      let lastError = null;

      for (const proxy of corsProxies) {
        try {
          const response = await fetch(proxy + url, {
            ...options,
            headers: {
              ...options.headers,
              "X-Requested-With": "XMLHttpRequest",
            },
          });

          if (response.ok) {
            return response;
          }
        } catch (error) {
          lastError = error;
          console.log(`Proxy ${proxy} failed, trying next...`);
        }
      }

      throw lastError || new Error("All proxies failed");
    } catch (error) {
      console.error("Error fetching with CORS proxies:", error);
      throw error;
    }
  };

  // Initialize map when component mounts and showMap is true
  useEffect(() => {
    if ((showMap || showOperatorMap) && typeof window !== "undefined") {
      // Dynamically import Leaflet only on client side
      const loadLeaflet = async () => {
        // Only load if not already loaded
        if (!window.L) {
          // Add Leaflet CSS
          const linkEl = document.createElement("link");
          linkEl.rel = "stylesheet";
          linkEl.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          linkEl.integrity =
            "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
          linkEl.crossOrigin = "";
          document.head.appendChild(linkEl);

          // Wait for CSS to load
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Add Leaflet JS
          const scriptEl = document.createElement("script");
          scriptEl.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          scriptEl.integrity =
            "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
          scriptEl.crossOrigin = "";
          document.body.appendChild(scriptEl);

          // Wait for script to load
          await new Promise((resolve) => {
            scriptEl.onload = resolve;
          });
        }

        if (showMap) {
          initializeMap();
        }

        if (showOperatorMap) {
          initializeOperatorMap();
        }
      };

      loadLeaflet();
    }

    return () => {
      // Clean up map when component unmounts
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      if (operatorMapInstanceRef.current) {
        operatorMapInstanceRef.current.remove();
        operatorMapInstanceRef.current = null;
      }
    };
  }, [showMap, showOperatorMap]);

  // Update marker position when coordinates change
  useEffect(() => {
    if (
      markerRef.current &&
      formData.farm_location_latitude &&
      formData.farm_location_longitude
    ) {
      const lat = Number.parseFloat(formData.farm_location_latitude);
      const lng = Number.parseFloat(formData.farm_location_longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        markerRef.current.setLatLng([lat, lng]);
        mapInstanceRef.current.setView(
          [lat, lng],
          mapInstanceRef.current.getZoom()
        );
      }
    }
  }, [formData.farm_location_latitude, formData.farm_location_longitude]);

  // Update operator marker position when coordinates change
  useEffect(() => {
    if (
      operatorMarkerRef.current &&
      formData.operator_location_latitude &&
      formData.operator_location_longitude
    ) {
      const lat = Number.parseFloat(formData.operator_location_latitude);
      const lng = Number.parseFloat(formData.operator_location_longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        operatorMarkerRef.current.setLatLng([lat, lng]);
        operatorMapInstanceRef.current.setView(
          [lat, lng],
          operatorMapInstanceRef.current.getZoom()
        );
      }
    }
  }, [
    formData.operator_location_latitude,
    formData.operator_location_longitude,
  ]);

  // Add this new function for reverse geocoding
  const fetchLocationName = async (
    latitude,
    longitude,
    locationField = "fishpond_location"
  ) => {
    setMessage({
      type: "info",
      content: "Fetching location name...",
    });

    try {
      // Try OpenStreetMap's Nominatim API first
      try {
        const response = await fetchWithCorsProxy(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
          {
            headers: {
              Accept: "application/json",
              "User-Agent": "Agricultural Inventory App",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();

          // Extract relevant location information
          let locationName = "";

          if (data.display_name) {
            const addressParts = [];

            if (data.address) {
              if (data.address.water) addressParts.push(data.address.water);
              if (data.address.hamlet) addressParts.push(data.address.hamlet);
              if (data.address.village) addressParts.push(data.address.village);
              if (data.address.town) addressParts.push(data.address.town);
              if (data.address.city) addressParts.push(data.address.city);
              if (data.address.municipality)
                addressParts.push(data.address.municipality);
              if (data.address.county) addressParts.push(data.address.county);
              if (data.address.state) addressParts.push(data.address.state);
            }

            locationName =
              addressParts.length > 0
                ? addressParts.join(", ")
                : data.display_name.split(",").slice(0, 3).join(",");

            setFormData((prevData) => ({
              ...prevData,
              [locationField]: locationName,
            }));

            setMessage({
              type: "success",
              content: "Location name retrieved successfully!",
            });

            return;
          }
        }
      } catch (nominatimError) {
        console.error("Nominatim error:", nominatimError);
      }

      // Fallback to BigDataCloud API if Nominatim fails
      try {
        const response = await fetchWithCorsProxy(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          {
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();

          const locationParts = [];
          if (data.locality) locationParts.push(data.locality);
          if (data.city) locationParts.push(data.city);
          if (data.principalSubdivision)
            locationParts.push(data.principalSubdivision);

          const locationName =
            locationParts.length > 0
              ? locationParts.join(", ")
              : `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

          setFormData((prevData) => ({
            ...prevData,
            [locationField]: locationName,
          }));

          setMessage({
            type: "success",
            content: "Location name retrieved successfully!",
          });

          return;
        }
      } catch (bigDataCloudError) {
        console.error("BigDataCloud error:", bigDataCloudError);
      }

      // If all APIs fail, use coordinates
      throw new Error("Could not retrieve location name from any service");
    } catch (error) {
      console.error("Error fetching location name:", error);

      // Fallback to coordinates
      setFormData((prevData) => ({
        ...prevData,
        [locationField]: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      }));

      setMessage({
        type: "warning",
        content: "Could not retrieve location name. Using coordinates instead.",
      });
    }
  };

  // Function for reverse geocoding for grower
  const fetchGrowerLocationName = async (latitude, longitude) => {
    await fetchLocationName(latitude, longitude, "farm_address");
  };

  // Also update the getOperatorCurrentLocation function to use reverse geocoding
  const getOperatorCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

            setFormData({
              ...formData,
              operator_location_latitude: latitude.toFixed(6),
              operator_location_longitude: longitude.toFixed(6),
            });

            // Update map view and marker if map is initialized
            if (operatorMapInstanceRef.current && operatorMarkerRef.current) {
              operatorMarkerRef.current.setLatLng([latitude, longitude]);
              operatorMapInstanceRef.current.setView([latitude, longitude], 15);
            }

            // Fetch location name based on coordinates
            try {
              await fetchLocationName(latitude, longitude, "fishpond_location");
              resolve();
            } catch (error) {
              console.error("Error fetching location name:", error);
              resolve(); // Still resolve the promise even if location name fetch fails
            }
          },
          (error) => {
            console.error("Error getting location:", error);

            let errorMessage = "Unable to retrieve your location.";

            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage +=
                  " Location permission denied. Please check your browser settings.";
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage += " Location information is unavailable.";
                break;
              case error.TIMEOUT:
                errorMessage += " The request to get location timed out.";
                break;
              default:
                errorMessage += " An unknown error occurred.";
            }

            setMessage({
              type: "error",
              content: errorMessage,
            });

            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      } else {
        const errorMessage = "Geolocation is not supported by this browser.";
        setMessage({
          type: "error",
          content: errorMessage,
        });
        reject(new Error(errorMessage));
      }
    });
  };

  // Function to get current location
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

            setFormData({
              ...formData,
              farm_location_latitude: latitude.toFixed(6),
              farm_location_longitude: longitude.toFixed(6),
            });

            // Update map view and marker if map is initialized
            if (mapInstanceRef.current && markerRef.current) {
              markerRef.current.setLatLng([latitude, longitude]);
              mapInstanceRef.current.setView([latitude, longitude], 15);
            }

            // Fetch location name based on coordinates
            try {
              await fetchGrowerLocationName(latitude, longitude);
              resolve();
            } catch (error) {
              console.error("Error fetching location name:", error);
              resolve(); // Still resolve the promise even if location name fetch fails
            }
          },
          (error) => {
            console.error("Error getting location:", error);

            let errorMessage = "Unable to retrieve your location.";

            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage +=
                  " Location permission denied. Please check your browser settings.";
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage += " Location information is unavailable.";
                break;
              case error.TIMEOUT:
                errorMessage += " The request to get location timed out.";
                break;
              default:
                errorMessage += " An unknown error occurred.";
            }

            setMessage({
              type: "error",
              content: errorMessage,
            });

            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      } else {
        const errorMessage = "Geolocation is not supported by this browser.";
        setMessage({
          type: "error",
          content: errorMessage,
        });
        reject(new Error(errorMessage));
      }
    });
  };

  // Update the map click handler in initializeOperatorMap to use reverse geocoding
  const initializeOperatorMap = () => {
    if (!operatorMapRef.current || operatorMapInstanceRef.current) return;

    // Default coordinates for Philippines (can be adjusted to your specific region)
    const defaultLat = formData.operator_location_latitude
      ? Number.parseFloat(formData.operator_location_latitude)
      : 8.9456;

    const defaultLng = formData.operator_location_longitude
      ? Number.parseFloat(formData.operator_location_longitude)
      : 125.5456;

    // Initialize map
    const L = window.L;
    const map = L.map(operatorMapRef.current).setView(
      [defaultLat, defaultLng],
      13
    );

    // Add tile layer (OpenStreetMap)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Add marker
    const marker = L.marker([defaultLat, defaultLng], {
      draggable: true,
    }).addTo(map);

    // Handle marker drag events
    marker.on("dragend", (e) => {
      const position = marker.getLatLng();
      setFormData({
        ...formData,
        operator_location_latitude: position.lat.toFixed(6),
        operator_location_longitude: position.lng.toFixed(6),
      });

      // Fetch location name based on new coordinates
      fetchLocationName(position.lat, position.lng, "fishpond_location");
    });

    // Handle map click events
    map.on("click", (e) => {
      marker.setLatLng(e.latlng);
      setFormData({
        ...formData,
        operator_location_latitude: e.latlng.lat.toFixed(6),
        operator_location_longitude: e.latlng.lng.toFixed(6),
      });

      // Fetch location name based on clicked coordinates
      fetchLocationName(e.latlng.lat, e.latlng.lng, "fishpond_location");
    });

    // Store references
    operatorMarkerRef.current = marker;
    operatorMapInstanceRef.current = map;

    // Fix map display issue by triggering a resize after a short delay
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  };

  const initializeMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Default coordinates for Philippines (can be adjusted to your specific region)
    const defaultLat = formData.farm_location_latitude
      ? Number.parseFloat(formData.farm_location_latitude)
      : 8.9456;
    const defaultLng = formData.farm_location_longitude
      ? Number.parseFloat(formData.farm_location_longitude)
      : 125.5456;

    // Initialize map
    const L = window.L;
    const map = L.map(mapRef.current).setView([defaultLat, defaultLng], 13);

    // Add tile layer (OpenStreetMap)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Add marker
    const marker = L.marker([defaultLat, defaultLng], {
      draggable: true,
    }).addTo(map);

    // Handle marker drag events
    marker.on("dragend", (e) => {
      const position = marker.getLatLng();
      setFormData({
        ...formData,
        farm_location_latitude: position.lat.toFixed(6),
        farm_location_longitude: position.lng.toFixed(6),
      });

      // Fetch location name based on new coordinates
      fetchGrowerLocationName(position.lat, position.lng);
    });

    // Handle map click events
    map.on("click", (e) => {
      marker.setLatLng(e.latlng);
      setFormData({
        ...formData,
        farm_location_latitude: e.latlng.lat.toFixed(6),
        farm_location_longitude: e.latlng.lng.toFixed(6),
      });

      // Fetch location name based on clicked coordinates
      fetchGrowerLocationName(e.latlng.lat, e.latlng.lng);
    });

    // Store references
    markerRef.current = marker;
    mapInstanceRef.current = map;

    // Fix map display issue by triggering a resize after a short delay
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  };

  // Handler functions
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === "farmer_type") {
      setFarmerType(value);
      setSelectedCrop(null);
    } else if (name === "crop_type") {
      setSelectedCrop(value);
    }
  };

  const handleFarmerTypeChange = (value) => {
    setFarmerType(value);
    setSelectedCrop(null);
    setFormData({
      ...formData,
      farmer_type: value,
    });
  };

  const handleAddAdditionalRice = () => {
    setAdditionalRiceDetails([
      ...additionalRiceDetails,
      {
        area_type: "",
        seed_type: "",
        area_harvested: "",
        production: "",
        ave_yield: "",
      },
    ]);
  };

  const handleRemoveAdditionalRice = (index) => {
    const newAdditionalRiceDetails = [...additionalRiceDetails];
    newAdditionalRiceDetails.splice(index, 1);
    setAdditionalRiceDetails(newAdditionalRiceDetails);
  };

  const handleAddAdditionalSpice = () => {
    setAdditionalSpiceDetails([
      ...additionalSpiceDetails,
      { spices_type: "", quantity: "" },
    ]);
  };

  const handleRemoveAdditionalSpice = (index) => {
    const newAdditionalSpiceDetails = [...additionalSpiceDetails];
    newAdditionalSpiceDetails.splice(index, 1);
    setAdditionalSpiceDetails(newAdditionalSpiceDetails);
  };

  const handleRemoveAdditionalLegumes = (index) => {
    const newAdditionalLegumesDetails = [...additionalLegumesDetails];
    newAdditionalLegumesDetails.splice(index, 1);
    setAdditionalLegumesDetails(newAdditionalLegumesDetails);
  };

  const handleAddAdditionalLegumes = () => {
    setAdditionalLegumesDetails([
      ...additionalLegumesDetails,
      { legumes_type: "", quantity: "" },
    ]);
  };

  const handleRemoveAdditionalBanana = (index) => {
    const newAdditionalBananaDetails = [...additionalBananaDetails];
    newAdditionalBananaDetails.splice(index, 1);
    setAdditionalBananaDetails(newAdditionalBananaDetails);
  };

  const handleAddAdditionalBanana = () => {
    setAdditionalBananaDetails([
      ...additionalBananaDetails,
      { banana_type: "", quantity: "" },
    ]);
  };

  const handleRemoveAdditionalVegetable = (index) => {
    const newAdditionalVegetableDetails = [...additionalVegetableDetails];
    newAdditionalVegetableDetails.splice(index, 1);
    setAdditionalVegetableDetails(newAdditionalVegetableDetails);
  };

  const handleAddAdditionalVegetable = () => {
    setAdditionalVegetableDetails([
      ...additionalVegetableDetails,
      { vegetable_type: "", quantity: "", other_vegetable: "" },
    ]);
  };

  const addAnimal = () => {
    setAnimals([
      ...animals,
      { animal_type: "", subcategory: "", quantity: "" },
    ]);
  };

  const handleAnimalChange = (index, field, value) => {
    const newAnimals = [...animals];
    newAnimals[index][field] = value;

    // Auto-populate subcategory dropdown options based on animal type
    if (field === "animal_type") {
      // Reset subcategory when animal type changes
      newAnimals[index].subcategory = "";
    }

    setAnimals(newAnimals);
  };

  const handleAdditionalRiceChange = (index, field, value) => {
    const newDetails = [...additionalRiceDetails];
    newDetails[index][field] = value;
    setAdditionalRiceDetails(newDetails);
  };

  const handleAdditionalSpiceChange = (index, field, value) => {
    const newDetails = [...additionalSpiceDetails];
    newDetails[index][field] = value;
    setAdditionalSpiceDetails(newDetails);
  };

  const handleAdditionalLegumesChange = (index, field, value) => {
    const newDetails = [...additionalLegumesDetails];
    newDetails[index][field] = value;
    setAdditionalLegumesDetails(newDetails);
  };

  const handleAdditionalBananaChange = (index, field, value) => {
    const newDetails = [...additionalBananaDetails];
    newDetails[index][field] = value;
    setAdditionalBananaDetails(newDetails);
  };

  const handleAdditionalVegetableChange = (index, field, value) => {
    const newDetails = [...additionalVegetableDetails];
    newDetails[index][field] = value;

    if (field === "vegetable_type" && value === "Other Crop (specify)") {
      setSelectedVegetable(index);
    } else if (field === "vegetable_type") {
      setSelectedVegetable(null);
    }

    setAdditionalVegetableDetails(newDetails);
  };

  const handleMapInvalidateSize = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare form data for submission
      const values = {
        ...formData,
      };

      // Format data for API submission
      const formattedData = {
        name: values.name,
        home_address: values.home_address,
        contact_number: values.contact_number,
        facebook_email: values.facebook_email,
        barangay: values.barangay,
        rsbsa_id: values.rsbsa_id || "", // Include RSBSA ID for all farmer types
      };

      // Add the new grower fields if they exist
      if (farmerType === "Grower") {
        if (values.farm_address)
          formattedData.farm_address = values.farm_address;
        if (values.farm_location_longitude)
          formattedData.farm_location_longitude =
            values.farm_location_longitude;
        if (values.farm_location_latitude)
          formattedData.farm_location_latitude = values.farm_location_latitude;
        if (values.market_outlet_location)
          formattedData.market_outlet_location = values.market_outlet_location;
        if (values.buyer_name) formattedData.buyer_name = values.buyer_name;
        if (values.association_organization)
          formattedData.association_organization =
            values.association_organization;
      }

      const currentUser = localStorage.getItem("userName") || "System";

      // Handle livestock records for Raiser type
      if (farmerType === "Raiser") {
        const livestockRecords = [];

        // Process animal entries
        for (let i = 0; i < animals.length; i++) {
          const animalType = animals[i].animal_type;
          const subcategory = animals[i].subcategory;
          const quantity = animals[i].quantity;

          if (animalType && subcategory && quantity) {
            livestockRecords.push({
              animal_type: animalType,
              subcategory: subcategory,
              quantity: Number.parseInt(quantity, 10),
              updated_by: currentUser,
            });
          }
        }

        // Only add livestock_records if there are valid entries
        if (livestockRecords.length > 0) {
          formattedData.livestock_records = livestockRecords;
        }
      }

      // Handle Operator type
      if (farmerType === "Operator") {
        const operatorData = {
          fishpond_location: values.fishpond_location || "",
          cultured_species: values.cultured_species || "",
          productive_area_sqm: values.area || "",
          stocking_density: values.stocking_density || "",
          date_of_stocking: values.date_of_stocking || "",
          production_kg: values.production || "",
          date_of_harvest: values.date_of_harvest || "",
          remarks: values.remarks || "",
          operator_location_longitude: values.operator_location_longitude || "",
          operator_location_latitude: values.operator_location_latitude || "",
        };

        // Only add operators array if at least one required field is provided
        if (operatorData.fishpond_location && operatorData.cultured_species) {
          formattedData.operators = [operatorData];
        }
      }

      // Handle crops based on crop type
      if (values.crop_type && values.crop_type !== "Rice") {
        const cropsArray = [];

        // For High Value Crops, handle it separately since it uses month instead of crop
        if (values.crop_type === "High Value Crops") {
          // Only add if month, crop, and quantity are provided
          if (values.month && values.high_value_crop && values.quantity) {
            const productionData = {
              month: values.month,
              crop: values.high_value_crop,
              quantity: values.quantity,
            };

            cropsArray.push({
              crop_type: "High Value Crops",
              variety_clone: values.variety_clone || "",
              area_hectare: values.area_hectare
                ? Number.parseFloat(values.area_hectare)
                : 0,
              production_type: values.cropping_intensity || "seasonal",
              production_data: JSON.stringify(productionData),
            });
          }
        }
        // For other crop types, handle additional entries
        else {
          // Handle additional spice entries
          if (values.crop_type === "Spices") {
            additionalSpiceDetails.forEach((spice) => {
              if (spice.spices_type && spice.quantity) {
                const productionData = {
                  crop: spice.spices_type,
                  quantity: spice.quantity,
                };

                cropsArray.push({
                  crop_type: "Spices",
                  area_hectare: values.area_hectare
                    ? Number.parseFloat(values.area_hectare)
                    : 0,
                  production_type: values.cropping_intensity || "seasonal",
                  production_data: JSON.stringify(productionData),
                });
              }
            });
          }

          // Handle additional legumes entries
          if (values.crop_type === "Legumes") {
            additionalLegumesDetails.forEach((legume) => {
              if (legume.legumes_type && legume.quantity) {
                const productionData = {
                  crop: legume.legumes_type,
                  quantity: legume.quantity,
                };

                cropsArray.push({
                  crop_type: "Legumes",
                  area_hectare: values.area_hectare
                    ? Number.parseFloat(values.area_hectare)
                    : 0,
                  production_type: values.cropping_intensity || "seasonal",
                  production_data: JSON.stringify(productionData),
                });
              }
            });
          }

          // Handle additional banana entries
          if (values.crop_type === "Banana") {
            additionalBananaDetails.forEach((banana) => {
              if (banana.banana_type && banana.quantity) {
                const productionData = {
                  crop: banana.banana_type,
                  quantity: banana.quantity,
                };

                cropsArray.push({
                  crop_type: "Banana",
                  area_hectare: values.area_hectare
                    ? Number.parseFloat(values.area_hectare)
                    : 0,
                  production_type: values.cropping_intensity || "seasonal",
                  production_data: JSON.stringify(productionData),
                });
              }
            });
          }

          // Handle additional vegetable entries
          if (values.crop_type === "Vegetable") {
            additionalVegetableDetails.forEach((vegetable) => {
              if (vegetable.vegetable_type && vegetable.quantity) {
                let cropValue = vegetable.vegetable_type;
                if (
                  vegetable.vegetable_type === "Other Crop (specify)" &&
                  vegetable.other_vegetable
                ) {
                  cropValue = vegetable.other_vegetable;
                }

                const productionData = {
                  crop: cropValue,
                  quantity: vegetable.quantity,
                };

                cropsArray.push({
                  crop_type: "Vegetable",
                  area_hectare: values.area_hectare
                    ? Number.parseFloat(values.area_hectare)
                    : 0,
                  production_type: values.cropping_intensity || "seasonal",
                  production_data: JSON.stringify(productionData),
                });
              }
            });
          }

          // Only add main crop entry if crop_value and quantity are provided
          // AND if there are no additional entries of the same type
          if (values.crop_value && values.quantity && cropsArray.length === 0) {
            const productionData = {
              crop: values.crop_value,
              quantity: values.quantity,
            };

            cropsArray.push({
              crop_type: values.crop_type,
              area_hectare: values.area_hectare
                ? Number.parseFloat(values.area_hectare)
                : 0,
              production_type: values.cropping_intensity || "seasonal",
              production_data: JSON.stringify(productionData),
            });
          }
        }

        // Only add crops array if there are valid entries
        if (cropsArray.length > 0) {
          formattedData.crops = cropsArray;
        }
      }

      // Handle rice entries
      const riceEntries = [];

      // Add main rice entry if it exists
      if (values.crop_type === "Rice") {
        const mainRiceEntry = {
          area_type: values.area_type || undefined,
          seed_type: values.seed_type || undefined,
          area_harvested: values.area_harvested
            ? Number.parseFloat(values.area_harvested)
            : undefined,
          production: values.production
            ? Number.parseFloat(values.production)
            : undefined,
          ave_yield: values.ave_yield
            ? Number.parseFloat(values.ave_yield)
            : undefined,
        };

        // Only add if at least one field has a value
        if (Object.values(mainRiceEntry).some((val) => val !== undefined)) {
          riceEntries.push(mainRiceEntry);
        }
      }

      // Add additional rice entries
      if (values.crop_type === "Rice") {
        additionalRiceDetails.forEach((rice) => {
          const riceEntry = {
            area_type: rice.area_type || undefined,
            seed_type: rice.seed_type || undefined,
            area_harvested: rice.area_harvested
              ? Number.parseFloat(rice.area_harvested)
              : undefined,
            production: rice.production
              ? Number.parseFloat(rice.production)
              : undefined,
            ave_yield: rice.ave_yield
              ? Number.parseFloat(rice.ave_yield)
              : undefined,
          };

          // Only add if at least one field has a value
          if (Object.values(riceEntry).some((val) => val !== undefined)) {
            riceEntries.push(riceEntry);
          }
        });
      }

      // Only include rice key if there are valid entries
      if (riceEntries.length > 0) {
        formattedData.rice = riceEntries;
      }

      // Determine which API endpoint to use based on the data
      let response;

      if (
        farmerType === "Raiser" &&
        formattedData.livestock_records &&
        formattedData.livestock_records.length > 0
      ) {
        // If we have livestock records, use the livestock-records endpoint
        response = await livestockAPI.createLivestockRecords(formattedData);
      } else if (
        farmerType === "Operator" &&
        formattedData.operators &&
        formattedData.operators.length > 0
      ) {
        // If we have operator data, use the operator endpoint
        response = await operatorAPI.addOperator(formattedData);
      } else if (farmerType === "Grower") {
        // Create the farmer first
        const farmerResponse = await farmerAPI.createFarmer(formattedData);

        // Get the farmer ID from the response
        const farmerId = farmerResponse.farmer_id || farmerResponse.id;

        if (farmerId) {
          if (formattedData.rice && formattedData.rice.length > 0) {
            // If we have rice data, use the rice endpoint
            response = await farmerAPI.addRice(farmerId, {
              rice: formattedData.rice,
            });
          } else if (formattedData.crops && formattedData.crops.length > 0) {
            // If we have crops data, use the crops endpoint
            response = await farmerAPI.addCrops(farmerId, {
              crops: formattedData.crops,
            });
          } else {
            response = farmerResponse;
          }
        } else {
          response = farmerResponse;
        }
      } else {
        // Otherwise use the regular farmers endpoint
        response = await farmerAPI.createFarmer(formattedData);
      }

      console.log("API Response:", response);

      if (response) {
        // Scroll to top to ensure the message is visible
        window.scrollTo({ top: 0, behavior: "smooth" });

        setMessage({
          type: "success",
          content: "Data submitted successfully!",
        });
        // Reset form
        setFormData({
          name: "",
          contact_number: "",
          facebook_email: "",
          barangay: "",
          home_address: "",
          farmer_type: "",
          rsbsa_id: "",
          farm_address: "",
          farm_location_longitude: "",
          farm_location_latitude: "",
          market_outlet_location: "",
          buyer_name: "",
          association_organization: "",
          fishpond_location: "",
          operator_location_longitude: "",
          operator_location_latitude: "",
          area_type: "",
          seed_type: "",
          area_harvested: "",
          production: "",
          ave_yield: "",
          month: "",
          high_value_crop: "",
          variety_clone: "",
          cropping_intensity: "",
          quantity: "",
          crop_value: "",
        });
        setFarmerType(null);
        setAnimals([{ animal_type: "", subcategory: "", quantity: "" }]);
        setSelectedCrop(null);
        setSelectedVegetable(null);
        setAdditionalRiceDetails([
          {
            area_type: "",
            seed_type: "",
            area_harvested: "",
            production: "",
            ave_yield: "",
          },
        ]);
        setAdditionalSpiceDetails([{ spices_type: "", quantity: "" }]);
        setAdditionalLegumesDetails([{ legumes_type: "", quantity: "" }]);
        setAdditionalBananaDetails([{ banana_type: "", quantity: "" }]);
        setAdditionalVegetableDetails([
          { vegetable_type: "", quantity: "", other_vegetable: "" },
        ]);
        setShowMap(false);
        setShowOperatorMap(false);
      } else {
        setMessage({ type: "error", content: "Failed to submit data." });
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      setMessage({
        type: "error",
        content: `An error occurred while submitting the data: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  // Barangay options
  const barangayOptions = [
    "Agusan Pequeño",
    "Ambago",
    "Amparo",
    "Ampayon",
    "Anticala",
    "Antongalon",
    "Aupagan",
    "Baan Km. 3",
    "Babag",
    "Bading",
    "Bancasi",
    "Banza",
    "Baobaoan",
    "Basag",
    "Bayanihan",
    "Bilay",
    "Bitan-agan",
    "Bit-os",
    "Bobon",
    "Bonbon",
    "Bugsukan",
    "Buhangin",
    "Cabcabon",
    "Camayahan",
    "Dankias",
    "De Oro",
    "Don Francisco",
    "Doongan",
    "Dulag",
    "Dumalagan",
    "Florida",
    "Kinamlutan",
    "Lemon",
    "Libertad",
    "Los Angeles",
    "Lumbocan",
    "MJ Santos",
    "Maguinda",
    "Mahay",
    "Mahogany",
    "Maibu",
    "Mandamo",
    "Masao",
    "Maug",
    "Manila de Bugabus",
    "Nongnong",
    "Pianing",
    "Pigdaulan",
    "Pinamanculan",
    "Salvacion",
    "San Mateo",
    "San Vicente",
    "Sto Niño",
    "Sumile",
    "Sumilihon",
    "Tagabaca",
    "Taguibo",
    "Taligaman",
    "Tiniwisan",
    "Tungao",
    "Villa Kananga",
  ];

  // High Value Crop options
  const highValueCropOptions = [
    "Cacao",
    "Mango",
    "Coffee",
    "Rubber",
    "Oil Palm",
    "Durian",
    "Coconut",
  ];

  // Helper function to get subcategories based on animal type
  const getSubcategories = (animalType) => {
    switch (animalType) {
      case "Cattle":
      case "Carabao":
        return [
          { value: "Carabull", label: "Carabull" },
          { value: "Caracow", label: "Caracow" },
        ];
      case "Goat":
      case "Rabbit":
        return [
          { value: "Buck", label: "Buck" },
          { value: "Doe", label: "Doe" },
        ];
      case "Sheep":
        return [
          { value: "Ram", label: "Ram" },
          { value: "Ewe", label: "Ewe" },
        ];
      case "Swine":
        return [
          { value: "Sow", label: "Sow" },
          { value: "Piglet", label: "Piglet" },
          { value: "Boar", label: "Boar" },
          { value: "Fatteners", label: "Fatteners" },
        ];
      case "Chicken":
        return [
          { value: "Broiler", label: "Broiler" },
          { value: "Layer", label: "Layer" },
          { value: "Freerange", label: "Freerange" },
          { value: "Gamefowl", label: "Gamefowl" },
          { value: "Fighting Cocks", label: "Fighting Cocks" },
        ];
      case "Duck":
      case "Quail":
      case "Turkey":
        return [
          { value: "Drake", label: "Drake" },
          { value: "Hen", label: "Hen" },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="w-full min-h-screen p-4 pb-24 overflow-auto bg-white">
      {/* Add CSS for hiding scrollbars but keeping functionality */}
      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        /* Map container styles */
        .map-container {
          width: 100%;
          border-radius: 0.375rem;
          position: relative;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        /* Map coordinates display */
        .map-coordinates {
          position: absolute;
          bottom: 10px;
          left: 10px;
          background: rgba(255, 255, 255, 0.9);
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          z-index: 1000;
          box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(0, 0, 0, 0.1);
        }
      `}</style>

      <div className="mb-4 bg-white border border-gray-200 rounded-lg shadow-md">
        <AddDataHeader />

        <form onSubmit={handleSubmit} className="relative p-4">
          {/* Message display */}
          <MessageDisplay message={message} />

          {/* Farmer Information Section */}
          <FarmerInformation
            formData={formData}
            handleInputChange={handleInputChange}
            handleFarmerTypeChange={handleFarmerTypeChange}
            barangayOptions={barangayOptions}
          />

          {/* Operator Information Section */}
          {farmerType === "Operator" && (
            <OperatorInformation
              formData={formData}
              handleInputChange={handleInputChange}
              showOperatorMap={showOperatorMap}
              setShowOperatorMap={setShowOperatorMap}
              operatorMapRef={operatorMapRef}
              operatorMarkerRef={operatorMarkerRef}
              operatorMapInstanceRef={operatorMapInstanceRef}
              fetchLocationName={fetchLocationName}
              getOperatorCurrentLocation={getOperatorCurrentLocation}
              setFormData={setFormData}
            />
          )}

          {/* Raiser Information Section */}
          {farmerType === "Raiser" && (
            <RaiserInformation
              animals={animals}
              handleAnimalChange={handleAnimalChange}
              addAnimal={addAnimal}
            />
          )}

          {/* Grower Information Section */}
          {farmerType === "Grower" && (
            <GrowerInformation
              formData={formData}
              handleInputChange={handleInputChange}
              showMap={showMap}
              setShowMap={setShowMap}
              mapRef={mapRef}
              markerRef={markerRef}
              mapInstanceRef={mapInstanceRef}
              fetchGrowerLocationName={fetchGrowerLocationName}
              getCurrentLocation={getCurrentLocation}
              setFormData={setFormData}
            />
          )}

          {/* Crop Information Section */}
          {farmerType === "Grower" && (
            <CropInformation
              formData={formData}
              handleInputChange={handleInputChange}
              handleSelectChange={handleSelectChange}
              additionalRiceDetails={additionalRiceDetails}
              handleAdditionalRiceChange={handleAdditionalRiceChange}
              handleRemoveAdditionalRice={handleRemoveAdditionalRice}
              handleAddAdditionalRice={handleAddAdditionalRice}
              additionalSpiceDetails={additionalSpiceDetails}
              handleAdditionalSpiceChange={handleAdditionalSpiceChange}
              handleRemoveAdditionalSpice={handleRemoveAdditionalSpice}
              handleAddAdditionalSpice={handleAddAdditionalSpice}
              additionalLegumesDetails={additionalLegumesDetails}
              handleAdditionalLegumesChange={handleAdditionalLegumesChange}
              handleRemoveAdditionalLegumes={handleRemoveAdditionalLegumes}
              handleAddAdditionalLegumes={handleAddAdditionalLegumes}
              additionalBananaDetails={additionalBananaDetails}
              handleAdditionalBananaChange={handleAdditionalBananaChange}
              handleRemoveAdditionalBanana={handleRemoveAdditionalBanana}
              handleAddAdditionalBanana={handleAddAdditionalBanana}
              additionalVegetableDetails={additionalVegetableDetails}
              handleAdditionalVegetableChange={handleAdditionalVegetableChange}
              handleRemoveAdditionalVegetable={handleRemoveAdditionalVegetable}
              handleAddAdditionalVegetable={handleAddAdditionalVegetable}
              highValueCropOptions={highValueCropOptions}
            />
          )}

          <SubmitButton loading={loading} isProcessingImage={false} />
        </form>
      </div>
    </div>
  );
};

export default AddData;
