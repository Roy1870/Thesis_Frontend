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
  Spin,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { livestockAPI } from "./services/api";

const { Option } = Select;

const LivestockTab = ({ farmerId, farmerData, colors, onDataChange }) => {
  const [livestockForm] = Form.useForm();
  const [livestockRecords, setLivestockRecords] = useState([]);
  const [isLivestockModalVisible, setIsLivestockModalVisible] = useState(false);
  const [isEditingLivestock, setIsEditingLivestock] = useState(false);
  const [currentLivestock, setCurrentLivestock] = useState(null);
  const [livestockModalLoading, setLivestockModalLoading] = useState(false);
  const [livestockLoading, setLivestockLoading] = useState(true);

  useEffect(() => {
    fetchLivestockRecords();
  }, [farmerId]);

  const fetchLivestockRecords = async () => {
    try {
      // Only show loading on initial fetch, not on refreshes
      if (livestockRecords.length === 0) {
        setLivestockLoading(true);
      }

      // Get all livestock records
      const response = await livestockAPI.getAllLivestockRecords();

      // Filter records for this farmer
      const farmerLivestockRecords = response.filter(
        (record) => record.farmer_id === farmerId
      );

      setLivestockRecords(farmerLivestockRecords);
      setLivestockLoading(false);
    } catch (err) {
      console.error("Error fetching livestock records:", err);
      setLivestockLoading(false);
    }
  };

  // Livestock Modal Functions
  const showAddLivestockModal = () => {
    setIsEditingLivestock(false);
    setCurrentLivestock(null);
    livestockForm.resetFields();
    setIsLivestockModalVisible(true);
  };

  const showEditLivestockModal = (livestock) => {
    setIsEditingLivestock(true);
    setCurrentLivestock(livestock);

    livestockForm.setFieldsValue({
      animal_type: livestock.animal_type,
      subcategory: livestock.subcategory,
      quantity: livestock.quantity,
    });

    setIsLivestockModalVisible(true);
  };

  const handleLivestockModalCancel = () => {
    setIsLivestockModalVisible(false);
    livestockForm.resetFields();
  };

  const handleLivestockModalSubmit = async () => {
    try {
      const values = await livestockForm.validateFields();
      setLivestockModalLoading(true);
      const currentUser = localStorage.getItem("userName") || "System";

      if (isEditingLivestock && currentLivestock) {
        // Format the update data according to the required structure
        const updateData = {
          farmer_id: farmerId,
          name: farmerData.name,
          contact_number: farmerData.contact_number || "",
          facebook_email: farmerData.facebook_email || "",
          home_address: farmerData.home_address || "",
          barangay: farmerData.barangay || "",
          livestock_records: [
            {
              animal_type: values.animal_type,
              subcategory: values.subcategory,
              quantity: Number.parseInt(values.quantity, 10),
              updated_by: currentUser,
            },
          ],
        };

        console.log("Updating livestock record with data:", updateData);
        await livestockAPI.updateLivestockRecord(
          currentLivestock.record_id,
          updateData
        );
        message.success("Livestock record updated successfully.");
      } else {
        // Add new livestock record
        const newLivestockData = {
          farmer_id: farmerId,
          name: farmerData.name,
          contact_number: farmerData.contact_number || "",
          facebook_email: farmerData.facebook_email || "",
          home_address: farmerData.home_address || "",
          barangay: farmerData.barangay || "",
          livestock_records: [
            {
              animal_type: values.animal_type,
              subcategory: values.subcategory,
              quantity: Number.parseInt(values.quantity, 10),
              updated_by: currentUser,
            },
          ],
        };

        await livestockAPI.createLivestockRecords(newLivestockData);
        message.success("Livestock record added successfully.");
      }

      // Refresh livestock records without showing loading
      const response = await livestockAPI.getAllLivestockRecords();
      const farmerLivestockRecords = response.filter(
        (record) => record.farmer_id === farmerId
      );
      setLivestockRecords(farmerLivestockRecords);

      // Notify parent component to refresh data
      if (onDataChange) {
        onDataChange();
      }

      setLivestockModalLoading(false);
      setIsLivestockModalVisible(false);
      livestockForm.resetFields();
    } catch (error) {
      console.error("Error submitting livestock form:", error);
      message.error(
        `Failed to ${isEditingLivestock ? "update" : "add"} livestock record. ${
          error.message
        }`
      );
      setLivestockModalLoading(false);
    }
  };

  const handleDeleteLivestock = async (recordId) => {
    try {
      if (!recordId) {
        console.error("Error: Record ID is undefined");
        message.error(
          "Failed to delete livestock record: Record ID is missing"
        );
        return;
      }

      console.log(`Deleting livestock record with ID: ${recordId}`);

      // Use the API function from the provided API service
      await livestockAPI.deleteLivestockRecord(recordId);
      message.success("Livestock record deleted successfully.");

      // Refresh livestock records without showing loading
      const response = await livestockAPI.getAllLivestockRecords();
      const farmerLivestockRecords = response.filter(
        (record) => record.farmer_id === farmerId
      );
      setLivestockRecords(farmerLivestockRecords);

      // Notify parent component to refresh data
      if (onDataChange) {
        onDataChange();
      }
    } catch (error) {
      console.error("Error deleting livestock record:", error);
      message.error(`Failed to delete livestock record. ${error.message}`);
    }
  };

  const livestockColumns = [
    {
      title: "Animal Type",
      dataIndex: "animal_type",
      key: "animal_type",
    },
    {
      title: "Subcategory",
      dataIndex: "subcategory",
      key: "subcategory",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Updated By",
      dataIndex: "updated_by",
      key: "updated_by",
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
            onClick={() => showEditLivestockModal(record)}
            className="action-button"
            style={{ color: colors.warning }}
          />
          <Popconfirm
            title="Delete this livestock record?"
            description="This action cannot be undone."
            onConfirm={() => handleDeleteLivestock(record.record_id)}
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

  const hasLivestock = livestockRecords.length > 0;

  return (
    <>
      <Card
        title={
          <div className="flex items-center">
            <InfoCircleOutlined className="mr-2 text-green-600" />
            <span className="text-base font-medium">Livestock Records</span>
          </div>
        }
        extra={
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={showAddLivestockModal}
            style={{
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            }}
          >
            Add Livestock
          </Button>
        }
        bordered={false}
        className="rounded-lg shadow-sm mt-4"
        bodyStyle={{ padding: "0" }}
      >
        {livestockLoading ? (
          <div className="py-10 flex justify-center">
            <Spin tip="Loading livestock records..." />
          </div>
        ) : hasLivestock ? (
          <Table
            columns={livestockColumns}
            dataSource={livestockRecords}
            rowKey={(record) =>
              `${record.animal_type}-${record.subcategory}-${
                record.id || Math.random()
              }`
            }
            pagination={false}
            size="small"
            scroll={{
              y: "calc(100vh - 300px)",
              x: livestockRecords.length > 0 ? "max-content" : undefined,
            }}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No livestock records available"
            className="py-10"
            style={{ marginBottom: "20px" }}
          ></Empty>
        )}
      </Card>

      {/* Add Livestock Modal */}
      <Modal
        title={isEditingLivestock ? "Edit Livestock" : "Add New Livestock"}
        open={isLivestockModalVisible}
        onCancel={handleLivestockModalCancel}
        width={700}
        footer={[
          <Button key="cancel" onClick={handleLivestockModalCancel}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={livestockModalLoading}
            onClick={handleLivestockModalSubmit}
            style={{
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            }}
          >
            {isEditingLivestock ? "Update" : "Add"}
          </Button>,
        ]}
      >
        <Form form={livestockForm} layout="vertical">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="animal_type"
              label="Animal Type"
              rules={[{ required: true, message: "Please select animal type" }]}
            >
              <Select placeholder="Select Animal Type">
                <Option value="Cattle">Cattle</Option>
                <Option value="Carabao">Carabao</Option>
                <Option value="Goat">Goat</Option>
                <Option value="Sheep">Sheep</Option>
                <Option value="Swine">Swine</Option>
                <Option value="Chicken">Chicken</Option>
                <Option value="Duck">Duck</Option>
                <Option value="Quail">Quail</Option>
                <Option value="Turkey">Turkey</Option>
                <Option value="Rabbit">Rabbit</Option>
              </Select>
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.animal_type !== currentValues.animal_type
              }
            >
              {({ getFieldValue }) => (
                <Form.Item
                  name="subcategory"
                  label="Subcategory"
                  rules={[
                    { required: true, message: "Please select subcategory" },
                  ]}
                >
                  <Select placeholder="Select Subcategory">
                    {getFieldValue("animal_type") === "Cattle" && (
                      <>
                        <Option value="Carabull">Carabull</Option>
                        <Option value="Caracow">Caracow</Option>
                      </>
                    )}
                    {getFieldValue("animal_type") === "Carabao" && (
                      <>
                        <Option value="Carabull">Carabull</Option>
                        <Option value="Caracow">Caracow</Option>
                      </>
                    )}
                    {getFieldValue("animal_type") === "Goat" && (
                      <>
                        <Option value="Buck">Buck</Option>
                        <Option value="Doe">Doe</Option>
                      </>
                    )}
                    {getFieldValue("animal_type") === "Sheep" && (
                      <>
                        <Option value="Ram">Ram</Option>
                        <Option value="Ewe">Ewe</Option>
                      </>
                    )}
                    {getFieldValue("animal_type") === "Swine" && (
                      <>
                        <Option value="Sow">Sow</Option>
                        <Option value="Piglet">Piglet</Option>
                        <Option value="Boar">Boar</Option>
                        <Option value="Fatteners">Fatteners</Option>
                      </>
                    )}
                    {getFieldValue("animal_type") === "Chicken" && (
                      <>
                        <Option value="Broiler">Broiler</Option>
                        <Option value="Layer">Layer</Option>
                        <Option value="Freerange">Freerange</Option>
                        <Option value="Gamefowl">Gamefowl</Option>
                        <Option value="Fighting Cocks">Fighting Cocks</Option>
                      </>
                    )}
                    {getFieldValue("animal_type") === "Duck" && (
                      <>
                        <Option value="Drake">Drake</Option>
                        <Option value="Hen">Hen</Option>
                      </>
                    )}
                    {getFieldValue("animal_type") === "Quail" && (
                      <>
                        <Option value="Cock">Cock</Option>
                        <Option value="Hen">Hen</Option>
                      </>
                    )}
                    {getFieldValue("animal_type") === "Turkey" && (
                      <>
                        <Option value="Gobbler">Gobbler</Option>

                        <Option value="Hen">Hen</Option>

                        <Option value="Hen">Hen</Option>
                      </>
                    )}
                    {getFieldValue("animal_type") === "Rabbit" && (
                      <>
                        <Option value="Buck">Buck</Option>
                        <Option value="Doe">Doe</Option>
                      </>
                    )}
                  </Select>
                </Form.Item>
              )}
            </Form.Item>

            <Form.Item
              name="quantity"
              label="Quantity"
              rules={[{ required: true, message: "Please enter quantity" }]}
            >
              <InputNumber
                className="w-full"
                min={1}
                placeholder="Enter quantity"
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default LivestockTab;
