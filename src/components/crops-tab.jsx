"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Button,
  Card,
  Table,
  Popconfirm,
  Empty,
  Space,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
  Spin,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { farmerAPI } from "./services/api";

const { Option } = Select;

const CropsTab = ({ farmerId, farmerData, colors, onDataChange }) => {
  const [cropForm] = Form.useForm();
  const [cropDataType, setCropDataType] = useState("Crop");
  const [isCropModalVisible, setIsCropModalVisible] = useState(false);
  const [isEditingCrop, setIsEditingCrop] = useState(false);
  const [currentCrop, setCurrentCrop] = useState(null);
  const [cropModalLoading, setCropModalLoading] = useState(false);
  const [crops, setCrops] = useState([]);
  const [cropLoading, setCropLoading] = useState(true);
  const [selectedCropType, setSelectedCropType] = useState(null);
  const [modalTitle, setModalTitle] = useState("Add New Crop");
  const [isEditingRice, setIsEditingRice] = useState(false); // Declare isEditingRice

  const fetchCropData = useCallback(async () => {
    try {
      // Only show loading on initial fetch, not on refreshes
      if (crops.length === 0) {
        setCropLoading(true);
      }

      // Get farmer data which includes crops
      const response = await farmerAPI.getFarmerById(farmerId);

      // Determine the crop data type from the first crop item
      if (response.crops && response.crops.length > 0) {
        try {
          const firstCrop = response.crops[0];
          if (firstCrop.production_data) {
            const data = JSON.parse(firstCrop.production_data);
            if (data.month) {
              setCropDataType("Month");
            } else if (data.crop) {
              setCropDataType("Crop");
            }
          }
        } catch (e) {
          console.error("Error parsing crop data:", e);
        }
      }

      // Process the crops data to extract JSON values
      if (response.crops && response.crops.length > 0) {
        response.crops = response.crops.map((crop) => {
          if (crop.production_data) {
            try {
              const data = JSON.parse(crop.production_data);
              return {
                ...crop,
                crop_value: data.crop || null,
                month_value: data.month || null,
                quantity_value: data.quantity || null,
              };
            } catch (e) {
              console.error("Error parsing production data:", e);
              return {
                ...crop,
                crop_value: null,
                month_value: null,
                quantity_value: null,
              };
            }
          }
          return crop;
        });
      }

      setCrops(response.crops || []);
      setCropLoading(false);
    } catch (err) {
      console.error("Error fetching crop data:", err);
      setCropLoading(false);
    }
  }, [farmerId, crops.length]);

  useEffect(() => {
    if (farmerId) {
      fetchCropData();
    }
  }, [farmerId, fetchCropData]);

  // Crop Modal Functions
  const showAddCropModal = () => {
    setIsEditingCrop(false);
    setCurrentCrop(null);
    setSelectedCropType(null);
    setModalTitle("Add New Crop");
    cropForm.resetFields();
    setIsCropModalVisible(true);
  };

  const showEditCropModal = (crop) => {
    setIsEditingCrop(true);
    setCurrentCrop(crop);
    setSelectedCropType(crop.crop_type);

    // Set a more descriptive title
    let cropName = "";
    try {
      if (crop.production_data) {
        const productionData = JSON.parse(crop.production_data);
        if (crop.crop_type === "Cacao") {
          cropName = `${crop.variety_clone || "Cacao"} (${
            productionData.month || "Unknown month"
          })`;
        } else {
          cropName = productionData.crop || crop.crop_type;
        }
      } else {
        cropName = crop.crop_type;
      }
    } catch (e) {
      cropName = crop.crop_type;
    }

    setModalTitle(`Edit ${cropName}`);

    // Parse production data to set form values
    let productionData = {};
    try {
      if (crop.production_data) {
        productionData = JSON.parse(crop.production_data);
      }
    } catch (e) {
      console.error("Error parsing production data:", e);
    }

    // Set form values based on crop type
    cropForm.setFieldsValue({
      crop_type: crop.crop_type,
      variety_clone: crop.variety_clone || "",
      area_hectare: crop.area_hectare,
      production_type: crop.production_type || "seasonal",
      crop_value: productionData.crop || "",
      month_value: productionData.month || "",
      quantity: productionData.quantity || "",
    });

    setIsCropModalVisible(true);
  };

  const handleCropModalCancel = () => {
    setIsCropModalVisible(false);
    cropForm.resetFields();
    setSelectedCropType(null);
  };

  const handleCropModalSubmit = async () => {
    try {
      const values = await cropForm.validateFields();
      setCropModalLoading(true);

      if (isEditingCrop && currentCrop) {
        // Update existing crop
        let productionData = {};

        if (values.crop_type === "Cacao") {
          productionData = {
            month: values.month_value,
            quantity: values.quantity,
          };
        } else {
          productionData = {
            crop: values.crop_value,
            quantity: values.quantity,
          };
        }

        const cropEntry = {
          crop_type: values.crop_type,
          variety_clone: values.variety_clone || "",
          area_hectare: values.area_hectare
            ? Number.parseFloat(values.area_hectare)
            : 0,
          production_type: values.production_type || "seasonal",
          production_data: JSON.stringify(productionData),
        };

        const cropData = {
          crops: [cropEntry],
        };

        console.log("Updating crop data:", JSON.stringify(cropData, null, 2));
        await farmerAPI.updateCrop(farmerId, currentCrop.crop_id, cropData);
        message.success("Crop updated successfully.");
      } else {
        // Add new crop
        let productionData = {};

        if (values.crop_type === "Cacao") {
          productionData = {
            month: values.month_value,
            quantity: values.quantity,
          };
        } else {
          productionData = {
            crop: values.crop_value,
            quantity: values.quantity,
          };
        }

        const cropEntry = {
          crop_type: values.crop_type,
          variety_clone: values.variety_clone || "",
          area_hectare: values.area_hectare
            ? Number.parseFloat(values.area_hectare)
            : 0,
          production_type: values.production_type || "seasonal",
          production_data: JSON.stringify(productionData),
        };

        const cropsData = {
          crops: [cropEntry],
        };

        console.log("Creating crop data:", JSON.stringify(cropsData, null, 2));
        await farmerAPI.addCrops(farmerId, cropsData);
        message.success("Crop added successfully.");
      }

      // Refresh crop data
      await fetchCropData();

      // Notify parent component to refresh data
      if (onDataChange) {
        onDataChange();
      }

      setCropModalLoading(false);
      setIsCropModalVisible(false);
      cropForm.resetFields();
      setSelectedCropType(null);
    } catch (error) {
      console.error("Error submitting crop form:", error);
      message.error(
        `Failed to ${isEditingCrop ? "update" : "add"} crop. ${error.message}`
      );
      setCropModalLoading(false);
    }
  };

  const handleDeleteCrop = async (cropId) => {
    try {
      await farmerAPI.deleteCrop(farmerId, cropId);
      message.success("Crop entry deleted successfully.");

      // Refresh crop data
      await fetchCropData();

      // Notify parent component to refresh data
      if (onDataChange) {
        onDataChange();
      }
    } catch (error) {
      message.error(`Failed to delete crop entry. ${error.message}`);
    }
  };

  const cropColumns = [
    {
      title: "Crop Type",
      dataIndex: "crop_type",
      key: "crop_type",
    },
    {
      title: "Variety/Clone",
      dataIndex: "variety_clone",
      key: "variety_clone",
    },
    {
      title: "Area (Hectare)",
      dataIndex: "area_hectare",
      key: "area_hectare",
    },
    {
      title: "Cropping Intensity",
      dataIndex: "production_type",
      key: "production_type",
    },
    {
      title: cropDataType,
      key: "crop_or_month",
      render: (_, record) => {
        return cropDataType === "Crop" ? record.crop_value : record.month_value;
      },
    },
    {
      title: "Quantity",
      key: "quantity",
      dataIndex: "quantity_value",
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
            onClick={() => showEditCropModal(record)}
            className="action-button"
            style={{ color: colors.warning }}
          />
          <Popconfirm
            title="Delete this crop entry?"
            description="This action cannot be undone."
            onConfirm={() => handleDeleteCrop(record.crop_id)}
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

  const hasCrops = crops && crops.length > 0;

  return (
    <>
      <Card
        title={
          <div className="flex items-center">
            <InfoCircleOutlined className="mr-2 text-green-600" />
            <span className="text-base font-medium">Crop Information</span>
          </div>
        }
        extra={
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={showAddCropModal}
            style={{
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            }}
          >
            Add Crop
          </Button>
        }
        bordered={false}
        className="rounded-lg shadow-sm mt-4"
        bodyStyle={{ padding: "0" }}
      >
        {cropLoading ? (
          <div className="py-10 flex justify-center">
            <Spin tip="Loading crop records..." />
          </div>
        ) : hasCrops ? (
          <Table
            columns={cropColumns}
            dataSource={crops}
            rowKey="crop_id"
            pagination={false}
            size="small"
            scroll={{
              x: crops.length > 0 ? "max-content" : undefined,
            }}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No crop information available"
            className="py-10"
            style={{ marginBottom: "20px" }}
          ></Empty>
        )}
      </Card>

      {/* Add Crop Modal */}
      <Modal
        title={modalTitle}
        open={isCropModalVisible}
        onCancel={handleCropModalCancel}
        width={700}
        footer={[
          <Button key="cancel" onClick={handleCropModalCancel}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={cropModalLoading}
            onClick={handleCropModalSubmit}
            style={{
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            }}
          >
            {isEditingCrop ? "Update" : "Add"}
          </Button>,
        ]}
      >
        <Form
          form={cropForm}
          layout="vertical"
          initialValues={{
            production_type: "seasonal",
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="crop_type"
                label="Crop Type"
                rules={[{ required: true, message: "Please select crop type" }]}
              >
                <Select
                  placeholder="Select Crop Type"
                  onChange={(value) => setSelectedCropType(value)}
                >
                  <Option value="Spices">Spices</Option>
                  <Option value="Legumes">Legumes</Option>
                  <Option value="Vegetable">Vegetable</Option>
                  <Option value="Cacao">Cacao</Option>
                  <Option value="Banana">Banana</Option>
                </Select>
              </Form.Item>
            </Col>

            {/* Common fields for all crop types */}
            <Col xs={24} sm={12}>
              <Form.Item
                label="Area (Hectare)"
                name="area_hectare"
                rules={[
                  { required: true, message: "Please enter area in hectares" },
                ]}
              >
                <InputNumber
                  className="w-full"
                  min={0}
                  step={0.01}
                  placeholder="Enter area in hectares"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="production_type"
                label="Cropping Intensity"
                rules={[
                  {
                    required: true,
                    message: "Please select cropping intensity",
                  },
                ]}
              >
                <Select placeholder="Select Cropping Intensity">
                  <Option value="year_round">Year Round</Option>
                  <Option value="quarterly">Quarterly</Option>
                  <Option value="seasonal">Seasonal</Option>
                  <Option value="annually">Annually</Option>
                  <Option value="twice_a_month">Twice a Month</Option>
                </Select>
              </Form.Item>
            </Col>

            {/* Variety/Clone field only for Cacao */}
            {selectedCropType === "Cacao" && (
              <Col xs={24} sm={12}>
                <Form.Item
                  name="variety_clone"
                  label="Variety/Clone"
                  rules={[
                    { required: true, message: "Please enter variety/clone" },
                  ]}
                >
                  <Input placeholder="Enter variety or clone" />
                </Form.Item>
              </Col>
            )}

            {/* Cacao specific fields */}
            {selectedCropType === "Cacao" && (
              <>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="month_value"
                    label="Month"
                    rules={[{ required: true, message: "Please select month" }]}
                  >
                    <Select placeholder="Select month">
                      <Option value="January">January</Option>
                      <Option value="February">February</Option>
                      <Option value="March">March</Option>
                      <Option value="April">April</Option>
                      <Option value="May">May</Option>
                      <Option value="June">June</Option>
                      <Option value="July">July</Option>
                      <Option value="August">August</Option>
                      <Option value="September">September</Option>
                      <Option value="October">October</Option>
                      <Option value="November">November</Option>
                      <Option value="December">December</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </>
            )}

            {/* Fields for other crop types */}
            {selectedCropType !== "Cacao" && (
              <>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="crop_value"
                    label="Crop"
                    rules={[{ required: true, message: "Please enter crop" }]}
                  >
                    <Input placeholder="Enter crop" />
                  </Form.Item>
                </Col>
              </>
            )}

            {/* Quantity field for all crop types */}
            <Col xs={24} sm={12}>
              <Form.Item
                name="quantity"
                label="Quantity"
                rules={[{ required: true, message: "Please enter quantity" }]}
              >
                <InputNumber
                  className="w-full"
                  min={0}
                  placeholder="Enter quantity"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default CropsTab;
