import { useState, useEffect } from "react";
import { Card, Col, Row, Typography, Spin, Statistic, Empty } from "antd";
import {
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  UserOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  BarChartOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

export default function Dashboard() {
  const [loading, setLoading] = useState(false);

  // Theme colors - matching your existing color scheme
  const colors = {
    primary: "#6A9C89",
    secondary: "#E6F5E4",
    accent: "#4F6F7D",
    error: "#D32F2F",
    warning: "#FFA000",
    success: "#388E3C",
    textDark: "#333333",
    textLight: "#666666",
    border: "#E0E0E0",
    background: "#F5F7F9",
  };

  // Sample data for charts
  const cropDistribution = [
    { name: "Rice", value: 35 },
    { name: "Corn", value: 25 },
    { name: "Vegetables", value: 20 },
    { name: "Fruits", value: 15 },
    { name: "Others", value: 5 },
  ];

  const monthlyData = [
    { name: "Jan", farmers: 20, crops: 45 },
    { name: "Feb", farmers: 25, crops: 55 },
    { name: "Mar", farmers: 30, crops: 65 },
    { name: "Apr", farmers: 35, crops: 70 },
    { name: "May", farmers: 40, crops: 80 },
    { name: "Jun", farmers: 45, crops: 90 },
  ];

  // Get current date with month name and year
  const currentDate = new Date();
  const options = { year: "numeric", month: "long" };
  const formattedDate = currentDate.toLocaleDateString("en-US", options);

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: colors.background,
        minHeight: "100vh",
      }}
    >
      <Title level={2} style={{ marginBottom: "24px", color: colors.textDark }}>
        Farmer Management Dashboard
      </Title>

      {/* Top Stats Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card
            bordered={false}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 8,
              color: "#fff",
              marginBottom: 16,
            }}
          >
            <Statistic
              title={
                <Text
                  style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}
                >
                  Total Farmers
                </Text>
              }
              value={125}
              valueStyle={{ color: "#fff", fontSize: 28, fontWeight: "bold" }}
              prefix={<UserOutlined />}
            />
            <Text style={{ color: "#fff", fontSize: 12 }}>
              As of {formattedDate}
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card
            bordered={false}
            style={{
              backgroundColor: colors.accent,
              borderRadius: 8,
              color: "#fff",
              marginBottom: 16,
            }}
          >
            <Statistic
              title={
                <Text
                  style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}
                >
                  Total Crops
                </Text>
              }
              value={350}
              valueStyle={{ color: "#fff", fontSize: 28, fontWeight: "bold" }}
              prefix={<InfoCircleOutlined />}
            />
            <Text style={{ color: "#fff", fontSize: 12 }}>
              Across all farmers
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card
            bordered={false}
            style={{
              backgroundColor: colors.success,
              borderRadius: 8,
              color: "#fff",
              marginBottom: 16,
            }}
          >
            <Statistic
              title={
                <Text
                  style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}
                >
                  Active Barangays
                </Text>
              }
              value={15}
              valueStyle={{ color: "#fff", fontSize: 28, fontWeight: "bold" }}
              prefix={<HomeOutlined />}
            />
            <Text style={{ color: "#fff", fontSize: 12 }}>
              With registered farmers
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12} style={{ marginBottom: 16 }}>
          <Card
            title={<Title level={4}>Monthly Farmer Registration</Title>}
            bordered={false}
            style={{ borderRadius: 8, height: "100%" }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={monthlyData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="farmers"
                  name="Farmers"
                  stroke={colors.primary}
                  fill={colors.primary}
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={<Title level={4}>Crop Distribution</Title>}
            bordered={false}
            style={{ borderRadius: 8, height: "100%" }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={cropDistribution}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Farmers" fill={colors.primary} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Bottom Row */}
      <Row gutter={16}>
        <Col span={24}>
          <Card
            title={<Title level={4}>Recent Activity</Title>}
            bordered={false}
            style={{ borderRadius: 8 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "40px 0",
              }}
            >
              <Empty
                description="No recent activity"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
