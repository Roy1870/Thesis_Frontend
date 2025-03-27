"use client";

import { useState, useEffect } from "react";
import { Modal, Form, Input } from "antd";

const EditFarmerModal = ({ visible, onCancel, farmer, onUpdate }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (farmer) {
      form.setFieldsValue({
        name: farmer.name,
        farm_size: farmer.farm_size,
        location: farmer.location,
      });
    }
  }, [farmer, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await onUpdate(values);
      setLoading(false);
      onCancel();
    } catch (errorInfo) {
      console.log("Failed:", errorInfo);
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Edit Farmer"
      visible={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical" name="edit_farmer_form">
        <Form.Item
          name="name"
          label="Name"
          rules={[
            {
              required: true,
              message: "Please input the farmer's name!",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="farm_size"
          label="Farm Size"
          rules={[
            {
              required: true,
              message: "Please input the farm size!",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="location"
          label="Location"
          rules={[
            {
              required: true,
              message: "Please input the location!",
            },
          ]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditFarmerModal;
