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
  const [additionalRiceDetails, setAdditionalRiceDetails] = useState([{ areaType: '', seedType: '', production: '' }]);


  const cropConfigurations = {
   
    Spices: [
      "Name of Buyer",
      "Market Outlet Location",
      "Association/Organization",
      "Cropping Intensity",
      "Farm Address",
      "Area (hectare)",
      "Farm Location Coordinates(longitude)",
      "Farm Location Coordinates(latitude)",
      "Spice Type",
      "Quantity",
    ],
    Legumes: [
      "Name of Buyer",
      "Market Outlet Location",
      "Legume Type",
      "Quantity",
      "Association/Organization",
      "Cropping Intensity",
      "Farm Address",
      "Area (hectare)",
      "Farm Location Coordinates(longitude)",
      "Farm Location Coordinates(latitude)",
    ],
    Vegetable: [
      "Name of Buyer",
      "Market Outlet Location",
      "Vegetable Type",
      "Quantity",
      "Association/Organization",
      "Cropping Intensity",
      "Farm Address",
      "Area (hectare)",
      "Farm Location Coordinates(longitude)",
      "Farm Location Coordinates(latitude)",
      "Other Vegetable",
    ],
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
      "Longitude",
      "Latitude",
    ],
    Banana: [
      "Name of Buyer",
      "Market Outlet Location",
      "Banana Type",
      "Quantity",
      "Farm Address",
      "Association/Organization",
      "Cropping Intensity",
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
    setAdditionalRiceDetails([...additionalRiceDetails, { areaType: '', seedType: '', production: '' }]);
  };

  const handleRemoveAdditionalRice = (index) => {
    const newAdditionalRiceDetails = [...additionalRiceDetails];
    newAdditionalRiceDetails.splice(index, 1);
    setAdditionalRiceDetails(newAdditionalRiceDetails);
  };
  const handleSubmit = async (values) => {
    try {
      // Construct base JSON structure
      const formattedData = {
        farmer: {
          name: values.name,
          home_address: values.home_address,
          contact_number: values.contact_number,
          facebook_email: values.facebook_email,
          farm_address: values.farm_address,
          farm_location_latitude: values.farm_location_latitude,
          farm_location_longitude: values.farm_location_longitude,
          market_outlet_location: values.market_outlet_location,
          buyer_name: values.buyer_name,
          association_organization: values.association_organization,
          barangay: values.barangay,
        },
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
            production_type: values.production_type,
            production_data: JSON.stringify(productionData), // Convert to JSON
          },
        ];
      }

      // Conditionally add rice if "Rice" is selected
      if (values.crop_type === "Rice") {
        formattedData.rice = [
          {
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
          },
        ];
      }

      // Debugging: Print formatted JSON
      console.log(
        "Formatted JSON Data:",
        JSON.stringify(formattedData, null, 2)
      );

      // Send data to API
      const response = await axios.post(
        "http://localhost:8000/api/growers",
        formattedData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Handle response
      if (response.status === 200) {
        message.success("Data submitted successfully!");
        form.resetFields();
        setFarmerType(null);
        setAnimals([{ animal_type: "", subcategory: "", quantity: "" }]);
        setSelectedCrop(null); // Reset selected crop
        setSelectedVegetable(null); // Reset selected vegetable
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
                <Form.Item label="Contact Number" name="contact_number">
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
                <Form.Item label="Facebook/Email" name="facebook_email">
                  <Input
                    placeholder="Enter Facebook or Email"
                    style={inputStyle}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Barangay" name="barangay">
                  <Select
                    placeholder="Select a Barangay"
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
            </Row>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item label="Home Address" name="home_address">
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
                    <Form.Item label="Quantity" name={`quantity_${index}`}>
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
                
            
                <Col span={12}>
                  <Form.Item label="Average Yield (mt/ha)" name="ave_yield">
                    <Input
                      placeholder="Enter Average Yield (mt/ha)"
                      style={inputStyle}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Area Harvested " name="area_harvested">
                    <Input
                      placeholder="Enter Area Harvested "
                      style={inputStyle}
                    />
                  </Form.Item>
                </Col>
                {/* Removed Raiser Details section */}
                <Col span={24}>
                  {additionalRiceDetails.map((riceDetail, index) => (
                    <Row gutter={12} key={index} style={{ marginBottom: '10px' }}>
                      <Col span={8}>
                        <Form.Item
                          label="Area Type"
                          name={`additionalRice[${index}].areaType`}
                         
                        >
                          <Select placeholder="Select Area Type">
                            <Option value="Irrigated">Irrigated</Option>
                            <Option value="Rainfed">Rainfed</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          label="Seed Type"
                          name={`additionalRice[${index}].seedType`}
                        >
                          <Select placeholder="Select Seed Type">
                            <Option value="Hybrid Seeds">Hybrid Seeds</Option>
                            <Option value="Certified Seeds">Certified Seeds</Option>
                            <Option value="Good Seeds">Good Seeds</Option>
                            {/* Add more seed types as needed */}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          label="Production"
                          name={`additionalRice[${index}].production`}
                          
                        >
                          <Input type="number" placeholder="Enter Production" style={inputStyle} />
                        </Form.Item>
                      </Col>
                      {additionalRiceDetails.length > 1 && (
                        <Col span={2} style={{ textAlign: 'right', marginTop: '30px' }}>
                          <Button type="primary" danger onClick={() => handleRemoveAdditionalRice(index)}>
                            
                            Remove
                          </Button>
                        </Col>
                      )}
                    </Row>
                  ))}
                  <Button type="dashed" onClick={handleAddAdditionalRice} style={{ width: '100%', marginTop: '10px' }}>
                    ADD ANOTHER RICE
                  </Button>
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
                      case "Spice Type":
                        if (selectedCrop === "Spices") {
                          formItem = (
                            <Col span={12} key={field}>
                              <Form.Item label="Spice Type" name="spice_type">
                                <Select placeholder="Select Spice Type">
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
                          );
                        }
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
                              <Form.Item label="Cacao" name="month">
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
                              <Select.Option value="year_round">Year Round</Select.Option>
                              <Select.Option value="quarterly">Quarterly</Select.Option>
                              <Select.Option value="seasonal">Seasonal</Select.Option>
                              <Select.Option value="annually">Annually</Select.Option>
                              <Select.Option value="twice_a_month">Twice a Month</Select.Option>
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
