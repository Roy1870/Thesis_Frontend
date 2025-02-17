import { useEffect, useState } from "react";
import { Table, Spin, Input, Space, Button, Alert, Modal } from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import * as XLSX from "xlsx";
import FilterSelect from "./FilterSelect"; // Import the FilterSelect component
import "./animaldatatable.css"; // Custom CSS
import DataEntry from "./DataEntry"; // Import the DataEntry component

const AnimalDataGroupedTable = ({ currentComponent, setCurrentComponent }) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState(""); // For search functionality
  const [isModalVisible, setIsModalVisible] = useState(false); // State for modal visibility
  // Fetch data from the API
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/animaldata") // Replace with your actual endpoint
      .then((response) => {
        const formatted = formatData(response.data);
        setData(formatted);
        setFilteredData(formatted);
        setLoading(false);
      })
      .catch((error) => {
        setError("Failed to fetch data.");
        setLoading(false);
      });
  }, []);

  // Format the data for the table
  const formatData = (data) => {
    const formatted = [];
    const years = [2021, 2022, 2023, 2024, 2025]; // The years we want to handle

    data.forEach((animal) => {
      animal["Kinds of Animals"].forEach((kind) => {
        const row = {
          animalName: animal["Animal Name"],
          kindName: kind["Kind Name"],
        };

        // Loop through each year and check if data exists, otherwise set to 0
        years.forEach((year) => {
          const yearData = kind["Yearly Data"].find(
            (data) => data.Year === String(year)
          );

          // If the year data is found, assign the counts; otherwise, assign 0
          row[`commercial_${year}`] = yearData
            ? yearData["Commercial Count"] || 0
            : 0;
          row[`backyard_${year}`] = yearData
            ? yearData["Backyard Count"] || 0
            : 0;
        });

        formatted.push(row);
      });
    });

    return formatted;
  };

  // Define the table columns with grouping for Commercial and Backyard
  const columns = [
    {
      title: "Animal Name",
      dataIndex: "animalName",
      key: "animalName",
      fixed: "left",
      render: (text, record, index) => {
        if (index === 0 || filteredData[index - 1]?.animalName !== text) {
          return {
            children: <strong>{text}</strong>,
            props: {
              rowSpan: filteredData.filter((item) => item.animalName === text)
                .length,
            },
          };
        }
        return { props: { rowSpan: 0 } };
      },
    },
    {
      title: "Kind of Animal",
      dataIndex: "kindName",
      key: "kindName",
      fixed: "left",
    },
    {
      title: "Commercial",
      children: [
        {
          title: "2021",
          dataIndex: "commercial_2021",
          key: "commercial_2021",
          align: "center",
        },
        {
          title: "2022",
          dataIndex: "commercial_2022",
          key: "commercial_2022",
          align: "center",
        },
        {
          title: "2023",
          dataIndex: "commercial_2023",
          key: "commercial_2023",
          align: "center",
        },
        {
          title: "2024",
          dataIndex: "commercial_2024",
          key: "commercial_2024",
          align: "center",
        },
        {
          title: "2025",
          dataIndex: "commercial_2025",
          key: "commercial_2025",
          align: "center",
        },
      ],
    },
    {
      title: "Backyard",
      children: [
        {
          title: "2021",
          dataIndex: "backyard_2021",
          key: "backyard_2021",
          align: "center",
        },
        {
          title: "2022",
          dataIndex: "backyard_2022",
          key: "backyard_2022",
          align: "center",
        },
        {
          title: "2023",
          dataIndex: "backyard_2023",
          key: "backyard_2023",
          align: "center",
        },
        {
          title: "2024",
          dataIndex: "backyard_2024",
          key: "backyard_2024",
          align: "center",
        },
        {
          title: "2025",
          dataIndex: "backyard_2025",
          key: "backyard_2025",
          align: "center",
        },
      ],
    },
  ];

  // Handle search input change
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    const filtered = data.filter(
      (item) =>
        item.animalName.toLowerCase().includes(value) ||
        item.kindName.toLowerCase().includes(value)
    );
    setFilteredData(filtered);
  };

  // Handle filter changes (you can expand this with multiple filter options)
  const handleFilterChange = (value) => {
    const filtered = data.filter((item) =>
      item.animalName.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  // Export data to Excel
  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Animal Data");
    XLSX.writeFile(wb, "AnimalData.xlsx");
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  return (
    <div style={{ margin: "10px" }}>
      {/* Title, Search Bar, and Filter Select */}
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
          Inventory
        </h2>
        <Space>
          <Input
            placeholder="Search by Animal or Kind of Animal"
            onChange={handleSearch}
            style={{
              width: 400,
              height: 35, // Ensure consistent height
              display: "flex",
              alignItems: "center", // Align content inside the input
            }}
            allowClear
            suffix={<SearchOutlined style={{ color: "#6A9C89" }} />}
          />
        </Space>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "15px",
          marginBottom: "20px",
          gap: "10px",
        }}
      >
        {/* Add New Entry Button */}
        <Button
          type="primary"
          onClick={showModal}
          style={{
            backgroundColor: "#6A9C89",
            borderColor: "#6A9C89",
          }}
          icon={<PlusOutlined />}
        >
          Add New Entry
        </Button>

        {/* Export and Filter Options */}
        <div style={{ display: "flex", gap: "10px" }}>
          <FilterSelect
            currentComponent={currentComponent}
            setCurrentComponent={setCurrentComponent}
          />
          <Button
            type="primary"
            onClick={handleExport}
            style={{ backgroundColor: "#6A9C89", borderColor: "#6A9C89" }}
          >
            Export to Excel
          </Button>
        </div>
      </div>

      {/* Spinner and Error Handling */}
      {loading && <Spin size="large" />}
      {error && <Alert message={error} type="error" />}

      {/* Table */}
      {!loading && !error && (
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey={(record, index) => index}
          pagination={{ pageSize: 5 }}
          bordered
          scroll={{ x: 1000 }}
          className="custom-table"
        />
      )}
      {/* Modal for Data Entry */}
      <Modal
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={null} // Remove default footer buttons
        width={800} // Optional: Adjust modal width
      >
        <DataEntry />
      </Modal>
    </div>
  );
};

export default AnimalDataGroupedTable;
