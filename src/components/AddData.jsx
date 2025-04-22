"use client";

import { useState, useEffect, useRef } from "react";
import { farmerAPI, livestockAPI, operatorAPI } from "./services/api";

// Dynamically import the map component with no SSR to avoid window is not defined errors
// const MapComponent = dynamic(() => import("./map-component"), {
//   ssr: false,
//   loading: () => (
//     <div className="w-full h-[300px] bg-gray-100 rounded-md flex items-center justify-center">
//       <div className="text-gray-500">Loading map...</div>
//     </div>
//   ),
// })

const AddData = () => {
  const [formData, setFormData] = useState({
    name: "",
    contact_number: "",
    facebook_email: "",
    barangay: "",
    home_address: "",
    farmer_type: "",
    // Added new fields for Grower
    farm_address: "",
    farm_location_longitude: "",
    farm_location_latitude: "",
    market_outlet_location: "",
    buyer_name: "",
    association_organization: "",
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
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Initialize map when component mounts and showMap is true
  useEffect(() => {
    if (showMap && typeof window !== "undefined") {
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

        initializeMap();
      };

      loadLeaflet();
    }

    return () => {
      // Clean up map when component unmounts
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [showMap]);

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
    });

    // Handle map click events
    map.on("click", (e) => {
      marker.setLatLng(e.latlng);
      setFormData({
        ...formData,
        farm_location_latitude: e.latlng.lat.toFixed(6),
        farm_location_longitude: e.latlng.lng.toFixed(6),
      });
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

    // Auto-select subcategory based on animal type
    if (field === "animal_type") {
      if (value === "Cattle") {
        newAnimals[index].subcategory = "Carabull";
      } else if (value === "Carabao") {
        newAnimals[index].subcategory = "Caracow";
      } else {
        newAnimals[index].subcategory = "";
      }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
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
              updated_by: currentUser, // You can replace this with the actual user name or ID
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
          geotagged_photo_url: values.geotagged_photo || "",
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

      console.log(
        "Formatted JSON Data:",
        JSON.stringify(formattedData, null, 2)
      );

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

      if (response) {
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
          farm_address: "",
          farm_location_longitude: "",
          farm_location_latitude: "",
          market_outlet_location: "",
          buyer_name: "",
          association_organization: "",
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
      } else {
        setMessage({ type: "error", content: "Failed to submit data." });
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      setMessage({
        type: "error",
        content: "An error occurred while submitting the data.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
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
        },
        (error) => {
          console.error("Error getting location:", error);
          alert(
            "Unable to retrieve your location. Please check your device settings."
          );
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
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
          height: 300px;
          width: 100%;
          border-radius: 0.375rem;
          position: relative;
        }

        /* Map coordinates display */
        .map-coordinates {
          position: absolute;
          bottom: 10px;
          left: 10px;
          background: rgba(255, 255, 255, 0.8);
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 12px;
          z-index: 1000;
          box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
        }
      `}</style>

      <div className="mb-4 bg-white border border-gray-200 rounded-lg shadow-md">
        <div className="flex items-center p-4 border-b">
          <button
            onClick={() => (window.location.href = "/inventory")}
            className="flex items-center justify-center px-3 py-1 mr-3 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              ></path>
            </svg>
            Back
          </button>
          <h2 className="m-0 text-xl font-semibold">Add Farmer Data</h2>
        </div>

        <form onSubmit={handleSubmit} className="relative p-4">
          {/* Message display */}
          {message.content && (
            <div
              className={`mb-4 p-3 rounded-md ${
                message.type === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {message.content}
            </div>
          )}

          {/* Farmer Information Section */}
          <div className="mb-6 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-md">
            <div className="p-3 font-medium text-white bg-emerald-700">
              Farmer Information
            </div>
            <div className="p-4 bg-emerald-50 max-h-[calc(100vh-240px)] overflow-y-auto overflow-x-hidden hide-scrollbar">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg
                        className="w-4 h-4 text-emerald-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        ></path>
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter name"
                      className="w-full py-2 pl-10 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg
                        className="w-4 h-4 text-emerald-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        ></path>
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="contact_number"
                      value={formData.contact_number}
                      onChange={handleInputChange}
                      placeholder="Enter contact number"
                      className="w-full py-2 pl-10 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Facebook/Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="facebook_email"
                    value={formData.facebook_email}
                    onChange={handleInputChange}
                    placeholder="Enter Facebook or Email"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Barangay <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="barangay"
                    value={formData.barangay}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  >
                    <option value="">Select a Barangay</option>
                    {barangayOptions.map((barangay) => (
                      <option key={barangay} value={barangay}>
                        {barangay}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Home Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="home_address"
                    value={formData.home_address}
                    onChange={handleInputChange}
                    placeholder="Enter home address"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Farmer Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="farmer_type"
                    value={formData.farmer_type}
                    onChange={(e) => handleFarmerTypeChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  >
                    <option value="">Select Farmer Type</option>
                    <option value="Raiser">Raiser</option>
                    <option value="Operator">Operator</option>
                    <option value="Grower">Grower</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Livestock Records Section */}
          {farmerType === "Raiser" && (
            <div className="mb-6 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-md">
              <div className="p-3 font-medium text-white bg-emerald-700">
                Livestock Records
              </div>
              <div className="p-4 bg-emerald-50 max-h-[500px] overflow-auto hide-scrollbar">
                {animals.map((animal, index) => (
                  <div
                    key={index}
                    className="p-3 mb-3 bg-white border border-gray-300 border-dashed rounded-md"
                  >
                    <div className="grid items-center grid-cols-1 gap-4 sm:grid-cols-12">
                      <div className="sm:col-span-4">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Animal Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={animal.animal_type}
                          onChange={(e) =>
                            handleAnimalChange(
                              index,
                              "animal_type",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                          required
                        >
                          <option value="">Select Animal Type</option>
                          <option value="Cattle">Cattle</option>
                          <option value="Carabao">Carabao</option>
                          <option value="Goat">Goat</option>
                          <option value="Sheep">Sheep</option>
                          <option value="Swine">Swine</option>
                          <option value="Chicken">Chicken</option>
                          <option value="Duck">Duck</option>
                          <option value="Quail">Quail</option>
                          <option value="Turkey">Turkey</option>
                          <option value="Rabbit">Rabbit</option>
                        </select>
                      </div>
                      <div className="sm:col-span-4">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Subcategory <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={animal.subcategory}
                          onChange={(e) =>
                            handleAnimalChange(
                              index,
                              "subcategory",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                          required
                        >
                          <option value="">Select Subcategory</option>
                          {animal.animal_type === "Cattle" && (
                            <>
                              <option value="Carabull">Carabull</option>
                              <option value="Caracow">Caracow</option>
                            </>
                          )}
                          {animal.animal_type === "Carabao" && (
                            <>
                              <option value="Carabull">Carabull</option>
                              <option value="Caracow">Caracow</option>
                            </>
                          )}
                          {animal.animal_type === "Goat" && (
                            <>
                              <option value="Buck">Buck</option>
                              <option value="Doe">Doe</option>
                            </>
                          )}
                          {animal.animal_type === "Sheep" && (
                            <>
                              <option value="Ram">Ram</option>
                              <option value="Ewe">Ewe</option>
                            </>
                          )}
                          {animal.animal_type === "Swine" && (
                            <>
                              <option value="Sow">Sow</option>
                              <option value="Piglet">Piglet</option>
                              <option value="Boar">Boar</option>
                              <option value="Fatteners">Fatteners</option>
                            </>
                          )}
                          {animal.animal_type === "Chicken" && (
                            <>
                              <option value="Broiler">Broiler</option>
                              <option value="Layer">Layer</option>
                              <option value="Freerange">Freerange</option>
                              <option value="Gamefowl">Gamefowl</option>
                              <option value="Fighting Cocks">
                                Fighting Cocks
                              </option>
                            </>
                          )}
                          {animal.animal_type === "Duck" && (
                            <>
                              <option value="Drake">Drake</option>
                              <option value="Hen">Hen</option>
                            </>
                          )}
                          {animal.animal_type === "Quail" && (
                            <>
                              <option value="Cock">Cock</option>
                              <option value="Hen">Hen</option>
                            </>
                          )}
                          {animal.animal_type === "Turkey" && (
                            <>
                              <option value="Gobbler">Gobbler</option>
                              <option value="Hen">Hen</option>
                            </>
                          )}
                          {animal.animal_type === "Rabbit" && (
                            <>
                              <option value="Buck">Buck</option>
                              <option value="Doe">Doe</option>
                            </>
                          )}
                        </select>
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={animal.quantity}
                          onChange={(e) =>
                            handleAnimalChange(
                              index,
                              "quantity",
                              e.target.value
                            )
                          }
                          placeholder="Enter Quantity"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                          required
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <label className="block mb-1 text-sm font-medium text-white">
                          &nbsp;
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const newAnimals = [...animals];
                            newAnimals.splice(index, 1);
                            setAnimals(newAnimals);
                          }}
                          className="flex items-center justify-center w-full px-3 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
                          disabled={animals.length === 1}
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            ></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-emerald-50">
                <button
                  type="button"
                  onClick={addAnimal}
                  className="flex items-center justify-center w-full px-4 py-2 border border-dashed rounded-md border-emerald-700 text-emerald-700 hover:bg-emerald-50"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    ></path>
                  </svg>
                  Add Animal
                </button>
              </div>
            </div>
          )}

          {/* Operator Details Section */}
          {farmerType === "Operator" && (
            <div className="mb-6 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-md">
              <div className="p-3 font-medium text-white bg-emerald-700">
                Operator Details
              </div>
              <div className="p-4 bg-emerald-50 max-h-[calc(100vh-240px)] overflow-y-auto overflow-x-hidden hide-scrollbar">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Fishpond Location
                    </label>
                    <input
                      type="text"
                      name="fishpond_location"
                      value={formData.fishpond_location || ""}
                      onChange={handleInputChange}
                      placeholder="Enter Fishpond Location"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Geotagged Photo
                    </label>
                    <input
                      type="text"
                      name="geotagged_photo"
                      value={formData.geotagged_photo || ""}
                      onChange={handleInputChange}
                      placeholder="Enter Geotagged Photo URL"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Cultured Species
                    </label>
                    <select
                      name="cultured_species"
                      value={formData.cultured_species || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Select Species</option>
                      <option value="Tilapia">Tilapia</option>
                      <option value="Bangus (Milkfish)">
                        Bangus (Milkfish)
                      </option>
                      <option value="Catfish">Catfish</option>
                      <option value="Carp">Carp</option>
                      <option value="Shrimp">Shrimp</option>
                      <option value="Prawn">Prawn</option>
                      <option value="Mudcrab">Mudcrab</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Area (Hectares)
                    </label>
                    <input
                      type="number"
                      name="area"
                      value={formData.area || ""}
                      onChange={handleInputChange}
                      placeholder="Enter Area"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Stocking Density
                    </label>
                    <input
                      type="text"
                      name="stocking_density"
                      value={formData.stocking_density || ""}
                      onChange={handleInputChange}
                      placeholder="Enter Stocking Density"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Date of Stocking
                    </label>
                    <input
                      type="date"
                      name="date_of_stocking"
                      value={formData.date_of_stocking || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Production
                    </label>
                    <input
                      type="text"
                      name="production"
                      value={formData.production || ""}
                      onChange={handleInputChange}
                      placeholder="Enter Production"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Date of Harvest
                    </label>
                    <input
                      type="date"
                      name="date_of_harvest"
                      value={formData.date_of_harvest || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Remarks
                    </label>
                    <select
                      name="remarks"
                      value={formData.remarks || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Select Status</option>
                      <option value="operational">Operational</option>
                      <option value="non-operational">Non-operational</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Grower Details Section */}
          {farmerType === "Grower" && (
            <div className="mb-6 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-md">
              <div className="p-3 font-medium text-white bg-emerald-700">
                Grower Details
              </div>
              <div className="p-4 bg-emerald-50 max-h-[calc(100vh-240px)] overflow-y-auto overflow-x-hidden hide-scrollbar">
                {/* Additional Grower Fields */}
                <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Farm Address
                    </label>
                    <input
                      type="text"
                      name="farm_address"
                      value={formData.farm_address || ""}
                      onChange={handleInputChange}
                      placeholder="Enter Farm Address"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  {/* Map Location Section */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        Farm Location (Map)
                      </label>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => setShowMap(!showMap)}
                          className="flex items-center px-2 py-1 text-xs text-white rounded bg-emerald-600 hover:bg-emerald-700"
                        >
                          {showMap ? "Hide Map" : "Show Map"}
                        </button>
                      </div>
                    </div>

                    {showMap && (
                      <div className="p-2 mb-4 border border-gray-300 rounded-md">
                        <p className="mb-2 text-xs text-gray-600">
                          Click on the map to set the farm location coordinates
                        </p>
                        <div className="relative map-container">
                          <div ref={mapRef} className="w-full h-full"></div>
                          {formData.farm_location_latitude &&
                            formData.farm_location_longitude && (
                              <div className="map-coordinates">
                                Lat: {formData.farm_location_latitude}, Lng:{" "}
                                {formData.farm_location_longitude}
                              </div>
                            )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Farm Location (Longitude)
                    </label>
                    <input
                      type="text"
                      name="farm_location_longitude"
                      value={formData.farm_location_longitude || ""}
                      onChange={handleInputChange}
                      placeholder="Enter Longitude (e.g., 125.5456)"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Farm Location (Latitude)
                    </label>
                    <input
                      type="text"
                      name="farm_location_latitude"
                      value={formData.farm_location_latitude || ""}
                      onChange={handleInputChange}
                      placeholder="Enter Latitude (e.g., 8.9456)"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Market Outlet Location
                    </label>
                    <input
                      type="text"
                      name="market_outlet_location"
                      value={formData.market_outlet_location || ""}
                      onChange={handleInputChange}
                      placeholder="Enter Market Outlet Location"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Buyer Name
                    </label>
                    <input
                      type="text"
                      name="buyer_name"
                      value={formData.buyer_name || ""}
                      onChange={handleInputChange}
                      placeholder="Enter Buyer Name"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Association/Organization
                    </label>
                    <input
                      type="text"
                      name="association_organization"
                      value={formData.association_organization || ""}
                      onChange={handleInputChange}
                      placeholder="Enter Association or Organization"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Crop Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="crop_type"
                      value={formData.crop_type || ""}
                      onChange={(e) =>
                        handleSelectChange("crop_type", e.target.value)
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    >
                      <option value="">Select Crop Type</option>
                      <option value="Rice">Rice</option>
                      <option value="Spices">Spices</option>
                      <option value="Legumes">Legumes</option>
                      <option value="Vegetable">Vegetable</option>
                      <option value="High Value Crops">High Value Crops</option>
                      <option value="Banana">Banana</option>
                    </select>
                  </div>

                  {/* Common fields for all crop types */}
                  {selectedCrop && (
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Area (Hectare) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="area_hectare"
                        value={formData.area_hectare || ""}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        placeholder="Enter Area in Hectares"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                    </div>
                  )}

                  {selectedCrop && (
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Cropping Intensity{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="cropping_intensity"
                        value={formData.cropping_intensity || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      >
                        <option value="">Select Cropping Intensity</option>
                        <option value="year_round">Year Round</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="seasonal">Seasonal</option>
                        <option value="annually">Annually</option>
                        <option value="twice_a_month">Twice a Month</option>
                      </select>
                    </div>
                  )}

                  {/* Month field for all crop types except Rice */}
                  {selectedCrop && selectedCrop !== "Rice" && (
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Month <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="month"
                        value={formData.month || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      >
                        <option value="">Select Month</option>
                        <option value="January">January</option>
                        <option value="February">February</option>
                        <option value="March">March</option>
                        <option value="April">April</option>
                        <option value="May">May</option>
                        <option value="June">June</option>
                        <option value="July">July</option>
                        <option value="August">August</option>
                        <option value="September">September</option>
                        <option value="October">October</option>
                        <option value="November">November</option>
                        <option value="December">December</option>
                      </select>
                    </div>
                  )}

                  {/* High Value Crops Section */}
                  {selectedCrop === "High Value Crops" && (
                    <>
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Crop <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="high_value_crop"
                          value={formData.high_value_crop || ""}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                          required
                        >
                          <option value="">Select Crop</option>
                          {highValueCropOptions.map((crop) => (
                            <option key={crop} value={crop}>
                              {crop}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Variety/Clone
                        </label>
                        <input
                          type="text"
                          name="variety_clone"
                          value={formData.variety_clone || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Variety/Clone"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="quantity"
                          value={formData.quantity || ""}
                          onChange={handleInputChange}
                          min="0"
                          placeholder="Enter Quantity"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                          required
                        />
                      </div>
                    </>
                  )}

                  {/* Spices Section */}
                  {selectedCrop === "Spices" && (
                    <>
                      <div className="col-span-1 sm:col-span-2">
                        <div className="max-h-[500px] overflow-auto p-1 mb-4 hide-scrollbar">
                          {additionalSpiceDetails.map((spiceDetail, index) => (
                            <div
                              key={index}
                              className="p-3 mb-3 bg-white border border-gray-300 border-dashed rounded-md"
                            >
                              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div>
                                  <label className="block mb-1 text-sm font-medium text-gray-700">
                                    Spice Type{" "}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <select
                                    value={spiceDetail.spices_type}
                                    onChange={(e) =>
                                      handleAdditionalSpiceChange(
                                        index,
                                        "spices_type",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                    required
                                  >
                                    <option value="">Select Spice Type</option>
                                    <option value="Black Pepper">
                                      Black Pepper
                                    </option>
                                    <option value="Ginger">Ginger</option>
                                    <option value="Turmeric">Turmeric</option>
                                    <option value="Lemongrass">
                                      Lemongrass
                                    </option>
                                    <option value="Chili">Chili</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block mb-1 text-sm font-medium text-gray-700">
                                    Quantity{" "}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="number"
                                    value={spiceDetail.quantity}
                                    onChange={(e) =>
                                      handleAdditionalSpiceChange(
                                        index,
                                        "quantity",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Enter Quantity"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                    required
                                  />
                                </div>
                                <div className="flex items-end">
                                  {additionalSpiceDetails.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveAdditionalSpice(index)
                                      }
                                      className="flex items-center justify-center w-full px-3 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
                                    >
                                      <svg
                                        className="w-4 h-4 mr-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        ></path>
                                      </svg>
                                      Remove
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={handleAddAdditionalSpice}
                          className="flex items-center justify-center w-full px-4 py-2 border border-dashed rounded-md border-emerald-700 text-emerald-700 hover:bg-emerald-50"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            ></path>
                          </svg>
                          Add Spice Entry
                        </button>
                      </div>
                    </>
                  )}

                  {/* Legumes Section */}
                  {selectedCrop === "Legumes" && (
                    <>
                      <div className="col-span-1 sm:col-span-2">
                        <div className="max-h-[500px] overflow-auto p-1 mb-4 hide-scrollbar">
                          {additionalLegumesDetails.map(
                            (legumeDetail, index) => (
                              <div
                                key={index}
                                className="p-3 mb-3 bg-white border border-gray-300 border-dashed rounded-md"
                              >
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                  <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                      Legume Type{" "}
                                      <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                      value={legumeDetail.legumes_type}
                                      onChange={(e) =>
                                        handleAdditionalLegumesChange(
                                          index,
                                          "legumes_type",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                      required
                                    >
                                      <option value="">
                                        Select Legume Type
                                      </option>
                                      <option value="Mung Bean">
                                        Mung Bean
                                      </option>
                                      <option value="Peanut">Peanut</option>
                                      <option value="Soybean">Soybean</option>
                                      <option value="Pigeon Pea">
                                        Pigeon Pea
                                      </option>
                                      <option value="Cowpea">Cowpea</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                      Quantity{" "}
                                      <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                      type="number"
                                      value={legumeDetail.quantity}
                                      onChange={(e) =>
                                        handleAdditionalLegumesChange(
                                          index,
                                          "quantity",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Enter Quantity"
                                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                      required
                                    />
                                  </div>
                                  <div className="flex items-end">
                                    {additionalLegumesDetails.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRemoveAdditionalLegumes(index)
                                        }
                                        className="flex items-center justify-center w-full px-3 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
                                      >
                                        <svg
                                          className="w-4 h-4 mr-1"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                          ></path>
                                        </svg>
                                        Remove
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={handleAddAdditionalLegumes}
                          className="flex items-center justify-center w-full px-4 py-2 border border-dashed rounded-md border-emerald-700 text-emerald-700 hover:bg-emerald-50"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            ></path>
                          </svg>
                          Add Legume Entry
                        </button>
                      </div>
                    </>
                  )}

                  {/* Banana Section */}
                  {selectedCrop === "Banana" && (
                    <>
                      <div className="col-span-1 sm:col-span-2">
                        <div className="max-h-[500px] overflow-auto p-1 mb-4 hide-scrollbar">
                          {additionalBananaDetails.map(
                            (bananaDetail, index) => (
                              <div
                                key={index}
                                className="p-3 mb-3 bg-white border border-gray-300 border-dashed rounded-md"
                              >
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                  <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                      Banana Type{" "}
                                      <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                      value={bananaDetail.banana_type}
                                      onChange={(e) =>
                                        handleAdditionalBananaChange(
                                          index,
                                          "banana_type",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                      required
                                    >
                                      <option value="">
                                        Select Banana Type
                                      </option>
                                      <option value="Lakatan">Lakatan</option>
                                      <option value="Latundan">Latundan</option>
                                      <option value="Cardava">Cardava</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                      Quantity{" "}
                                      <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                      type="number"
                                      value={bananaDetail.quantity}
                                      onChange={(e) =>
                                        handleAdditionalBananaChange(
                                          index,
                                          "quantity",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Enter Quantity"
                                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                      required
                                    />
                                  </div>
                                  <div className="flex items-end">
                                    {additionalBananaDetails.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRemoveAdditionalBanana(index)
                                        }
                                        className="flex items-center justify-center w-full px-3 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
                                      >
                                        <svg
                                          className="w-4 h-4 mr-1"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                          ></path>
                                        </svg>
                                        Remove
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={handleAddAdditionalBanana}
                          className="flex items-center justify-center w-full px-4 py-2 border border-dashed rounded-md border-emerald-700 text-emerald-700 hover:bg-emerald-50"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            ></path>
                          </svg>
                          Add Banana Entry
                        </button>
                      </div>
                    </>
                  )}

                  {/* Vegetable Section */}
                  {selectedCrop === "Vegetable" && (
                    <>
                      <div className="col-span-1 sm:col-span-2">
                        <div className="max-h-[500px] overflow-auto p-1 mb-4 hide-scrollbar">
                          {additionalVegetableDetails.map(
                            (vegetableDetail, index) => (
                              <div
                                key={index}
                                className="p-3 mb-3 bg-white border border-gray-300 border-dashed rounded-md"
                              >
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                  <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                      Vegetable Type{" "}
                                      <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                      value={vegetableDetail.vegetable_type}
                                      onChange={(e) =>
                                        handleAdditionalVegetableChange(
                                          index,
                                          "vegetable_type",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                      required
                                    >
                                      <option value="">
                                        Select Vegetable Type
                                      </option>
                                      <option value="Leafy Vegetables">
                                        Leafy Vegetables
                                      </option>
                                      <option value="Root Vegetables">
                                        Root Vegetables
                                      </option>
                                      <option value="Fruit Vegetables">
                                        Fruit Vegetables
                                      </option>
                                      <option value="Tomato">Tomato</option>
                                      <option value="Eggplant">Eggplant</option>
                                      <option value="Okra">Okra</option>
                                      <option value="Other Crop (specify)">
                                        Other Crop (specify)
                                      </option>
                                    </select>
                                  </div>
                                  {vegetableDetail.vegetable_type ===
                                    "Other Crop (specify)" && (
                                    <div>
                                      <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Specify Vegetable{" "}
                                        <span className="text-red-500">*</span>
                                      </label>
                                      <input
                                        type="text"
                                        value={vegetableDetail.other_vegetable}
                                        onChange={(e) =>
                                          handleAdditionalVegetableChange(
                                            index,
                                            "other_vegetable",
                                            e.target.value
                                          )
                                        }
                                        placeholder="Specify Vegetable"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                        required
                                      />
                                    </div>
                                  )}
                                  <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                      Quantity{" "}
                                      <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                      type="number"
                                      value={vegetableDetail.quantity}
                                      onChange={(e) =>
                                        handleAdditionalVegetableChange(
                                          index,
                                          "quantity",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Enter Quantity"
                                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                      required
                                    />
                                  </div>
                                  <div className="flex items-end">
                                    {additionalVegetableDetails.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRemoveAdditionalVegetable(index)
                                        }
                                        className="flex items-center justify-center w-full px-3 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
                                      >
                                        <svg
                                          className="w-4 h-4 mr-1"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                          ></path>
                                        </svg>
                                        Remove
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={handleAddAdditionalVegetable}
                          className="flex items-center justify-center w-full px-4 py-2 border border-dashed rounded-md border-emerald-700 text-emerald-700 hover:bg-emerald-50"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            ></path>
                          </svg>
                          Add Vegetable Entry
                        </button>
                      </div>
                    </>
                  )}

                  {/* Rice Details */}
                  {selectedCrop === "Rice" && (
                    <>
                      <div className="col-span-1 sm:col-span-2">
                        <div className="max-h-[500px] overflow-auto p-1 mb-4 hide-scrollbar">
                          {additionalRiceDetails.map((riceDetail, index) => (
                            <div
                              key={index}
                              className="p-3 mb-3 bg-white border border-gray-300 border-dashed rounded-md"
                            >
                              <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
                                <div>
                                  <label className="block mb-1 text-sm font-medium text-gray-700">
                                    Area Type{" "}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <select
                                    value={riceDetail.area_type}
                                    onChange={(e) =>
                                      handleAdditionalRiceChange(
                                        index,
                                        "area_type",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                    required
                                  >
                                    <option value="">Select Area Type</option>
                                    <option value="Irrigated">Irrigated</option>
                                    <option value="Rainfed">Rainfed</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block mb-1 text-sm font-medium text-gray-700">
                                    Seed Type{" "}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <select
                                    value={riceDetail.seed_type}
                                    onChange={(e) =>
                                      handleAdditionalRiceChange(
                                        index,
                                        "seed_type",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                    required
                                  >
                                    <option value="">Select Seed Type</option>
                                    <option value="Hybrid Seeds">
                                      Hybrid Seeds
                                    </option>
                                    <option value="Certified Seeds">
                                      Certified Seeds
                                    </option>
                                    <option value="Good Seeds">
                                      Good Seeds
                                    </option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block mb-1 text-sm font-medium text-gray-700">
                                    Area Harvested{" "}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="number"
                                    value={riceDetail.area_harvested || ""}
                                    onChange={(e) =>
                                      handleAdditionalRiceChange(
                                        index,
                                        "area_harvested",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Enter Area"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block mb-1 text-sm font-medium text-gray-700">
                                    Production{" "}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="number"
                                    value={riceDetail.production || ""}
                                    onChange={(e) =>
                                      handleAdditionalRiceChange(
                                        index,
                                        "production",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Enter Production"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block mb-1 text-sm font-medium text-gray-700">
                                    Average Yield{" "}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="number"
                                    value={riceDetail.ave_yield || ""}
                                    onChange={(e) =>
                                      handleAdditionalRiceChange(
                                        index,
                                        "ave_yield",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Enter Average Yield"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                    required
                                  />
                                </div>
                                <div className="flex items-end">
                                  {additionalRiceDetails.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveAdditionalRice(index)
                                      }
                                      className="flex items-center justify-center w-full px-3 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
                                    >
                                      <svg
                                        className="w-4 h-4 mr-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        ></path>
                                      </svg>
                                      Remove
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={handleAddAdditionalRice}
                          className="flex items-center justify-center w-full px-4 py-2 border border-dashed rounded-md border-emerald-700 text-emerald-700 hover:bg-emerald-50"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            ></path>
                          </svg>
                          Add Rice Entry
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Submit Button - Fixed at bottom on mobile */}
          <div className="fixed bottom-0 left-0 right-0 z-10 p-4 bg-white border-t border-gray-200 md:static md:bg-transparent md:border-0 md:p-0 md:mt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center w-full h-12 px-6 py-2 text-base text-white rounded-md shadow-md bg-emerald-700 hover:bg-emerald-800 md:w-auto"
            >
              {loading ? (
                <svg
                  className="w-5 h-5 text-white animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                    ></path>
                  </svg>
                  Submit
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddData;
