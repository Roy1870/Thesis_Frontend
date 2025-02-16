import { useState, useEffect } from "react";
import { Card, Typography, Spin } from "antd";
import LivestockLineChart from "./LivestockLineChart";
import axios from "axios";

const { Title, Paragraph } = Typography;

const LivestockInsights = () => {
  const [chartData, setChartData] = useState([]);
  const [insights, setInsights] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Retrieve the token from localStorage
        const token = localStorage.getItem("authToken");

        if (!token) {
          throw new Error("No authentication token found.");
        }

        const response = await axios.get(
          "http://localhost:8000/api/livestock/LiveStockInsights",
          {
            headers: {
              Authorization: `Bearer ${token}`, // Pass the token in the headers
            },
          }
        );

        const { data, insights } = response.data;

        setChartData(data);
        setInsights(insights);
      } catch (error) {
        console.error("Error fetching livestock data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  return (
    <div style={{ padding: "24px" }}>
      <Card bordered={false} style={{ marginBottom: "24px" }}>
        <Title level={2}>Yearly Livestock Insights</Title>
        <Paragraph>
          Below is the yearly livestock trend and AI-generated insights to help
          guide decisions for improving livestock management across barangays.
        </Paragraph>
      </Card>

      <Card bordered={false} style={{ marginBottom: "24px" }}>
        {loading ? (
          <Spin tip="Loading chart..." />
        ) : (
          <LivestockLineChart data={chartData} />
        )}
      </Card>

      <Card bordered={false}>
        <Title level={3}>AI-Generated Insights</Title>
        {loading ? (
          <Spin tip="Loading insights..." />
        ) : (
          <Paragraph>{insights || "No insights available."}</Paragraph>
        )}
      </Card>
    </div>
  );
};

export default LivestockInsights;
