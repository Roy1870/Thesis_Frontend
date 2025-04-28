"use client";

import { useState, useEffect, useRef } from "react";
import { farmerAPI, livestockAPI, operatorAPI } from "./services/api";

const AddData = () => {
  const [formData, setFormData] = useState({
    name: "",
    contact_number: "",
    facebook_email: "",
    barangay: "",
    home_address: "",
    farmer_type: "",
    rsbsa_id: "", // Add this line
    // Added new fields for Grower
    farm_address: "",
    farm_location_longitude: "",
    farm_location_latitude: "",
    market_outlet_location: "",
    buyer_name: "",
    association_organization: "",
    // Added fields for operator
    fishpond_location: "",
    operator_location_longitude: "",
    operator_location_latitude: "",
    geotagged_photo: null,
    geotagged_photo_url: "",
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
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [ocrDebug, setOcrDebug] = useState(null); // Add debug state

  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const operatorMapRef = useRef(null);
  const operatorMarkerRef = useRef(null);
  const operatorMapInstanceRef = useRef(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Load Tesseract.js for OCR
  useEffect(() => {
    const loadTesseract = async () => {
      if (!window.Tesseract) {
        try {
          const script = document.createElement("script");
          script.src =
            "https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js";
          script.async = true;
          document.body.appendChild(script);

          return new Promise((resolve) => {
            script.onload = () => {
              resolve();
            };
            script.onerror = () => {
              console.error("Failed to load Tesseract.js");
              resolve();
            };
          });
        } catch (error) {
          console.error("Error loading Tesseract.js:", error);
        }
      }
      return Promise.resolve();
    };

    loadTesseract();
  }, []);

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

  // Preprocess image for better OCR results
  const preprocessImage = async (imageUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        // Create canvas
        const canvas = document.createElement("canvas");

        // Set canvas dimensions - focus on the top portion where coordinates are likely to be
        const cropHeight = Math.min(img.height * 0.25, 200); // Increased height to capture more of the header
        canvas.width = img.width;
        canvas.height = cropHeight;

        const ctx = canvas.getContext("2d");

        // Draw only the top portion of the image
        ctx.drawImage(
          img,
          0,
          0,
          img.width,
          cropHeight,
          0,
          0,
          canvas.width,
          canvas.height
        );

        // Apply multiple image processing techniques for better OCR results

        // First pass: Create a grayscale version
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Convert to grayscale
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Weighted grayscale conversion (gives better results than simple average)
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;

          data[i] = gray;
          data[i + 1] = gray;
          data[i + 2] = gray;
        }

        ctx.putImageData(imageData, 0, 0);

        // Second pass: Apply adaptive thresholding
        const imageData2 = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data2 = imageData2.data;

        // Increase contrast with adaptive approach
        const blockSize = 15; // Size of the local neighborhood for adaptive thresholding
        const C = 10; // Constant subtracted from the mean

        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            // Calculate local mean
            let sum = 0;
            let count = 0;

            for (
              let dy = -Math.floor(blockSize / 2);
              dy <= Math.floor(blockSize / 2);
              dy++
            ) {
              for (
                let dx = -Math.floor(blockSize / 2);
                dx <= Math.floor(blockSize / 2);
                dx++
              ) {
                const nx = x + dx;
                const ny = y + dy;

                if (
                  nx >= 0 &&
                  nx < canvas.width &&
                  ny >= 0 &&
                  ny < canvas.height
                ) {
                  const idx = (ny * canvas.width + nx) * 4;
                  sum += data2[idx];
                  count++;
                }
              }
            }

            const mean = sum / count;
            const idx = (y * canvas.width + x) * 4;

            // Apply threshold
            const value = data2[idx] < mean - C ? 0 : 255;

            data2[idx] = value;
            data2[idx + 1] = value;
            data2[idx + 2] = value;
          }
        }

        ctx.putImageData(imageData2, 0, 0);

        // Third pass: Apply sharpening
        const imageData3 = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext("2d");
        tempCtx.putImageData(imageData3, 0, 0);

        // Apply unsharp masking
        ctx.globalAlpha = 1.0;
        ctx.drawImage(tempCanvas, 0, 0);
        ctx.globalCompositeOperation = "overlay";
        ctx.globalAlpha = 0.5;
        ctx.drawImage(tempCanvas, 0, 0);
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1.0;

        // Convert canvas to data URL
        const processedImageUrl = canvas.toDataURL("image/png");
        resolve(processedImageUrl);
      };

      img.src = imageUrl;
    });
  };

  // Function to extract coordinates from OCR text
  const extractCoordinatesFromText = (text) => {
    setOcrDebug(text); // Store full OCR text for debugging

    // Department of Agriculture specific format (most precise pattern)
    const doaPattern =
      /Department\s+of\s+Agriculture[\s\S]*?(?:Lat(?:itude)?[:\s]*([0-9.]+))[\s\S]*?(?:Long(?:itude)?[:\s]*([0-9.]+))/i;

    // Alternative Department of Agriculture pattern
    const doaPattern2 =
      /(?:Lat(?:itude)?[:\s]*([0-9.]+))[\s\S]{1,50}(?:Long(?:itude)?[:\s]*([0-9.]+))/i;

    // Generic patterns as fallbacks
    const latitudePattern = /lat(?:itude)?[:\s]*([0-9.-]+)/i;
    const longitudePattern = /long(?:itude)?[:\s]*([0-9.-]+)/i;

    // Coordinate pair pattern (like "8.473194, 126.094194")
    const coordinatePairPattern = /(\d+\.\d+)[,\s]+(\d+\.\d+)/g;

    // Digit-by-digit pattern for Department of Agriculture format
    // This is a very specific pattern for the exact format seen in the images
    const digitPattern =
      /Latitude:\s+(\d)\.(\d)(\d)(\d)(\d)(\d)(\d)[\s\S]*?Longitude:\s+(\d)(\d)(\d)\.(\d)(\d)(\d)(\d)(\d)(\d)/i;

    // Try Department of Agriculture specific format first (most precise)
    const doaMatch = text.match(doaPattern);
    if (doaMatch && doaMatch[1] && doaMatch[2]) {
      const latitude = Number.parseFloat(doaMatch[1]);
      const longitude = Number.parseFloat(doaMatch[2]);

      if (isValidCoordinate(latitude, longitude)) {
        return { latitude, longitude };
      }
    }

    // Try digit-by-digit pattern for Department of Agriculture format
    const digitMatch = text.match(digitPattern);
    if (digitMatch) {
      // Reconstruct latitude from individual digits
      const latitude = Number.parseFloat(
        `${digitMatch[1]}.${digitMatch[2]}${digitMatch[3]}${digitMatch[4]}${digitMatch[5]}${digitMatch[6]}${digitMatch[7]}`
      );

      // Reconstruct longitude from individual digits
      const longitude = Number.parseFloat(
        `${digitMatch[8]}${digitMatch[9]}${digitMatch[10]}.${digitMatch[11]}${digitMatch[12]}${digitMatch[13]}${digitMatch[14]}${digitMatch[15]}${digitMatch[16]}`
      );

      if (isValidCoordinate(latitude, longitude)) {
        return { latitude, longitude };
      }
    }

    // Try alternative Department of Agriculture pattern
    const doaMatch2 = text.match(doaPattern2);
    if (doaMatch2 && doaMatch2[1] && doaMatch2[2]) {
      const latitude = Number.parseFloat(doaMatch2[1]);
      const longitude = Number.parseFloat(doaMatch2[2]);

      if (isValidCoordinate(latitude, longitude)) {
        return { latitude, longitude };
      }
    }

    // Try generic latitude/longitude patterns
    const latMatch = text.match(latitudePattern);
    const lngMatch = text.match(longitudePattern);

    if (latMatch && latMatch[1] && lngMatch && lngMatch[1]) {
      const latitude = Number.parseFloat(latMatch[1]);
      const longitude = Number.parseFloat(lngMatch[1]);

      if (isValidCoordinate(latitude, longitude)) {
        return { latitude, longitude };
      }
    }

    // Try coordinate pair pattern
    const pairs = [];
    let match;
    while ((match = coordinatePairPattern.exec(text)) !== null) {
      pairs.push({
        lat: Number.parseFloat(match[1]),
        lng: Number.parseFloat(match[2]),
      });
    }

    // Check if any of the pairs are valid coordinates
    for (const coord of pairs) {
      if (isValidCoordinate(coord.lat, coord.lng)) {
        return { latitude: coord.lat, longitude: coord.lng };
      }
    }

    // Last resort: Look for any numbers that could be coordinates
    const numberPattern = /(\d+\.\d+)/g;
    const numbers = [];
    let numMatch;

    while ((numMatch = numberPattern.exec(text)) !== null) {
      numbers.push(Number.parseFloat(numMatch[1]));
    }

    // If we found at least two numbers, assume the first two might be coordinates
    if (numbers.length >= 2) {
      const latitude = numbers[0];
      const longitude = numbers[1];

      if (isValidCoordinate(latitude, longitude)) {
        return { latitude, longitude };
      }
    }

    return null;
  };

  // Helper function to validate coordinates
  const isValidCoordinate = (latitude, longitude) => {
    return (
      !isNaN(latitude) &&
      !isNaN(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180 &&
      // Additional check for Philippines region (optional)
      latitude >= 4 &&
      latitude <= 21 &&
      longitude >= 116 &&
      longitude <= 127
    );
  };

  // Function to perform OCR on an image
  const performOCR = async (imageUrl) => {
    if (!window.Tesseract) {
      console.error("Tesseract.js not loaded");
      return null;
    }

    try {
      setIsProcessingImage(true);
      setMessage({
        type: "info",
        content: "Processing image to extract coordinates...",
      });

      // Create multiple preprocessed versions of the image for better results
      const processedImageUrl = await preprocessImage(imageUrl);

      // Create a worker with specific configuration for better text recognition
      const worker = await window.Tesseract.createWorker({
        logger: (m) => m,
        workerPath:
          "https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/worker.min.js",
        corePath:
          "https://cdn.jsdelivr.net/npm/tesseract.js-core@4/tesseract-core.wasm.js",
        langPath: "https://tessdata.projectnaptha.com/4.0.0",
      });

      // Load English language data
      await worker.loadLanguage("eng");
      await worker.initialize("eng");

      // Set parameters optimized for coordinate text recognition
      await worker.setParameters({
        tessedit_char_whitelist:
          "0123456789.,:-ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ",
        tessedit_pageseg_mode: "4", // Assume a single column of text of variable sizes
        tessjs_create_hocr: "0",
        tessjs_create_tsv: "0",
        tessjs_create_box: "0",
        tessjs_create_unlv: "0",
        tessjs_create_osd: "0",
      });

      // Recognize text in the processed image
      const result = await worker.recognize(processedImageUrl);

      setOcrResult(result.data.text);

      // Extract coordinates from the recognized text
      let coordinates = extractCoordinatesFromText(result.data.text);

      // If coordinates were found, terminate worker and return
      if (coordinates) {
        await worker.terminate();
        setIsProcessingImage(false);
        setMessage({
          type: "success",
          content: "Coordinates extracted successfully!",
        });
        return coordinates;
      }

      // If no coordinates found, try with the full image

      // Create a new worker for the full image
      const fullWorker = await window.Tesseract.createWorker({
        logger: (m) => m,
      });

      await fullWorker.loadLanguage("eng");
      await fullWorker.initialize("eng");

      // Set parameters for the full image scan
      await fullWorker.setParameters({
        tessedit_char_whitelist:
          "0123456789.,:-ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ",
        tessedit_pageseg_mode: "3", // Fully automatic page segmentation, but no OSD
      });

      // Try with the original image
      const fullResult = await fullWorker.recognize(imageUrl);

      setOcrResult(
        (prev) => prev + "\n\n--- FULL IMAGE OCR ---\n" + fullResult.data.text
      );

      // Extract coordinates from the full image text
      coordinates = extractCoordinatesFromText(fullResult.data.text);

      await fullWorker.terminate();
      setIsProcessingImage(false);

      if (coordinates) {
        setMessage({
          type: "success",
          content: "Coordinates extracted from full image successfully!",
        });
        return coordinates;
      }

      // If still no coordinates, try one more approach with different preprocessing

      // Create a third worker with different preprocessing
      const altWorker = await window.Tesseract.createWorker({
        logger: (m) => m,
      });

      await altWorker.loadLanguage("eng");
      await altWorker.initialize("eng");

      // Apply a different preprocessing approach
      const altProcessedImage = await createAlternativeProcessedImage(imageUrl);

      const altResult = await altWorker.recognize(altProcessedImage);

      setOcrResult(
        (prev) =>
          prev +
          "\n\n--- ALTERNATIVE PROCESSING OCR ---\n" +
          altResult.data.text
      );

      // Extract coordinates from the alternatively processed image
      coordinates = extractCoordinatesFromText(altResult.data.text);

      await altWorker.terminate();

      if (coordinates) {
        setMessage({
          type: "success",
          content: "Coordinates extracted with alternative processing!",
        });
        return coordinates;
      }

      // If all attempts failed
      setMessage({
        type: "error",
        content:
          "Could not extract coordinates from the image. Please enter them manually.",
      });
      return null;
    } catch (error) {
      console.error("OCR Error:", error);
      setIsProcessingImage(false);
      setMessage({
        type: "error",
        content: "Error processing image: " + error.message,
      });
      return null;
    } finally {
      setIsProcessingImage(false);
    }
  };

  // Alternative image preprocessing for difficult cases
  const createAlternativeProcessedImage = async (imageUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        // Create canvas
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");

        // Draw the original image
        ctx.drawImage(img, 0, 0);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Apply extreme contrast and inversion for difficult text
        for (let i = 0; i < data.length; i += 4) {
          // Convert to grayscale
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;

          // Apply binary threshold with inversion
          const threshold = 128;
          const value = avg < threshold ? 255 : 0; // Invert colors

          data[i] = value;
          data[i + 1] = value;
          data[i + 2] = value;
        }

        ctx.putImageData(imageData, 0, 0);

        // Convert canvas to data URL
        const processedImageUrl = canvas.toDataURL("image/png");
        resolve(processedImageUrl);
      };

      img.src = imageUrl;
    });
  };

  // Function to handle photo upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create a preview URL for the image
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);

    // Store the file in formData
    setFormData({
      ...formData,
      geotagged_photo: file,
      geotagged_photo_url: previewUrl,
    });

    try {
      setMessage({
        type: "info",
        content: "Analyzing image for coordinates...",
      });

      // Perform OCR on the image to extract coordinates
      const coordinates = await performOCR(previewUrl);

      if (coordinates) {
        // Update coordinates in state
        setFormData((prevData) => ({
          ...prevData,
          operator_location_latitude: coordinates.latitude.toFixed(6),
          operator_location_longitude: coordinates.longitude.toFixed(6),
        }));

        // Auto-show map after extracting coordinates
        setShowOperatorMap(true);

        // Perform reverse geocoding to get the place name
        fetchLocationName(coordinates.latitude, coordinates.longitude);

        setMessage({
          type: "success",
          content: `Coordinates extracted: ${coordinates.latitude.toFixed(
            6
          )}, ${coordinates.longitude.toFixed(6)}`,
        });
      } else {
        // If OCR failed, show a message
        setMessage({
          type: "warning",
          content:
            "Could not extract coordinates from the image. Please enter them manually.",
        });
      }
    } catch (error) {
      console.error("Error processing image:", error);
      setMessage({
        type: "error",
        content: "Error processing image: " + error.message,
      });
    }
  };

  // Function to handle grower photo upload
  const handleGrowerPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create a preview URL for the image
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);

    // Store the file in formData
    setFormData({
      ...formData,
      geotagged_photo: file,
      geotagged_photo_url: previewUrl,
    });

    try {
      setMessage({
        type: "info",
        content: "Analyzing image for coordinates...",
      });

      // Perform OCR on the image to extract coordinates
      const coordinates = await performOCR(previewUrl);

      if (coordinates) {
        // Update coordinates in state
        setFormData((prevData) => ({
          ...prevData,
          farm_location_latitude: coordinates.latitude.toFixed(6),
          farm_location_longitude: coordinates.longitude.toFixed(6),
        }));

        // Auto-show map after extracting coordinates
        setShowMap(true);

        // Perform reverse geocoding to get the place name
        fetchGrowerLocationName(coordinates.latitude, coordinates.longitude);

        setMessage({
          type: "success",
          content: `Coordinates extracted: ${coordinates.latitude.toFixed(
            6
          )}, ${coordinates.longitude.toFixed(6)}`,
        });
      } else {
        // If OCR failed, show a message
        setMessage({
          type: "warning",
          content:
            "Could not extract coordinates from the image. Please enter them manually.",
        });
      }
    } catch (error) {
      console.error("Error processing image:", error);
      setMessage({
        type: "error",
        content: "Error processing image: " + error.message,
      });
    }
  };

  // Add this new function for reverse geocoding
  const fetchLocationName = async (latitude, longitude) => {
    try {
      // Using OpenStreetMap's Nominatim API for reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            Accept: "application/json",
            "User-Agent": "Agricultural Inventory App", // Required by Nominatim's usage policy
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch location name");
      }

      const data = await response.json();

      // Extract relevant location information
      let locationName = "";

      if (data.display_name) {
        // For a more concise name, we can use parts of the address
        const addressParts = [];

        if (data.address) {
          // Build a more concise address from components
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

        // If we have address parts, use them; otherwise use the full display_name
        locationName =
          addressParts.length > 0
            ? addressParts.join(", ")
            : data.display_name.split(",").slice(0, 3).join(","); // Take first 3 parts of display_name
      } else {
        // Fallback to coordinates if no name is found
        locationName = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      }

      // Update the fishpond location with the place name
      setFormData((prevData) => ({
        ...prevData,
        fishpond_location: locationName,
      }));

      setMessage({
        type: "success",
        content: "Location name retrieved successfully!",
      });
    } catch (error) {
      console.error("Error fetching location name:", error);
      // Fallback to coordinates if reverse geocoding fails
      setFormData((prevData) => ({
        ...prevData,
        fishpond_location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      }));

      setMessage({
        type: "warning",
        content: "Could not retrieve location name. Using coordinates instead.",
      });
    }
  };

  // Add this new function for reverse geocoding for grower
  const fetchGrowerLocationName = async (latitude, longitude) => {
    try {
      // Using OpenStreetMap's Nominatim API for reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            Accept: "application/json",
            "User-Agent": "Agricultural Inventory App", // Required by Nominatim's usage policy
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch location name");
      }

      const data = await response.json();

      // Extract relevant location information
      let locationName = "";

      if (data.display_name) {
        // For a more concise name, we can use parts of the address
        const addressParts = [];

        if (data.address) {
          // Build a more concise address from components
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

        // If we have address parts, use them; otherwise use the full display_name
        locationName =
          addressParts.length > 0
            ? addressParts.join(", ")
            : data.display_name.split(",").slice(0, 3).join(","); // Take first 3 parts of display_name
      } else {
        // Fallback to coordinates if no name is found
        locationName = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      }

      // Update the farm address with the place name
      setFormData((prevData) => ({
        ...prevData,
        farm_address: locationName,
      }));

      setMessage({
        type: "success",
        content: "Farm location name retrieved successfully!",
      });
    } catch (error) {
      console.error("Error fetching location name:", error);
      // Fallback to coordinates if reverse geocoding fails
      setFormData((prevData) => ({
        ...prevData,
        farm_address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      }));

      setMessage({
        type: "warning",
        content: "Could not retrieve location name. Using coordinates instead.",
      });
    }
  };

  // Also update the getOperatorCurrentLocation function to use reverse geocoding
  const getOperatorCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
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
          fetchLocationName(latitude, longitude);
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

          // Fetch location name based on coordinates
          fetchGrowerLocationName(latitude, longitude);
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
      fetchLocationName(position.lat, position.lng);
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
      fetchLocationName(e.latlng.lat, e.latlng.lng);
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

  // We're not uploading photos anymore, just extracting coordinates
  // Function kept as a placeholder in case upload functionality is needed in the future
  const uploadPhoto = async (file) => {
    return "";
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
      // We're not uploading the photo, just using it for coordinates
      const values = {
        ...formData,
        // Don't include the photo URL in the submitted data
        geotagged_photo_url: "",
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
          geotagged_photo: null,
          geotagged_photo_url: "",
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
        setPhotoPreview(null);
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

        /* Photo preview styles */
        .photo-preview {
          width: 100%;
          max-height: 200px;
          object-fit: contain;
          border-radius: 0.375rem;
          margin-top: 0.5rem;
        }

        .photo-upload-container {
          position: relative;
          width: 100%;
          border: 2px dashed #e2e8f0;
          border-radius: 0.375rem;
          padding: 1rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .photo-upload-container:hover {
          border-color: #10b981;
          background-color: rgba(16, 185, 129, 0.05);
        }

        .photo-upload-container input {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
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
                  : message.type === "info"
                  ? "bg-blue-100 text-blue-800"
                  : message.type === "warning"
                  ? "bg-yellow-100 text-yellow-800"
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
            <div className="p-4 bg-emerald-50 hide-scrollbar">
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
                    RSBSA ID
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
                          d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                        ></path>
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="rsbsa_id"
                      value={formData.rsbsa_id}
                      onChange={handleInputChange}
                      placeholder="Enter RSBSA ID"
                      className="w-full py-2 pl-10 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
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

          {/* Operator Information Section */}
          {farmerType === "Operator" && (
            <div className="mb-6 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-md">
              <div className="p-3 font-medium text-white bg-emerald-700">
                Operator Information
              </div>
              <div className="p-4 bg-emerald-50 hide-scrollbar">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Geotagged Photo
                    </label>
                    <div className="photo-upload-container">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        ref={fileInputRef}
                      />
                      <svg
                        className="w-6 h-6 mx-auto text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-5l-4 4-4-4m-4-5l4-4 4 4 4-4"
                        ></path>
                      </svg>
                      <p className="text-sm text-gray-500">
                        Select a geotagged photo with coordinates overlaid on
                        the image
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        The system will extract location data using OCR
                        technology without uploading the image
                      </p>
                    </div>
                    {isProcessingImage && (
                      <div className="mt-2 text-center">
                        <div className="inline-block w-6 h-6 border-2 rounded-full border-t-emerald-500 animate-spin"></div>
                        <p className="mt-1 text-sm text-gray-600">
                          Processing image...
                        </p>
                      </div>
                    )}
                    {photoPreview && (
                      <div className="mt-2">
                        <img
                          src={photoPreview || "/placeholder.svg"}
                          alt="Photo preview"
                          className="photo-preview"
                        />
                      </div>
                    )}
                  </div>
                  {formData.operator_location_latitude &&
                    formData.operator_location_longitude && (
                      <div className="sm:col-span-2">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Operator Location Map
                        </label>
                        <div className="map-container">
                          <div className="map-coordinates">
                            <span className="font-medium">Coordinates:</span>{" "}
                            {formData.operator_location_latitude},{" "}
                            {formData.operator_location_longitude}
                          </div>
                          <div
                            className="w-full h-full"
                            ref={operatorMapRef}
                          ></div>
                        </div>
                        <div className="flex mt-2 space-x-2">
                          <button
                            type="button"
                            onClick={() => setShowOperatorMap(!showOperatorMap)}
                            className="px-4 py-2 font-medium text-white rounded-md bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          >
                            {showOperatorMap ? "Hide Map" : "Show Map"}
                          </button>
                          <button
                            type="button"
                            onClick={getOperatorCurrentLocation}
                            className="px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            Get Current Location
                          </button>
                        </div>
                      </div>
                    )}
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Fishpond Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fishpond_location"
                      value={formData.fishpond_location}
                      onChange={handleInputChange}
                      placeholder="Enter fishpond location"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Cultured Species <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="cultured_species"
                      value={formData.cultured_species}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                      required
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
                      Productive Area (sqm)
                    </label>
                    <input
                      type="number"
                      name="area"
                      value={formData.area}
                      onChange={handleInputChange}
                      placeholder="Enter productive area"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Stocking Density
                    </label>
                    <input
                      type="number"
                      name="stocking_density"
                      value={formData.stocking_density}
                      onChange={handleInputChange}
                      placeholder="Enter stocking density"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                      min="0"
                      step="1"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Date of Stocking
                    </label>
                    <input
                      type="date"
                      name="date_of_stocking"
                      value={formData.date_of_stocking}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Production (kg)
                    </label>
                    <input
                      type="number"
                      name="production"
                      value={formData.production}
                      onChange={handleInputChange}
                      placeholder="Enter production"
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
                      value={formData.date_of_harvest}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Remarks <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                      required
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

          {/* Raiser Information Section */}
          {farmerType === "Raiser" && (
            <div className="mb-6 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-md">
              <div className="p-3 font-medium text-white bg-emerald-700">
                Raiser Information
              </div>
              <div className="p-4 bg-emerald-50 hide-scrollbar">
                {animals.map((animal, index) => (
                  <div
                    key={index}
                    className="p-3 mb-4 border border-gray-300 rounded-md"
                  >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Animal Type
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

                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Subcategory
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
                          disabled={!animal.animal_type}
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
                          {(animal.animal_type === "Duck" ||
                            animal.animal_type === "Quail" ||
                            animal.animal_type === "Turkey") && (
                            <>
                              <option value="Drake">Drake</option>
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

                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Quantity
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
                          placeholder="Enter quantity"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addAnimal}
                  className="px-4 py-2 font-medium text-white rounded-md bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  Add Animal
                </button>
              </div>
            </div>
          )}

          {/* Grower Information Section */}
          {farmerType === "Grower" && (
            <div className="mb-6 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-md">
              <div className="p-3 font-medium text-white bg-emerald-700">
                Grower Information
              </div>
              <div className="p-4 bg-emerald-50 hide-scrollbar">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Geotagged Photo
                    </label>
                    <div className="photo-upload-container">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleGrowerPhotoUpload}
                        ref={fileInputRef}
                      />
                      <svg
                        className="w-6 h-6 mx-auto text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-5l-4 4-4-4m-4-5l4-4 4 4 4-4"
                        ></path>
                      </svg>
                      <p className="text-sm text-gray-500">
                        Select a geotagged photo with coordinates overlaid on
                        the image
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        The system will extract location data using OCR
                        technology without uploading the image
                      </p>
                    </div>
                    {isProcessingImage && (
                      <div className="mt-2 text-center">
                        <div className="inline-block w-6 h-6 border-2 rounded-full border-t-emerald-500 animate-spin"></div>
                        <p className="mt-1 text-sm text-gray-600">
                          Processing image...
                        </p>
                      </div>
                    )}
                    {photoPreview && (
                      <div className="mt-2">
                        <img
                          src={photoPreview || "/placeholder.svg"}
                          alt="Photo preview"
                          className="photo-preview"
                        />
                      </div>
                    )}
                  </div>
                  {formData.farm_location_latitude &&
                    formData.farm_location_longitude && (
                      <div className="sm:col-span-2">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Farm Location Map
                        </label>
                        <div className="map-container">
                          <div className="map-coordinates">
                            <span className="font-medium">Coordinates:</span>{" "}
                            {formData.farm_location_latitude},{" "}
                            {formData.farm_location_longitude}
                          </div>
                          <div className="w-full h-full" ref={mapRef}></div>
                        </div>
                        <div className="flex mt-2 space-x-2">
                          <button
                            type="button"
                            onClick={() => setShowMap(!showMap)}
                            className="px-4 py-2 font-medium text-white rounded-md bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          >
                            {showMap ? "Hide Map" : "Show Map"}
                          </button>
                          <button
                            type="button"
                            onClick={getCurrentLocation}
                            className="px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            Get Current Location
                          </button>
                        </div>
                      </div>
                    )}
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Farm Address
                    </label>
                    <input
                      type="text"
                      name="farm_address"
                      value={formData.farm_address}
                      onChange={handleInputChange}
                      placeholder="Enter farm address"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Farm Location Longitude
                    </label>
                    <input
                      type="number"
                      name="farm_location_longitude"
                      value={formData.farm_location_longitude}
                      onChange={handleInputChange}
                      placeholder="Enter farm longitude"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Farm Location Latitude
                    </label>
                    <input
                      type="number"
                      name="farm_location_latitude"
                      value={formData.farm_location_latitude}
                      onChange={handleInputChange}
                      placeholder="Enter farm latitude"
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
                      value={formData.market_outlet_location}
                      onChange={handleInputChange}
                      placeholder="Enter market outlet location"
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
                      value={formData.buyer_name}
                      onChange={handleInputChange}
                      placeholder="Enter buyer name"
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
                      value={formData.association_organization}
                      onChange={handleInputChange}
                      placeholder="Enter association/organization"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Crop Information Section */}
          {farmerType === "Grower" && (
            <div className="mb-6 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-md">
              <div className="p-3 font-medium text-white bg-emerald-700">
                Crop Information
              </div>
              <div className="p-4 bg-emerald-50 hide-scrollbar">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Crop Type
                    </label>
                    <select
                      name="crop_type"
                      value={formData.crop_type}
                      onChange={(e) =>
                        handleSelectChange("crop_type", e.target.value)
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Select Crop Type</option>
                      <option value="Rice">Rice</option>
                      <option value="Spices">Spices</option>
                      <option value="Legumes">Legumes</option>
                      <option value="Banana">Banana</option>
                      <option value="Vegetable">Vegetable</option>
                      <option value="High Value Crops">High Value Crops</option>
                    </select>
                  </div>

                  {formData.crop_type === "High Value Crops" && (
                    <>
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Month
                        </label>
                        <select
                          name="month"
                          value={formData.month}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
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

                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          High Value Crop
                        </label>
                        <select
                          name="high_value_crop"
                          value={formData.high_value_crop}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
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
                          Area (hectare)
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
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Cropping Intensity
                        </label>
                        <select
                          name="cropping_intensity"
                          value={formData.cropping_intensity || ""}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          <option value="">Select Cropping Intensity</option>
                          <option value="year_round">Year Round</option>
                          <option value="quarterly">Quarterly</option>
                          <option value="seasonal">Seasonal</option>
                          <option value="annually">Annually</option>
                          <option value="twice_a_month">Twice a Month</option>
                        </select>
                      </div>

                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Quantity
                        </label>
                        <input
                          type="number"
                          name="quantity"
                          value={formData.quantity || ""}
                          onChange={handleInputChange}
                          min="0"
                          placeholder="Enter Quantity"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                    </>
                  )}

                  {formData.crop_type !== "Rice" &&
                    formData.crop_type !== "High Value Crops" &&
                    formData.crop_type !== "" && (
                      <>
                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            Area (hectare)
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
                          />
                        </div>

                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            Cropping Intensity
                          </label>
                          <select
                            name="cropping_intensity"
                            value={formData.cropping_intensity || ""}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                          >
                            <option value="">Select Cropping Intensity</option>
                            <option value="year_round">Year Round</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="seasonal">Seasonal</option>
                            <option value="annually">Annually</option>
                            <option value="twice_a_month">Twice a Month</option>
                          </select>
                        </div>
                      </>
                    )}

                  {/* Spices Section */}
                  {formData.crop_type === "Spices" && (
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

                                  <option value="Ginger">Ginger</option>
                                  <option value="Onion">Onion</option>
                                  <option value="Hotpepper">Hotpepper</option>
                                  <option value="Sweet Pepper">
                                    Sweet Pepper
                                  </option>
                                  <option value="Turmeric">Turmeric</option>
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
                  )}

                  {/* Legumes Section */}
                  {formData.crop_type === "Legumes" && (
                    <div className="col-span-1 sm:col-span-2">
                      <div className="max-h-[500px] overflow-auto p-1 mb-4 hide-scrollbar">
                        {additionalLegumesDetails.map((legumeDetail, index) => (
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
                                  <option value="">Select Legume Type</option>
                                  <option value="Mung Bean">Mung Bean</option>
                                  <option value="Peanut">Peanut</option>
                                  <option value="Soybean">Soybean</option>
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
                        ))}
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
                  )}

                  {/* Banana Section */}
                  {formData.crop_type === "Banana" && (
                    <div className="col-span-1 sm:col-span-2">
                      <div className="max-h-[500px] overflow-auto p-1 mb-4 hide-scrollbar">
                        {additionalBananaDetails.map((bananaDetail, index) => (
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
                                  <option value="">Select Banana Type</option>
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
                        ))}
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
                  )}

                  {/* Vegetable Section */}
                  {formData.crop_type === "Vegetable" && (
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
                                    <option value="Eggplant">Eggplant</option>
                                    <option value="Ampalaya">Ampalaya</option>
                                    <option value="Okra">Okra</option>
                                    <option value="Pole Sitao">
                                      Pole Sitao
                                    </option>
                                    <option value="Squash">Squash</option>
                                    <option value="Tomato">Tomato</option>
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
                  )}

                  {/* Rice Details */}
                  {formData.crop_type === "Rice" && (
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
                                    <option value="Upland">Upland</option>
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
                                    <option value="Certified">Certified</option>
                                    <option value="Good Seed">Good Seed</option>
                                    <option value="Hybrid">Hybrid</option>
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

          <button
            type="submit"
            disabled={loading || isProcessingImage}
            className="fixed bottom-0 left-0 right-0 z-10 p-4 text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-400 disabled:cursor-not-allowed md:static md:w-auto md:rounded-md:px-6 md:py-2"
          >
            {loading ? (
              <>
                <svg
                  className="inline-block w-5 h-5 mr-2 animate-spin"
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
                Submitting...
              </>
            ) : isProcessingImage ? (
              "Processing Image..."
            ) : (
              "Submit"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddData;
