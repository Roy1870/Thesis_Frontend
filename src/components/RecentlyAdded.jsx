import { useState, useEffect } from "react";
import { Table, Spin, Alert, Button } from "antd";
import axios from "axios";

const RecentlyAdded = ({ setCurrentComponent }) => {
  const [farmerData, setFarmerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentFarmers = async () => {
      try {
        const authToken = localStorage.getItem("authToken");

        if (!authToken) {
          setError("Authorization token not found.");
          setLoading(false);
          return;
        }

        const response = await axios.get("http://localhost:8000/api/farmers/recent", {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        setFarmerData(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch data.");
        setLoading(false);
      }
    };

    fetchRecentFarmers();
  }, []);

  const columns = [
    { title: "Farmer Name", dataIndex: "farmer_name", key: "farmer_name" },
    { title: "Barangay", dataIndex: "barangay", key: "barangay" },
    { title: "Contact", dataIndex: "contact", key: "contact" },
    { title: "Date Added", dataIndex: "added_date", key: "added_date" },
  ];

  return (
    <div style={{ margin: "10px" }}>
      <h2 style={{ fontWeight: "bold", margin: 0 }}>Recently Added Farmers</h2>

      {loading && <Spin size="large" />}
      {error && <Alert message={error} type="error" />}
      {!loading && !error && (
        <Table
          columns={columns}
          dataSource={farmerData}
          rowKey="farmer_name"
          pagination={false}
          style={{ marginTop: "20px" }}
        />
      )}

      <Button
        type="default"
        onClick={() => setCurrentComponent("FarmerDetails")}
        style={{ marginTop: "15px", backgroundColor: "#6A9C89", color: "white" }}
      >
        Back to Inventory
      </Button>
    </div>
  );
};

export default RecentlyAdded;
