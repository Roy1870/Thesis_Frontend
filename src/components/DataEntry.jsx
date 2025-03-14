import React, { useState } from "react";
import {
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Card,
  Row,
  Col,
  message,
} from "antd";
import { PhoneOutlined, UserOutlined } from "@ant-design/icons";

const { Option } = Select;

const DataEntry = () => {
  const [form] = Form.useForm();
  const [farmerType, setFarmerType] = useState(null);

  const handleSubmit = async (values) => {
    try {
      const farmerData = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        contact: values.contact,
        home_address: values.home_address,
        farm_address: values.farm_address,
      };

      console.log("Farmer Data:", farmerData); // Debugging log

      const farmerResponse = await fetch("http://localhost:8000/api/farmers/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(farmerData),
      });

      if (!farmerResponse.ok) {
        const errorData = await farmerResponse.json();
        console.error("Farmer Response Error:", errorData); // Log the error
        message.error(`Error submitting farmer data: ${errorData.message}`);
        return;
      }

      if (farmerType) {
        let apiUrl = "";
        let specificData = {};

        switch (farmerType) {
          case "grower":
            apiUrl = "http://localhost:8000/api/growers/data";
            specificData = {
              crop_name: values.crop_name,
              area: values.area,
              yield: values.yield,
              season: values.season,
              market_outlet: values.market_outlet,
              buyer: values.buyer,
              association: values.association,
            };
            break;
          case "raiser":
            apiUrl = "http://localhost:8000/api/raisers/data";
            specificData = {
              species: values.species,
              remarks: values.remarks,
            };
            break;
          case "operator":
            apiUrl = "http://localhost:8000/api/operators/data";
            specificData = {
              fishpond_location: values.fishpond_location,
              cultured_species: values.cultured_species,
              productive_area: values.productive_area,
              stocking_density: values.stocking_density,
              production: values.production,
              harvest_date: values.harvest_date,
              month: values.month,
              year: values.year,
            };
            break;
          default:
            message.error("Please select a farmer type.");
            return;
        }

        console.log("Specific Data:", specificData); // Debugging log

        const specificResponse = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(specificData),
        });

        if (specificResponse.ok) {
          message.success("Data submitted successfully!");
          form.resetFields();
          setFarmerType(null);
        } else {
          const errorData = await specificResponse.json();
          console.error("Specific Response Error:", errorData); // Log the error
          message.error(`Error submitting specific data: ${errorData.message}`);
        }
      }
    } catch (error) {
      console.error("Submission Error:", error); // Log the error
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

  return (
    <div style={{ margin: "10px" }}>
      <h2 style={{ fontWeight: "bold", margin: 0, lineHeight: "1" }}>
        Data Entry
      </h2>

      <div style={{ padding: "20px", backgroundColor: "#FFFFFF" }}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Farmer Information */}
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
                <Form.Item
                  label="First Name"
                  name="first_name"
                  rules={[{ required: true, message: "Please enter first name" }]}
                >
                  <Input
                    prefix={<UserOutlined style={{ color: headerColor }} />}
                    placeholder="Enter first name"
                    style={inputStyle}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Last Name"
                  name="last_name"
                  rules={[{ required: true, message: "Please enter last name" }]}
                >
                  <Input
                    prefix={<UserOutlined style={{ color: headerColor }} />}
                    placeholder="Enter last name"
                    style={inputStyle}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: "Please enter email" }]}
            >
              <Input type="email" placeholder="Enter email" style={inputStyle} />
            </Form.Item>

            <Form.Item
              label="Contact"
              name="contact"
              rules={[{ required: true, message: "Please enter contact number" }]}
            >
              <Input
                prefix={<PhoneOutlined style={{ color: headerColor }} />}
                placeholder="Enter contact number"
                style={inputStyle}
              />
            </Form.Item>

            <Form.Item
              label="Home Address"
              name="home_address"
              rules={[{ required: true, message: "Please enter home address" }]}
            >
              <Input placeholder="Enter home address" style={inputStyle} />
            </Form.Item>

            <Form.Item
              label="Farm Address"
              name="farm_address"
              rules={[{ required: true, message: "Please enter farm address" }]}
            >
              <Input placeholder="Enter farm address" style={inputStyle} />
            </Form.Item>

            {/* Farmer Type Selection */}
            <Form.Item
              label="Select Farmer Type"
              style={{ width: "100%", marginBottom: "0" }}
            >
              <Select
                placeholder="Select Farmer Type"
                onChange={setFarmerType}
                style={{ ...inputStyle, height: "40px" }}
              >
                <Option value="grower">Grower</Option>
                <Option value="raiser">Raiser</Option>
                <Option value="operator">Operator</Option>
              </Select>
            </Form.Item>
          </Card>

          {/* Show data entry fields ONLY when a farmer type is selected */}
          {farmerType && (
            <>
              {farmerType === "grower" && (
                <Card
                  title="Grower Information"
                  style={{
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
                  <Form.Item label="Crop Name" name="crop_name">
                    <Input placeholder="Enter crop name" style={inputStyle} />
                  </Form.Item>

                  <Row gutter={24}>
                    <Col span={12}>
                      <Form.Item label="Area (ha)" name="area">
                        <InputNumber min={0} placeholder="Enter area" style={inputStyle} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Yield (kg)" name="yield">
                        <InputNumber min={0} placeholder="Enter yield" style={inputStyle} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={24}>
                    <Col span={12}>
                      <Form.Item label="Season" name="season">
                        <Input placeholder="Enter season" style={inputStyle} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Market Outlet" name="market_outlet">
                        <Input placeholder="Enter market outlet" style={inputStyle} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item label="Buyer" name="buyer">
                    <Input placeholder="Enter buyer" style={inputStyle} />
                  </Form.Item>

                  <Form.Item label="Association" name="association">
                    <Input placeholder="Enter association" style={inputStyle} />
                  </Form.Item>
                </Card>
              )}

              {farmerType === "operator" && (
                <Card
                  title="Operator Information"
                  style={{
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
                        <Input placeholder="Enter fishpond location" style={inputStyle} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Cultured Species" name="cultured_species">
                        <Input placeholder="Enter cultured species" style={inputStyle} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={24}>
                    <Col span={12}>
                      <Form.Item label="Productive Area (ha)" name="productive_area">
                        <InputNumber min={0} placeholder="Enter productive area" style={inputStyle} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Stocking Density" name="stocking_density">
                        <InputNumber min={0} placeholder="Enter stocking density" style={inputStyle} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={24}>
                    <Col span={12}>
                      <Form.Item label="Production (kg)" name="production">
                        <InputNumber min={0} placeholder="Enter production" style={inputStyle} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Harvest Date" name="harvest_date">
                        <Input type="date" style={inputStyle} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={24}>
                    <Col span={12}>
                      <Form.Item label="Month" name="month">
                        <Input placeholder="Enter month" style={inputStyle} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Year" name="year">
                        <InputNumber min={2000} placeholder="Enter year" style={inputStyle} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              )}

              {farmerType === "raiser" && (
                <Card
                  title="Raiser Information"
                  style={{
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
                  <Form.Item label="Species" name="species">
                    <Input placeholder="Enter species" style={inputStyle} />
                  </Form.Item>
                  <Form.Item label="Remarks" name="remarks">
                    <Input.TextArea placeholder="Enter remarks" style={inputStyle} />
                  </Form.Item>
                </Card>
              )}
            </>
          )}

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
        </Form>
      </div>
    </div>
  );
};

export default DataEntry;