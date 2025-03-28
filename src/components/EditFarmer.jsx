"use client";

import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  message,
  Spin,
  Table,
  Popconfirm,
  Alert,
  Tabs,
  Badge,
  Empty,
  Space,
  Modal,
  Select,
  InputNumber,
  Row,
  Col,
} from "antd";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  PlusOutlined,
  SaveOutlined,
  UserOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { farmerAPI, livestockAPI } from "./services/api";

// Add compact form styles
const compactFormItemStyle = {
  marginBottom: "8px",
};

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const EditFarmer = ({ farmer, onClose, colors }) => {
  const [form] = Form.useForm();
  const [cropForm] = Form.useForm();
  const [riceForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [farmerData, setFarmerData] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("info");
  const [cropDataType, setCropDataType] = useState("Crop"); // Default column title
  const [isCropModalVisible, setIsCropModalVisible] = useState(false);
  const [isRiceModalVisible, setIsRiceModalVisible] = useState(false);
  const [isEditingCrop, setIsEditingCrop] = useState(false);
  const [isEditingRice, setIsEditingRice] = useState(false);
  const [currentCrop, setCurrentCrop] = useState(null);
  const [currentRice, setCurrentRice] = useState(null);
  const [cropModalLoading, setCropModalLoading] = useState(false);
  const [riceModalLoading, setRiceModalLoading] = useState(false);
  const [livestockRecords, setLivestockRecords] = useState([]);
  const [isLivestockModalVisible, setIsLivestockModalVisible] = useState(false);
  const [isEditingLivestock, setIsEditingLivestock] = useState(false);
  const [currentLivestock, setCurrentLivestock] = useState(null);
  const [livestockModalLoading, setLivestockModalLoading] = useState(false);
  const [livestockForm] = Form.useForm();
  const [livestockLoading, setLivestockLoading] = useState(true);

  // Fetch the farmer data
  useEffect(() => {
    const fetchFarmerDetails = async () => {
      try {
        setFetchLoading(true);

        const response = await farmerAPI.getFarmerById(farmer.farmer_id);

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

        setFarmerData(response);

        // Set form values
        form.setFieldsValue({
          name: response.name,
          contact_number: response.contact_number,
          facebook_email: response.facebook_email,
          home_address: response.home_address,
          farm_address: response.farm_address,
          farm_location_longitude: response.farm_location_longitude,
          farm_location_latitude: response.farm_location_latitude,
          market_outlet_location: response.market_outlet_location,
          buyer_name: response.buyer_name,
          association_organization: response.association_organization,
          barangay: response.barangay,
        });

        setFetchLoading(false);
      } catch (err) {
        console.error("Error fetching farmer details:", err);
        setError(`Failed to fetch farmer details: ${err.message}`);
        setFetchLoading(false);
      }
    };

    const fetchLivestockRecords = async () => {
      try {
        setLivestockLoading(true);

        // Get all livestock records
        const response = await livestockAPI.getAllLivestockRecords();

        // Filter records for this farmer
        const farmerLivestockRecords = response.filter(
          (record) => record.farmer_id === farmer.farmer_id
        );

        setLivestockRecords(farmerLivestockRecords);
        setLivestockLoading(false);
      } catch (err) {
        console.error("Error fetching livestock records:", err);
        setLivestockLoading(false);
      }
    };

    fetchFarmerDetails();
    fetchLivestockRecords();
  }, [farmer.farmer_id, form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      console.log("Updating farmer with data:", values);
      await farmerAPI.updateFarmer(farmer.farmer_id, values);
      message.success("Farmer updated successfully.");
      setLoading(false);
    } catch (error) {
      message.error(`Failed to update farmer. ${error.message}`);
      setLoading(false);
    }
  };

  // Crop Modal Functions
  const showAddCropModal = () => {
    setIsEditingCrop(false);
    setCurrentCrop(null);
    cropForm.resetFields();
    setIsCropModalVisible(true);
  };

  const showEditCropModal = (crop) => {
    setIsEditingCrop(true);
    setCurrentCrop(crop);

    // Parse production data to set form values
    let productionData = {};
    try {
      if (crop.production_data) {
        productionData = JSON.parse(crop.production_data);
      }
    } catch (e) {
      console.error("Error parsing production data:", e);
    }

    // Set form values
    cropForm.setFieldsValue({
      crop_type: crop.crop_type,
      variety_clone: crop.variety_clone,
      area_hectare: crop.area_hectare,
      production_type: crop.production_type,
      crop_value: productionData.crop || "",
      month_value: productionData.month || "",
      quantity: productionData.quantity || "",
    });

    setIsCropModalVisible(true);
  };

  const handleCropModalCancel = () => {
    setIsCropModalVisible(false);
    cropForm.resetFields();
  };

  // Update the handleCropModalSubmit function to handle both single and multiple crop entries
  const handleCropModalSubmit = async () => {
    try {
      const values = await cropForm.validateFields();
      setCropModalLoading(true);

      // Prepare production data JSON based on crop type
      let productionData = {};
      if (values.crop_type === "Cacao") {
        // For Cacao, only use month_value
        productionData = {
          month: values.month_value,
          quantity: values.quantity,
        };
      } else {
        // For other crop types, use crop_value
        productionData = {
          crop: values.crop_value,
          quantity: values.quantity,
        };
      }

      // Create the crop object
      const cropObject = {
        crop_type: values.crop_type,
        variety_clone: values.variety_clone || "",
        area_hectare: values.area_hectare,
        production_type: values.production_type,
        production_data: JSON.stringify(productionData),
      };

      console.log("Submitting crop data:", cropObject);

      if (isEditingCrop && currentCrop) {
        // Update existing crop
        await farmerAPI.updateFarmer(farmer.farmer_id, {
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
          crops: [cropObject],
        });
        message.success("Crop updated successfully.");
      } else {
        // Add new crop
        await farmerAPI.addCrops(farmer.farmer_id, {
          crops: [cropObject],
        });
        message.success("Crop added successfully.");
      }

      // Refresh farmer data
      const response = await farmerAPI.getFarmerById(farmer.farmer_id);

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

      setFarmerData(response);
      setCropModalLoading(false);
      setIsCropModalVisible(false);
      cropForm.resetFields();
    } catch (error) {
      console.error("Error submitting crop form:", error);
      message.error(
        `Failed to ${isEditingCrop ? "update" : "add"} crop. ${error.message}`
      );
      setCropModalLoading(false);
    }
  };

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

  // Update the handleRiceModalSubmit function to handle both single and multiple rice entries
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
        await farmerAPI.updateFarmer(farmer.farmer_id, {
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
        await farmerAPI.addRice(farmer.farmer_id, {
          rice: [riceObject],
        });
        message.success("Rice data added successfully.");
      }

      // Refresh farmer data
      const response = await farmerAPI.getFarmerById(farmer.farmer_id);
      setFarmerData(response);
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
          farmer_id: farmer.farmer_id,
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
          farmer_id: farmer.farmer_id,
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

      // Refresh livestock records
      const allLivestockRecords = await livestockAPI.getAllLivestockRecords();
      const farmerLivestockRecords = allLivestockRecords.filter(
        (record) => record.farmer_id === farmer.farmer_id
      );
      setLivestockRecords(farmerLivestockRecords);

      // Refresh farmer data
      const response = await farmerAPI.getFarmerById(farmer.farmer_id);
      setFarmerData(response);

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

      // Refresh livestock records
      const allLivestockRecords = await livestockAPI.getAllLivestockRecords();
      const farmerLivestockRecords = allLivestockRecords.filter(
        (record) => record.farmer_id === farmer.farmer_id
      );
      setLivestockRecords(farmerLivestockRecords);

      // Refresh farmer data to ensure consistency with other data
      const response = await farmerAPI.getFarmerById(farmer.farmer_id);

      // Process the crops data to extract JSON values (keeping this consistent with crop/rice pattern)
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

      setFarmerData(response);
    } catch (error) {
      console.error("Error deleting livestock record:", error);
      message.error(`Failed to delete livestock record. ${error.message}`);
    }
  };

  // Fix the bug where crop data doesn't display properly after deletion
  const handleDeleteCrop = async (cropId) => {
    try {
      await farmerAPI.deleteCrop(cropId);
      message.success("Crop entry deleted successfully.");

      // Refresh farmer data
      const response = await farmerAPI.getFarmerById(farmer.farmer_id);

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

      setFarmerData(response);
    } catch (error) {
      message.error(`Failed to delete crop entry. ${error.message}`);
    }
  };

  // Similarly fix the rice deletion function to ensure data is properly processed
  const handleDeleteRice = async (riceId) => {
    try {
      await farmerAPI.deleteRice(riceId);
      message.success("Rice entry deleted successfully.");

      // Refresh farmer data
      const response = await farmerAPI.getFarmerById(farmer.farmer_id);

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

      setFarmerData(response);
    } catch (error) {
      message.error(`Failed to delete rice entry. ${error.message}`);
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
      title: "Production Type",
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

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" tip="Loading farmer details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5">
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button onClick={onClose} type="primary">
              Go Back
            </Button>
          }
        />
      </div>
    );
  }

  // Check if rice and crop data exists
  const hasRice = farmerData?.rice && farmerData.rice.length > 0;
  const hasCrops = farmerData?.crops && farmerData.crops.length > 0;
  const hasLivestock = livestockRecords.length > 0;

  return (
    <div className="min-h-[90vh] max-h-screen overflow-y-auto overflow-x-hidden">
      {/* Header with back button and farmer name */}
      <Card
        bordered={false}
        className="rounded-lg shadow-sm mb-3"
        bodyStyle={{ padding: "10px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Button icon={<ArrowLeftOutlined />} onClick={onClose}>
            Back
          </Button>
        </div>

        {/* Navigation buttons */}
        <div className="flex flex-wrap gap-5 mb-2 mt-3">
          <Button
            type={activeTab === "info" ? "primary" : "default"}
            icon={<UserOutlined />}
            onClick={() => setActiveTab("info")}
            style={{
              backgroundColor: activeTab === "info" ? colors.primary : "",
              borderColor: activeTab === "info" ? colors.primary : "",
            }}
          >
            Farmer Information
          </Button>

          <Button
            type={activeTab === "crops" ? "primary" : "default"}
            icon={<InfoCircleOutlined />}
            onClick={() => setActiveTab("crops")}
            style={{
              backgroundColor: activeTab === "crops" ? colors.primary : "",
              borderColor: activeTab === "crops" ? colors.primary : "",
            }}
          >
            Crop Information
            {hasCrops && (
              <Badge
                count={farmerData.crops.length}
                className="ml-1"
                style={{
                  backgroundColor:
                    activeTab === "crops" ? "#fff" : colors.primary,
                  color: activeTab === "crops" ? colors.primary : "#fff",
                }}
              />
            )}
          </Button>

          <Button
            type={activeTab === "rice" ? "primary" : "default"}
            icon={<InfoCircleOutlined />}
            onClick={() => setActiveTab("rice")}
            style={{
              backgroundColor: activeTab === "rice" ? colors.primary : "",
              borderColor: activeTab === "rice" ? colors.primary : "",
            }}
          >
            Rice Information
            {hasRice && (
              <Badge
                count={farmerData.rice.length}
                className="ml-1"
                style={{
                  backgroundColor:
                    activeTab === "rice" ? "#fff" : colors.primary,
                  color: activeTab === "rice" ? colors.primary : "#fff",
                }}
              />
            )}
          </Button>

          <Button
            type={activeTab === "livestock" ? "primary" : "default"}
            icon={<InfoCircleOutlined />}
            onClick={() => setActiveTab("livestock")}
            style={{
              backgroundColor: activeTab === "livestock" ? colors.primary : "",
              borderColor: activeTab === "livestock" ? colors.primary : "",
            }}
          >
            Livestock Records
            {hasLivestock && (
              <Badge
                count={livestockRecords.length}
                className="ml-1"
                style={{
                  backgroundColor:
                    activeTab === "livestock" ? "#fff" : colors.primary,
                  color: activeTab === "livestock" ? colors.primary : "#fff",
                }}
              />
            )}
          </Button>
        </div>
      </Card>

      {/* Content based on active tab */}
      {activeTab === "info" && (
        <Card
          bordered={false}
          className="rounded-lg shadow-sm mb-4"
          bodyStyle={{ padding: "16px" }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              name: farmerData?.name || "",
              contact_number: farmerData?.contact_number || "",
              facebook_email: farmerData?.facebook_email || "",
              home_address: farmerData?.home_address || "",
              farm_address: farmerData?.farm_address || "",
              farm_location_longitude:
                farmerData?.farm_location_longitude || "",
              farm_location_latitude: farmerData?.farm_location_latitude || "",
              market_outlet_location: farmerData?.market_outlet_location || "",
              buyer_name: farmerData?.buyer_name || "",
              association_organization:
                farmerData?.association_organization || "",
              barangay: farmerData?.barangay || "",
            }}
          >
            <Row gutter={[24, 24]}>
              <Col span={24} md={12}>
                <Card
                  title={
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <UserOutlined
                        style={{ marginRight: 8, color: colors.primary }}
                      />
                      <span>Personal Information</span>
                    </div>
                  }
                  style={{ borderRadius: 8, height: "100%" }}
                >
                  <div style={{ marginBottom: 16 }}>
                    <Text type="secondary">Name</Text>
                    <Form.Item
                      name="name"
                      rules={[{ required: true }]}
                      style={{ marginBottom: 0 }}
                    >
                      <Input style={{ fontSize: 16 }} />
                    </Form.Item>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <Text type="secondary">Contact Number</Text>
                    <Form.Item
                      name="contact_number"
                      style={{ marginBottom: 0 }}
                    >
                      <Input style={{ fontSize: 16 }} />
                    </Form.Item>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <Text type="secondary">Email</Text>
                    <Form.Item
                      name="facebook_email"
                      style={{ marginBottom: 0 }}
                    >
                      <Input style={{ fontSize: 16 }} />
                    </Form.Item>
                  </div>
                  <div>
                    <Text type="secondary">Barangay</Text>
                    <Form.Item name="barangay" style={{ marginBottom: 0 }}>
                      <Input style={{ fontSize: 16 }} />
                    </Form.Item>
                  </div>
                </Card>
              </Col>
              <Col span={24} md={12}>
                <Card
                  title={
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <HomeOutlined
                        style={{ marginRight: 8, color: colors.primary }}
                      />
                      <span>Address Information</span>
                    </div>
                  }
                  style={{ borderRadius: 8, height: "100%" }}
                >
                  <div style={{ marginBottom: 16 }}>
                    <Text type="secondary">Home Address</Text>
                    <Form.Item name="home_address" style={{ marginBottom: 0 }}>
                      <Input style={{ fontSize: 16 }} />
                    </Form.Item>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <Text type="secondary">Farm Address</Text>
                    <Form.Item name="farm_address" style={{ marginBottom: 0 }}>
                      <Input style={{ fontSize: 16 }} />
                    </Form.Item>
                  </div>
                  <div>
                    <Text type="secondary">Farm Location</Text>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <Form.Item
                        name="farm_location_longitude"
                        style={{ marginBottom: 0, width: "50%" }}
                      >
                        <Input
                          style={{ fontSize: 16 }}
                          placeholder="Longitude"
                        />
                      </Form.Item>
                      <Form.Item
                        name="farm_location_latitude"
                        style={{ marginBottom: 0, width: "50%" }}
                      >
                        <Input
                          style={{ fontSize: 16 }}
                          placeholder="Latitude"
                        />
                      </Form.Item>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            <Form.Item className="mt-6">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
                style={{
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                  marginTop: "24px",
                }}
              >
                Save Changes
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}

      {activeTab === "crops" && (
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
          {hasCrops ? (
            <Table
              columns={cropColumns}
              dataSource={farmerData.crops}
              rowKey="crop_id"
              pagination={false}
              size="small"
              scroll={{
                x: farmerData.crops.length > 0 ? "max-content" : undefined,
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
      )}

      {activeTab === "rice" && (
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
              dataSource={farmerData.rice}
              rowKey="rice_id"
              pagination={false}
              size="small"
              scroll={{
                y: "calc(100vh - 300px)",
                x: farmerData.rice.length > 0 ? "max-content" : undefined,
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
      )}

      {activeTab === "livestock" && (
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
      )}

      {/* Add Crop Modal */}
      <Modal
        title={isEditingCrop ? "Edit Crop" : "Add New Crop"}
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
            data_type: "crop",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="crop_type"
              label="Crop Type"
              rules={[{ required: true, message: "Please select crop type" }]}
            >
              <Select placeholder="Select Crop Type">
                <Option value="Spices">Spices</Option>
                <Option value="Legumes">Legumes</Option>
                <Option value="Vegetable">Vegetable</Option>
                <Option value="Cacao">Cacao</Option>
                <Option value="Banana">Banana</Option>
              </Select>
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.crop_type !== currentValues.crop_type
              }
            >
              {({ getFieldValue }) =>
                getFieldValue("crop_type") === "Cacao" ? (
                  <Form.Item
                    name="variety_clone"
                    label="Variety/Clone"
                    rules={[
                      { required: true, message: "Please enter variety/clone" },
                    ]}
                  >
                    <Input placeholder="Enter variety or clone" />
                  </Form.Item>
                ) : null
              }
            </Form.Item>

            <Form.Item
              name="area_hectare"
              label="Area (Hectare)"
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

            <Form.Item
              name="production_type"
              label="Cropping Intensity"
              rules={[
                { required: true, message: "Please select cropping intensity" },
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

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.crop_type !== currentValues.crop_type
              }
            >
              {({ getFieldValue }) =>
                getFieldValue("crop_type") === "Cacao" ? (
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
                ) : (
                  <Form.Item
                    name="crop_value"
                    label="Crop"
                    rules={[
                      { required: true, message: "Please select crop value" },
                    ]}
                  >
                    <Select placeholder="Select crop value">
                      <Option value="Ginger">Ginger</Option>
                      <Option value="Onion">Onion</Option>
                      <Option value="Hotpepper">Hotpepper</Option>
                      <Option value="Sweet Pepper">Sweet Pepper</Option>
                      <Option value="Turmeric">Turmeric</Option>
                      <Option value="Peanut">Peanut</Option>
                      <Option value="Mungbean">Mungbean</Option>
                      <Option value="Soybean">Soybean</Option>
                      <Option value="Eggplant">Eggplant</Option>
                      <Option value="Ampalaya">Ampalaya</Option>
                      <Option value="Okra">Okra</Option>
                      <Option value="Pole Sitao">Pole Sitao</Option>
                      <Option value="Squash">Squash</Option>
                      <Option value="Tomato">Tomato</Option>
                      <Option value="Lakatan">Lakatan</Option>
                      <Option value="Latundan">Latundan</Option>
                      <Option value="Cardava">Cardava</Option>
                    </Select>
                  </Form.Item>
                )
              }
            </Form.Item>

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
          </div>
        </Form>
      </Modal>

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
    </div>
  );
};

export default EditFarmer;
