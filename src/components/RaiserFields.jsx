import React, { useState } from "react";
import { Form, Input, Select, Row, Col, Button } from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";

const { Option } = Select;

const classificationOptions = {
  CATTLE: ["Carabull", "Caracow"],
  CARABAO: ["Carabull", "Caracow"],
  GOAT: ["Buck", "Doe"],
  SHEEP: ["Ram", "Ewe"],
  SWINE: ["Sow", "Piglet", "Boar", "Fatteners"],
  CHICKEN: ["Broiler", "Layer", "Free range", "Game fowl", "Fighting Cocks"],
  DUCK: ["Drake", "Hen"],
  QUAIL: ["Cock", "Hen"],
  TURKEY: ["Gobbler", "Hen"],
  RABBIT: ["Buck", "Doe"],
};

const RaiserFields = () => {
  const [animalEntries, setAnimalEntries] = useState([{ id: Date.now(), animalType: null, classification: null, quantity: null }]);

  const addAnimalEntry = () => {
    setAnimalEntries([...animalEntries, { id: Date.now(), animalType: null, classification: null, quantity: null }]);
  };

  const removeAnimalEntry = (id) => {
    setAnimalEntries(animalEntries.filter((entry) => entry.id !== id));
  };

  return (
    <div style={{ overflow: 'hidden' }}> {/* Prevent scrollbar */}
      {animalEntries.map((entry, index) => (
        <Row gutter={16} key={entry.id} align="middle" style={{ marginBottom: '10px' }}> {/* Adjust spacing */}
          {/* Animal Type Field */}
          <Col span={6}>
            <Form.Item label="Animal Type" name={["animals", index, "animal_type"]}>
              <Select
                placeholder="Select Animal Type"
                onChange={(value) => {
                  const updatedEntries = [...animalEntries];
                  updatedEntries[index].animalType = value;
                  setAnimalEntries(updatedEntries);
                }}
              >
                {Object.keys(classificationOptions).map((type) => (
                  <Option key={type} value={type}>
                    {type.charAt(0) + type.slice(1).toLowerCase()}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Classification Field */}
          <Col span={6}>
            <Form.Item label="Classification" name={["animals", index, "classification"]}>
              <Select placeholder="Select Classification" disabled={!entry.animalType}>
                {entry.animalType &&
                  classificationOptions[entry.animalType].map((option) => (
                    <Option key={option} value={option}>
                      {option}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Quantity Field */}
          <Col span={6}>
            <Form.Item
              label="Quantity"
              name={["animals", index, "quantity"]}
              rules={[{ required: true, message: "Please enter quantity" }]}
            >
              <Input type="number" placeholder="Enter quantity" min={1} onChange={(e) => {
                const updatedEntries = [...animalEntries];
                updatedEntries[index].quantity = e.target.value;
                setAnimalEntries(updatedEntries);
              }} />
            </Form.Item>
          </Col>

          {/* Remove Button */}
          <Col span={4}>
            <Button type="danger" onClick={() => removeAnimalEntry(entry.id)} icon={<MinusCircleOutlined />} />
          </Col>
        </Row>
      ))}

      {/* Add More Button */}
      <Row>
        <Col span={24}>
          <Button type="dashed" onClick={addAnimalEntry} icon={<PlusOutlined />} style={{ marginTop: "10px" }}> Add Another Animal </Button>
        </Col>
      </Row>
    </div>
  );
};

export default RaiserFields;