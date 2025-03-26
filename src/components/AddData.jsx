import React, { useState } from "react";
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
} from "antd";
import { UserOutlined, PhoneOutlined } from "@ant-design/icons";
import axios from "axios";

const token = localStorage.getItem("authToken");

const { Option } = Select;

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
    { spices_type: "", quantity: "",  },
  ]);

  const [additionalLegumesDetails, setAdditionalLegumesDetails] = useState([
    { legumes_type: "", quantity: "",  },
  ]);

  const [additionalBananaDetails, setAdditionalBananaDetails] = useState([
    { banana_type: "", quantity: "",  },
  ]);

  
  const [additionalVegetableDetails, setAdditionalVegetableDetails] = useState([
    { vegetable_type: "", quantity: "", other_vegetable: "" },
  ]);

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

  const handleAddAdditionalLegumes= () => {
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

  const handleAddAdditionalBanana= () => {
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

  const handleAddAdditionalVegetable= () => {
    setAdditionalVegetableDetails([
      ...additionalVegetableDetails,
      { vegetable_type: "", quantity: "", other_vegetable: "", },
    ]);
  };
  
  
  const handleSubmit = async (values) => {
    try {
      const formattedData = {
        name: values.name,
        home_address: values.home_address,
        contact_number: values.contact_number,
        facebook_email: values.facebook_email,
        barangay: values.barangay,
      };

      // Conditionally add crops if it's NOT "Rice"
      if (values.crop_type && values.crop_type !== "Rice") {
        const productionData = {
          crop:
            values.banana_type ??
            values.legumes_type ??
            values.spices_type ??
            values.vegetable_type ??
            values.crop_type, // Fallback to general crop type if specific type is missing
          quantity: values.quantity || 0,
        };

        // Only add the month if it exists
        if (values.month) {
          productionData[values.month] = values.quantity || 0;
        }

        formattedData.crops = [
          {
            crop_type: values.crop_type,
            area_hectare: values.area_hectare
              ? parseFloat(values.area_hectare)
              : undefined,
            production_type: values.cropping_intensity,
            production_data: JSON.stringify(productionData), // Convert to JSON
          },
        ];
      }

      let riceEntries = [];

      // ✅ Ensure all values exist before adding to rice array
      if (values.crop_type === "Rice") {
        const mainRiceEntry = {
          area_type: values.area_type || undefined,
          seed_type: values.seed_type || undefined,
          area_harvested: values.area_harvested
            ? parseFloat(values.area_harvested)
            : undefined,
          production: values.production
            ? parseFloat(values.production)
            : undefined,
          ave_yield: values.ave_yield
            ? parseFloat(values.ave_yield)
            : undefined,
        };

        // 🚨 Prevent empty rice object from being added
        if (Object.values(mainRiceEntry).some((val) => val !== undefined)) {
          riceEntries.push(mainRiceEntry);
        }
      }

      // ✅ Handle additional rice entries correctly
      if (Array.isArray(values.additionalRice)) {
        values.additionalRice.forEach((rice, index) => {
          const riceEntry = {
            area_type: rice.area_type || undefined,
            seed_type: rice.seed_type || undefined,
            area_harvested: rice.area_harvested
              ? parseFloat(rice.area_harvested)
              : undefined,
            production: rice.production
              ? parseFloat(rice.production)
              : undefined,
            ave_yield: rice.ave_yield ? parseFloat(rice.ave_yield) : undefined,
          };

          // 🚨 Prevent empty objects from being added
          if (Object.values(riceEntry).some((val) => val !== undefined)) {
            riceEntries.push(riceEntry);
          }
        });
      }

      // ✅ Only include `rice` key if there are valid entries
      if (riceEntries.length > 0) {
        formattedData.rice = riceEntries;
      }

      console.log(
        "Formatted JSON Data:",
        JSON.stringify(formattedData, null, 2)
      );

      const response = await axios.post(
        "http://localhost:8000/api/farmers",
        formattedData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        message.success("Data submitted successfully!");
        form.resetFields();
        setFarmerType(null);
        setAnimals([{ animal_type: "", subcategory: "", quantity: "" }]);
        setSelectedCrop(null);
        setSelectedVegetable(null);
        setAdditionalRiceDetails([]);
      } else {
        message.error("Failed to submit data.");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      message.error("An error occurred while submitting the data.");
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

  return (
    <div style={{ margin: "px" }}>
      <div
        style={{
          padding: "40px",
          backgroundColor: "#FFFFFF",
          maxHeight: "750px",
          overflowY: "auto",
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Card
            title="Farmer Information"
            style={{
              marginBottom: "20px",
              borderRadius: "8px",
              backgroundColor: lighterShade,
              border: `1px solid ${borderColor}`,
            }}
            headStyle={{
              background: headerColor,
              color: "#ffffff",
              borderRadius: "8px 8px 0 0",
            }}
          >
            {/* Farmer Information Form Fields */}
            <Row gutter={24}>
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
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item  rules={[{ required: true }]} label="Contact Number" name="contact number">
                  <Input
                    prefix={<PhoneOutlined style={{ color: headerColor }} />}
                    placeholder="Enter contact number"
                    style={inputStyle}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item  rules={[{ required: true }]} label="Facebook/Email" name="facebook_email">
                  <Input
                    placeholder="Enter Facebook or Email"
                    style={inputStyle}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item  rules={[{ required: true }]} label="Barangay" name="barangay">
                  <Select placeholder="Select a Barangay">
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

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item rules={[{ required: true }]} label="Home Address" name="home_address">
                  <Input placeholder="Enter home address" style={inputStyle} />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="Farmer Type" name="farmer_type">
                  <Select
                    placeholder="Select Farmer Type"
                    onChange={(value) => setFarmerType(value)}
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
              title="Raiser Details"
              style={{
                marginBottom: "20px",
                borderRadius: "8px",
                backgroundColor: lighterShade,
                border: `1px solid ${borderColor}`,
              }}
              headStyle={{
                background: headerColor,
                color: "#ffffff",
                borderRadius: "8px 8px 0 0",
              }}
            >
              {/* Raiser Details Form Fields */}
              {animals.map((animal, index) => (
                <Row gutter={24} key={index}>
                  <Col span={6}>
                    <Form.Item
                      label="Animal Type"
                      rules={[{ required: true }]}
                      name={`animal_type_${index}`}
                    >
                      <Select
                        placeholder="Select Animal Type"
                        value={animal.animal_type}
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
                        <Option value="CATTLE">Cattle</Option>
                        <Option value="CARABAO">Carabao</Option>
                        <Option value="GOAT">Goat</Option>
                        <Option value="SHEEP">Sheep</Option>
                        <Option value="SWINE">Swine</Option>
                        <Option value="CHICKEN">Chicken</Option>
                        <Option value="DUCK">Duck</Option>
                        <Option value="QUAIL">Quail</Option>
                        <Option value="TURKEY">Turkey</Option>
                        <Option value="RABBIT">Rabbit</Option>
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
                        onChange={(value) => {
                          const newAnimals = [...animals];
                          newAnimals[index].subcategory = value;
                          setAnimals(newAnimals);
                        }}
                      >
                        {animal.animal_type === "CATTLE" && (
                          <>
                            <Option value="Carabull">Carabull</Option>
                            <Option value="Caracow">Caracow</Option>
                          </>
                        )}
                        {animal.animal_type === "CARABAO" && (
                          <>
                            <Option value="Carabull">Carabull</Option>
                            <Option value="Caracow">Caracow</Option>
                          </>
                        )}
                        {animal.animal_type === "GOAT" && (
                          <>
                            <Option value="Buck">Buck</Option>
                            <Option value="Doe">Doe</Option>
                          </>
                        )}
                        {animal.animal_type === "SHEEP" && (
                          <>
                            <Option value="Ran">Ram</Option>
                            <Option value="Ewe">Ewe</Option>
                          </>
                        )}
                        {animal.animal_type === "SWINE" && (
                          <>
                            <Option value="Sow">Sow</Option>
                            <Option value="Piglet">Piglet</Option>
                            <Option value="Boar">Boar</Option>
                            <Option value="Fatteners">Fatteners</Option>
                          </>
                        )}
                        {animal.animal_type === "CHICKEN" && (
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
                        {animal.animal_type === "DUCK" && (
                          <>
                            <Option value="Drake">Drake</Option>
                            <Option value="Hen">Hen</Option>
                          </>
                        )}
                        {animal.animal_type === "QUAIL" && (
                          <>
                            <Option value="Cock">Cock</Option>
                            <Option value="Hen">Hen</Option>
                          </>
                        )}
                        {animal.animal_type === "TURKEY" && (
                          <>
                            <Option value="Gobbler">Gobbler</Option>
                            <Option value="Hen">Hen</Option>
                          </>
                        )}
                        {animal.animal_type === "RABBIT" && (
                          <>
                            <Option value="Buck">Buck</Option>
                            <Option value="Doe">Doe</Option>
                          </>
                        )}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item rules={[{ required: true }]} label="Quantity" name={`quantity_${index}`}>
                      <Input
                        placeholder="Enter Quantity"
                        
                        type="number"
                        value={animal.quantity}
                        onChange={(e) => {
                          const newAnimals = [...animals];
                          newAnimals[index].quantity = e.target.value;
                          setAnimals(newAnimals);
                        }}
                        style={inputStyle}
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
              >
                ADD ANOTHER ANIMAL
              </Button>
            </Card>
          )}

          {farmerType === "Operator" && (
            <Card
              title="Operator Details"
              style={{
                marginBottom: "20px",
                borderRadius: "8px",
                backgroundColor: lighterShade,
                border: `1px solid ${borderColor}`,
              }}
              headStyle={{
                background: headerColor,
                color: "#ffffff",
                borderRadius: "8px 8px 0 0",
              }}
            >
              {/* Operator Details Form Fields */}
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item label="Fishpond Location" name="fishpond_location">
                    <Input
                      placeholder="Enter Fishpond Location"
                      style={inputStyle}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Geotagged Photo" name="geotagged_photo">
                    <Input
                      placeholder="Enter Geotagged Photo URL"
                      style={inputStyle}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item label="Cultured Species" name="cultured_species">
                    <Input
                      placeholder="Enter Cultured Species"
                      style={inputStyle}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Area (Hectares)" name="area">
                    <Input
                      placeholder="Enter Area"
                      type="number"
                      style={inputStyle}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item label="Stocking Density" name="stocking_density">
                    <Input
                      placeholder="Enter Stocking Density"
                      style={inputStyle}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Date of Stocking" name="date_of_stocking">
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item label="Production" name="production">
                    <Input placeholder="Enter Production" style={inputStyle} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Date of Harvest" name="date_of_harvest">
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    label="Operational Status"
                    name="operational_status"
                  >
                    <Select placeholder="Select Operational Status">
                      <Option value="Active">Active</Option>
                      <Option value="Inactive">Inactive</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Remarks" name="remarks">
                    <Input placeholder="Enter Remarks" style={inputStyle} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          )}

          {farmerType === "Grower" && (
            <Card
              title="Grower Details"
              style={{
                marginBottom: "20px",
                borderRadius: "8px",
                backgroundColor: lighterShade,
                border: `1px solid ${borderColor}`,
              }}
              headStyle={{
                background: headerColor,
                color: "#ffffff",
                borderRadius: "8px 8px 0 0",
              }}
            >
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item label="Crop Type" name="crop_type">
                    <Select
                      placeholder="Select Crop Type"
                      onChange={(value) => setSelectedCrop(value)} // Update selectedCrop state
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
                    >
                      ADD ANOTHER RICE ENTRY
                    </Button>

                    {additionalRiceDetails.map((riceDetail, index) => (
                      <Row
                        gutter={60}
                        key={index}
                        style={{ marginBottom: "10px" }}
                      >
                        {/* Area Type */}
                        <Col span={4}>
                          <Form.Item
                            label="Area Type"
                            name={["additionalRice", index, "area_type"]}
                          >
                            <Select placeholder="Select Area Type">
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
                            <Select placeholder="Select Seed Type">
                              <Option value="Hybrid Seeds">Hybrid Seeds</Option>
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
                            <Input
                              type="number"
                              placeholder="Enter Area Harvested"
                              style={inputStyle}
                            />
                          </Form.Item>
                        </Col>

                        {/* Production */}
                        <Col span={4}>
                          <Form.Item
                            label="Production"
                            name={["additionalRice", index, "production"]}
                          >
                            <Input
                              type="number"
                              placeholder="Enter Production"
                              style={inputStyle}
                            />
                          </Form.Item>
                        </Col>

                        {/* Average Yield */}
                        <Col span={4}>
                          <Form.Item
                            label="Average Yield "
                            name={["additionalRice", index, "ave_yield"]}
                          >
                            <Input
                              type="number"
                              placeholder="Enter Average Yield"
                              style={inputStyle}
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
                              onClick={() => handleRemoveAdditionalRice(index)}
                            >
                              Remove
                            </Button>
                          </Col>
                        )}
                      </Row>
                    ))}
                  </>
                )}

                {selectedCrop === "Spices" && (
            <>
              <Col span={12}>
                <Form.Item label="Name Of Buyer" name="Name of Buyer">
                  <Input placeholder="Enter Name of Buyer" style={inputStyle} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Market Outlet Location" name="Market Outlet Location">
                  <Input placeholder="Enter Market Outlet Location" style={inputStyle} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Association/Organization" name="Association/Organization">
                  <Input placeholder="Enter Association/Organization" style={inputStyle} />
                </Form.Item>
              </Col>
              <Col span={12} key="cropping_intensity">
                <Form.Item label="Cropping Intensity" name="cropping_intensity">
                  <Select placeholder="Select Cropping Intensity">
                    <Select.Option value="year_round">Year Round</Select.Option>
                    <Select.Option value="quarterly">Quarterly</Select.Option>
                    <Select.Option value="seasonal">Seasonal</Select.Option>
                    <Select.Option value="annually">Annually</Select.Option>
                    <Select.Option value="twice_a_month">Twice a Month</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Farm Address" name="farm_address">
                  <Input placeholder="Enter Farm Address" style={inputStyle} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Area (hectare)" name="area_hectare">
                  <Input type="number" placeholder="Enter Area (hectare)" style={inputStyle} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Farm Location Coordinates(longitude)" name="farm_location_longitude">
                  <Input placeholder="Enter Longitude" style={inputStyle} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Farm Location Coordinates(latitude)" name="farm_location_laitude">
                  <Input placeholder="Enter Latitude" style={inputStyle} />
                </Form.Item>
              </Col>
              
                  <Col span={24}>
              <Row gutter={[12, 12]}>
                {additionalSpiceDetails.map((spiceDetail, index) => (
                  <React.Fragment key={index}>
                    <Col span={24} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                      <Row gutter={11} style={{ width: '200%', justifyContent: 'center', alignItems: 'center' }}>
                        <Col span={10}>
                          <Form.Item  rules={[{ required: true }]} label="Spice Type" name={["additionalSpice", index, "spices_type"]}>
                            <Select placeholder="Select Spices Type" style={{ width: '100%' }}>
                              <Option value="Ginger">Ginger</Option>
                              <Option value="Onion">Onion</Option>
                              <Option value="Hotpepper">Hotpepper</Option>
                              <Option value="Sweet Pepper">Sweet Pepper</Option>
                              <Option value="Turmeric">Turmeric</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={11}>
                          <Form.Item rules={[{ required: true }]} label="Quantity" name={["additionalSpice", index, "quantity"]}>
                            <Input type="number" placeholder="Enter Quantity" style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        {additionalSpiceDetails.length > 1 && (
                          <Col span={2} style={{ textAlign: "center"}}>
                            <Button type="primary" danger onClick={() => handleRemoveAdditionalSpice(index)}>
                              Remove
                            </Button>
                          </Col>
                        )}
                      </Row>
                    </Col>
                  </React.Fragment>
                ))}
                <Col span={24} style={{ display: "flex", justifyContent: "center" }}>
                  <Button
                    type="dashed"
                    onClick={handleAddAdditionalSpice}
                    style={{ width: "50%", marginBottom: "5px" }}
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
                  <Input placeholder="Enter Name of Buyer" style={inputStyle} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Market Outlet Location" name="Market Outlet Location">
                  <Input placeholder="Enter Market Outlet Location" style={inputStyle} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Association/Organization" name="Association/Organization">
                  <Input placeholder="Enter Association/Organization" style={inputStyle} />
                </Form.Item>
              </Col>
              <Col span={12} key="cropping_intensity">
                <Form.Item label="Cropping Intensity" name="cropping_intensity">
                  <Select placeholder="Select Cropping Intensity">
                    <Select.Option value="year_round">Year Round</Select.Option>
                    <Select.Option value="quarterly">Quarterly</Select.Option>
                    <Select.Option value="seasonal">Seasonal</Select.Option>
                    <Select.Option value="annually">Annually</Select.Option>
                    <Select.Option value="twice_a_month">Twice a Month</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Farm Address" name="farm_address">
                  <Input placeholder="Enter Farm Address" style={inputStyle} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Area (hectare)" name="area_hectare">
                  <Input type="number" placeholder="Enter Area (hectare)" style={inputStyle} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Farm Location Coordinates(longitude)" name="farm_location_longitude">
                  <Input placeholder="Enter Longitude" style={inputStyle} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Farm Location Coordinates(latitude)" name="farm_location_laitude">
                  <Input placeholder="Enter Latitude" style={inputStyle} />
                </Form.Item>
              </Col>
              
                  <Col span={24}>
              <Row gutter={[12, 12]}>
                {additionalLegumesDetails.map((legumesDetail, index) => (
                  <React.Fragment key={index}>
                    <Col span={24} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                      <Row gutter={11} style={{ width: '200%', justifyContent: 'center', alignItems: 'center' }}>
                        <Col span={10}>
                          <Form.Item  rules={[{ required: true }]} label="Legumes Type" name={["additionalLegumes", index, "legumes_type"]}>
                            <Select placeholder="Select Legumes Type" style={{ width: '100%' }}>
                              <Option value="Peanut">Peanut</Option>
                              <Option value="Mungbean">Mungbean</Option>
                              <Option value="Soybean">Soybean</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={11}>
                          <Form.Item rules={[{ required: true }]} label="Quantity" name={["additionalLegumes", index, "quantity"]}>
                            <Input type="number" placeholder="Enter Quantity" style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        {additionalLegumesDetails.length > 1 && (
                          <Col span={2} style={{ textAlign: "center"}}>
                            <Button type="primary" danger onClick={() => handleRemoveAdditionalLegumes(index)}>
                              Remove
                            </Button>
                          </Col>
                        )}
                      </Row>
                    </Col>
                  </React.Fragment>
                ))}
                <Col span={24} style={{ display: "flex", justifyContent: "center" }}>
                  <Button
                    type="dashed"
                    onClick={handleAddAdditionalLegumes}
                    style={{ width: "50%", marginBottom: "5px" }}
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
                  <Input placeholder="Enter Name of Buyer" style={inputStyle} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Market Outlet Location" name="Market Outlet Location">
                  <Input placeholder="Enter Market Outlet Location" style={inputStyle} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Association/Organization" name="Association/Organization">
                  <Input placeholder="Enter Association/Organization" style={inputStyle} />
                </Form.Item>
              </Col>
              <Col span={12} key="cropping_intensity">
                <Form.Item label="Cropping Intensity" name="cropping_intensity">
                  <Select placeholder="Select Cropping Intensity">
                    <Select.Option value="year_round">Year Round</Select.Option>
                    <Select.Option value="quarterly">Quarterly</Select.Option>
                    <Select.Option value="seasonal">Seasonal</Select.Option>
                    <Select.Option value="annually">Annually</Select.Option>
                    <Select.Option value="twice_a_month">Twice a Month</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Farm Address" name="farm_address">
                  <Input placeholder="Enter Farm Address" style={inputStyle} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Area (hectare)" name="area_hectare">
                  <Input type="number" placeholder="Enter Area (hectare)" style={inputStyle} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Farm Location Coordinates(longitude)" name="farm_location_longitude">
                  <Input placeholder="Enter Longitude" style={inputStyle} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Farm Location Coordinates(latitude)" name="farm_location_laitude">
                  <Input placeholder="Enter Latitude" style={inputStyle} />
                </Form.Item>
              </Col>
              
                  <Col span={24}>
              <Row gutter={[12, 12]}>
                {additionalBananaDetails.map((bananaDetail, index) => (
                  <React.Fragment key={index}>
                    <Col span={24} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                      <Row gutter={11} style={{ width: '200%', justifyContent: 'center', alignItems: 'center' }}>
                        <Col span={10}>
                          <Form.Item  rules={[{ required: true }]} label="Banana Type" name={["additionalBanana", index, "banana_type"]}>
                            <Select placeholder="Select Banana Type" style={{ width: '100%' }}>
                              <Option value="Lakatan">Lakatan</Option>
                              <Option value="Latundan">Latundan</Option>
                              <Option value="Cardava">Cardava</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={11}>
                          <Form.Item rules={[{ required: true }]} label="Quantity" name={["additionalBanana", index, "quantity"]}>
                            <Input type="number" placeholder="Enter Quantity" style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        {additionalBananaDetails.length > 1 && (
                          <Col span={2} style={{ textAlign: "center"}}>
                            <Button type="primary" danger onClick={() => handleRemoveAdditionalBanana(index)}>
                              Remove
                            </Button>
                          </Col>
                        )}
                      </Row>
                    </Col>
                  </React.Fragment>
                ))}
                <Col span={24} style={{ display: "flex", justifyContent: "center" }}>
                  <Button
                    type="dashed"
                    onClick={handleAddAdditionalBanana}
                    style={{ width: "50%", marginBottom: "5px" }}
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
                  <Input placeholder="Enter Name of Buyer" style={inputStyle} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Market Outlet Location" name="Market Outlet Location">
                  <Input placeholder="Enter Market Outlet Location" style={inputStyle} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Association/Organization" name="Association/Organization">
                  <Input placeholder="Enter Association/Organization" style={inputStyle} />
                </Form.Item>
              </Col>
              <Col span={12} key="cropping_intensity">
                <Form.Item label="Cropping Intensity" name="cropping_intensity">
                  <Select placeholder="Select Cropping Intensity">
                    <Select.Option value="year_round">Year Round</Select.Option>
                    <Select.Option value="quarterly">Quarterly</Select.Option>
                    <Select.Option value="seasonal">Seasonal</Select.Option>
                    <Select.Option value="annually">Annually</Select.Option>
                    <Select.Option value="twice_a_month">Twice a Month</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Farm Address" name="farm_address">
                  <Input placeholder="Enter Farm Address" style={inputStyle} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Area (hectare)" name="area_hectare">
                  <Input type="number" placeholder="Enter Area (hectare)" style={inputStyle} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Farm Location Coordinates(longitude)" name="farm_location_longitude">
                  <Input placeholder="Enter Longitude" style={inputStyle} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Farm Location Coordinates(latitude)" name="farm_location_laitude">
                  <Input placeholder="Enter Latitude" style={inputStyle} />
                </Form.Item>
              </Col>

                    <Col span={24}>
            <Row gutter={[12, 12]}>
              {additionalVegetableDetails.map((vegetableDetail, index) => (
                <React.Fragment key={index}>
                  <Col span={24}>
                    <Row gutter={11} style={{ justifyContent: 'center', alignItems: 'center' }}>
                      <Col span={8}>
                        <Form.Item rules={[{ required: true }]} label="Vegetable Type" name={["additionalVegetable", index, "vegetable_type"]}>
                          <Select
                            placeholder="Select Vegetable Type"
                            style={{ width: '100%' }}
                            onChange={(value) => {
                              if (value === "Other Crop (specify)") {
                                setSelectedVegetable(index);
                              } else {
                                setSelectedVegetable(null);
                              }
                            }}
                          >
                            <Option value="Eggplant">Eggplant</Option>
                            <Option value="Ampalaya">Ampalaya</Option>
                            <Option value="Okra">Okra</Option>
                            <Option value="Pole Sitao">Pole Sitao</Option>
                            <Option value="Squash">Squash</Option>
                            <Option value="Tomato">Tomato</Option>
                            <Option value="Other Crop (specify)">Other Crop (specify)</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={7}>
                        <Form.Item rules={[{ required: true }]} label="Quantity" name={["additionalVegetable", index, "quantity"]}>
                          <Input type="number" placeholder="Enter Quantity" style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      {selectedVegetable === index && (
                        <Col span={7}>
                          <Form.Item label="Other Crop (specify)" name={["additionalVegetable", index, "other_vegetable"]}>
                            <Input placeholder="Specify Other Vegetable" style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                      )}
                      {additionalVegetableDetails.length > 1 && (
                        <Col span={2} style={{ textAlign: "center" }}>
                          <Button type="primary" danger onClick={() => handleRemoveAdditionalVegetable(index)}>
                            Remove
                          </Button>
                        </Col>
                      )}
                    </Row>
                  </Col>
                </React.Fragment>
              ))}
              <Col span={24} style={{ display: "flex", justifyContent: "center" }}>
                <Button
                  type="dashed"
                  onClick={handleAddAdditionalVegetable}
                  style={{ width: "50%", marginBottom: "5px" }}
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
                                <Select placeholder="Select Legume Type">
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
                                <Select placeholder="Select Month" name="month">
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
                                <Select placeholder="Select Banana Type">
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
                              <Input
                                placeholder="Enter Quantity"
                                type="number"
                                style={inputStyle}
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
                              />
                            </Form.Item>
                          </Col>
                        );
                        break;
                      case "Area (hectare)":
                        formItem = (
                          <Col span={12} key={field}>
                            <Form.Item
                              label="Area (hectare)"
                              type="number"
                              name="area_hectare"
                            >
                              <Input
                                placeholder="Enter Area (hectare)"
                                style={inputStyle}
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
                              <Select placeholder="Select Cropping Intensity">
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
                              <Select placeholder={`Select ${field}`}>
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
                              <Select placeholder={`Select ${field}`}>
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

          <Form.Item style={{ textAlign: "center", marginTop: "20px" }}>
            <Button
              type="primary"
              htmlType="submit"
              style={{
                backgroundColor: headerColor,
                borderRadius: "8px",
                padding: "8px 20px",
              }}
            >
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default AddData;
