import React, { useState, useRef, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Row,
  Col,
  message,
} from "antd";
import { PhoneOutlined, UserOutlined } from "@ant-design/icons";

const { Option } = Select;

const RaiserFields = () => {
  const [selectedAnimal, setSelectedAnimal] = useState(null);

  // Define animals and their classifications
  const animals = ["CATTLE", "CARABAO", "GOAT", "RABBIT"];
  const classifications = {
    CATTLE: ["Carabull", "Caracow"],
    CARABAO: ["Carabull", "Caracow"],
    GOAT: ["Buck", "Doe", "Ram", "Ewe"],
    RABBIT: ["Sow", "Piglet", "Boar", "Fatteners", "Broiler", "Layer", "Free range", "Game fowl", "Fighting Cocks", "Drake", "Hen", "Cock", "Hen", "Gobbler", "Hen", "Buck", "Doe"],
  };

  return (
    <Row gutter={24}>
      <Col span={12}>
        <Form.Item label="Animal" name="animal">
          <Select
            placeholder="Select Animal"
            onChange={(value) => setSelectedAnimal(value)}
          >
            {animals.map((animal) => (
              <Option key={animal} value={animal}>
                {animal}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item label="Classification" name="classification">
          <Select placeholder="Select Classification" disabled={!selectedAnimal}>
            {selectedAnimal &&
              classifications[selectedAnimal].map((classification) => (
                <Option key={classification} value={classification}>
                  {classification}
                </Option>
              ))}
          </Select>
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item label="Quantity" name="quantity">
          <Input placeholder="Enter Quantity" type="number" />
        </Form.Item>
      </Col>
    </Row>
  );
};

const OperatorFields = () => (
  <Row gutter={24}>
    <Col span={12}>
      <Form.Item label="Crop Type" name="crop_type">
        <Input placeholder="Enter Crop Type" />
      </Form.Item>
    </Col>
    <Col span={12}>
      <Form.Item label="Variety/Clone" name="variety_clone">
        <Input placeholder="Enter Variety/Clone" />
      </Form.Item>
    </Col>
    <Col span={12}>
      <Form.Item label="Area (Hectare)" name="area_hectare">
        <Input placeholder="Enter Area in Hectare" type="number" />
      </Form.Item>
    </Col>
    <Col span={12}>
      <Form.Item label="Production Type" name="production_type">
        <Input placeholder="Enter Production Type" />
      </Form.Item>
    </Col>
    <Col span={12}>
      <Form.Item label="Production Data" name="production_data">
        <Input placeholder="Enter Production Data" />
      </Form.Item>
    </Col>
  </Row>
);

const GrowerFields = () => (
  <Row gutter={24}>
    <Col span={12}>
      <Form.Item label="Grower Specific Field 1" name="grower_field1">
        <Input placeholder="Enter Grower Specific Field 1" />
      </Form.Item>
    </Col>
    <Col span={12}>
      <Form.Item label="Grower Specific Field 2" name="grower_field2">
        <Input placeholder="Enter Grower Specific Field 2" />
      </Form.Item>
    </Col>
  </Row>
);

const DataEntry = () => {
  const [form] = Form.useForm();
  const [farmerType, setFarmerType] = useState(null);
  const scrollRef = useRef(null);

  const handleSubmit = async (values) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/dataEntry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success("Data submitted successfully!");
        form.resetFields();
        setFarmerType(null);
      } else {
        const errorData = await response.json();
        message.error(`Error: ${errorData.message}`);
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

  const handleFarmerTypeChange = (value) => {
    setFarmerType(value);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [farmerType]);

  return (
    <div style={{ margin: "10px" }}>
      <h2 style={{ fontWeight: "bold", margin: 0, lineHeight: "1" }}>Data Entry</h2>
      <div style={{ padding: "20px", backgroundColor: "#FFFFFF" }}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div style={{ maxHeight: "500px", overflowY: "auto", overflowX: "hidden" }}>
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
              {/* Common Fields */}
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    label="Name"
                    name="name"
                    rules={[{ required: true, message: "Please enter name" }]}
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
                  <Form.Item label="Farm Location Longitude" name="farm_longitude">
                    <Input placeholder="Enter longitude" style={inputStyle} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Farm Location Latitude" name="farm_latitude">
                    <Input placeholder="Enter latitude" style={inputStyle} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item label="Market Outlet Location" name="market_outlet">
                    <Input placeholder="Enter market outlet location" style={inputStyle} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Buyer Name" name="buyer_name">
                    <Input placeholder="Enter buyer name" style={inputStyle} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item label="Association/Organization" name="association">
                    <Input placeholder="Enter association/organization" style={inputStyle} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Farmer Type" name="farmer_type">
                    <Select
                      placeholder="Select Farmer Type"
                      onChange={handleFarmerTypeChange}
                      style={inputStyle}
                    >
                      <Option value="Raiser">Raiser</Option>
                      <Option value="Operator">Operator</Option>
                      <Option value="Grower">Grower</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              {/* Conditionally Render Specific Fields */}
              <div
                ref={scrollRef}
                style={{
                  borderTop: `1px solid ${borderColor}`,
                  paddingTop: "10px",
                  marginTop: "10px",
                }}
              >
                {farmerType === "Raiser" && <RaiserFields />}
                {farmerType === "Operator" && <OperatorFields />}
                {farmerType === "Grower" && <GrowerFields />}
              </div>
            </Card>

            {/* Submit Button */}
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
          </div>
        </Form>
      </div>
    </div>
  );
};

export default DataEntry;