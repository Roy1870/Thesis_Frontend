"use client";

import { useState } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Row,
  Col,
  DatePicker,
  message,
  InputNumber,
  Typography,
  Divider,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import { farmerAPI, livestockAPI } from "./services/api";

// Import the accordion component
import AccordionSection from "./accordian-section";

const { Option } = Select;
const { Title, Text } = Typography;

const AddData = () => {
  const [form] = Form.useForm();
  const [farmerType, setFarmerType] = useState(null);
  const [animals, setAnimals] = useState([
    { animal_type: "", subcategory: "", quantity: "" },
  ]);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [selectedVegetable, setSelectedVegetable] = useState(null);
  const [additionalRiceDetails, setAdditionalRiceDetails] = useState([
    { area_type: "", seed_type: "", production: "" },
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

  // Colors maintained from original
  const colors = {
    primary: "#6A9C89",
    secondary: "#E6F5E4",
    background: "#FFFFFF",
    text: "#333333",
    border: "#CBD5E0",
  };

  const cropConfigurations = {
    Cacao: [
      "Market Outlet Location",
      "Month",
      "Quantity",
      "Name of Buyer",
      "Farm Address",
      "Association/Organization",
      "Cropping Intensity",
      "Variety Clone",
      "Area (hectare)",
      "Farm Location Coordinates(longitude)",
      "Farm Location Coordinates(latitude)",
    ],
  };

  // Handler functions - keeping all original functionality
  const handleFarmerTypeChange = (value) => {
    setFarmerType(value);
    setSelectedCrop(null);
  };

  const handleAddAdditionalRice = () => {
    setAdditionalRiceDetails([
      ...additionalRiceDetails,
      { area_type: "", seed_type: "", production: "" },
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

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const formattedData = {
        name: values.name,
        home_address: values.home_address,
        contact_number: values.contact_number,
        facebook_email: values.facebook_email,
        barangay: values.barangay,
      };

      // Handle livestock records for Raiser type
      if (farmerType === "Raiser") {
        const livestockRecords = [];

        // Process animal entries from the form
        for (let i = 0; i < animals.length; i++) {
          const animalType = values[`animal_type_${i}`];
          const subcategory = values[`subcategory_${i}`];
          const quantity = values[`quantity_${i}`];

          if (animalType && subcategory && quantity) {
            livestockRecords.push({
              animal_type: animalType,
              subcategory: subcategory,
              quantity: Number.parseInt(quantity, 10),
              updated_by: "User", // You can replace this with the actual user name or ID
            });
          }
        }

        // Only add livestock_records if there are valid entries
        if (livestockRecords.length > 0) {
          formattedData.livestock_records = livestockRecords;
        }
      }

      // Handle crops based on crop type
      if (values.crop_type && values.crop_type !== "Rice") {
        const cropsArray = [];

        // For Cacao, handle it separately since it uses month instead of crop
        if (values.crop_type === "Cacao") {
          // Only add if month and quantity are provided
          if (values.month && values.quantity) {
            const productionData = {
              month: values.month,
              quantity: values.quantity,
            };

            cropsArray.push({
              crop_type: "Cacao",
              variety_clone: values.variety_clone || "",
              area_hectare: values.area_hectare
                ? Number.parseFloat(values.area_hectare)
                : 0,
              production_type: values.cropping_intensity || "seasonal",
              production_data: JSON.stringify(productionData),
            });
          }
        }
        // For other crop types, handle additional entries first
        else {
          // Handle additional spice entries
          if (values.crop_type === "Spices" && values.additionalSpice) {
            values.additionalSpice.forEach((spice) => {
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
          if (values.crop_type === "Legumes" && values.additionalLegumes) {
            values.additionalLegumes.forEach((legume) => {
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
          if (values.crop_type === "Banana" && values.additionalBanana) {
            values.additionalBanana.forEach((banana) => {
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
          if (values.crop_type === "Vegetable" && values.additionalVegetable) {
            values.additionalVegetable.forEach((vegetable) => {
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
          // This prevents the duplicate entry bug
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
      if (values.crop_type === "Rice" && Array.isArray(values.additionalRice)) {
        values.additionalRice.forEach((rice) => {
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
        formattedData.livestock_records &&
        formattedData.livestock_records.length > 0
      ) {
        // If we have livestock records, use the livestock-records endpoint
        response = await livestockAPI.createLivestockRecords(formattedData);
      } else {
        // Otherwise use the regular farmers endpoint
        response = await farmerAPI.createFarmer(formattedData);
      }

      if (response) {
        message.success("Data submitted successfully!");
        form.resetFields();
        setFarmerType(null);
        setAnimals([{ animal_type: "", subcategory: "", quantity: "" }]);
        setSelectedCrop(null);
        setSelectedVegetable(null);
        setAdditionalRiceDetails([
          { area_type: "", seed_type: "", production: "" },
        ]);
        setAdditionalSpiceDetails([{ spices_type: "", quantity: "" }]);
        setAdditionalLegumesDetails([{ legumes_type: "", quantity: "" }]);
        setAdditionalBananaDetails([{ banana_type: "", quantity: "" }]);
        setAdditionalVegetableDetails([
          { vegetable_type: "", quantity: "", other_vegetable: "" },
        ]);
      } else {
        message.error("Failed to submit data.");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      message.error("An error occurred while submitting the data.");
    } finally {
      setLoading(false);
    }
  };

  const addAnimal = () => {
    setAnimals([
      ...animals,
      { animal_type: "", subcategory: "", quantity: "" },
    ]);
  };

  // Improved styling
  const cardStyle = {
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    marginBottom: "16px",
    border: `1px solid ${colors.border}`,
  };

  const cardHeadStyle = {
    background: colors.primary,
    color: "#ffffff",
    borderRadius: "8px 8px 0 0",
    padding: "10px 16px",
    fontSize: "15px",
    fontWeight: "500",
  };

  const buttonStyle = {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  };

  const addButtonStyle = {
    borderColor: colors.primary,
    color: colors.primary,
    width: "100%",
    marginBottom: "16px",
  };

  const entryContainerStyle = {
    padding: "10px",
    marginBottom: "10px",
    border: `1px dashed ${colors.border}`,
    borderRadius: "6px",
    backgroundColor: colors.background,
  };

  const inputStyle = {
    borderRadius: "6px",
    border: `1px solid ${colors.border}`,
    fontSize: "13px",
  };

  const cardBodyStyle = {
    padding: "16px",
    backgroundColor: colors.secondary,
    maxHeight: "calc(100vh - 240px)",
    overflowY: "auto",
    overflowX: "hidden",
  };

  return (
    <div
      style={{
        padding: "16px",
        backgroundColor: colors.background,
        minHeight: "100vh",
        maxWidth: "100%",
        overflow: "auto",
      }}
    >
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => (window.location.href = "/inventory")}
              style={{ marginRight: 12 }}
            >
              Back
            </Button>
            <Title level={4} style={{ margin: 0 }}>
              Add Farmer Data
            </Title>
          </div>
        }
        style={cardStyle}
        bodyStyle={{ padding: "16px" }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          size="small"
        >
          {/* Farmer Information Section */}
          <Card
            title="Farmer Information"
            style={cardStyle}
            headStyle={cardHeadStyle}
            bodyStyle={cardBodyStyle}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Name"
                  name="name"
                  rules={[{ required: true, message: "Please enter name" }]}
                >
                  <Input
                    prefix={<UserOutlined style={{ color: colors.primary }} />}
                    placeholder="Enter name"
                    style={inputStyle}
                    size="small"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Contact Number"
                  name="contact_number"
                  rules={[
                    { required: true, message: "Please enter contact number" },
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined style={{ color: colors.primary }} />}
                    placeholder="Enter contact number"
                    style={inputStyle}
                    size="small"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Facebook/Email"
                  name="facebook_email"
                  rules={[
                    {
                      required: true,
                      message: "Please enter Facebook or Email",
                    },
                  ]}
                >
                  <Input
                    placeholder="Enter Facebook or Email"
                    style={inputStyle}
                    size="small"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Barangay"
                  name="barangay"
                  rules={[
                    { required: true, message: "Please select a barangay" },
                  ]}
                >
                  <Select
                    placeholder="Select a Barangay"
                    style={inputStyle}
                    size="small"
                    showSearch
                  >
                    <Option value="Agusan Pequeño">Agusan Pequeño</Option>
                    <Option value="Ambago">Ambago</Option>
                    <Option value="Amparo">Amparo</Option>
                    <Option value="Ampayon">Ampayon</Option>
                    <Option value="Anticala">Anticala</Option>
                    <Option value="Antongalon">Antongalon</Option>
                    <Option value="Aupagan">Aupagan</Option>
                    <Option value="Baan Km. 3">Baan Km. 3</Option>
                    <Option value="Babag">Babag</Option>
                    <Option value="Bading">Bading</Option>
                    <Option value="Bancasi">Bancasi</Option>
                    <Option value="Banza">Banza</Option>
                    <Option value="Baobaoan">Baobaoan</Option>
                    <Option value="Basag">Basag</Option>
                    <Option value="Bayanihan">Bayanihan</Option>
                    <Option value="Bilay">Bilay</Option>
                    <Option value="Bitan-agan">Bitan-agan</Option>
                    <Option value="Bit-os">Bit-os</Option>
                    <Option value="Bobon">Bobon</Option>
                    <Option value="Bonbon">Bonbon</Option>
                    <Option value="Bugsukan">Bugsukan</Option>
                    <Option value="Buhangin">Buhangin</Option>
                    <Option value="Cabcabon">Cabcabon</Option>
                    <Option value="Camayahan">Camayahan</Option>
                    <Option value="Dankias">Dankias</Option>
                    <Option value="De Oro">De Oro</Option>
                    <Option value="Don Francisco">Don Francisco</Option>
                    <Option value="Doongan">Doongan</Option>
                    <Option value="Dulag">Dulag</Option>
                    <Option value="Dumalagan">Dumalagan</Option>
                    <Option value="Florida">Florida</Option>
                    <Option value="Kinamlutan">Kinamlutan</Option>
                    <Option value="Lemon">Lemon</Option>
                    <Option value="Libertad">Libertad</Option>
                    <Option value="Los Angeles">Los Angeles</Option>
                    <Option value="Lumbocan">Lumbocan</Option>
                    <Option value="MJ Santos">MJ Santos</Option>
                    <Option value="Maguinda">Maguinda</Option>
                    <Option value="Mahay">Mahay</Option>
                    <Option value="Mahogany">Mahogany</Option>
                    <Option value="Maibu">Maibu</Option>
                    <Option value="Mandamo">Mandamo</Option>
                    <Option value="Masao">Masao</Option>
                    <Option value="Maug">Maug</Option>
                    <Option value="Manila de Bugabus">Manila de Bugabus</Option>
                    <Option value="Nongnong">Nongnong</Option>
                    <Option value="Pianing">Pianing</Option>
                    <Option value="Pigdaulan">Pigdaulan</Option>
                    <Option value="Pinamanculan">Pinamanculan</Option>
                    <Option value="Salvacion">Salvacion</Option>
                    <Option value="San Mateo">San Mateo</Option>
                    <Option value="San Vicente">San Vicente</Option>
                    <Option value="Sto Niño">Sto Niño</Option>
                    <Option value="Sumile">Sumile</Option>
                    <Option value="Sumilihon">Sumilihon</Option>
                    <Option value="Tagabaca">Tagabaca</Option>
                    <Option value="Taguibo">Taguibo</Option>
                    <Option value="Taligaman">Taligaman</Option>
                    <Option value="Tiniwisan">Tiniwisan</Option>
                    <Option value="Tungao">Tungao</Option>
                    <Option value="Villa Kananga">Villa Kananga</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Home Address"
                  name="home_address"
                  rules={[
                    { required: true, message: "Please enter home address" },
                  ]}
                >
                  <Input
                    placeholder="Enter home address"
                    style={inputStyle}
                    size="small"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Farmer Type"
                  name="farmer_type"
                  rules={[
                    { required: true, message: "Please select farmer type" },
                  ]}
                >
                  <Select
                    placeholder="Select Farmer Type"
                    onChange={handleFarmerTypeChange}
                    style={inputStyle}
                    size="small"
                  >
                    <Option value="Raiser">Raiser</Option>
                    <Option value="Operator">Operator</Option>
                    <Option value="Grower">Grower</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Livestock Records Section */}
          {farmerType === "Raiser" && (
            <Card
              title="Livestock Records"
              style={cardStyle}
              headStyle={cardHeadStyle}
              bodyStyle={cardBodyStyle}
            >
              <div
                style={{
                  maxHeight: "500px",
                  overflow: "auto",
                  padding: "4px",
                  marginBottom: "16px",
                }}
              >
                {animals.map((animal, index) => (
                  <div key={index} style={entryContainerStyle}>
                    <Row gutter={[16, 16]} align="middle">
                      <Col xs={24} sm={8}>
                        <Form.Item
                          label="Animal Type"
                          name={`animal_type_${index}`}
                          rules={[{ required: true, message: "Required" }]}
                        >
                          <Select
                            placeholder="Select Animal Type"
                            value={animal.animal_type}
                            size="small"
                            onChange={(value) => {
                              const newAnimals = [...animals];
                              newAnimals[index].animal_type = value;

                              if (value === "CATTLE") {
                                newAnimals[index].subcategory = "Carabull";
                              } else if (value === "CARABAO") {
                                newAnimals[index].subcategory = "Caracow";
                              } else {
                                newAnimals[index].subcategory = undefined;
                              }

                              setAnimals(newAnimals);
                            }}
                          >
                            <Option value="Cattle">Cattle</Option>
                            <Option value="Carabao">Carabao</Option>
                            <Option value="Goat">Goat</Option>
                            <Option value="Sheep">Sheep</Option>
                            <Option value="Swine">Swine</Option>
                            <Option value="Chicken">Chicken</Option>
                            <Option value="Duck">Duck</Option>
                            <Option value="Quail">Quail</Option>
                            <Option value="Turkey">Turkey</Option>
                            <Option value="Rabbit">Rabbit</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Form.Item
                          label="Subcategory"
                          name={`subcategory_${index}`}
                          rules={[{ required: true, message: "Required" }]}
                        >
                          <Select
                            placeholder="Select Subcategory"
                            value={animal.subcategory}
                            size="small"
                            onChange={(value) => {
                              const newAnimals = [...animals];
                              newAnimals[index].subcategory = value;
                              setAnimals(newAnimals);
                            }}
                          >
                            {animal.animal_type === "Cattle" && (
                              <>
                                <Option value="Carabull">Carabull</Option>
                                <Option value="Caracow">Caracow</Option>
                              </>
                            )}
                            {animal.animal_type === "Carabao" && (
                              <>
                                <Option value="Carabull">Carabull</Option>
                                <Option value="Caracow">Caracow</Option>
                              </>
                            )}
                            {animal.animal_type === "Goat" && (
                              <>
                                <Option value="Buck">Buck</Option>
                                <Option value="Doe">Doe</Option>
                              </>
                            )}
                            {animal.animal_type === "Sheep" && (
                              <>
                                <Option value="Ram">Ram</Option>
                                <Option value="Ewe">Ewe</Option>
                              </>
                            )}
                            {animal.animal_type === "Swine" && (
                              <>
                                <Option value="Sow">Sow</Option>
                                <Option value="Piglet">Piglet</Option>
                                <Option value="Boar">Boar</Option>
                                <Option value="Fatteners">Fatteners</Option>
                              </>
                            )}
                            {animal.animal_type === "Chicken" && (
                              <>
                                <Option value="Broiler">Broiler</Option>
                                <Option value="Layer">Layer</Option>
                                <Option value="Freerange">Freerange</Option>
                                <Option value="Gamefowl">Gamefowl</Option>
                                <Option value="Fighting Cocks">
                                  Fighting Cocks
                                </Option>
                              </>
                            )}
                            {animal.animal_type === "Duck" && (
                              <>
                                <Option value="Drake">Drake</Option>
                                <Option value="Hen">Hen</Option>
                              </>
                            )}
                            {animal.animal_type === "Quail" && (
                              <>
                                <Option value="Cock">Cock</Option>
                                <Option value="Hen">Hen</Option>
                              </>
                            )}
                            {animal.animal_type === "Turkey" && (
                              <>
                                <Option value="Gobbler">Gobbler</Option>
                                <Option value="Hen">Hen</Option>
                              </>
                            )}
                            {animal.animal_type === "Rabbit" && (
                              <>
                                <Option value="Buck">Buck</Option>
                                <Option value="Doe">Doe</Option>
                              </>
                            )}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={16} sm={6}>
                        <Form.Item
                          label="Quantity"
                          name={`quantity_${index}`}
                          rules={[{ required: true, message: "Required" }]}
                        >
                          <InputNumber
                            placeholder="Enter Quantity"
                            type="number"
                            value={animal.quantity}
                            onChange={(value) => {
                              const newAnimals = [...animals];
                              newAnimals[index].quantity = value;
                              setAnimals(newAnimals);
                            }}
                            style={{ width: "100%" }}
                            size="small"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={8} sm={2}>
                        <Form.Item label=" ">
                          <Button
                            type="primary"
                            danger
                            icon={<MinusCircleOutlined />}
                            size="small"
                            onClick={() => {
                              const newAnimals = [...animals];
                              newAnimals.splice(index, 1);
                              setAnimals(newAnimals);
                            }}
                          >
                            Remove
                          </Button>
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                ))}
              </div>
              <Button
                type="dashed"
                onClick={addAnimal}
                icon={<PlusOutlined />}
                style={addButtonStyle}
                size="small"
              >
                Add Animal
              </Button>
            </Card>
          )}

          {/* Operator Details Section */}
          {farmerType === "Operator" && (
            <Card
              title="Operator Details"
              style={cardStyle}
              headStyle={cardHeadStyle}
              bodyStyle={cardBodyStyle}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item label="Fishpond Location" name="fishpond_location">
                    <Input
                      placeholder="Enter Fishpond Location"
                      style={inputStyle}
                      size="small"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Geotagged Photo" name="geotagged_photo">
                    <Input
                      placeholder="Enter Geotagged Photo URL"
                      style={inputStyle}
                      size="small"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Cultured Species" name="cultured_species">
                    <Input
                      placeholder="Enter Cultured Species"
                      style={inputStyle}
                      size="small"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Area (Hectares)" name="area">
                    <InputNumber
                      placeholder="Enter Area"
                      type="number"
                      style={{ width: "100%" }}
                      size="small"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Stocking Density" name="stocking_density">
                    <Input
                      placeholder="Enter Stocking Density"
                      style={inputStyle}
                      size="small"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Date of Stocking" name="date_of_stocking">
                    <DatePicker style={{ width: "100%" }} size="small" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Production" name="production">
                    <Input
                      placeholder="Enter Production"
                      style={inputStyle}
                      size="small"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Date of Harvest" name="date_of_harvest">
                    <DatePicker style={{ width: "100%" }} size="small" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Operational Status"
                    name="operational_status"
                  >
                    <Select
                      placeholder="Select Operational Status"
                      size="small"
                    >
                      <Option value="Active">Active</Option>
                      <Option value="Inactive">Inactive</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Remarks" name="remarks">
                    <Input
                      placeholder="Enter Remarks"
                      style={inputStyle}
                      size="small"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          )}

          {/* Grower Details Section */}
          {farmerType === "Grower" && (
            <Card
              title="Grower Details"
              style={cardStyle}
              headStyle={cardHeadStyle}
              bodyStyle={cardBodyStyle}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Crop Type"
                    name="crop_type"
                    rules={[
                      { required: true, message: "Please select crop type" },
                    ]}
                  >
                    <Select
                      placeholder="Select Crop Type"
                      onChange={(value) => setSelectedCrop(value)}
                      size="small"
                    >
                      <Option value="Rice">Rice</Option>
                      <Option value="Spices">Spices</Option>
                      <Option value="Legumes">Legumes</Option>
                      <Option value="Vegetable">Vegetable</Option>
                      <Option value="Cacao">Cacao</Option>
                      <Option value="Banana">Banana</Option>
                    </Select>
                  </Form.Item>
                </Col>

                {/* Rice Details */}
                {selectedCrop === "Rice" && (
                  <>
                    <div
                      style={{
                        maxHeight: "500px",
                        overflow: "auto",
                        padding: "4px",
                        marginBottom: "16px",
                      }}
                    >
                      {additionalRiceDetails.map((riceDetail, index) => (
                        <div key={index} style={entryContainerStyle}>
                          <Row gutter={[16, 16]}>
                            <Col xs={24} sm={8} md={4}>
                              <Form.Item
                                label="Area Type"
                                name={["additionalRice", index, "area_type"]}
                              >
                                <Select
                                  placeholder="Select Area Type"
                                  size="small"
                                >
                                  <Option value="Irrigated">Irrigated</Option>
                                  <Option value="Rainfed">Rainfed</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col xs={24} sm={8} md={4}>
                              <Form.Item
                                label="Seed Type"
                                name={["additionalRice", index, "seed_type"]}
                              >
                                <Select
                                  placeholder="Select Seed Type"
                                  size="small"
                                >
                                  <Option value="Hybrid Seeds">
                                    Hybrid Seeds
                                  </Option>
                                  <Option value="Certified Seeds">
                                    Certified Seeds
                                  </Option>
                                  <Option value="Good Seeds">Good Seeds</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col xs={24} sm={8} md={4}>
                              <Form.Item
                                label="Area Harvested"
                                name={[
                                  "additionalRice",
                                  index,
                                  "area_harvested",
                                ]}
                              >
                                <InputNumber
                                  type="number"
                                  placeholder="Enter Area"
                                  style={{ width: "100%" }}
                                  size="small"
                                />
                              </Form.Item>
                            </Col>
                            <Col xs={24} sm={8} md={4}>
                              <Form.Item
                                label="Production"
                                name={["additionalRice", index, "production"]}
                              >
                                <InputNumber
                                  type="number"
                                  placeholder="Enter Production"
                                  style={{ width: "100%" }}
                                  size="small"
                                />
                              </Form.Item>
                            </Col>
                            <Col xs={24} sm={8} md={4}>
                              <Form.Item
                                label="Average Yield"
                                name={["additionalRice", index, "ave_yield"]}
                              >
                                <InputNumber
                                  type="number"
                                  placeholder="Enter Yield"
                                  style={{ width: "100%" }}
                                  size="small"
                                />
                              </Form.Item>
                            </Col>
                            {additionalRiceDetails.length > 1 && (
                              <Col xs={24} sm={8} md={4}>
                                <Form.Item label=" ">
                                  <Button
                                    type="primary"
                                    danger
                                    size="small"
                                    icon={<MinusCircleOutlined />}
                                    onClick={() =>
                                      handleRemoveAdditionalRice(index)
                                    }
                                  >
                                    Remove
                                  </Button>
                                </Form.Item>
                              </Col>
                            )}
                          </Row>
                        </div>
                      ))}
                    </div>
                    <Button
                      type="dashed"
                      onClick={handleAddAdditionalRice}
                      icon={<PlusOutlined />}
                      style={addButtonStyle}
                      size="small"
                    >
                      Add Rice Entry
                    </Button>
                  </>
                )}

                {/* Spices Details */}
                {selectedCrop === "Spices" && (
                  <>
                    <Col xs={24} sm={12}>
                      <Form.Item label="Name Of Buyer" name="Name of Buyer">
                        <Input
                          placeholder="Enter Name of Buyer"
                          style={inputStyle}
                          size="small"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Market Outlet Location"
                        name="Market Outlet Location"
                      >
                        <Input
                          placeholder="Enter Market Outlet Location"
                          style={inputStyle}
                          size="small"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Association/Organization"
                        name="Association/Organization"
                      >
                        <Input
                          placeholder="Enter Association/Organization"
                          style={inputStyle}
                          size="small"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Cropping Intensity"
                        name="cropping_intensity"
                      >
                        <Select
                          placeholder="Select Cropping Intensity"
                          size="small"
                        >
                          <Option value="year_round">Year Round</Option>
                          <Option value="quarterly">Quarterly</Option>
                          <Option value="seasonal">Seasonal</Option>
                          <Option value="annually">Annually</Option>
                          <Option value="twice_a_month">Twice a Month</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item label="Farm Address" name="farm_address">
                        <Input
                          placeholder="Enter Farm Address"
                          style={inputStyle}
                          size="small"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item label="Area (hectare)" name="area_hectare">
                        <InputNumber
                          type="number"
                          placeholder="Enter Area (hectare)"
                          style={{ width: "100%" }}
                          size="small"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Farm Location Coordinates(longitude)"
                        name="farm_location_longitude"
                      >
                        <Input
                          placeholder="Enter Longitude"
                          style={inputStyle}
                          size="small"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Farm Location Coordinates(latitude)"
                        name="farm_location_laitude"
                      >
                        <Input
                          placeholder="Enter Latitude"
                          style={inputStyle}
                          size="small"
                        />
                      </Form.Item>
                    </Col>

                    <Divider orientation="left">Spice Entries</Divider>
                    <div
                      style={{
                        maxHeight: "500px",
                        overflow: "auto",
                        padding: "4px",
                        marginBottom: "16px",
                      }}
                    >
                      {additionalSpiceDetails.map((spiceDetail, index) => (
                        <div key={index} style={entryContainerStyle}>
                          <Row gutter={[16, 16]} align="middle">
                            <Col xs={24} sm={10}>
                              <Form.Item
                                label="Spice Type"
                                name={["additionalSpice", index, "spices_type"]}
                                rules={[
                                  { required: true, message: "Required" },
                                ]}
                              >
                                <Select
                                  placeholder="Select Spices Type"
                                  size="small"
                                >
                                  <Option value="Ginger">Ginger</Option>
                                  <Option value="Onion">Onion</Option>
                                  <Option value="Hotpepper">Hotpepper</Option>
                                  <Option value="Sweet Pepper">
                                    Sweet Pepper
                                  </Option>
                                  <Option value="Turmeric">Turmeric</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col xs={24} sm={10}>
                              <Form.Item
                                label="Quantity"
                                name={["additionalSpice", index, "quantity"]}
                                rules={[
                                  { required: true, message: "Required" },
                                ]}
                              >
                                <InputNumber
                                  type="number"
                                  placeholder="Enter Quantity"
                                  style={{ width: "100%" }}
                                  size="small"
                                />
                              </Form.Item>
                            </Col>
                            {additionalSpiceDetails.length > 1 && (
                              <Col xs={24} sm={4}>
                                <Form.Item label=" ">
                                  <Button
                                    type="primary"
                                    danger
                                    size="small"
                                    icon={<MinusCircleOutlined />}
                                    onClick={() =>
                                      handleRemoveAdditionalSpice(index)
                                    }
                                  >
                                    Remove
                                  </Button>
                                </Form.Item>
                              </Col>
                            )}
                          </Row>
                        </div>
                      ))}
                    </div>
                    <Button
                      type="dashed"
                      onClick={handleAddAdditionalSpice}
                      icon={<PlusOutlined />}
                      style={addButtonStyle}
                    >
                      Add Spice Entry
                    </Button>
                  </>
                )}

                {/* Legumes Details */}
                {selectedCrop === "Legumes" && (
                  <>
                    <Col xs={24} sm={12}>
                      <Form.Item label="Name Of Buyer" name="Name of Buyer">
                        <Input
                          placeholder="Enter Name of Buyer"
                          style={inputStyle}
                          size="small"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Market Outlet Location"
                        name="Market Outlet Location"
                      >
                        <Input
                          placeholder="Enter Market Outlet Location"
                          style={inputStyle}
                          size="small"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Association/Organization"
                        name="Association/Organization"
                      >
                        <Input
                          placeholder="Enter Association/Organization"
                          style={inputStyle}
                          size="small"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Cropping Intensity"
                        name="cropping_intensity"
                      >
                        <Select
                          placeholder="Select Cropping Intensity"
                          size="small"
                        >
                          <Option value="year_round">Year Round</Option>
                          <Option value="quarterly">Quarterly</Option>
                          <Option value="seasonal">Seasonal</Option>
                          <Option value="annually">Annually</Option>
                          <Option value="twice_a_month">Twice a Month</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item label="Farm Address" name="farm_address">
                        <Input
                          placeholder="Enter Farm Address"
                          style={inputStyle}
                          size="small"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item label="Area (hectare)" name="area_hectare">
                        <InputNumber
                          type="number"
                          placeholder="Enter Area (hectare)"
                          style={{ width: "100%" }}
                          size="small"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Farm Location Coordinates(longitude)"
                        name="farm_location_longitude"
                      >
                        <Input
                          placeholder="Enter Longitude"
                          style={inputStyle}
                          size="small"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Farm Location Coordinates(latitude)"
                        name="farm_location_laitude"
                      >
                        <Input
                          placeholder="Enter Latitude"
                          style={inputStyle}
                          size="small"
                        />
                      </Form.Item>
                    </Col>

                    <Divider orientation="left">Legumes Entries</Divider>

                    {additionalLegumesDetails.map((legumesDetail, index) => (
                      <div key={index} style={entryContainerStyle}>
                        <Row gutter={[16, 16]} align="middle">
                          <Col xs={24} sm={10}>
                            <Form.Item
                              label="Legumes Type"
                              name={[
                                "additionalLegumes",
                                index,
                                "legumes_type",
                              ]}
                              rules={[{ required: true, message: "Required" }]}
                            >
                              <Select
                                placeholder="Select Legumes Type"
                                size="small"
                              >
                                <Option value="Peanut">Peanut</Option>
                                <Option value="Mungbean">Mungbean</Option>
                                <Option value="Soybean">Soybean</Option>
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={10}>
                            <Form.Item
                              label="Quantity"
                              name={["additionalLegumes", index, "quantity"]}
                              rules={[{ required: true, message: "Required" }]}
                            >
                              <InputNumber
                                type="number"
                                placeholder="Enter Quantity"
                                style={{ width: "100%" }}
                                size="small"
                              />
                            </Form.Item>
                          </Col>
                          {additionalLegumesDetails.length > 1 && (
                            <Col xs={24} sm={4}>
                              <Form.Item label=" ">
                                <Button
                                  type="primary"
                                  danger
                                  icon={<MinusCircleOutlined />}
                                  size="small"
                                  onClick={() =>
                                    handleRemoveAdditionalLegumes(index)
                                  }
                                >
                                  Remove
                                </Button>
                              </Form.Item>
                            </Col>
                          )}
                        </Row>
                      </div>
                    ))}
                    <Button
                      type="dashed"
                      onClick={handleAddAdditionalLegumes}
                      icon={<PlusOutlined />}
                      style={addButtonStyle}
                    >
                      Add Legumes Entry
                    </Button>
                  </>
                )}

                {/* Banana Details */}
                {selectedCrop === "Banana" && (
                  <>
                    <Col xs={24} sm={12}>
                      <Form.Item label="Name Of Buyer" name="Name of Buyer">
                        <Input
                          placeholder="Enter Name of Buyer"
                          style={inputStyle}
                          size="small"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Market Outlet Location"
                        name="Market Outlet Location"
                      >
                        <Input
                          placeholder="Enter Market Outlet Location"
                          style={inputStyle}
                          size="small"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Association/Organization"
                        name="Association/Organization"
                      >
                        <Input
                          placeholder="Enter Association/Organization"
                          style={inputStyle}
                          size="small"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Cropping Intensity"
                        name="cropping_intensity"
                      >
                        <Select
                          placeholder="Select Cropping Intensity"
                          size="small"
                        >
                          <Option value="year_round">Year Round</Option>
                          <Option value="quarterly">Quarterly</Option>
                          <Option value="seasonal">Seasonal</Option>
                          <Option value="annually">Annually</Option>
                          <Option value="twice_a_month">Twice a Month</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item label="Farm Address" name="farm_address">
                        <Input
                          placeholder="Enter Farm Address"
                          style={inputStyle}
                          size="small"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item label="Area (hectare)" name="area_hectare">
                        <InputNumber
                          type="number"
                          placeholder="Enter Area (hectare)"
                          style={{ width: "100%" }}
                          size="small"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Farm Location Coordinates(longitude)"
                        name="farm_location_longitude"
                      >
                        <Input
                          placeholder="Enter Longitude"
                          style={inputStyle}
                          size="small"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Farm Location Coordinates(latitude)"
                        name="farm_location_laitude"
                      >
                        <Input
                          placeholder="Enter Latitude"
                          style={inputStyle}
                          size="small"
                        />
                      </Form.Item>
                    </Col>

                    <Divider orientation="left">Banana Entries</Divider>

                    {additionalBananaDetails.map((bananaDetail, index) => (
                      <div key={index} style={entryContainerStyle}>
                        <Row gutter={[16, 16]} align="middle">
                          <Col xs={24} sm={10}>
                            <Form.Item
                              label="Banana Type"
                              name={["additionalBanana", index, "banana_type"]}
                              rules={[{ required: true, message: "Required" }]}
                            >
                              <Select
                                placeholder="Select Banana Type"
                                size="small"
                              >
                                <Option value="Lakatan">Lakatan</Option>
                                <Option value="Latundan">Latundan</Option>
                                <Option value="Cardava">Cardava</Option>
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={10}>
                            <Form.Item
                              label="Quantity"
                              name={["additionalBanana", index, "quantity"]}
                              rules={[{ required: true, message: "Required" }]}
                            >
                              <InputNumber
                                type="number"
                                placeholder="Enter Quantity"
                                style={{ width: "100%" }}
                                size="small"
                              />
                            </Form.Item>
                          </Col>
                          {additionalBananaDetails.length > 1 && (
                            <Col xs={24} sm={4}>
                              <Form.Item label=" ">
                                <Button
                                  type="primary"
                                  danger
                                  icon={<MinusCircleOutlined />}
                                  size="small"
                                  onClick={() =>
                                    handleRemoveAdditionalBanana(index)
                                  }
                                >
                                  Remove
                                </Button>
                              </Form.Item>
                            </Col>
                          )}
                        </Row>
                      </div>
                    ))}
                    <Button
                      type="dashed"
                      onClick={handleAddAdditionalBanana}
                      icon={<PlusOutlined />}
                      style={addButtonStyle}
                    >
                      Add Banana Entry
                    </Button>
                  </>
                )}

                {/* Vegetable Details */}
                {selectedCrop === "Vegetable" && (
                  <>
                    <Col xs={24} sm={12}>
                      <Form.Item label="Name Of Buyer" name="Name of Buyer">
                        <Input
                          placeholder="Enter Name of Buyer"
                          style={inputStyle}
                          size="small"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Market Outlet Location"
                        name="Market Outlet Location"
                      >
                        <Input
                          placeholder="Enter Market Outlet Location"
                          style={inputStyle}
                          size="small"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Association/Organization"
                        name="Association/Organization"
                      >
                        <Input
                          placeholder="Enter Association/Organization"
                          style={inputStyle}
                          size="small"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Cropping Intensity"
                        name="cropping_intensity"
                      >
                        <Select
                          placeholder="Select Cropping Intensity"
                          size="small"
                        >
                          <Option value="year_round">Year Round</Option>
                          <Option value="quarterly">Quarterly</Option>
                          <Option value="seasonal">Seasonal</Option>
                          <Option value="annually">Annually</Option>
                          <Option value="twice_a_month">Twice a Month</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item label="Farm Address" name="farm_address">
                        <Input
                          placeholder="Enter Farm Address"
                          style={inputStyle}
                          size="small"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item label="Area (hectare)" name="area_hectare">
                        <InputNumber
                          type="number"
                          placeholder="Enter Area (hectare)"
                          style={{ width: "100%" }}
                          size="small"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Farm Location Coordinates(longitude)"
                        name="farm_location_longitude"
                      >
                        <Input
                          placeholder="Enter Longitude"
                          style={inputStyle}
                          size="small"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Farm Location Coordinates(latitude)"
                        name="farm_location_laitude"
                      >
                        <Input
                          placeholder="Enter Latitude"
                          style={inputStyle}
                          size="small"
                        />
                      </Form.Item>
                    </Col>

                    <Col span={24}>
                      <AccordionSection title="Vegetable Entries">
                        <div style={{ maxHeight: "400px", overflow: "auto" }}>
                          {additionalVegetableDetails.map(
                            (vegetableDetail, index) => (
                              <div key={index} style={entryContainerStyle}>
                                <Row gutter={[16, 16]} align="middle">
                                  <Col xs={24} sm={8}>
                                    <Form.Item
                                      label="Vegetable Type"
                                      name={[
                                        "additionalVegetable",
                                        index,
                                        "vegetable_type",
                                      ]}
                                      rules={[
                                        { required: true, message: "Required" },
                                      ]}
                                    >
                                      <Select
                                        placeholder="Select Vegetable Type"
                                        size="small"
                                        onChange={(value) => {
                                          if (
                                            value === "Other Crop (specify)"
                                          ) {
                                            setSelectedVegetable(index);
                                          } else {
                                            setSelectedVegetable(null);
                                          }
                                        }}
                                      >
                                        <Option value="Eggplant">
                                          Eggplant
                                        </Option>
                                        <Option value="Ampalaya">
                                          Ampalaya
                                        </Option>
                                        <Option value="Okra">Okra</Option>
                                        <Option value="Pole Sitao">
                                          Pole Sitao
                                        </Option>
                                        <Option value="Squash">Squash</Option>
                                        <Option value="Tomato">Tomato</Option>
                                        <Option value="Other Crop (specify)">
                                          Other Crop (specify)
                                        </Option>
                                      </Select>
                                    </Form.Item>
                                  </Col>
                                  <Col xs={24} sm={7}>
                                    <Form.Item
                                      label="Quantity"
                                      name={[
                                        "additionalVegetable",
                                        index,
                                        "quantity",
                                      ]}
                                      rules={[
                                        { required: true, message: "Required" },
                                      ]}
                                    >
                                      <InputNumber
                                        type="number"
                                        placeholder="Enter Quantity"
                                        style={{ width: "100%" }}
                                        size="small"
                                      />
                                    </Form.Item>
                                  </Col>
                                  {selectedVegetable === index && (
                                    <Col xs={24} sm={7}>
                                      <Form.Item
                                        label="Other Crop (specify)"
                                        name={[
                                          "additionalVegetable",
                                          index,
                                          "other_vegetable",
                                        ]}
                                      >
                                        <Input
                                          placeholder="Specify Other Vegetable"
                                          style={inputStyle}
                                          size="small"
                                        />
                                      </Form.Item>
                                    </Col>
                                  )}
                                  {additionalVegetableDetails.length > 1 && (
                                    <Col xs={24} sm={2}>
                                      <Form.Item label=" ">
                                        <Button
                                          type="primary"
                                          danger
                                          icon={<MinusCircleOutlined />}
                                          size="small"
                                          onClick={() =>
                                            handleRemoveAdditionalVegetable(
                                              index
                                            )
                                          }
                                        >
                                          Remove
                                        </Button>
                                      </Form.Item>
                                    </Col>
                                  )}
                                </Row>
                              </div>
                            )
                          )}
                        </div>
                        <Button
                          type="dashed"
                          onClick={handleAddAdditionalVegetable}
                          icon={<PlusOutlined />}
                          style={{ width: "100%", marginTop: "10px" }}
                          size="small"
                        >
                          Add Vegetable Entry
                        </Button>
                      </AccordionSection>
                    </Col>
                  </>
                )}

                {/* Cacao Details */}
                {selectedCrop === "Cacao" &&
                  cropConfigurations["Cacao"].map((field) => {
                    let formItem;
                    switch (field) {
                      case "Name of Buyer":
                        formItem = (
                          <Col xs={24} sm={12} key={field}>
                            <Form.Item label="Name of Buyer" name="buyer_name">
                              <Input
                                placeholder="Enter Name of Buyer"
                                style={inputStyle}
                                size="small"
                              />
                            </Form.Item>
                          </Col>
                        );
                        break;
                      case "Month":
                        formItem = (
                          <Col xs={24} sm={12} key={field}>
                            <Form.Item label="Month" name="month">
                              <Select
                                placeholder="Select Month"
                                name="month"
                                size="small"
                              >
                                <Option value="January">January</Option>
                                <Option value="February">February</Option>
                                <Option value="March">March</Option>
                                <Option value="April">April</Option>
                                <Option value="May">May</Option>
                                <Option value="June">June</Option>
                                <Option value="July">July</Option>
                                <Option value="August">August</Option>
                                <Option value="September">September</Option>
                                <Option value="October">October</Option>
                                <Option value="November">November</Option>
                                <Option value="December">December</Option>
                              </Select>
                            </Form.Item>
                          </Col>
                        );
                        break;
                      case "Quantity":
                        formItem = (
                          <Col xs={24} sm={12} key={field}>
                            <Form.Item label="Quantity" name="quantity">
                              <InputNumber
                                placeholder="Enter Quantity"
                                type="number"
                                style={{ width: "100%" }}
                                size="small"
                              />
                            </Form.Item>
                          </Col>
                        );
                        break;
                      case "Market Outlet Location":
                        formItem = (
                          <Col xs={24} sm={12} key={field}>
                            <Form.Item
                              label={field}
                              name="market_outlet_location"
                            >
                              <Input
                                placeholder="Enter Market Outlet Location"
                                style={inputStyle}
                                size="small"
                              />
                            </Form.Item>
                          </Col>
                        );
                        break;
                      case "Farm Address":
                        formItem = (
                          <Col xs={24} sm={12} key={field}>
                            <Form.Item
                              label={field}
                              name={field.toLowerCase().replace(/ /g, "_")}
                            >
                              <Input
                                placeholder="Enter Farm Address"
                                style={inputStyle}
                                size="small"
                              />
                            </Form.Item>
                          </Col>
                        );
                        break;
                      case "Association/Organization":
                        formItem = (
                          <Col xs={24} sm={12} key={field}>
                            <Form.Item
                              label="Association/Organization"
                              name="association_organization"
                            >
                              <Input
                                placeholder="Enter Association/Organization"
                                style={inputStyle}
                                size="small"
                              />
                            </Form.Item>
                          </Col>
                        );
                        break;
                      case "Cropping Intensity":
                        formItem = (
                          <Col xs={24} sm={12} key="cropping_intensity">
                            <Form.Item
                              label="Cropping Intensity"
                              name="cropping_intensity"
                            >
                              <Select
                                placeholder="Select Cropping Intensity"
                                size="small"
                              >
                                <Option value="year_round">Year Round</Option>
                                <Option value="quarterly">Quarterly</Option>
                                <Option value="seasonal">Seasonal</Option>
                                <Option value="annually">Annually</Option>
                                <Option value="twice_a_month">
                                  Twice a Month
                                </Option>
                              </Select>
                            </Form.Item>
                          </Col>
                        );
                        break;
                      case "Variety Clone":
                        formItem = (
                          <Col xs={24} sm={12} key={field}>
                            <Form.Item
                              label="Variety Clone"
                              name="variety_clone"
                            >
                              <Input
                                placeholder="Enter Variety Clone"
                                style={inputStyle}
                                size="small"
                              />
                            </Form.Item>
                          </Col>
                        );
                        break;
                      case "Area (hectare)":
                        formItem = (
                          <Col xs={24} sm={12} key={field}>
                            <Form.Item
                              label="Area (hectare)"
                              name="area_hectare"
                            >
                              <InputNumber
                                type="number"
                                placeholder="Enter Area (hectare)"
                                style={{ width: "100%" }}
                                size="small"
                              />
                            </Form.Item>
                          </Col>
                        );
                        break;
                      case "Farm Location Coordinates(longitude)":
                        formItem = (
                          <Col xs={24} sm={12} key={field}>
                            <Form.Item
                              label="Farm Location Coordinates(longitude)"
                              name="farm_location_longitude"
                            >
                              <Input
                                placeholder="Enter Longitude"
                                style={inputStyle}
                                size="small"
                              />
                            </Form.Item>
                          </Col>
                        );
                        break;
                      case "Farm Location Coordinates(latitude)":
                        formItem = (
                          <Col xs={24} sm={12} key={field}>
                            <Form.Item
                              label="Farm Location Coordinates(latitude)"
                              name="farm_location_latitude"
                            >
                              <Input
                                placeholder="Enter Latitude"
                                style={inputStyle}
                                size="small"
                              />
                            </Form.Item>
                          </Col>
                        );
                        break;
                      default:
                        formItem = (
                          <Col xs={24} sm={12} key={field}>
                            <Form.Item
                              label={field}
                              name={field.toLowerCase().replace(/ /g, "_")}
                            >
                              <Input
                                placeholder={`Enter ${field}`}
                                style={inputStyle}
                                size="small"
                              />
                            </Form.Item>
                          </Col>
                        );
                        break;
                    }
                    return formItem;
                  })}
              </Row>
            </Card>
          )}

          {/* Submit Button */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
              style={{
                backgroundColor: colors.primary,
                borderColor: colors.primary,
                height: "40px",
                width: "140px",
                fontSize: "16px",
              }}
            >
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AddData;
