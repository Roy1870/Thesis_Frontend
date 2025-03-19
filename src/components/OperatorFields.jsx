import React from "react";
import { Form, Input, Row, Col } from "antd";

const OperatorFields = () => {
  return (
    <Row gutter={[16, 16]} style={{ flexWrap: "wrap" }}>
      <Col xs={24} sm={12} md={12} lg={12} xl={12}>
        <Form.Item label="fishpond_location" name="fishpond_location" style={{ width: "100%" }}>
          <Input placeholder="Enter fishpond location" style={{ width: "100%" }} />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12} md={12} lg={12} xl={12}>
        <Form.Item label="geotagged_photo_url" name="geotagged_photo_url" style={{ width: "100%" }}>
          <Input placeholder="Enter geotagged photo URL" style={{ width: "100%" }} />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={12} lg={12} xl={12}>
        <Form.Item label="cultured_species" name="cultured_species" style={{ width: "100%" }}>
          <Input placeholder="Enter cultured species" style={{ width: "100%" }} />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12} md={12} lg={12} xl={12}>
        <Form.Item label="productive_area_sqm" name="productive_area_sqm" style={{ width: "100%" }}>
          <Input placeholder="Enter productive area (sqm)" style={{ width: "100%" }} />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={12} lg={12} xl={12}>
        <Form.Item label="stocking_density" name="stocking_density" style={{ width: "100%" }}>
          <Input placeholder="Enter stocking density" style={{ width: "100%" }} />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12} md={12} lg={12} xl={12}>
        <Form.Item label="date_of_stocking" name="date_of_stocking" style={{ width: "100%" }}>
          <Input placeholder="Enter date of stocking" style={{ width: "100%" }} />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={12} lg={12} xl={12}>
        <Form.Item label="production_kg" name="production_kg" style={{ width: "100%" }}>
          <Input placeholder="Enter production (kg)" style={{ width: "100%" }} />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12} md={12} lg={12} xl={12}>
        <Form.Item label="date_of_harvest" name="date_of_harvest" style={{ width: "100%" }}>
          <Input placeholder="Enter date of harvest" style={{ width: "100%" }} />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={12} lg={12} xl={12}>
        <Form.Item label="operational_status" name="operational_status" style={{ width: "100%" }}>
          <Input placeholder="Enter operational status" style={{ width: "100%" }} />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12} md={12} lg={12} xl={12}>
        <Form.Item label="Operator Specific Field 1" name="operator_field1" style={{ width: "100%" }}>
          <Input placeholder="Enter Operator Specific Field 1" style={{ width: "100%" }} />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={12} lg={12} xl={12}>
        <Form.Item label="Operator Specific Field 2" name="operator_field2" style={{ width: "100%" }}>
          <Input placeholder="Enter Operator Specific Field 2" style={{ width: "100%" }} />
        </Form.Item>
      </Col>
    </Row>
  );
};

export default OperatorFields;