"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  message,
  Spin,
  Alert,
  Badge,
  Row,
  Col,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  UserOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { farmerAPI } from "./services/api";
import { livestockAPI } from "./services/api";
import { operatorAPI } from "./services/api";
import OperatorTab from "./operator-tab";
import LivestockTab from "./livestock-tab";
import RiceTab from "./rice-tab";
import CropsTab from "./crops-tab";

// Add compact form styles
const compactFormItemStyle = {
  marginBottom: "8px",
};

const { Text } = Typography;

const EditFarmer = ({ farmer, onClose, colors }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [farmerData, setFarmerData] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("info");
  const [livestockRecords, setLivestockRecords] = useState([]);
  const [operatorData, setOperatorData] = useState([]);
  const [livestockLoading, setLivestockLoading] = useState(true);
  const [operatorLoading, setOperatorLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to trigger a refresh of all data
  const refreshAllData = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Fetch the farmer data
  const fetchFarmerDetails = useCallback(async () => {
    try {
      setFetchLoading(true);

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
  }, [farmer.farmer_id, form]);

  const fetchLivestockRecords = useCallback(async () => {
    try {
      // Only show loading on initial fetch, not on refreshes
      if (livestockRecords.length === 0) {
        setLivestockLoading(true);
      }

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
  }, [farmer.farmer_id, livestockRecords.length]);

  const fetchOperatorData = useCallback(async () => {
    try {
      // Only show loading on initial fetch, not on refreshes
      if (operatorData.length === 0) {
        setOperatorLoading(true);
      }

      // Use the getOperatorsByFarmerId method instead of getAllOperators to reduce API calls
      const response = await operatorAPI.getOperatorsByFarmerId(
        farmer.farmer_id
      );

      // No need to filter as the API already returns filtered data
      setOperatorData(response);
      setOperatorLoading(false);
    } catch (err) {
      console.error("Error fetching operator data:", err);
      setOperatorLoading(false);
    }
  }, [farmer.farmer_id, operatorData.length]);

  useEffect(() => {
    fetchFarmerDetails();
    fetchLivestockRecords();
    fetchOperatorData();
  }, [
    fetchFarmerDetails,
    fetchLivestockRecords,
    fetchOperatorData,
    refreshTrigger,
  ]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      console.log("Updating farmer with data:", values);
      await farmerAPI.updateFarmer(farmer.farmer_id, values);
      message.success("Farmer updated successfully.");
      refreshAllData(); // Refresh data after update
      setLoading(false);
    } catch (error) {
      message.error(`Failed to update farmer. ${error.message}`);
      setLoading(false);
    }
  };

  if (fetchLoading || livestockLoading || operatorLoading) {
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

  // Check if rice, crop, livestock data exists
  const hasRice = farmerData?.rice && farmerData.rice.length > 0;
  const hasCrops = farmerData?.crops && farmerData.crops.length > 0;
  const hasLivestock = livestockRecords && livestockRecords.length > 0;
  const hasOperators = operatorData && operatorData.length > 0;

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

          <Button
            type={activeTab === "operator" ? "primary" : "default"}
            icon={<EnvironmentOutlined />}
            onClick={() => setActiveTab("operator")}
            style={{
              backgroundColor: activeTab === "operator" ? colors.primary : "",
              borderColor: activeTab === "operator" ? colors.primary : "",
            }}
          >
            Operator Information
            {hasOperators && (
              <Badge
                count={operatorData.length}
                className="ml-1"
                style={{
                  backgroundColor:
                    activeTab === "operator" ? "#fff" : colors.primary,
                  color: activeTab === "operator" ? colors.primary : "#fff",
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
        <CropsTab
          farmerId={farmer.farmer_id}
          farmerData={farmerData}
          colors={colors}
          onDataChange={refreshAllData}
        />
      )}

      {activeTab === "rice" && (
        <RiceTab
          farmerId={farmer.farmer_id}
          farmerData={farmerData}
          colors={colors}
          onDataChange={refreshAllData}
        />
      )}

      {activeTab === "livestock" && (
        <LivestockTab
          farmerId={farmer.farmer_id}
          farmerData={farmerData}
          colors={colors}
          onDataChange={refreshAllData}
        />
      )}

      {activeTab === "operator" && (
        <OperatorTab
          farmerId={farmer.farmer_id}
          farmerData={farmerData}
          colors={colors}
          onDataChange={refreshAllData}
        />
      )}
    </div>
  );
};

export default EditFarmer;
