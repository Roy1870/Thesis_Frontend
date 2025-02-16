import { useState } from "react";
import { Button, Card, Typography, Space, Divider, Input } from "antd";

const { Title, Paragraph } = Typography;

const Settings = () => {
  const [activeSection, setActiveSection] = useState("about");

  return (
    <div style={{ margin: "10px" }}>
      {/* Title and Buttons for Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Title level={3} style={{ fontWeight: "bold" }}>
          Settings
        </Title>
        <Space>
          <Button
            onClick={() => setActiveSection("about")}
            style={{
              marginRight: "10px",
              backgroundColor: activeSection === "about" ? "#6A9C89" : "#fff",
              borderColor: "#6A9C89",
              color: activeSection === "about" ? "#fff" : "#6A9C89",
              fontWeight: "bold",
              borderRadius: "5px",
              boxShadow:
                activeSection === "about"
                  ? "0 0 5px 2px rgba(0, 0, 0, 0.1)"
                  : "none",
            }}
          >
            About Us
          </Button>
          <Button
            onClick={() => setActiveSection("contacts")}
            style={{
              backgroundColor:
                activeSection === "contacts" ? "#6A9C89" : "#fff",
              borderColor: "#6A9C89",
              color: activeSection === "contacts" ? "#fff" : "#6A9C89",
              fontWeight: "bold",
              borderRadius: "5px",
              boxShadow:
                activeSection === "contacts"
                  ? "0 0 5px 2px rgba(0, 0, 0, 0.1)"
                  : "none",
            }}
          >
            Contacts
          </Button>
        </Space>
      </div>

      {/* Content based on active section */}
      <Card
        style={{
          marginTop: "20px",
          backgroundColor: "#f9f9f9",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
        bodyStyle={{ padding: "20px" }}
      >
        <Space direction="vertical" size="middle">
          {activeSection === "about" && (
            <>
              <Paragraph>
                The{" "}
                <strong>
                  City Agriculture and Veterinary Department (CAVD) of Butuan
                  City
                </strong>{" "}
                is committed to supporting the agricultural and veterinary needs
                of our community. We are at the forefront of monitoring and
                analyzing livestock and poultry production across all barangays.
              </Paragraph>
              <Paragraph>
                Our purpose is to <strong>list, tally, and analyze</strong> the
                total number of livestock and poultry products produced by
                farmers in each barangay. This data enables us to:
              </Paragraph>
              <ul style={{ paddingLeft: "20px" }}>
                <li>Track and improve agricultural productivity,</li>
                <li>
                  Support farmers in resource planning and development, and
                </li>
                <li>
                  Develop sustainable policies to ensure food security and
                  economic growth.
                </li>
              </ul>
              <Divider />
              <Paragraph style={{ fontWeight: "bold", textAlign: "center" }}>
                Together, we cultivate success!
              </Paragraph>
            </>
          )}

          {activeSection === "contacts" && (
            <>
              <Title level={4}>Contact Information</Title>
              <Paragraph>
                For any inquiries or assistance, feel free to contact us:
              </Paragraph>
              <ul style={{ paddingLeft: "20px" }}>
                <li>Email: cavd@butuan.gov.ph</li>
                <li>Phone: (085) 123-4567</li>
                <li>Address: City Hall, Butuan City, Philippines</li>
              </ul>
              <Divider />
              <Paragraph>
                You can also reach us through the form below:
              </Paragraph>
              <Input
                placeholder="Enter your query..."
                style={{ width: "100%" }}
              />
            </>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default Settings;
