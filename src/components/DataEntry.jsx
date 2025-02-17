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
  const [breeds, setBreeds] = useState([]);

  const animals = [
    "Carabao",
    "Cattle",
    "Swine",
    "Goat",
    "Chicken",
    "Sheep",
    "Turkey",
    "Geese",
    "Duck",
    "Horse",
  ];

  const animalBreeds = {
    Carabao: ["Carabull", "Caracow"],
    Cattle: ["Bull", "Cow"],
    Swine: ["Boar", "Sow", "Fattener", "Piglet"],
    Goat: ["Buck", "Doe"],
    Chicken: ["Broiler", "Fighting Cocks", "Native", "Layer"],
    Sheep: ["Ram", "Ewe"],
    Turkey: ["None"],
    Geese: ["None"],
    Duck: ["None"],
    Horse: ["None"],
  };

  const handleAnimalChange = (value) => {
    setBreeds(animalBreeds[value] || []);
    form.setFieldsValue({ kind_of_animal: undefined }); // Reset breed field when the animal changes
  };

  const handleSubmit = async (values) => {
    console.log("Form submitted with values: ", values);
    message.success("Form submitted successfully!");
    form.resetFields();
  };

  // Updated color palette
  const headerColor = "#6A9C89";
  const lighterShade = "#E6F5E4";
  const borderColor = "#CBD5E0";

  return (
    <div style={{ margin: "10px" }}>
      <h2
        style={{
          fontWeight: "bold",
          margin: 0,
          lineHeight: "1",
        }}
      >
        Data Entry
      </h2>

      <div style={{ padding: "20px", backgroundColor: "#FFFFFF" }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ quantity: 1 }}
        >
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
                  rules={[
                    { required: true, message: "Please enter your first name" },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined style={{ color: headerColor }} />}
                    placeholder="Enter first name"
                    style={{
                      borderRadius: "6px",
                      border: `1px solid ${borderColor}`,
                      padding: "8px",
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Last Name"
                  name="last_name"
                  rules={[
                    { required: true, message: "Please enter your last name" },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined style={{ color: headerColor }} />}
                    placeholder="Enter last name"
                    style={{
                      borderRadius: "6px",
                      border: `1px solid ${borderColor}`,
                      padding: "8px",
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              label="Contact"
              name="contact"
              rules={[
                {
                  required: true,
                  message: "Please enter your contact number",
                },
              ]}
            >
              <Input
                prefix={<PhoneOutlined style={{ color: headerColor }} />}
                placeholder="Enter contact number"
                style={{
                  borderRadius: "6px",
                  border: `1px solid ${borderColor}`,
                  padding: "8px",
                }}
              />
            </Form.Item>
            <Form.Item
              label="Barangay Name"
              name="barangay_name"
              rules={[
                { required: true, message: "Please enter your barangay name" },
              ]}
            >
              <Select
                showSearch
                placeholder="Select or type barangay name"
                filterOption={(input, option) =>
                  option?.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {[
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
                ].map((barangay) => (
                  <Option key={barangay} value={barangay}>
                    {barangay}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Card>

          {/* Animal Information */}
          <Card
            title="Animal Information"
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
                <Form.Item
                  label="Kind of Animal"
                  name="animal_name"
                  rules={[
                    { required: true, message: "Please select an animal" },
                  ]}
                >
                  <Select
                    showSearch
                    placeholder="Select or type animal"
                    filterOption={(input, option) =>
                      option?.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    onChange={handleAnimalChange}
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
                <Form.Item
                  label="Breed of Animal"
                  name="kind_of_animal"
                  rules={[{ required: true, message: "Please select a breed" }]}
                >
                  <Select
                    placeholder="Select breed"
                    disabled={breeds.length === 0}
                  >
                    {breeds.map((breed) => (
                      <Option key={breed} value={breed}>
                        {breed}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label="Quantity"
                  name="quantity"
                  rules={[
                    { required: true, message: "Please enter the quantity" },
                  ]}
                >
                  <InputNumber
                    placeholder="Enter quantity"
                    min={1}
                    style={{
                      width: "100%",
                      borderRadius: "6px",
                      border: `1px solid ${borderColor}`,
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Category"
                  name="category"
                  rules={[
                    { required: true, message: "Please select a category" },
                  ]}
                >
                  <Select
                    placeholder="Select category"
                    style={{
                      borderRadius: "6px",
                      border: `1px solid ${borderColor}`,
                      height: "40px",
                    }}
                  >
                    <Option value="commercial">Commercial</Option>
                    <Option value="backyard">Backyard</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              label="Year"
              name="year"
              rules={[{ required: true, message: "Please enter a year" }]}
            >
              <Input
                placeholder="Enter year"
                style={{
                  borderRadius: "6px",
                  border: `1px solid ${borderColor}`,
                  padding: "8px",
                }}
              />
            </Form.Item>
          </Card>

          {/* Submit Button */}
          <Form.Item style={{ textAlign: "center", marginTop: "20px" }}>
            <Button
              type="primary"
              htmlType="submit"
              style={{
                backgroundColor: headerColor,
                borderColor: "#2F855A",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "16px",
                fontWeight: "bold",
                color: "#fff",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
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
