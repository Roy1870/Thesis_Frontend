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
  Input,
  Select,
  InputNumber,
  DatePicker,
  Badge,
  Spin,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { operatorAPI } from "./services/api";
import moment from "moment";

const { Option } = Select;

const OperatorTab = ({ farmerId, farmerData, colors, onDataChange }) => {
  const [operatorForm] = Form.useForm();
  const [operatorData, setOperatorData] = useState([]);
  const [isOperatorModalVisible, setIsOperatorModalVisible] = useState(false);
  const [isEditingOperator, setIsEditingOperator] = useState(false);
  const [currentOperator, setCurrentOperator] = useState(null);
  const [operatorModalLoading, setOperatorModalLoading] = useState(false);
  const [operatorLoading, setOperatorLoading] = useState(true);

  useEffect(() => {
    if (farmerId) {
      fetchOperatorData();
    }
  }, [farmerId]);

  const fetchOperatorData = async () => {
    try {
      // Only show loading on initial fetch, not on refreshes
      if (operatorData.length === 0) {
        setOperatorLoading(true);
      }

      // Get all livestock records
      const response = await operatorAPI.getAllOperators();

      // Filter records for this farmer
      const operator = response.filter(
        (operator) => operator.farmer_id === farmerId
      );

      setOperatorData(operator);
      setOperatorLoading(false);
    } catch (err) {
      console.error("Error fetching operator records:", err);
      setOperatorLoading(false);
    }
  };

  // Operator Modal Functions
  const showAddOperatorModal = () => {
    setIsEditingOperator(false);
    setCurrentOperator(null);
    operatorForm.resetFields();
    setIsOperatorModalVisible(true);
  };

  const showEditOperatorModal = (operator) => {
    setIsEditingOperator(true);
    setCurrentOperator(operator);

    operatorForm.setFieldsValue({
      fishpond_location: operator.fishpond_location,
      cultured_species: operator.cultured_species,
      productive_area_sqm: operator.productive_area_sqm,
      stocking_density: operator.stocking_density,
      date_of_stocking: operator.date_of_stocking
        ? moment(operator.date_of_stocking)
        : null,
      production_kg: operator.production_kg,
      date_of_harvest: operator.date_of_harvest
        ? moment(operator.date_of_harvest)
        : null,
      operational_status: operator.operational_status,
      remarks: operator.remarks,
      geotagged_photo_url: operator.geotagged_photo_url,
    });

    setIsOperatorModalVisible(true);
  };

  const handleOperatorModalCancel = () => {
    setIsOperatorModalVisible(false);
    operatorForm.resetFields();
  };

  const handleOperatorModalSubmit = async () => {
    try {
      const values = await operatorForm.validateFields();
      setOperatorModalLoading(true);

      // Format dates properly
      const formattedValues = {
        ...values,
        date_of_stocking: values.date_of_stocking
          ? values.date_of_stocking.format("YYYY-MM-DD")
          : null,
        date_of_harvest: values.date_of_harvest
          ? values.date_of_harvest.format("YYYY-MM-DD")
          : null,
      };

      // Structure the data with farmer and operator objects
      const FarmersData = {
        farmer_id: farmerData.farmer_id,
        name: farmerData.name,
        contact_number: farmerData.contact_number || "",
        facebook_email: farmerData.facebook_email || "",
        home_address: farmerData.home_address || "",
        barangay: farmerData.barangay || "",
        operators: [
          {
            fishpond_location: values.fishpond_location,
            cultured_species: values.cultured_species,
            productive_area_sqm: values.productive_area_sqm,
            stocking_density: values.stocking_density,
            date_of_stocking: values.date_of_stocking
              ? moment(values.date_of_stocking)
              : null,
            production_kg: values.production_kg,
            date_of_harvest: values.date_of_harvest
              ? moment(values.date_of_harvest)
              : null,
            operational_status: values.operational_status,
            remarks: values.remarks,
            geotagged_photo_url: values.geotagged_photo_url,
          },
        ],
      };

      if (isEditingOperator && currentOperator) {
        // Update existing operator
        console.log(
          "Updating operator with data:",
          JSON.stringify(FarmersData, null, 2)
        );
        await operatorAPI.updateOperator(
          currentOperator.farmer_id || currentOperator.id,
          FarmersData
        );
        message.success("Operator data updated successfully.");
      } else {
        // Add new operator
        console.log(
          "Creating operator with data:",
          JSON.stringify(FarmersData, null, 2)
        );
        await operatorAPI.addOperator(FarmersData);
        message.success("Operator data added successfully.");
      }

      // Refresh operator data
      await fetchOperatorData();

      // Notify parent component to refresh data
      if (onDataChange) {
        onDataChange();
      }

      setOperatorModalLoading(false);
      setIsOperatorModalVisible(false);
      operatorForm.resetFields();
    } catch (error) {
      console.error("Error submitting operator form:", error);
      message.error(
        `Failed to ${isEditingOperator ? "update" : "add"} operator data. ${
          error.message
        }`
      );
      setOperatorModalLoading(false);
    }
  };

  const handleDeleteOperator = async (operatorId) => {
    try {
      await operatorAPI.deleteOperator(operatorId);
      message.success("Operator data deleted successfully.");

      // Refresh operator data
      await fetchOperatorData();

      // Notify parent component to refresh data
      if (onDataChange) {
        onDataChange();
      }
    } catch (error) {
      message.error(`Failed to delete operator data. ${error.message}`);
    }
  };

  const operatorColumns = [
    {
      title: "Fishpond Location",
      dataIndex: "fishpond_location",
      key: "fishpond_location",
    },
    {
      title: "Cultured Species",
      dataIndex: "cultured_species",
      key: "cultured_species",
    },
    {
      title: "Area (sqm)",
      dataIndex: "productive_area_sqm",
      key: "productive_area_sqm",
    },
    {
      title: "Stocking Density",
      dataIndex: "stocking_density",
      key: "stocking_density",
    },
    {
      title: "Production (kg)",
      dataIndex: "production_kg",
      key: "production_kg",
    },
    {
      title: "Status",
      dataIndex: "operational_status",
      key: "operational_status",
      render: (status) => (
        <Badge
          status={status === "Active" ? "success" : "default"}
          text={status}
        />
      ),
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
            onClick={() => showEditOperatorModal(record)}
            className="action-button"
            style={{ color: colors.warning }}
          />
          <Popconfirm
            title="Delete this operator record?"
            description="This action cannot be undone."
            onConfirm={() =>
              handleDeleteOperator(record.operator_id || record.id)
            }
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

  const hasOperator = operatorData && operatorData.length > 0;

  return (
    <>
      <Card
        title={
          <div className="flex items-center">
            <EnvironmentOutlined className="mr-2 text-green-600" />
            <span className="text-base font-medium">Operator Information</span>
          </div>
        }
        extra={
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={showAddOperatorModal}
            style={{
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            }}
          >
            Add Operator
          </Button>
        }
        bordered={false}
        className="rounded-lg shadow-sm mt-4"
        bodyStyle={{ padding: "0" }}
      >
        {operatorLoading ? (
          <div className="py-10 flex justify-center">
            <Spin tip="Loading operator records..." />
          </div>
        ) : hasOperator ? (
          <Table
            columns={operatorColumns}
            dataSource={operatorData}
            rowKey={(record) =>
              record.operator_id || record.id || Math.random().toString()
            }
            pagination={false}
            size="small"
            scroll={{
              y: "calc(100vh - 300px)",
              x: operatorData.length > 0 ? "max-content" : undefined,
            }}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No operator information available"
            className="py-10"
            style={{ marginBottom: "20px" }}
          ></Empty>
        )}
      </Card>

      {/* Add Operator Modal */}
      <Modal
        title={isEditingOperator ? "Edit Operator" : "Add New Operator"}
        open={isOperatorModalVisible}
        onCancel={handleOperatorModalCancel}
        width={700}
        footer={[
          <Button key="cancel" onClick={handleOperatorModalCancel}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={operatorModalLoading}
            onClick={handleOperatorModalSubmit}
            style={{
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            }}
          >
            {isEditingOperator ? "Update" : "Add"}
          </Button>,
        ]}
      >
        <Form form={operatorForm} layout="vertical">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="fishpond_location"
              label="Fishpond Location"
              rules={[
                { required: true, message: "Please enter fishpond location" },
              ]}
            >
              <Input placeholder="Enter fishpond location" />
            </Form.Item>

            <Form.Item
              name="cultured_species"
              label="Cultured Species"
              rules={[
                { required: true, message: "Please enter cultured species" },
              ]}
            >
              <Select placeholder="Select Species">
                <Option value="Tilapia">Tilapia</Option>
                <Option value="Bangus (Milkfish)">Bangus (Milkfish)</Option>
                <Option value="Catfish">Catfish</Option>
                <Option value="Carp">Carp</Option>
                <Option value="Shrimp">Shrimp</Option>
                <Option value="Prawn">Prawn</Option>
                <Option value="Mudcrab">Mudcrab</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="productive_area_sqm"
              label="Productive Area (sqm)"
              rules={[
                { required: true, message: "Please enter productive area" },
              ]}
            >
              <InputNumber
                className="w-full"
                min={0}
                placeholder="Enter productive area in square meters"
              />
            </Form.Item>

            <Form.Item
              name="stocking_density"
              label="Stocking Density"
              rules={[
                { required: true, message: "Please enter stocking density" },
              ]}
            >
              <InputNumber
                className="w-full"
                min={0}
                placeholder="Enter stocking density"
              />
            </Form.Item>

            <Form.Item
              name="date_of_stocking"
              label="Date of Stocking"
              rules={[
                { required: true, message: "Please select date of stocking" },
              ]}
            >
              <DatePicker className="w-full" />
            </Form.Item>

            <Form.Item
              name="production_kg"
              label="Production (kg)"
              rules={[
                { required: true, message: "Please enter production in kg" },
              ]}
            >
              <InputNumber
                className="w-full"
                min={0}
                placeholder="Enter production in kilograms"
              />
            </Form.Item>

            <Form.Item name="date_of_harvest" label="Date of Harvest">
              <DatePicker className="w-full" />
            </Form.Item>

            <Form.Item
              name="operational_status"
              label="Operational Status"
              rules={[
                { required: true, message: "Please select operational status" },
              ]}
            >
              <Select placeholder="Select Status">
                <Option value="Active">Active</Option>
                <Option value="Inactive">Inactive</Option>
                <Option value="Under Maintenance">Under Maintenance</Option>
                <Option value="Abandoned">Abandoned</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="geotagged_photo_url"
              label="Geotagged Photo"
              className="col-span-2"
            >
              <Input placeholder="Enter photo URL" />
            </Form.Item>

            <Form.Item name="remarks" label="Remarks" className="col-span-2">
              <Input.TextArea
                rows={4}
                placeholder="Enter any additional notes or remarks"
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default OperatorTab;
