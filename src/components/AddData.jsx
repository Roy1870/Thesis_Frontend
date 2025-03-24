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

  const cropConfigurations = {
    Rice: [
      "Area Type",
      "Seed Type",
      "Area Harvested",
      "Production",
      "Average Yield (mt/ha)",
    ],
    Spices: [
      "Name of Buyer",
      "Spice Type",
      "Quantity",
      "Association/Organization",
      "Production Type",
      "Area (hectare)",
      "Farm Location Coordinates(longitude)",
      "Farm Location Coordinates(latitude)",
    ],
    Legumes: [
      "Name of Buyer",
      "Legume Type",
      "Quantity",
      "Association/Organization",
      "Production Type",
      "Area (hectare)",
      "Farm Location Coordinates(longitude)",
      "Farm Location Coordinates(latitude)",
    ],
    Vegetable: [
      "Name of Buyer",
      "Vegetable Type",
      "Quantity",
      "Association/Organization",
      "Production Type",
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
      "Association/Organization",
      "Production Type",
      "Variety Clone",
      "Area (hectare)",
      "Longitude",
      "Latitude",
    ],
    Banana: [
      "Name of Buyer",
      "Banana Type",
      "Quantity",
      "Association/Organization",
      "Production Type",
      "Area (hectare)",
      "Farm Location Coordinates(longitude)",
      "Farm Location Coordinates(latitude)",
    ],
  };

  const handleSubmit = async (values) => {
    try {
      // Construct base JSON structure
      const formattedData = {
        farmer: {
          name: values.name,
          address: values.address,
          contact_number: values.contact_number,
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
    <div style={{ margin: "10px" }}>
      <h2 style={{ fontWeight: "bold", margin: 0, lineHeight: "1" }}>
        Add Data
      </h2>
      <div
        style={{
          padding: "20px",
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
                  <Input placeholder="Enter barangay" style={inputStyle} />
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
                <Form.Item label="Date" name="date">
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
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
              title=""
              style={{
                marginBottom: "20px",
                borderRadius: "8px",
                backgroundColor: lighterShade,
                border: `1px solid ${borderColor}`,
              }}
              headStyle={{}}
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
                {selectedCrop &&
                  cropConfigurations[selectedCrop] &&
                  cropConfigurations[selectedCrop].map((field) => {
                    let formItem;
                    switch (field) {
                      case "Name of Buyer":
                        formItem = (
                          <Col span={12} key={field}>
                            <Form.Item
                              label="Name of Buyer"
                              name="name_of_buyer"
                            >
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
                      case "Production Type":
                        formItem = (
                          <Col span={12} key={field}>
                            <Form.Item
                              label="Production Type"
                              name="production_type"
                            >
                              <Input
                                placeholder="Enter Area (hectare)"
                                style={inputStyle}
                              />
                            </Form.Item>
                          </Col>
                        );
                        break;
                      case "Farm Location Coordinates(longitude)":
                        formItem = (
                          <Col span={12} key={field}>
                            <Form.Item
                              label="Farm Location Coordinates(longitude)"
                              name="farm_location_coordinates_longitude"
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
                              name="farm_location_coordinates_latitude"
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
