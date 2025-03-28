"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Card,
  Table,
  Popconfirm,
  Empty,
  Space,
  Modal,
  Form,
  Select,
  InputNumber,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { farmerAPI } from "./services/api";

const { Option } = Select;

const RiceTab = ({ farmerId, farmerData, colors, onDataChange }) => {
  const [riceForm] = Form.useForm();
  const [isRiceModalVisible, setIsRiceModalVisible] = useState(false);
  const [isEditingRice, setIsEditingRice] = useState(false);
  const [currentRice, setCurrentRice] = useState(null);
  const [riceModalLoading, setRiceModalLoading] = useState(false);
  const [rice, setRice] = useState([]);

  useEffect(() => {
    if (farmerData?.rice) {
      setRice(farmerData.rice);
    }
  }, [farmerData]);

  // Rice Modal Functions
  const showAddRiceModal = () => {
    setIsEditingRice(false);
    setCurrentRice(null);
    riceForm.resetFields();
    setIsRiceModalVisible(true);
  };

  const showEditRiceModal = (rice) => {
    setIsEditingRice(true);
    setCurrentRice(rice);

    riceForm.setFieldsValue({
      area_type: rice.area_type,
      seed_type: rice.seed_type,
      area_harvested: rice.area_harvested,
      production: rice.production,
      ave_yield: rice.ave_yield,
    });

    setIsRiceModalVisible(true);
  };

  const handleRiceModalCancel = () => {
    setIsRiceModalVisible(false);
    riceForm.resetFields();
  };

  const handleRiceModalSubmit = async () => {
    try {
      const values = await riceForm.validateFields();
      setRiceModalLoading(true);

      // Create the rice object
      const riceObject = {
        area_type: values.area_type,
        seed_type: values.seed_type,
        area_harvested: values.area_harvested,
        production: values.production,
        ave_yield: values.ave_yield,
      };

      console.log("Submitting rice data:", riceObject);

      if (isEditingRice && currentRice) {
        // Update existing rice
        await farmerAPI.updateFarmer(farmerId, {
          name: farmerData.name,
          home_address: farmerData.home_address || "",
          contact_number: farmerData.contact_number || "",
          facebook_email: farmerData.facebook_email || "",
          barangay: farmerData.barangay || "",
          farm_address: farmerData.farm_address || "",
          farm_location_longitude: farmerData.farm_location_longitude || "",
          farm_location_latitude: farmerData.farm_location_latitude || "",
          market_outlet_location: farmerData.market_outlet_location || "",
          buyer_name: farmerData.buyer_name || "",
          association_organization: farmerData.association_organization || "",
          rice: [riceObject],
        });
        message.success("Rice data updated successfully.");
      } else {
        // Add new rice
        await farmerAPI.addRice(farmerId, {
          rice: [riceObject],
        });
        message.success("Rice data added successfully.");
      }

      // Refresh farmer data without showing loading
      const response = await farmerAPI.getFarmerById(farmerId);
      setRice(response.rice || []);

      // Notify parent component to refresh data
      if (onDataChange) {
        onDataChange();
      }

      setRiceModalLoading(false);
      setIsRiceModalVisible(false);
      riceForm.resetFields();
    } catch (error) {
      console.error("Error submitting rice form:", error);
      message.error(
        `Failed to ${isEditingRice ? "update" : "add"} rice data. ${
          error.message
        }`
      );
      setRiceModalLoading(false);
    }
  };

  const handleDeleteRice = async (riceId) => {
    try {
      await farmerAPI.deleteRice(riceId);
      message.success("Rice entry deleted successfully.");

      // Refresh farmer data without showing loading
      const response = await farmerAPI.getFarmerById(farmerId);
      setRice(response.rice || []);

      // Notify parent component to refresh data
      if (onDataChange) {
        onDataChange();
      }
    } catch (error) {
      message.error(`Failed to delete rice entry. ${error.message}`);
    }
  };

  const riceColumns = [
    {
      title: "Area Type",
      dataIndex: "area_type",
      key: "area_type",
    },
    {
      title: "Seed Type",
      dataIndex: "seed_type",
      key: "seed_type",
    },
    {
      title: "Area Harvested",
      dataIndex: "area_harvested",
      key: "area_harvested",
    },
    {
      title: "Production",
      dataIndex: "production",
      key: "production",
    },
    {
      title: "Average Yield",
      dataIndex: "ave_yield",
      key: "ave_yield",
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => showEditRiceModal(record)}
            className="action-button"
            style={{ color: colors.warning }}
          />
          <Popconfirm
            title="Delete this rice entry?"
            description="This action cannot be undone."
            onConfirm={() => handleDeleteRice(record.rice_id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{
              style: {
                backgroundColor: colors.error,
                borderColor: colors.error,
              },
            }}
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              danger
              className="action-button"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const hasRice = rice && rice.length > 0;

  return (
    <>
      <Card
        title={
          <div className="flex items-center">
            <InfoCircleOutlined className="mr-2 text-green-600" />
            <span className="text-base font-medium">Rice Information</span>
          </div>
        }
        extra={
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={showAddRiceModal}
            style={{
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            }}
          >
            Add Rice
          </Button>
        }
        bordered={false}
        className="rounded-lg shadow-sm mt-4"
        bodyStyle={{ padding: "0" }}
      >
        {hasRice ? (
          <Table
            columns={riceColumns}
            dataSource={rice}
            rowKey="rice_id"
            pagination={false}
            size="small"
            scroll={{
              y: "calc(100vh - 300px)",
              x: rice.length > 0 ? "max-content" : undefined,
            }}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No rice information available"
            className="py-10"
            style={{ marginBottom: "20px" }}
          ></Empty>
        )}
      </Card>

      {/* Add Rice Modal */}
      <Modal
        title={isEditingRice ? "Edit Rice" : "Add New Rice"}
        open={isRiceModalVisible}
        onCancel={handleRiceModalCancel}
        width={700}
        footer={[
          <Button key="cancel" onClick={handleRiceModalCancel}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={riceModalLoading}
            onClick={handleRiceModalSubmit}
            style={{
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            }}
          >
            {isEditingRice ? "Update" : "Add"}
          </Button>,
        ]}
      >
        <Form form={riceForm} layout="vertical">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="area_type"
              label="Area Type"
              rules={[{ required: true, message: "Please select area type" }]}
            >
              <Select placeholder="Select Area Type">
                <Option value="Irrigated">Irrigated</Option>
                <Option value="Rainfed">Rainfed</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="seed_type"
              label="Seed Type"
              rules={[{ required: true, message: "Please select seed type" }]}
            >
              <Select placeholder="Select Seed Type">
                <Option value="Hybrid Seeds">Hybrid Seeds</Option>
                <Option value="Certified Seeds">Certified Seeds</Option>
                <Option value="Good Seeds">Good Seeds</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="area_harvested"
              label="Area Harvested"
              rules={[
                { required: true, message: "Please enter area harvested" },
              ]}
            >
              <InputNumber
                className="w-full"
                min={0}
                step={0.01}
                placeholder="Enter area harvested"
              />
            </Form.Item>

            <Form.Item
              name="production"
              label="Production"
              rules={[{ required: true, message: "Please enter production" }]}
            >
              <InputNumber
                className="w-full"
                min={0}
                placeholder="Enter production"
              />
            </Form.Item>

            <Form.Item
              name="ave_yield"
              label="Average Yield"
              rules={[
                { required: true, message: "Please enter average yield" },
              ]}
            >
              <InputNumber
                className="w-full"
                min={0}
                step={0.01}
                placeholder="Enter average yield"
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default RiceTab;
