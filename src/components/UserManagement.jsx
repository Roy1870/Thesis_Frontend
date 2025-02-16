import { useState, useEffect } from "react";
import {
  Table,
  Spin,
  Alert,
  Input,
  Space,
  Button,
  Tooltip,
  Popconfirm,
  message,
  Modal,
  Form,
} from "antd";
import { EditOutlined, SearchOutlined } from "@ant-design/icons"; // Pencil icon and search icon
import axios from "axios";
import * as XLSX from "xlsx"; // Import xlsx for export functionality

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [newUserType, setNewUserType] = useState("");
  const [searchText, setSearchText] = useState(""); // Search text for filtering
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility state
  const [form] = Form.useForm(); // Form instance for modal

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          setError("Authorization token not found.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          "http://localhost:8000/api/usermanagement/data",
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch data.");
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Delete user function
  const deleteUser = async (userId) => {
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        message.error("Authorization token not found.");
        return;
      }

      await axios.delete(
        `http://localhost:8000/api/usermanagement/delete/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      message.success("User deleted successfully.");
      // Refresh the user data
      setUsers(users.filter((user) => user.id !== userId));
    } catch (err) {
      message.error("Failed to delete user.");
    }
  };

  // Update user type function
  const updateUserType = async (userId, newUserType) => {
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        message.error("Authorization token not found.");
        return;
      }

      await axios.put(
        `http://localhost:8000/api/usermanagement/change-type/${userId}`,
        { user_type: newUserType },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      message.success("User type updated successfully.");
      // Refresh the user data
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, user_type: newUserType } : user
        )
      );
      setEditingUserId(null); // Exit editing mode after update
    } catch (err) {
      message.error("Failed to update user type.");
    }
  };

  // Define columns for Ant Design Table
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone Number",
      dataIndex: "phone_number",
      key: "phone_number",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "User Type",
      dataIndex: "user_type",
      key: "user_type",
      render: (text, record) => {
        return (
          <Space>
            {editingUserId === record.id ? (
              <Space>
                <Input
                  value={newUserType}
                  onChange={(e) => setNewUserType(e.target.value)}
                  style={{ width: 120 }}
                />
                <Button
                  onClick={() => updateUserType(record.id, newUserType)}
                  type="primary"
                >
                  Save
                </Button>
                <Button onClick={() => setEditingUserId(null)} type="default">
                  Cancel
                </Button>
              </Space>
            ) : (
              <Space>
                <span>{text}</span>
                <Tooltip title="Edit User Type">
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => {
                      setEditingUserId(record.id);
                      setNewUserType(text); // Set the current user type as default
                    }}
                    type="link"
                  />
                </Tooltip>
              </Space>
            )}
          </Space>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Space size="middle">
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => deleteUser(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Handle Search functionality
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const filteredData = users.filter((user) =>
    user.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Export function to Excel
  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users Data");
    XLSX.writeFile(wb, "UsersData.xlsx");
  };

  // Handle modal visibility and form submission
  const showAddUserModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleAddUser = async (values) => {
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        message.error("Authorization token not found.");
        return;
      }

      await axios.post("http://localhost:8000/api/register", values, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      message.success("User added successfully.");
      setIsModalVisible(false);
      form.resetFields(); // Reset the form fields
      // Optionally, refresh the user list here
    } catch (err) {
      message.error("Failed to add user.");
    }
  };

  return (
    <div style={{ margin: "10px" }}>
      {/* Header with title and search */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: 0,
        }}
      >
        <h2
          style={{
            fontWeight: "bold",
            margin: 0,
            lineHeight: "1", // Ensures consistent alignment
          }}
        >
          User Management
        </h2>
        <Space>
          <Input
            placeholder="Search by Name"
            value={searchText}
            onChange={handleSearchChange}
            style={{
              width: 400,
              height: 35,
              display: "flex",
              alignItems: "center",
            }}
            suffix={<SearchOutlined style={{ color: "#6A9C89" }} />}
          />
        </Space>
      </div>

      {/* Export and Add User Buttons */}
      <div style={{ marginTop: "15px", marginBottom: "20px" }}>
        <Button
          type="primary"
          onClick={handleExport}
          style={{
            backgroundColor: "#6A9C89",
            borderColor: "#6A9C89",
            marginRight: 10,
          }}
        >
          Export to Excel
        </Button>
        <Button
          type="primary"
          onClick={showAddUserModal}
          style={{ backgroundColor: "#6A9C89", borderColor: "#6A9C89" }}
        >
          Add User
        </Button>
      </div>

      {/* Loading Spinner and Error Handling */}
      {loading && <Spin size="large" />}
      {error && <Alert message={error} type="error" />}

      {/* Table */}
      {!loading && !error && (
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={false}
          style={{
            marginTop: "20px",
          }}
          components={{
            header: {
              cell: (props) => (
                <th
                  {...props}
                  style={{
                    backgroundColor: "#6A9C89", // Green background for headers
                    color: "white", // White text for the header
                  }}
                />
              ),
            },
          }}
        />
      )}

      {/* Add User Modal */}
      <Modal
        title="Add User"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleAddUser}
          layout="vertical"
          initialValues={{
            name: "",
            email: "",
            password: "",
            password_confirmation: "",
          }}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[
              { required: true, message: "Please input the user's name!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please input the user's email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: "Please input the user's password!" },
            ]}
            hasFeedback
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="password_confirmation"
            rules={[
              {
                required: true,
                message: "Please confirm the user's password!",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject("The two passwords do not match!");
                },
              }),
            ]}
            hasFeedback
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
              Add User
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
