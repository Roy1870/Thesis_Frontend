"use client"

import { useState } from "react"
import { farmerAPI, livestockAPI } from "./services/api"

// Accordion component for collapsible sections
const AccordionSection = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="mb-4 border rounded-lg overflow-hidden">
      <button
        className="w-full p-3 text-left font-medium bg-emerald-700 text-white flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        {title}
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      <div className={`${isOpen ? "block" : "hidden"} p-4 bg-emerald-50`}>{children}</div>
    </div>
  )
}

const AddData = () => {
  const [formData, setFormData] = useState({
    name: "",
    contact_number: "",
    facebook_email: "",
    barangay: "",
    home_address: "",
    farmer_type: "",
  })

  const [farmerType, setFarmerType] = useState(null)
  const [animals, setAnimals] = useState([{ animal_type: "", subcategory: "", quantity: "" }])
  const [selectedCrop, setSelectedCrop] = useState(null)
  const [selectedVegetable, setSelectedVegetable] = useState(null)
  const [additionalRiceDetails, setAdditionalRiceDetails] = useState([{ area_type: "", seed_type: "", production: "" }])
  const [additionalSpiceDetails, setAdditionalSpiceDetails] = useState([{ spices_type: "", quantity: "" }])
  const [additionalLegumesDetails, setAdditionalLegumesDetails] = useState([{ legumes_type: "", quantity: "" }])
  const [additionalBananaDetails, setAdditionalBananaDetails] = useState([{ banana_type: "", quantity: "" }])
  const [additionalVegetableDetails, setAdditionalVegetableDetails] = useState([
    { vegetable_type: "", quantity: "", other_vegetable: "" },
  ])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", content: "" })

  // Handler functions
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    })

    if (name === "farmer_type") {
      setFarmerType(value)
      setSelectedCrop(null)
    } else if (name === "crop_type") {
      setSelectedCrop(value)
    }
  }

  const handleFarmerTypeChange = (value) => {
    setFarmerType(value)
    setSelectedCrop(null)
    setFormData({
      ...formData,
      farmer_type: value,
    })
  }

  const handleAddAdditionalRice = () => {
    setAdditionalRiceDetails([...additionalRiceDetails, { area_type: "", seed_type: "", production: "" }])
  }

  const handleRemoveAdditionalRice = (index) => {
    const newAdditionalRiceDetails = [...additionalRiceDetails]
    newAdditionalRiceDetails.splice(index, 1)
    setAdditionalRiceDetails(newAdditionalRiceDetails)
  }

  const handleAddAdditionalSpice = () => {
    setAdditionalSpiceDetails([...additionalSpiceDetails, { spices_type: "", quantity: "" }])
  }

  const handleRemoveAdditionalSpice = (index) => {
    const newAdditionalSpiceDetails = [...additionalSpiceDetails]
    newAdditionalSpiceDetails.splice(index, 1)
    setAdditionalSpiceDetails(newAdditionalSpiceDetails)
  }

  const handleRemoveAdditionalLegumes = (index) => {
    const newAdditionalLegumesDetails = [...additionalLegumesDetails]
    newAdditionalLegumesDetails.splice(index, 1)
    setAdditionalLegumesDetails(newAdditionalLegumesDetails)
  }

  const handleAddAdditionalLegumes = () => {
    setAdditionalLegumesDetails([...additionalLegumesDetails, { legumes_type: "", quantity: "" }])
  }

  const handleRemoveAdditionalBanana = (index) => {
    const newAdditionalBananaDetails = [...additionalBananaDetails]
    newAdditionalBananaDetails.splice(index, 1)
    setAdditionalBananaDetails(newAdditionalBananaDetails)
  }

  const handleAddAdditionalBanana = () => {
    setAdditionalBananaDetails([...additionalBananaDetails, { banana_type: "", quantity: "" }])
  }

  const handleRemoveAdditionalVegetable = (index) => {
    const newAdditionalVegetableDetails = [...additionalVegetableDetails]
    newAdditionalVegetableDetails.splice(index, 1)
    setAdditionalVegetableDetails(newAdditionalVegetableDetails)
  }

  const handleAddAdditionalVegetable = () => {
    setAdditionalVegetableDetails([
      ...additionalVegetableDetails,
      { vegetable_type: "", quantity: "", other_vegetable: "" },
    ])
  }

  const addAnimal = () => {
    setAnimals([...animals, { animal_type: "", subcategory: "", quantity: "" }])
  }

  const handleAnimalChange = (index, field, value) => {
    const newAnimals = [...animals]
    newAnimals[index][field] = value

    // Auto-select subcategory based on animal type
    if (field === "animal_type") {
      if (value === "Cattle") {
        newAnimals[index].subcategory = "Carabull"
      } else if (value === "Carabao") {
        newAnimals[index].subcategory = "Caracow"
      } else {
        newAnimals[index].subcategory = ""
      }
    }

    setAnimals(newAnimals)
  }

  const handleAdditionalRiceChange = (index, field, value) => {
    const newDetails = [...additionalRiceDetails]
    newDetails[index][field] = value
    setAdditionalRiceDetails(newDetails)
  }

  const handleAdditionalSpiceChange = (index, field, value) => {
    const newDetails = [...additionalSpiceDetails]
    newDetails[index][field] = value
    setAdditionalSpiceDetails(newDetails)
  }

  const handleAdditionalLegumesChange = (index, field, value) => {
    const newDetails = [...additionalLegumesDetails]
    newDetails[index][field] = value
    setAdditionalLegumesDetails(newDetails)
  }

  const handleAdditionalBananaChange = (index, field, value) => {
    const newDetails = [...additionalBananaDetails]
    newDetails[index][field] = value
    setAdditionalBananaDetails(newDetails)
  }

  const handleAdditionalVegetableChange = (index, field, value) => {
    const newDetails = [...additionalVegetableDetails]
    newDetails[index][field] = value

    if (field === "vegetable_type" && value === "Other Crop (specify)") {
      setSelectedVegetable(index)
    } else if (field === "vegetable_type") {
      setSelectedVegetable(null)
    }

    setAdditionalVegetableDetails(newDetails)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const values = {
        ...formData,
      }

      // Format data for API submission
      const formattedData = {
        name: values.name,
        home_address: values.home_address,
        contact_number: values.contact_number,
        facebook_email: values.facebook_email,
        barangay: values.barangay,
      }

      // Handle livestock records for Raiser type
      if (farmerType === "Raiser") {
        const livestockRecords = []

        // Process animal entries
        for (let i = 0; i < animals.length; i++) {
          const animalType = animals[i].animal_type
          const subcategory = animals[i].subcategory
          const quantity = animals[i].quantity

          if (animalType && subcategory && quantity) {
            livestockRecords.push({
              animal_type: animalType,
              subcategory: subcategory,
              quantity: Number.parseInt(quantity, 10),
              updated_by: "User", // You can replace this with the actual user name or ID
            })
          }
        }

        // Only add livestock_records if there are valid entries
        if (livestockRecords.length > 0) {
          formattedData.livestock_records = livestockRecords
        }
      }

      // Handle crops based on crop type
      if (values.crop_type && values.crop_type !== "Rice") {
        const cropsArray = []

        // For Cacao, handle it separately since it uses month instead of crop
        if (values.crop_type === "Cacao") {
          // Only add if month and quantity are provided
          if (values.month && values.quantity) {
            const productionData = {
              month: values.month,
              quantity: values.quantity,
            }

            cropsArray.push({
              crop_type: "Cacao",
              variety_clone: values.variety_clone || "",
              area_hectare: values.area_hectare ? Number.parseFloat(values.area_hectare) : 0,
              production_type: values.cropping_intensity || "seasonal",
              production_data: JSON.stringify(productionData),
            })
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
                }

                cropsArray.push({
                  crop_type: "Spices",
                  area_hectare: values.area_hectare ? Number.parseFloat(values.area_hectare) : 0,
                  production_type: values.cropping_intensity || "seasonal",
                  production_data: JSON.stringify(productionData),
                })
              }
            })
          }

          // Handle additional legumes entries
          if (values.crop_type === "Legumes") {
            additionalLegumesDetails.forEach((legume) => {
              if (legume.legumes_type && legume.quantity) {
                const productionData = {
                  crop: legume.legumes_type,
                  quantity: legume.quantity,
                }

                cropsArray.push({
                  crop_type: "Legumes",
                  area_hectare: values.area_hectare ? Number.parseFloat(values.area_hectare) : 0,
                  production_type: values.cropping_intensity || "seasonal",
                  production_data: JSON.stringify(productionData),
                })
              }
            })
          }

          // Handle additional banana entries
          if (values.crop_type === "Banana") {
            additionalBananaDetails.forEach((banana) => {
              if (banana.banana_type && banana.quantity) {
                const productionData = {
                  crop: banana.banana_type,
                  quantity: banana.quantity,
                }

                cropsArray.push({
                  crop_type: "Banana",
                  area_hectare: values.area_hectare ? Number.parseFloat(values.area_hectare) : 0,
                  production_type: values.cropping_intensity || "seasonal",
                  production_data: JSON.stringify(productionData),
                })
              }
            })
          }

          // Handle additional vegetable entries
          if (values.crop_type === "Vegetable") {
            additionalVegetableDetails.forEach((vegetable) => {
              if (vegetable.vegetable_type && vegetable.quantity) {
                let cropValue = vegetable.vegetable_type
                if (vegetable.vegetable_type === "Other Crop (specify)" && vegetable.other_vegetable) {
                  cropValue = vegetable.other_vegetable
                }

                const productionData = {
                  crop: cropValue,
                  quantity: vegetable.quantity,
                }

                cropsArray.push({
                  crop_type: "Vegetable",
                  area_hectare: values.area_hectare ? Number.parseFloat(values.area_hectare) : 0,
                  production_type: values.cropping_intensity || "seasonal",
                  production_data: JSON.stringify(productionData),
                })
              }
            })
          }

          // Only add main crop entry if crop_value and quantity are provided
          // AND if there are no additional entries of the same type
          if (values.crop_value && values.quantity && cropsArray.length === 0) {
            const productionData = {
              crop: values.crop_value,
              quantity: values.quantity,
            }

            cropsArray.push({
              crop_type: values.crop_type,
              area_hectare: values.area_hectare ? Number.parseFloat(values.area_hectare) : 0,
              production_type: values.cropping_intensity || "seasonal",
              production_data: JSON.stringify(productionData),
            })
          }
        }

        // Only add crops array if there are valid entries
        if (cropsArray.length > 0) {
          formattedData.crops = cropsArray
        }
      }

      // Handle rice entries
      const riceEntries = []

      // Add main rice entry if it exists
      if (values.crop_type === "Rice") {
        const mainRiceEntry = {
          area_type: values.area_type || undefined,
          seed_type: values.seed_type || undefined,
          area_harvested: values.area_harvested ? Number.parseFloat(values.area_harvested) : undefined,
          production: values.production ? Number.parseFloat(values.production) : undefined,
          ave_yield: values.ave_yield ? Number.parseFloat(values.ave_yield) : undefined,
        }

        // Only add if at least one field has a value
        if (Object.values(mainRiceEntry).some((val) => val !== undefined)) {
          riceEntries.push(mainRiceEntry)
        }
      }

      // Add additional rice entries
      if (values.crop_type === "Rice") {
        additionalRiceDetails.forEach((rice) => {
          const riceEntry = {
            area_type: rice.area_type || undefined,
            seed_type: rice.seed_type || undefined,
            area_harvested: rice.area_harvested ? Number.parseFloat(rice.area_harvested) : undefined,
            production: rice.production ? Number.parseFloat(rice.production) : undefined,
            ave_yield: rice.ave_yield ? Number.parseFloat(rice.ave_yield) : undefined,
          }

          // Only add if at least one field has a value
          if (Object.values(riceEntry).some((val) => val !== undefined)) {
            riceEntries.push(riceEntry)
          }
        })
      }

      // Only include rice key if there are valid entries
      if (riceEntries.length > 0) {
        formattedData.rice = riceEntries
      }

      console.log("Formatted JSON Data:", JSON.stringify(formattedData, null, 2))

      // Determine which API endpoint to use based on the data
      let response

      if (formattedData.livestock_records && formattedData.livestock_records.length > 0) {
        // If we have livestock records, use the livestock-records endpoint
        response = await livestockAPI.createLivestockRecords(formattedData)
      } else {
        // Otherwise use the regular farmers endpoint
        response = await farmerAPI.createFarmer(formattedData)
      }

      if (response) {
        setMessage({ type: "success", content: "Data submitted successfully!" })
        // Reset form
        setFormData({
          name: "",
          contact_number: "",
          facebook_email: "",
          barangay: "",
          home_address: "",
          farmer_type: "",
        })
        setFarmerType(null)
        setAnimals([{ animal_type: "", subcategory: "", quantity: "" }])
        setSelectedCrop(null)
        setSelectedVegetable(null)
        setAdditionalRiceDetails([{ area_type: "", seed_type: "", production: "" }])
        setAdditionalSpiceDetails([{ spices_type: "", quantity: "" }])
        setAdditionalLegumesDetails([{ legumes_type: "", quantity: "" }])
        setAdditionalBananaDetails([{ banana_type: "", quantity: "" }])
        setAdditionalVegetableDetails([{ vegetable_type: "", quantity: "", other_vegetable: "" }])
      } else {
        setMessage({ type: "error", content: "Failed to submit data." })
      }
    } catch (error) {
      console.error("Error submitting data:", error)
      setMessage({ type: "error", content: "An error occurred while submitting the data." })
    } finally {
      setLoading(false)
    }
  }

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
  ]

  return (
    <div className="min-h-screen bg-white p-4 w-full overflow-auto">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-4">
        <div className="flex items-center p-4 border-b">
          <button
            onClick={() => (window.location.href = "/inventory")}
            className="mr-3 flex items-center justify-center px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back
          </button>
          <h2 className="text-xl font-semibold m-0">Add Farmer Data</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {/* Message display */}
          {message.content && (
            <div
              className={`mb-4 p-3 rounded-md ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {message.content}
            </div>
          )}

          {/* Farmer Information Section */}
          <div className="mb-6 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-emerald-700 text-white p-3 font-medium">Farmer Information</div>
            <div className="p-4 bg-emerald-50 max-h-[calc(100vh-240px)] overflow-y-auto overflow-x-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
                      className="pl-10 w-full text-sm rounded-md border border-gray-300 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
                      className="pl-10 w-full text-sm rounded-md border border-gray-300 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Facebook/Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="facebook_email"
                    value={formData.facebook_email}
                    onChange={handleInputChange}
                    placeholder="Enter Facebook or Email"
                    className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Barangay <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="barangay"
                    value={formData.barangay}
                    onChange={handleInputChange}
                    className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Home Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="home_address"
                    value={formData.home_address}
                    onChange={handleInputChange}
                    placeholder="Enter home address"
                    className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Farmer Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="farmer_type"
                    value={formData.farmer_type}
                    onChange={(e) => handleFarmerTypeChange(e.target.value)}
                    className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
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
            <div className="mb-6 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-emerald-700 text-white p-3 font-medium">Livestock Records</div>
              <div className="p-4 bg-emerald-50 max-h-[500px] overflow-auto">
                {animals.map((animal, index) => (
                  <div key={index} className="p-3 mb-3 border border-dashed border-gray-300 rounded-md bg-white">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                      <div className="sm:col-span-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Animal Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={animal.animal_type}
                          onChange={(e) => handleAnimalChange(index, "animal_type", e.target.value)}
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Subcategory <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={animal.subcategory}
                          onChange={(e) => handleAnimalChange(index, "subcategory", e.target.value)}
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
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
                              <option value="Fighting Cocks">Fighting Cocks</option>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={animal.quantity}
                          onChange={(e) => handleAnimalChange(index, "quantity", e.target.value)}
                          placeholder="Enter Quantity"
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                          required
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <label className="block text-sm font-medium text-white mb-1">&nbsp;</label>
                        <button
                          type="button"
                          onClick={() => {
                            const newAnimals = [...animals]
                            newAnimals.splice(index, 1)
                            setAnimals(newAnimals)
                          }}
                          className="w-full text-sm bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-md flex items-center justify-center"
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
                  className="w-full border border-dashed border-emerald-700 text-emerald-700 hover:bg-emerald-50 py-2 px-4 rounded-md flex items-center justify-center"
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
            <div className="mb-6 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-emerald-700 text-white p-3 font-medium">Operator Details</div>
              <div className="p-4 bg-emerald-50 max-h-[calc(100vh-240px)] overflow-y-auto overflow-x-hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fishpond Location</label>
                    <input
                      type="text"
                      name="fishpond_location"
                      value={formData.fishpond_location || ""}
                      onChange={handleInputChange}
                      placeholder="Enter Fishpond Location"
                      className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Geotagged Photo</label>
                    <input
                      type="text"
                      name="geotagged_photo"
                      value={formData.geotagged_photo || ""}
                      onChange={handleInputChange}
                      placeholder="Enter Geotagged Photo URL"
                      className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cultured Species</label>
                    <input
                      type="text"
                      name="cultured_species"
                      value={formData.cultured_species || ""}
                      onChange={handleInputChange}
                      placeholder="Enter Cultured Species"
                      className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Area (Hectares)</label>
                    <input
                      type="number"
                      name="area"
                      value={formData.area || ""}
                      onChange={handleInputChange}
                      placeholder="Enter Area"
                      className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stocking Density</label>
                    <input
                      type="text"
                      name="stocking_density"
                      value={formData.stocking_density || ""}
                      onChange={handleInputChange}
                      placeholder="Enter Stocking Density"
                      className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Stocking</label>
                    <input
                      type="date"
                      name="date_of_stocking"
                      value={formData.date_of_stocking || ""}
                      onChange={handleInputChange}
                      className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Production</label>
                    <input
                      type="text"
                      name="production"
                      value={formData.production || ""}
                      onChange={handleInputChange}
                      placeholder="Enter Production"
                      className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Harvest</label>
                    <input
                      type="date"
                      name="date_of_harvest"
                      value={formData.date_of_harvest || ""}
                      onChange={handleInputChange}
                      className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Operational Status</label>
                    <select
                      name="operational_status"
                      value={formData.operational_status || ""}
                      onChange={handleInputChange}
                      className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Select Operational Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                    <input
                      type="text"
                      name="remarks"
                      value={formData.remarks || ""}
                      onChange={handleInputChange}
                      placeholder="Enter Remarks"
                      className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Grower Details Section */}
          {farmerType === "Grower" && (
            <div className="mb-6 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-emerald-700 text-white p-3 font-medium">Grower Details</div>
              <div className="p-4 bg-emerald-50 max-h-[calc(100vh-240px)] overflow-y-auto overflow-x-hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Crop Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="crop_type"
                      value={formData.crop_type || ""}
                      onChange={(e) => handleSelectChange("crop_type", e.target.value)}
                      className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    >
                      <option value="">Select Crop Type</option>
                      <option value="Rice">Rice</option>
                      <option value="Spices">Spices</option>
                      <option value="Legumes">Legumes</option>
                      <option value="Vegetable">Vegetable</option>
                      <option value="Cacao">Cacao</option>
                      <option value="Banana">Banana</option>
                    </select>
                  </div>

                  {/* Rice Details */}
                  {selectedCrop === "Rice" && (
                    <>
                      <div className="col-span-1 sm:col-span-2">
                        <div className="max-h-[500px] overflow-auto p-1 mb-4">
                          {additionalRiceDetails.map((riceDetail, index) => (
                            <div
                              key={index}
                              className="p-3 mb-3 border border-dashed border-gray-300 rounded-md bg-white"
                            >
                              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Area Type</label>
                                  <select
                                    value={riceDetail.area_type}
                                    onChange={(e) => handleAdditionalRiceChange(index, "area_type", e.target.value)}
                                    className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                                  >
                                    <option value="">Select Area Type</option>
                                    <option value="Irrigated">Irrigated</option>
                                    <option value="Rainfed">Rainfed</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Seed Type</label>
                                  <select
                                    value={riceDetail.seed_type}
                                    onChange={(e) => handleAdditionalRiceChange(index, "seed_type", e.target.value)}
                                    className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                                  >
                                    <option value="">Select Seed Type</option>
                                    <option value="Hybrid Seeds">Hybrid Seeds</option>
                                    <option value="Certified Seeds">Certified Seeds</option>
                                    <option value="Good Seeds">Good Seeds</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Area Harvested</label>
                                  <input
                                    type="number"
                                    value={riceDetail.area_harvested || ""}
                                    onChange={(e) =>
                                      handleAdditionalRiceChange(index, "area_harvested", e.target.value)
                                    }
                                    placeholder="Enter Area"
                                    className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Production</label>
                                  <input
                                    type="number"
                                    value={riceDetail.production || ""}
                                    onChange={(e) => handleAdditionalRiceChange(index, "production", e.target.value)}
                                    placeholder="Enter Production"
                                    className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                                  />
                                </div>
                                <div className="flex items-end">
                                  {additionalRiceDetails.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveAdditionalRice(index)}
                                      className="w-full text-sm bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-md flex items-center justify-center"
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
                          className="w-full border border-dashed border-emerald-700 text-emerald-700 hover:bg-emerald-50 py-2 px-4 rounded-md flex items-center justify-center"
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

                  {/* Spices Details */}
                  {selectedCrop === "Spices" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name Of Buyer</label>
                        <input
                          type="text"
                          name="buyer_name"
                          value={formData.buyer_name || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Name of Buyer"
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Market Outlet Location</label>
                        <input
                          type="text"
                          name="market_outlet_location"
                          value={formData.market_outlet_location || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Market Outlet Location"
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Association/Organization</label>
                        <input
                          type="text"
                          name="association_organization"
                          value={formData.association_organization || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Association/Organization"
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cropping Intensity</label>
                        <select
                          name="cropping_intensity"
                          value={formData.cropping_intensity || ""}
                          onChange={handleInputChange}
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Farm Address</label>
                        <input
                          type="text"
                          name="farm_address"
                          value={formData.farm_address || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Farm Address"
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Area (hectare)</label>
                        <input
                          type="number"
                          name="area_hectare"
                          value={formData.area_hectare || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Area (hectare)"
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Farm Location Coordinates(longitude)
                        </label>
                        <input
                          type="text"
                          name="farm_location_longitude"
                          value={formData.farm_location_longitude || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Longitude"
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Farm Location Coordinates(latitude)
                        </label>
                        <input
                          type="text"
                          name="farm_location_latitude"
                          value={formData.farm_location_latitude || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Latitude"
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>

                      <div className="col-span-1 sm:col-span-2">
                        <div className="border-t border-gray-300 my-4 pt-4">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Spice Entries</h3>
                        </div>

                        <div className="max-h-[500px] overflow-auto p-1 mb-4">
                          {additionalSpiceDetails.map((spiceDetail, index) => (
                            <div
                              key={index}
                              className="p-3 mb-3 border border-dashed border-gray-300 rounded-md bg-white"
                            >
                              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                                <div className="sm:col-span-5">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Spice Type <span className="text-red-500">*</span>
                                  </label>
                                  <select
                                    value={spiceDetail.spices_type}
                                    onChange={(e) => handleAdditionalSpiceChange(index, "spices_type", e.target.value)}
                                    className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                                    required
                                  >
                                    <option value="">Select Spices Type</option>
                                    <option value="Ginger">Ginger</option>
                                    <option value="Onion">Onion</option>
                                    <option value="Hotpepper">Hotpepper</option>
                                    <option value="Sweet Pepper">Sweet Pepper</option>
                                    <option value="Turmeric">Turmeric</option>
                                  </select>
                                </div>
                                <div className="sm:col-span-5">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Quantity <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="number"
                                    value={spiceDetail.quantity}
                                    onChange={(e) => handleAdditionalSpiceChange(index, "quantity", e.target.value)}
                                    placeholder="Enter Quantity"
                                    className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                                    required
                                  />
                                </div>
                                <div className="sm:col-span-2">
                                  {additionalSpiceDetails.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveAdditionalSpice(index)}
                                      className="w-full text-sm bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-md flex items-center justify-center"
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
                          className="w-full border border-dashed border-emerald-700 text-emerald-700 hover:bg-emerald-50 py-2 px-4 rounded-md flex items-center justify-center"
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

                  {/* Legumes Details */}
                  {selectedCrop === "Legumes" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name Of Buyer</label>
                        <input
                          type="text"
                          name="buyer_name"
                          value={formData.buyer_name || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Name of Buyer"
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Market Outlet Location</label>
                        <input
                          type="text"
                          name="market_outlet_location"
                          value={formData.market_outlet_location || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Market Outlet Location"
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Association/Organization</label>
                        <input
                          type="text"
                          name="association_organization"
                          value={formData.association_organization || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Association/Organization"
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cropping Intensity</label>
                        <select
                          name="cropping_intensity"
                          value={formData.cropping_intensity || ""}
                          onChange={handleInputChange}
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Farm Address</label>
                        <input
                          type="text"
                          name="farm_address"
                          value={formData.farm_address || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Farm Address"
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Area (hectare)</label>
                        <input
                          type="number"
                          name="area_hectare"
                          value={formData.area_hectare || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Area (hectare)"
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Farm Location Coordinates(longitude)
                        </label>
                        <input
                          type="text"
                          name="farm_location_longitude"
                          value={formData.farm_location_longitude || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Longitude"
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Farm Location Coordinates(latitude)
                        </label>
                        <input
                          type="text"
                          name="farm_location_latitude"
                          value={formData.farm_location_latitude || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Latitude"
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>

                      <div className="col-span-1 sm:col-span-2">
                        <div className="border-t border-gray-300 my-4 pt-4">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Legumes Entries</h3>
                        </div>

                        <div className="max-h-[500px] overflow-auto p-1 mb-4">
                          {additionalLegumesDetails.map((legumesDetail, index) => (
                            <div
                              key={index}
                              className="p-3 mb-3 border border-dashed border-gray-300 rounded-md bg-white"
                            >
                              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                                <div className="sm:col-span-5">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Legumes Type <span className="text-red-500">*</span>
                                  </label>
                                  <select
                                    value={legumesDetail.legumes_type}
                                    onChange={(e) =>
                                      handleAdditionalLegumesChange(index, "legumes_type", e.target.value)
                                    }
                                    className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                                    required
                                  >
                                    <option value="">Select Legumes Type</option>
                                    <option value="Peanut">Peanut</option>
                                    <option value="Mungbean">Mungbean</option>
                                    <option value="Soybean">Soybean</option>
                                  </select>
                                </div>
                                <div className="sm:col-span-5">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Quantity <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="number"
                                    value={legumesDetail.quantity}
                                    onChange={(e) => handleAdditionalLegumesChange(index, "quantity", e.target.value)}
                                    placeholder="Enter Quantity"
                                    className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                                    required
                                  />
                                </div>
                                <div className="sm:col-span-2">
                                  {additionalLegumesDetails.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveAdditionalLegumes(index)}
                                      className="w-full text-sm bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-md flex items-center justify-center"
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
                          className="w-full border border-dashed border-emerald-700 text-emerald-700 hover:bg-emerald-50 py-2 px-4 rounded-md flex items-center justify-center"
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
                          Add Legumes Entry
                        </button>
                      </div>
                    </>
                  )}

                  {/* Banana Details */}
                  {selectedCrop === "Banana" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name Of Buyer</label>
                        <input
                          type="text"
                          name="buyer_name"
                          value={formData.buyer_name || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Name of Buyer"
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Market Outlet Location</label>
                        <input
                          type="text"
                          name="market_outlet_location"
                          value={formData.market_outlet_location || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Market Outlet Location"
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Association/Organization</label>
                        <input
                          type="text"
                          name="association_organization"
                          value={formData.association_organization || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Association/Organization"
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cropping Intensity</label>
                        <select
                          name="cropping_intensity"
                          value={formData.cropping_intensity || ""}
                          onChange={handleInputChange}
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Farm Address</label>
                        <input
                          type="text"
                          name="farm_address"
                          value={formData.farm_address || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Farm Address"
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Area (hectare)</label>
                        <input
                          type="number"
                          name="area_hectare"
                          value={formData.area_hectare || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Area (hectare)"
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Farm Location Coordinates(longitude)
                        </label>
                        <input
                          type="text"
                          name="farm_location_longitude"
                          value={formData.farm_location_longitude || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Longitude"
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Farm Location Coordinates(latitude)
                        </label>
                        <input
                          type="text"
                          name="farm_location_latitude"
                          value={formData.farm_location_latitude || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Latitude"
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>

                      <div className="col-span-1 sm:col-span-2">
                        <div className="border-t border-gray-300 my-4 pt-4">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Banana Entries</h3>
                        </div>

                        <div className="max-h-[500px] overflow-auto p-1 mb-4">
                          {additionalBananaDetails.map((bananaDetail, index) => (
                            <div
                              key={index}
                              className="p-3 mb-3 border border-dashed border-gray-300 rounded-md bg-white"
                            >
                              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                                <div className="sm:col-span-5">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Banana Type <span className="text-red-500">*</span>
                                  </label>
                                  <select
                                    value={bananaDetail.banana_type}
                                    onChange={(e) => handleAdditionalBananaChange(index, "banana_type", e.target.value)}
                                    className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                                    required
                                  >
                                    <option value="">Select Banana Type</option>
                                    <option value="Lakatan">Lakatan</option>
                                    <option value="Latundan">Latundan</option>
                                    <option value="Cardava">Cardava</option>
                                  </select>
                                </div>
                                <div className="sm:col-span-5">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Quantity <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="number"
                                    value={bananaDetail.quantity}
                                    onChange={(e) => handleAdditionalBananaChange(index, "quantity", e.target.value)}
                                    placeholder="Enter Quantity"
                                    className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                                    required
                                  />
                                </div>
                                <div className="sm:col-span-2">
                                  {additionalBananaDetails.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveAdditionalBanana(index)}
                                      className="w-full text-sm bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-md flex items-center justify-center"
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
                          className="w-full border border-dashed border-emerald-700 text-emerald-700 hover:bg-emerald-50 py-2 px-4 rounded-md flex items-center justify-center"
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

                  {/* Vegetable Details */}
                  {selectedCrop === "Vegetable" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name Of Buyer</label>
                        <input
                          type="text"
                          name="buyer_name"
                          value={formData.buyer_name || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Name of Buyer"
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Market Outlet Location</label>
                        <input
                          type="text"
                          name="market_outlet_location"
                          value={formData.market_outlet_location || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Market Outlet Location"
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Association/Organization</label>
                        <input
                          type="text"
                          name="association_organization"
                          value={formData.association_organization || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Association/Organization"
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cropping Intensity</label>
                        <select
                          name="cropping_intensity"
                          value={formData.cropping_intensity || ""}
                          onChange={handleInputChange}
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Farm Address</label>
                        <input
                          type="text"
                          name="farm_address"
                          value={formData.farm_address || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Farm Address"
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Area (hectare)</label>
                        <input
                          type="number"
                          name="area_hectare"
                          value={formData.area_hectare || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Area (hectare)"
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Farm Location Coordinates(longitude)
                        </label>
                        <input
                          type="text"
                          name="farm_location_longitude"
                          value={formData.farm_location_longitude || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Longitude"
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Farm Location Coordinates(latitude)
                        </label>
                        <input
                          type="text"
                          name="farm_location_latitude"
                          value={formData.farm_location_latitude || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Latitude"
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>

                      <div className="col-span-1 sm:col-span-2">
                        <AccordionSection title="Vegetable Entries">
                          <div className="max-h-[400px] overflow-auto">
                            {additionalVegetableDetails.map((vegetableDetail, index) => (
                              <div
                                key={index}
                                className="p-3 mb-3 border border-dashed border-gray-300 rounded-md bg-white"
                              >
                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                                  <div className="sm:col-span-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Vegetable Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                      value={vegetableDetail.vegetable_type}
                                      onChange={(e) =>
                                        handleAdditionalVegetableChange(index, "vegetable_type", e.target.value)
                                      }
                                      className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                                      required
                                    >
                                      <option value="">Select Vegetable Type</option>
                                      <option value="Eggplant">Eggplant</option>
                                      <option value="Ampalaya">Ampalaya</option>
                                      <option value="Okra">Okra</option>
                                      <option value="Pole Sitao">Pole Sitao</option>
                                      <option value="Squash">Squash</option>
                                      <option value="Tomato">Tomato</option>
                                      <option value="Other Crop (specify)">Other Crop (specify)</option>
                                    </select>
                                  </div>
                                  <div className="sm:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Quantity <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                      type="number"
                                      value={vegetableDetail.quantity}
                                      onChange={(e) =>
                                        handleAdditionalVegetableChange(index, "quantity", e.target.value)
                                      }
                                      placeholder="Enter Quantity"
                                      className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                                      required
                                    />
                                  </div>
                                  {selectedVegetable === index && (
                                    <div className="sm:col-span-3">
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Other Crop (specify)
                                      </label>
                                      <input
                                        type="text"
                                        value={vegetableDetail.other_vegetable || ""}
                                        onChange={(e) =>
                                          handleAdditionalVegetableChange(index, "other_vegetable", e.target.value)
                                        }
                                        placeholder="Specify Other Vegetable"
                                        className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                                      />
                                    </div>
                                  )}
                                  <div className="sm:col-span-2">
                                    {additionalVegetableDetails.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveAdditionalVegetable(index)}
                                        className="w-full text-sm bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-md flex items-center justify-center"
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
                            onClick={handleAddAdditionalVegetable}
                            className="w-full border border-dashed border-emerald-700 text-emerald-700 hover:bg-emerald-50 py-2 px-4 rounded-md flex items-center justify-center mt-3"
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
                        </AccordionSection>
                      </div>
                    </>
                  )}

                  {/* Cacao Details */}
                  {selectedCrop === "Cacao" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name of Buyer</label>
                        <input
                          type="text"
                          name="buyer_name"
                          value={formData.buyer_name || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Name of Buyer"
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                        <select
                          name="month"
                          value={formData.month || ""}
                          onChange={handleInputChange}
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        <input
                          type="number"
                          name="quantity"
                          value={formData.quantity || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Quantity"
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Market Outlet Location</label>
                        <input
                          type="text"
                          name="market_outlet_location"
                          value={formData.market_outlet_location || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Market Outlet Location"
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Farm Address</label>
                        <input
                          type="text"
                          name="farm_address"
                          value={formData.farm_address || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Farm Address"
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Association/Organization</label>
                        <input
                          type="text"
                          name="association_organization"
                          value={formData.association_organization || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Association/Organization"
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cropping Intensity</label>
                        <select
                          name="cropping_intensity"
                          value={formData.cropping_intensity || ""}
                          onChange={handleInputChange}
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Variety Clone</label>
                        <input
                          type="text"
                          name="variety_clone"
                          value={formData.variety_clone || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Variety Clone"
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Area (hectare)</label>
                        <input
                          type="number"
                          name="area_hectare"
                          value={formData.area_hectare || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Area (hectare)"
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Farm Location Coordinates(longitude)
                        </label>
                        <input
                          type="text"
                          name="farm_location_longitude"
                          value={formData.farm_location_longitude || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Longitude"
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Farm Location Coordinates(latitude)
                        </label>
                        <input
                          type="text"
                          name="farm_location_latitude"
                          value={formData.farm_location_latitude || ""}
                          onChange={handleInputChange}
                          placeholder="Enter Latitude"
                          className="w-full text-sm rounded-md border border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-700 hover:bg-emerald-800 text-white py-2 px-6 rounded-md h-10 w-36 text-base flex items-center justify-center"
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
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
  )
}

export default AddData

