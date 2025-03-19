import React from "react";
import { Form, Input, Row, Col } from "antd";

const GrowerFields = () => {
  return (
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
};

export default GrowerFields;