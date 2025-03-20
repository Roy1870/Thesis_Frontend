import React, { useState } from "react";
import { Layout, Menu, Button, Dropdown, Space, message } from "antd";
import {
  DashboardOutlined,
  FormOutlined,
  InboxOutlined,
  LineChartOutlined,
  SettingOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CheckCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./sidebar.css";
import logo from "../images/logo.png";

const { Sider } = Layout;

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState(window.location.pathname);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    message.success({
      content: "Logout success!",
      duration: 4,
      icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
    });

    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  const userType = localStorage.getItem("userType");
  const userName = localStorage.getItem("userName");
  const profileMenu = (
    <Menu>
      <Menu.Item
        key="/profile"
        icon={<UserOutlined />}
        onClick={() => {
          setSelectedKey("/profile");
          navigate("/profile");
        }}
      >
        Profile Details
      </Menu.Item>
      <Menu.Item key="/logout" icon={<UserOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      trigger={null}
      width={250}
      style={{ backgroundColor: "#6A9C89" }}
    >
      <div className="sidebar-header">
        {!collapsed && (
          <div className="logo">
            <img src={logo} alt="Logo" className="logo-img" />
            <span className="logo-text">AgriTrack</span>
          </div>
        )}
        <Button
          className={"toggle-btn " + (collapsed ? "collapsed" : "")}
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleSidebar}
        />
      </div>

      {!collapsed && (
        <div className="welcome-container">
          <h3 className="welcome-text">
            Welcome, <span className="username">{userName}</span>!
          </h3>
        </div>
      )}

      <Menu
        style={{ backgroundColor: "#6A9C89" }}
        selectedKeys={[selectedKey]}
        mode="inline"
      >
        <Menu.Item
          key="/"
          icon={<DashboardOutlined />}
          onClick={() => {
            setSelectedKey("/");
            navigate("/");
          }}
        >
          Dashboard
        </Menu.Item>
        <Menu.Item
          key="/add-data"
          icon={<FormOutlined />}
          onClick={() => {
            setSelectedKey("/add-data");
            navigate("/add-data");
          }}
        >
          Add Data
        </Menu.Item>
        <Menu.Item
          key="/inventory"
          icon={<InboxOutlined />}
          onClick={() => {
            setSelectedKey("/inventory");
            navigate("/inventory");
          }}
        >
          Inventory
        </Menu.Item>
        <Menu.Item
          key="/analytics"
          icon={<LineChartOutlined />}
          onClick={() => {
            setSelectedKey("/analytics");
            navigate("/analytics");
          }}
        >
          Analytics
        </Menu.Item>
        <Menu.Item
          key="/settings"
          icon={<SettingOutlined />}
          onClick={() => {
            setSelectedKey("/settings");
            navigate("/settings");
          }}
        >
          Settings
        </Menu.Item>

        {userType === "admin" && (
          <Menu.Item
            key="/user-management"
            icon={<TeamOutlined />}
            onClick={() => {
              setSelectedKey("/user-management");
              navigate("/user-management");
            }}
          >
            User Management
          </Menu.Item>
        )}
      </Menu>

      <div className={"profile " + (selectedKey === "/profile" ? "selected" : "")}>
        <Dropdown overlay={profileMenu} trigger={["click"]}>
          <a onClick={(e) => e.preventDefault()}>
            <Space>
              <UserOutlined className="profile-icon" />
              {!collapsed && <span className="profile-text">Profile</span>}
            </Space>
          </a>
        </Dropdown>
      </div>
    </Sider>
  );
};

export default Sidebar;