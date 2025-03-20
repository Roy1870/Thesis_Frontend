import React, { useState } from "react";
import { Form, Input, Select, Button, Card, Row, Col, DatePicker, message } from "antd";
import { UserOutlined, PhoneOutlined } from "@ant-design/icons";
import axios from "axios";

const token = localStorage.getItem("authToken");

const { Option } = Select;

const AddData = () => {
  const [form] = Form.useForm();
  const [farmerType, setFarmerType] = useState(null);
  const [animals, setAnimals] = useState([{ animal_type: "", subcategory: "", quantity: "" }]);

  const handleSubmit = async (values) => {
    try {
      const response = await axios.post("http://localhost:8000/api/farmers/data", values, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        message.success("Data submitted successfully!");
        form.resetFields();
        setFarmerType(null);
        setAnimals([{ animal_type: "", subcategory: "", quantity: "" }]);
      } else {
        message.error("Failed to submit data.");
      }
    } catch (error) {
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
    setAnimals([...animals, { animal_type: "", subcategory: "", quantity: "" }]);
  };

  return (
    <div style={{ margin: "10px" }}>
      <h2 style={{ fontWeight: "bold", margin: 0, lineHeight: "1" }}>Add Data</h2>
      <div style={{ padding: "20px", backgroundColor: "#FFFFFF", maxHeight: "600px", overflowY: "auto" }}>
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
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item label="Name" name="name" rules={[{ required: true }]}>
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
                  <Input placeholder="Enter Facebook or Email" style={inputStyle} />
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
                <Form.Item label="Farm Address" name="farm_address">
                  <Input placeholder="Enter farm address" style={inputStyle} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item label="Farmer Type" name="farmer_type">
                  <Select
                    placeholder="Select Farmer Type"
                    onChange={(value) => setFarmerType(value)}
                    style={inputStyle}
                  >
                    <Option value="Raiser">Raiser</Option>
                    <Option value="Operator">Operator</Option>
                    <Option value="Grower">Grower</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Date" name="date">
                  <DatePicker style={{ width: "100%" }} />
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
              {animals.map((animal, index) => (
                <Row gutter={24} key={index}>
                  <Col span={8}>
                    <Form.Item label="Animal Type" name={`animal_type_${index}`}>
                      <Select
                        placeholder="Select Animal Type"
                        value={animal.animal_type}
                        onChange={(value) => {
                          const newAnimals = [...animals];
                          newAnimals[index].animal_type = value;
                          setAnimals(newAnimals);
                        }}
                        style={inputStyle}
                      >
                        <Option value="CATTLE">Cattle</Option>
                        <Option value="CARABAO">Carabao</Option>
                        <Option value="GOAT">Goat</Option>
                        <Option value="RABBIT">Rabbit</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Subcategory" name={`subcategory_${index}`}>
                      <Input
                        placeholder="Enter Subcategory"
                        value={animal.subcategory}
                        onChange={(e) => {
                          const newAnimals = [...animals];
                          newAnimals[index].subcategory = e.target.value;
                          setAnimals(newAnimals);
                        }}
                        style={inputStyle}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
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
                </Row>
              ))}
              <Button type="dashed" onClick={addAnimal} style={{ width: "100%", marginBottom: "20px" }}>
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
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item label="Fishpond Location" name="fishpond_location">
                    <Input placeholder="Enter Fishpond Location" style={inputStyle} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Geotagged Photo" name="geotagged_photo">
                    <Input placeholder="Enter Geotagged Photo URL" style={inputStyle} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item label="Cultured Species" name="cultured_species">
                    <Input placeholder="Enter Cultured Species" style={inputStyle} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Area (Hectares)" name="area">
                    <Input placeholder="Enter Area" type="number" style={inputStyle} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item label="Stocking Density" name="stocking_density">
                    <Input placeholder="Enter Stocking Density" style={inputStyle} />
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
                  <Form.Item label="Operational Status" name="operational_status">
                    <Select placeholder="Select Operational Status" style={inputStyle}>
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
                    <Input placeholder="Enter Crop Type" style={inputStyle} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Classification" name="classification">
                    <Input placeholder="Enter Classification" style={inputStyle} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item label="Area (Hectares)" name="area_hectares">
                    <Input placeholder="Enter Area in Hectares" type="number" style={inputStyle} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Production" name="production">
                    <Input placeholder="Enter Production" style={inputStyle} />
                  </Form.Item>
                </Col>
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