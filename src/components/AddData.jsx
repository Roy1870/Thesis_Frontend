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
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { farmerAPI, livestockAPI } from "./services/api";

const { Option } = Select;
const { Title } = Typography;

const AddData = () => {
  const [form] = Form.useForm();
  const [farmerType, setFarmerType] = useState(null);
  const [animals, setAnimals] = useState([
    { animal_type: "", subcategory: "", quantity: "" },
  ]);
  const [selectedCrop, setSelectedCrop] = useState(null); // New state for selected crop
  const [selectedVegetable, setSelectedVegetable] = useState(null); // State to track selected vegetable
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
  const handleFarmerTypeChange = (value) => {
    setFarmerType(value);
    setSelectedCrop(null); // Reset selected crop when farmer type changes
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

  const headerColor = "#6A9C89";
  const lighterShade = "#E6F5E4";
  const borderColor = "#CBD5E0";

  const inputStyle = {
    borderRadius: "6px",
    border: `1px solid ${borderColor}`,
    padding: "8px",
    width: "100%",
  };

  const addAnimal = () => {
    setAnimals([
      ...animals,
      { animal_type: "", subcategory: "", quantity: "" },
    ]);
  };

  const contentStyle = {
    padding: "12px",
    backgroundColor: colors.secondary,
  };

  return (
    <div
      style={{
        padding: "12px",
        backgroundColor: colors.background,
        minHeight: "100vh",
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => (window.location.href = "/inventory")}
              style={{ marginRight: 12 }}
              size="small"
            >
              Back
            </Button>
            <Title
              level={4}
              style={{ margin: 0, fontSize: "16px", lineHeight: "1.2" }}
            >
              Add Farmer Data
            </Title>
          </div>
        }
        style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
        bodyStyle={{ padding: "12px 12px 0" }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Card
            title="Farmer Information"
            style={{
              marginBottom: "16px",
              borderRadius: "8px",
              backgroundColor: lighterShade,
              border: `1px solid ${borderColor}`,
            }}
            headStyle={{
              background: headerColor,
              color: "#ffffff",
              borderRadius: "8px 8px 0 0",
              padding: "8px 12px",
              fontSize: "14px",
            }}
            bodyStyle={{ padding: "12px" }}
          >
            {/* Farmer Information Form Fields */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Name"
                  name="name"
                  rules={[{ required: true }]}
                >
                  <Input
                    prefix={<UserOutlined style={{ color: headerColor }} />}
                    placeholder="Enter name"
                    style={inputStyle}
                    size="small"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  rules={[{ required: true }]}
                  label="Contact Number"
                  name="contact_number"
                >
                  <Input
                    prefix={<PhoneOutlined style={{ color: headerColor }} />}
                    placeholder="Enter contact number"
                    style={inputStyle}
                    size="small"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  rules={[{ required: true }]}
                  label="Facebook/Email"
                  name="facebook_email"
                >
                  <Input
                    placeholder="Enter Facebook or Email"
                    style={inputStyle}
                    size="small"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  rules={[{ required: true }]}
                  label="Barangay"
                  name="barangay"
                >
                  <Select placeholder="Select a Barangay" size="small">
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
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  rules={[{ required: true }]}
                  label="Home Address"
                  name="home_address"
                >
                  <Input
                    placeholder="Enter home address"
                    style={inputStyle}
                    size="small"
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="Farmer Type" name="farmer_type">
                  <Select
                    placeholder="Select Farmer Type"
                    onChange={(value) => setFarmerType(value)}
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

          {farmerType === "Raiser" && (
            <Card
              title="Livestock Records"
              style={{
                marginBottom: "16px",
                borderRadius: "8px",
                backgroundColor: lighterShade,
                border: `1px solid ${borderColor}`,
              }}
              headStyle={{
                background: headerColor,
                color: "#ffffff",
                borderRadius: "8px 8px 0 0",
                padding: "8px 12px",
                fontSize: "14px",
              }}
              bodyStyle={{ padding: "12px" }}
            >
              {/* Livestock Records Form Fields */}
              {animals.map((animal, index) => (
                <Row gutter={16} key={index}>
                  <Col span={6}>
                    <Form.Item
                      label="Animal Type"
                      rules={[{ required: true }]}
                      name={`animal_type_${index}`}
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
                  <Col span={6}>
                    <Form.Item
                      label="Subcategory"
                      rules={[{ required: true }]}
                      name={`subcategory_${index}`}
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
                  <Col span={6}>
                    <Form.Item
                      rules={[{ required: true }]}
                      label="Quantity"
                      name={`quantity_${index}`}
                    >
                      <InputNumber
                        placeholder="Enter Quantity"
                        type="number"
                        value={animal.quantity}
                        size="small"
                        onChange={(value) => {
                          const newAnimals = [...animals];
                          newAnimals[index].quantity = value;
                          setAnimals(newAnimals);
                        }}
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={2}>
                    {/* Use Form.Item with label=" " (a space) for alignment */}
                    <Form.Item label=" ">
                      {" "}
                      {/* Add a label with a space */}
                      <Button
                        type="primary"
                        danger
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
              ))}
              <Button
                type="dashed"
                onClick={addAnimal}
                style={{ width: "100%", marginBottom: "20px" }}
                size="small"
              >
                ADD ANOTHER ANIMAL
              </Button>
            </Card>
          )}

          {farmerType === "Operator" && (
            <Card
              title="Operator Details"
              style={{
                marginBottom: "16px",
                borderRadius: "8px",
                backgroundColor: lighterShade,
                border: `1px solid ${borderColor}`,
              }}
              headStyle={{
                background: headerColor,
                color: "#ffffff",
                borderRadius: "8px 8px 0 0",
                padding: "8px 12px",
                fontSize: "14px",
              }}
              bodyStyle={{ padding: "12px" }}
            >
              {/* Operator Details Form Fields */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Fishpond Location" name="fishpond_location">
                    <Input
                      placeholder="Enter Fishpond Location"
                      style={inputStyle}
                      size="small"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Geotagged Photo" name="geotagged_photo">
                    <Input
                      placeholder="Enter Geotagged Photo URL"
                      style={inputStyle}
                      size="small"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Cultured Species" name="cultured_species">
                    <Input
                      placeholder="Enter Cultured Species"
                      style={inputStyle}
                      size="small"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Area (Hectares)" name="area">
                    <InputNumber
                      placeholder="Enter Area"
                      type="number"
                      style={{ width: "100%" }}
                      size="small"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Stocking Density" name="stocking_density">
                    <Input
                      placeholder="Enter Stocking Density"
                      style={inputStyle}
                      size="small"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Date of Stocking" name="date_of_stocking">
                    <DatePicker style={{ width: "100%" }} size="small" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Production" name="production">
                    <Input
                      placeholder="Enter Production"
                      style={inputStyle}
                      size="small"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Date of Harvest" name="date_of_harvest">
                    <DatePicker style={{ width: "100%" }} size="small" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
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
                <Col span={12}>
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

          {farmerType === "Grower" && (
            <Card
              title="Grower Details"
              style={{
                marginBottom: "16px",
                borderRadius: "8px",
                backgroundColor: lighterShade,
                border: `1px solid ${borderColor}`,
              }}
              headStyle={{
                background: headerColor,
                color: "#ffffff",
                borderRadius: "8px 8px 0 0",
                padding: "8px 12px",
                fontSize: "14px",
              }}
              bodyStyle={{ padding: "12px" }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Crop Type" name="crop_type">
                    <Select
                      placeholder="Select Crop Type"
                      onChange={(value) => setSelectedCrop(value)} // Update selectedCrop state
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

                {selectedCrop === "Rice" && (
                  <>
                    <Button
                      type="dashed"
                      onClick={handleAddAdditionalRice}
                      style={{ width: "100%", marginBottom: "10px" }}
                      size="small"
                    >
                      ADD ANOTHER RICE ENTRY
                    </Button>

                    {additionalRiceDetails.map((riceDetail, index) => (
                      <div
                        key={index}
                        style={{
                          marginBottom: "12px",
                          padding: "12px",
                          border: "1px dashed #d9d9d9",
                          borderRadius: "6px",
                        }}
                      >
                        <Row gutter={16} style={{ marginBottom: "10px" }}>
                          {/* Area Type */}
                          <Col span={4}>
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

                          {/* Seed Type */}
                          <Col span={4}>
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

                          {/* Area Harvested */}
                          <Col span={4}>
                            <Form.Item
                              label="Area Harvested"
                              name={["additionalRice", index, "area_harvested"]}
                            >
                              <InputNumber
                                type="number"
                                placeholder="Enter Area Harvested"
                                style={{ width: "100%" }}
                                size="small"
                              />
                            </Form.Item>
                          </Col>

                          {/* Production */}
                          <Col span={4}>
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

                          {/* Average Yield */}
                          <Col span={4}>
                            <Form.Item
                              label="Average Yield "
                              name={["additionalRice", index, "ave_yield"]}
                            >
                              <InputNumber
                                type="number"
                                placeholder="Enter Average Yield"
                                style={{ width: "100%" }}
                                size="small"
                              />
                            </Form.Item>
                          </Col>

                          {/* Remove Button */}
                          {additionalRiceDetails.length > 1 && (
                            <Col
                              span={2}
                              style={{ textAlign: "right", marginTop: "30px" }}
                            >
                              <Button
                                type="primary"
                                danger
                                size="small"
                                onClick={() =>
                                  handleRemoveAdditionalRice(index)
                                }
                              >
                                Remove
                              </Button>
                            </Col>
                          )}
                        </Row>
                      </div>
                    ))}
                  </>
                )}

                {selectedCrop === "Spices" && (
                  <>
                    <Col span={12}>
                      <Form.Item label="Name Of Buyer" name="Name of Buyer">
                        <Input
                          placeholder="Enter Name of Buyer"
                          style={inputStyle}
                          size="small"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
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
                    <Col span={12}>
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
                    <Col span={12} key="cropping_intensity">
                      <Form.Item
                        label="Cropping Intensity"
                        name="cropping_intensity"
                      >
                        <Select
                          placeholder="Select Cropping Intensity"
                          size="small"
                        >
                          <Select.Option value="year_round">
                            Year Round
                          </Select.Option>
                          <Select.Option value="quarterly">
                            Quarterly
                          </Select.Option>
                          <Select.Option value="seasonal">
                            Seasonal
                          </Select.Option>
                          <Select.Option value="annually">
                            Annually
                          </Select.Option>
                          <Select.Option value="twice_a_month">
                            Twice a Month
                          </Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Farm Address" name="farm_address">
                        <Input
                          placeholder="Enter Farm Address"
                          style={inputStyle}
                          size="small"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Area (hectare)" name="area_hectare">
                        <InputNumber
                          type="number"
                          placeholder="Enter Area (hectare)"
                          style={{ width: "100%" }}
                          size="small"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
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
                    <Col span={12}>
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
                      <Row gutter={[12, 12]}>
                        {additionalSpiceDetails.map((spiceDetail, index) => (
                          <div
                            key={index}
                            style={{
                              marginBottom: "12px",
                              padding: "12px",
                              border: "1px dashed #d9d9d9",
                              borderRadius: "6px",
                            }}
                          >
                            <Col
                              span={24}
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <Row
                                gutter={11}
                                style={{
                                  width: "200%",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <Col span={10}>
                                  <Form.Item
                                    rules={[{ required: true }]}
                                    label="Spice Type"
                                    name={[
                                      "additionalSpice",
                                      index,
                                      "spices_type",
                                    ]}
                                  >
                                    <Select
                                      placeholder="Select Spices Type"
                                      style={{ width: "100%" }}
                                      size="small"
                                    >
                                      <Option value="Ginger">Ginger</Option>
                                      <Option value="Onion">Onion</Option>
                                      <Option value="Hotpepper">
                                        Hotpepper
                                      </Option>
                                      <Option value="Sweet Pepper">
                                        Sweet Pepper
                                      </Option>
                                      <Option value="Turmeric">Turmeric</Option>
                                    </Select>
                                  </Form.Item>
                                </Col>
                                <Col span={11}>
                                  <Form.Item
                                    rules={[{ required: true }]}
                                    label="Quantity"
                                    name={[
                                      "additionalSpice",
                                      index,
                                      "quantity",
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
                                  <Col span={2} style={{ textAlign: "center" }}>
                                    <Button
                                      type="primary"
                                      danger
                                      size="small"
                                      onClick={() =>
                                        handleRemoveAdditionalSpice(index)
                                      }
                                    >
                                      Remove
                                    </Button>
                                  </Col>
                                )}
                              </Row>
                            </Col>
                          </div>
                        ))}
                        <Col
                          span={24}
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <Button
                            type="dashed"
                            onClick={handleAddAdditionalSpice}
                            style={{ width: "50%", marginBottom: "5px" }}
                            size="small"
                          >
                            ADD ANOTHER SPICE ENTRY
                          </Button>
                        </Col>
                      </Row>
                    </Col>
                  </>
                )}

                {selectedCrop === "Legumes" && (
                  <>
                    <Col span={12}>
                      <Form.Item label="Name Of Buyer" name="Name of Buyer">
                        <Input
                          placeholder="Enter Name of Buyer"
                          style={inputStyle}
                          size="small"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
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
                    <Col span={12}>
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
                    <Col span={12} key="cropping_intensity">
                      <Form.Item
                        label="Cropping Intensity"
                        name="cropping_intensity"
                      >
                        <Select
                          placeholder="Select Cropping Intensity"
                          size="small"
                        >
                          <Select.Option value="year_round">
                            Year Round
                          </Select.Option>
                          <Select.Option value="quarterly">
                            Quarterly
                          </Select.Option>
                          <Select.Option value="seasonal">
                            Seasonal
                          </Select.Option>
                          <Select.Option value="annually">
                            Annually
                          </Select.Option>
                          <Select.Option value="twice_a_month">
                            Twice a Month
                          </Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Farm Address" name="farm_address">
                        <Input
                          placeholder="Enter Farm Address"
                          style={inputStyle}
                          size="small"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Area (hectare)" name="area_hectare">
                        <InputNumber
                          type="number"
                          placeholder="Enter Area (hectare)"
                          style={{ width: "100%" }}
                          size="small"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
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
                    <Col span={12}>
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
                      <Row gutter={[12, 12]}>
                        {additionalLegumesDetails.map(
                          (legumesDetail, index) => (
                            <div
                              key={index}
                              style={{
                                marginBottom: "12px",
                                padding: "12px",
                                border: "1px dashed #d9d9d9",
                                borderRadius: "6px",
                              }}
                            >
                              <Col
                                span={24}
                                style={{
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <Row
                                  gutter={11}
                                  style={{
                                    width: "200%",
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                >
                                  <Col span={10}>
                                    <Form.Item
                                      rules={[{ required: true }]}
                                      label="Legumes Type"
                                      name={[
                                        "additionalLegumes",
                                        index,
                                        "legumes_type",
                                      ]}
                                    >
                                      <Select
                                        placeholder="Select Legumes Type"
                                        style={{ width: "100%" }}
                                        size="small"
                                      >
                                        <Option value="Peanut">Peanut</Option>
                                        <Option value="Mungbean">
                                          Mungbean
                                        </Option>
                                        <Option value="Soybean">Soybean</Option>
                                      </Select>
                                    </Form.Item>
                                  </Col>
                                  <Col span={11}>
                                    <Form.Item
                                      rules={[{ required: true }]}
                                      label="Quantity"
                                      name={[
                                        "additionalLegumes",
                                        index,
                                        "quantity",
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
                                  {additionalLegumesDetails.length > 1 && (
                                    <Col
                                      span={2}
                                      style={{ textAlign: "center" }}
                                    >
                                      <Button
                                        type="primary"
                                        danger
                                        size="small"
                                        onClick={() =>
                                          handleRemoveAdditionalLegumes(index)
                                        }
                                      >
                                        Remove
                                      </Button>
                                    </Col>
                                  )}
                                </Row>
                              </Col>
                            </div>
                          )
                        )}
                        <Col
                          span={24}
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <Button
                            type="dashed"
                            onClick={handleAddAdditionalLegumes}
                            style={{ width: "50%", marginBottom: "5px" }}
                            size="small"
                          >
                            ADD ANOTHER LEGUMES ENTRY
                          </Button>
                        </Col>
                      </Row>
                    </Col>
                  </>
                )}

                {selectedCrop === "Banana" && (
                  <>
                    <Col span={12}>
                      <Form.Item label="Name Of Buyer" name="Name of Buyer">
                        <Input
                          placeholder="Enter Name of Buyer"
                          style={inputStyle}
                          size="small"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
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
                    <Col span={12}>
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
                    <Col span={12} key="cropping_intensity">
                      <Form.Item
                        label="Cropping Intensity"
                        name="cropping_intensity"
                      >
                        <Select
                          placeholder="Select Cropping Intensity"
                          size="small"
                        >
                          <Select.Option value="year_round">
                            Year Round
                          </Select.Option>
                          <Select.Option value="quarterly">
                            Quarterly
                          </Select.Option>
                          <Select.Option value="seasonal">
                            Seasonal
                          </Select.Option>
                          <Select.Option value="annually">
                            Annually
                          </Select.Option>
                          <Select.Option value="twice_a_month">
                            Twice a Month
                          </Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Farm Address" name="farm_address">
                        <Input
                          placeholder="Enter Farm Address"
                          style={inputStyle}
                          size="small"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Area (hectare)" name="area_hectare">
                        <InputNumber
                          type="number"
                          placeholder="Enter Area (hectare)"
                          style={{ width: "100%" }}
                          size="small"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
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
                    <Col span={12}>
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
                      <Row gutter={[12, 12]}>
                        {additionalBananaDetails.map((bananaDetail, index) => (
                          <div
                            key={index}
                            style={{
                              marginBottom: "12px",
                              padding: "12px",
                              border: "1px dashed #d9d9d9",
                              borderRadius: "6px",
                            }}
                          >
                            <Col
                              span={24}
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <Row
                                gutter={11}
                                style={{
                                  width: "200%",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <Col span={10}>
                                  <Form.Item
                                    rules={[{ required: true }]}
                                    label="Banana Type"
                                    name={[
                                      "additionalBanana",
                                      index,
                                      "banana_type",
                                    ]}
                                  >
                                    <Select
                                      placeholder="Select Banana Type"
                                      style={{ width: "100%" }}
                                      size="small"
                                    >
                                      <Option value="Lakatan">Lakatan</Option>
                                      <Option value="Latundan">Latundan</Option>
                                      <Option value="Cardava">Cardava</Option>
                                    </Select>
                                  </Form.Item>
                                </Col>
                                <Col span={11}>
                                  <Form.Item
                                    rules={[{ required: true }]}
                                    label="Quantity"
                                    name={[
                                      "additionalBanana",
                                      index,
                                      "quantity",
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
                                {additionalBananaDetails.length > 1 && (
                                  <Col span={2} style={{ textAlign: "center" }}>
                                    <Button
                                      type="primary"
                                      danger
                                      size="small"
                                      onClick={() =>
                                        handleRemoveAdditionalBanana(index)
                                      }
                                    >
                                      Remove
                                    </Button>
                                  </Col>
                                )}
                              </Row>
                            </Col>
                          </div>
                        ))}
                        <Col
                          span={24}
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <Button
                            type="dashed"
                            onClick={handleAddAdditionalBanana}
                            style={{ width: "50%", marginBottom: "5px" }}
                            size="small"
                          >
                            ADD ANOTHER BANANA ENTRY
                          </Button>
                        </Col>
                      </Row>
                    </Col>
                  </>
                )}

                {selectedCrop === "Vegetable" && (
                  <>
                    <Col span={12}>
                      <Form.Item label="Name Of Buyer" name="Name of Buyer">
                        <Input
                          placeholder="Enter Name of Buyer"
                          style={inputStyle}
                          size="small"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
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
                    <Col span={12}>
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
                    <Col span={12} key="cropping_intensity">
                      <Form.Item
                        label="Cropping Intensity"
                        name="cropping_intensity"
                      >
                        <Select
                          placeholder="Select Cropping Intensity"
                          size="small"
                        >
                          <Select.Option value="year_round">
                            Year Round
                          </Select.Option>
                          <Select.Option value="quarterly">
                            Quarterly
                          </Select.Option>
                          <Select.Option value="seasonal">
                            Seasonal
                          </Select.Option>
                          <Select.Option value="annually">
                            Annually
                          </Select.Option>
                          <Select.Option value="twice_a_month">
                            Twice a Month
                          </Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Farm Address" name="farm_address">
                        <Input
                          placeholder="Enter Farm Address"
                          style={inputStyle}
                          size="small"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Area (hectare)" name="area_hectare">
                        <InputNumber
                          type="number"
                          placeholder="Enter Area (hectare)"
                          style={{ width: "100%" }}
                          size="small"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
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
                    <Col span={12}>
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
                      <Row gutter={[12, 12]}>
                        {additionalVegetableDetails.map(
                          (vegetableDetail, index) => (
                            <div
                              key={index}
                              style={{
                                marginBottom: "12px",
                                padding: "12px",
                                border: "1px dashed #d9d9d9",
                                borderRadius: "6px",
                              }}
                            >
                              <Col span={24}>
                                <Row
                                  gutter={11}
                                  style={{
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                >
                                  <Col span={8}>
                                    <Form.Item
                                      rules={[{ required: true }]}
                                      label="Vegetable Type"
                                      name={[
                                        "additionalVegetable",
                                        index,
                                        "vegetable_type",
                                      ]}
                                    >
                                      <Select
                                        placeholder="Select Vegetable Type"
                                        style={{ width: "100%" }}
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
                                  <Col span={7}>
                                    <Form.Item
                                      rules={[{ required: true }]}
                                      label="Quantity"
                                      name={[
                                        "additionalVegetable",
                                        index,
                                        "quantity",
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
                                    <Col span={7}>
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
                                          style={{ width: "100%" }}
                                          size="small"
                                        />
                                      </Form.Item>
                                    </Col>
                                  )}
                                  {additionalVegetableDetails.length > 1 && (
                                    <Col
                                      span={2}
                                      style={{ textAlign: "center" }}
                                    >
                                      <Button
                                        type="primary"
                                        danger
                                        size="small"
                                        onClick={() =>
                                          handleRemoveAdditionalVegetable(index)
                                        }
                                      >
                                        Remove
                                      </Button>
                                    </Col>
                                  )}
                                </Row>
                              </Col>
                            </div>
                          )
                        )}
                        <Col
                          span={24}
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <Button
                            type="dashed"
                            onClick={handleAddAdditionalVegetable}
                            style={{ width: "50%", marginBottom: "5px" }}
                            size="small"
                          >
                            ADD ANOTHER VEGETABLE ENTRY
                          </Button>
                        </Col>
                      </Row>
                    </Col>
                  </>
                )}

                {selectedCrop &&
                  cropConfigurations[selectedCrop] &&
                  cropConfigurations[selectedCrop].map((field) => {
                    let formItem;
                    switch (field) {
                      case "Name of Buyer":
                        formItem = (
                          <Col span={12} key={field}>
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
                      case "Legume Type":
                        if (selectedCrop === "Legumes") {
                          formItem = (
                            <Col span={12} key={field}>
                              <Form.Item label="Legume Type" name="legume_type">
                                <Select
                                  placeholder="Select Legume Type"
                                  size="small"
                                >
                                  <Option value="Peanut">Peanut</Option>
                                  <Option value="Mungbean">Mungbean</Option>
                                  <Option value="Soybean">Soybean</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                          );
                        }
                        break;
                      case "Vegetable Type":
                        if (selectedCrop === "Vegetable") {
                          formItem = (
                            <Col span={12} key={field}>
                              <Form.Item
                                label="Vegetable Type"
                                name="vegetable_type"
                              >
                                <Select
                                  placeholder="Select Vegetable Type"
                                  onChange={(value) =>
                                    setSelectedVegetable(value)
                                  }
                                  size="small"
                                >
                                  <Option value="Eggplant">Eggplant</Option>
                                  <Option value="Ampalaya">Ampalaya</Option>
                                  <Option value="Okra">Okra</Option>
                                  <Option value="Pole Sitao">Pole Sitao</Option>
                                  <Option value="Squash">Squash</Option>
                                  <Option value="Tomato">Tomato</Option>
                                  <Option value="Other Crop (specify)">
                                    Other Crop (specify)
                                  </Option>
                                </Select>
                              </Form.Item>
                            </Col>
                          );
                        }
                        break;
                      case "Month":
                        if (selectedCrop === "Cacao") {
                          formItem = (
                            <Col span={12} key={field}>
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
                        }
                        break;
                      case "Banana Type":
                        if (selectedCrop === "Banana") {
                          formItem = (
                            <Col span={12} key={field}>
                              <Form.Item label="Banana Type" name="banana_type">
                                <Select
                                  placeholder="Select Banana Type"
                                  size="small"
                                >
                                  <Option value="LAKATAN">LAKATAN</Option>
                                  <Option value="LATUNDAN">LATUNDAN</Option>
                                  <Option value="CARDAVA">CARDAVA</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                          );
                        }
                        break;
                      case "Quantity":
                        formItem = (
                          <Col span={12} key={field}>
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
                      case "Farm Address":
                        formItem = (
                          <Col span={12} key={field}>
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
                      case "Market Outlet Location":
                        formItem = (
                          <Col span={12} key={field}>
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
                      case "Association/Organization":
                        formItem = (
                          <Col span={12} key={field}>
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
                        break;
                      case "Area (hectare)":
                        formItem = (
                          <Col span={12} key={field}>
                            <Form.Item
                              label="Area (hectare)"
                              type="number"
                              name="area_hectare"
                            >
                              <InputNumber
                                placeholder="Enter Area (hectare)"
                                style={{ width: "100%" }}
                                size="small"
                              />
                            </Form.Item>
                          </Col>
                        );
                        break;
                      case "Cropping Intensity":
                        formItem = (
                          <Col span={12} key="cropping_intensity">
                            <Form.Item
                              label="Cropping Intensity"
                              name="cropping_intensity"
                            >
                              <Select
                                placeholder="Select Cropping Intensity"
                                size="small"
                              >
                                <Select.Option value="year_round">
                                  Year Round
                                </Select.Option>
                                <Select.Option value="quarterly">
                                  Quarterly
                                </Select.Option>
                                <Select.Option value="seasonal">
                                  Seasonal
                                </Select.Option>
                                <Select.Option value="annually">
                                  Annually
                                </Select.Option>
                                <Select.Option value="twice_a_month">
                                  Twice a Month
                                </Select.Option>
                              </Select>
                            </Form.Item>
                          </Col>
                        );
                        break;
                      case "Farm Location Coordinates(longitude)":
                        formItem = (
                          <Col span={12} key={field}>
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
                          <Col span={12} key={field}>
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
                      case "Other Vegetable":
                        if (selectedCrop === "Vegetable") {
                          formItem = (
                            <Col span={12} key={field}>
                              {selectedVegetable === "Other Crop (specify)" && (
                                <Form.Item
                                  label="Other Crop (specify)"
                                  name="other_vegetable"
                                >
                                  <Input
                                    placeholder="Specify Other Vegetable"
                                    style={inputStyle}
                                    size="small"
                                  />
                                </Form.Item>
                              )}
                            </Col>
                          );
                        }
                        break;
                      case "Area Type":
                        formItem = (
                          <Col span={12} key={field}>
                            <Form.Item
                              label={field}
                              name={field.toLowerCase().replace(/ /g, "_")}
                            >
                              <Select
                                placeholder={`Select ${field}`}
                                size="small"
                              >
                                <Option value="Irrigated">Irrigated</Option>
                                <Option value="Rainfed">Rainfed</Option>
                              </Select>
                            </Form.Item>
                          </Col>
                        );
                        break;
                      case "Seed Type":
                        formItem = (
                          <Col span={12} key={field}>
                            <Form.Item
                              label={field}
                              name={field.toLowerCase().replace(/ /g, "_")}
                            >
                              <Select
                                placeholder={`Select ${field}`}
                                size="small"
                              >
                                <Option value="Hybrid Seeds">
                                  Hybrid Seeds
                                </Option>
                                <Option value="Certified Seeds ">
                                  Certified Seeds
                                </Option>
                                <Option value="Good Seeds">Good Seeds</Option>
                              </Select>
                            </Form.Item>
                          </Col>
                        );
                        break;
                      case "Production":
                        formItem = (
                          <Col span={12} key={field}>
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
                      case "Average Yield (mt/ha)":
                        formItem = (
                          <Col span={12} key={field}>
                            <Form.Item label={field} name="ave_yield">
                              <Input
                                placeholder={`Enter ${field}`}
                                style={inputStyle}
                                size="small"
                              />
                            </Form.Item>
                          </Col>
                        );
                        break;
                      default:
                        formItem = (
                          <Col span={12} key={field}>
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

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
              style={{
                backgroundColor: colors.primary,
                borderColor: colors.primary,
                height: "32px",
                width: "120px",
                fontSize: "14px",
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
