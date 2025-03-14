import { Card, Col, Row, Typography, Spin } from "antd";
import {
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  ResponsiveContainer,
} from "recharts"; // Import Recharts components
import useFetchData from "./useFetchData"; // Import the custom hook
import useFetchChartData from "./useFetchChartData"; // Import the custom hook
import useFetchTopBarangay from "./useFetchTopBarangay";

const { Text, Title } = Typography;

export default function Dashboard() {
  // Fetch total animals
  const { data: animalCount, loading: loadingAnimals } = useFetchData(
    "http://localhost:8000/api/animal/count"
  );

  // Fetch total livestock
  const { data: livestockCount, loading: loadingLivestock } = useFetchData(
    "http://localhost:8000/api/livestock/total"
  );

  const { data: currentYear, loading: loadingCurrent } = useFetchData(
    "http://localhost:8000/api/livestock/currentyeartotal"
  );
  const {
    data: topBarangays,
    loading: loadingBarangays,
    error,
  } = useFetchTopBarangay("http://localhost:8000/api/livestock/TopBarangay");
  // Fetch yearly livestock data for chart
  const { data: yearlyLivestockData, loading: loadingYearlyData } =
    useFetchChartData("http://localhost:8000/api/livestock/YearsData");

  // Get current date with month name and year (e.g., "October 2024")
  const currentDate = new Date();
  const options = { year: "numeric", month: "long" }; // Show month name and year
  const formattedDate = currentDate.toLocaleDateString("en-US", options);

  return (
    <div style={{ margin: "20px" }}>
      <h2 style={{ fontWeight: "bold" }}>Dashboard</h2>

      {/* Top 3 boxes */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {/* Card 1: Total Animals */}
        <Col span={8}>
          <Card
            bordered={false}
            style={{
              backgroundColor: "#6A9C89", // Green background
              borderRadius: 0,
              color: "#fff", // White text color for contrast
            }}
          >
            <Text
              strong
              style={{
                fontSize: 24,
                fontFamily: "'Open Sans', sans-serif", // Use Open Sans font
                fontWeight: "900", // Extra bold
                color: "#fff",
              }}
            >
              Total Grower
            </Text>
            <div>
              {loadingAnimals ? (
                <Spin tip="Loading..." style={{ color: "#fff" }} />
              ) : (
                <>
                  <Title
                    level={2}
                    style={{
                      margin: 0,
                      fontFamily: "'Open Sans', sans-serif",
                      fontWeight: "900",
                      color: "#fff",
                    }}
                  >
                    {animalCount !== null ? animalCount : "N/A"}
                  </Title>
                  <Text
                    strong
                    style={{
                      fontSize: 10,
                      fontFamily: "'Open Sans', sans-serif",
                      fontWeight: "900",
                      color: "#fff",
                      textAlign: "center",
                    }}
                  >
                    As of now, {formattedDate}
                  </Text>
                </>
              )}
            </div>
          </Card>
        </Col>

        {/* Card 2: Total Livestock */}
        <Col span={8}>
          <Card
            bordered={false}
            style={{
              backgroundColor: "#6A9C89",
              borderRadius: 0,
              color: "#fff",
            }}
          >
            <Text
              strong
              style={{
                fontSize: 24,
                fontFamily: "'Open Sans', sans-serif",
                fontWeight: "900",
                color: "#fff",
              }}
            >
              Total Raiser
            </Text>
            <div>
              {loadingLivestock ? (
                <Spin tip="Loading..." style={{ color: "#fff" }} />
              ) : (
                <>
                  <Title
                    level={2}
                    style={{
                      margin: 0,
                      fontFamily: "'Open Sans', sans-serif",
                      fontWeight: "900",
                      color: "#fff",
                    }}
                  >
                    {livestockCount !== null ? livestockCount : "N/A"}
                  </Title>
                  <Text
                    strong
                    style={{
                      fontSize: 10,
                      fontFamily: "'Open Sans', sans-serif",
                      fontWeight: "900",
                      color: "#fff",
                    }}
                  >
                    As of now, {formattedDate}
                  </Text>
                </>
              )}
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card
            bordered={false}
            style={{
              backgroundColor: "#6A9C89", // Green background
              borderRadius: 0,
              color: "#fff", // White text color for contrast
            }}
          >
            <Text
              strong
              style={{
                fontSize: 23,
                fontFamily: "'Open Sans', sans-serif", // Use Open Sans font
                fontWeight: "950", // Extra bold
                color: "#fff",
              }}
            >
              Total Operator
            </Text>
            <div>
              {loadingCurrent ? (
                <Spin tip="Loading..." style={{ color: "#fff" }} />
              ) : (
                <>
                  <Title
                    level={2}
                    style={{
                      margin: 0,
                      fontFamily: "'Open Sans', sans-serif",
                      fontWeight: "900",
                      color: "#fff",
                    }}
                  >
                    {currentYear !== null ? currentYear : "N/A"}
                  </Title>
                  <Text
                    strong
                    style={{
                      fontSize: 10,
                      fontFamily: "'Open Sans', sans-serif",
                      fontWeight: "900",
                      color: "#fff",
                      textAlign: "center",
                    }}
                  >
                    As of now, {formattedDate}
                  </Text>
                </>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Bottom layout with Chart and Leaderboard */}
      <Row gutter={16}>
        <Col span={16}>
          <Card bordered={false} style={{ height: "100%", borderRadius: 0 }}>
            {loadingYearlyData ? (
              <Spin tip="Loading chart..." />
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={yearlyLivestockData}>
                  {/* Chart Title */}
                  <Title level={3} style={{ textAlign: "center" }}>
                    Yearly Total Livestock COunt
                  </Title>

                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis
                    label={{
                      value: "Total Farmers", // Y-axis label text
                      angle: -90, // Rotate label
                      position: "insideLeft", // Position it inside the chart
                      style: { fontSize: "14px", fontWeight: "bold" }, // Style the label
                    }}
                    tickFormatter={(value) => value.toLocaleString()} // Format ticks with commas
                    domain={[0, 400]} // Automatically adjust range based on the data
                    tick={{ angle: -45 }} // Rotate the Y-axis ticks for readability
                  />
                  <Tooltip />
                  <Legend />
                  <Area
                    dataKey="total_livestock_count"
                    stroke="#FFA500"
                    fill="#6A9C89"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
        <Col span={8}>
          <Card
            title="Leaderboard"
            bordered={false}
            style={{
              height: "100%",
              borderRadius: 0,
              background: "linear-gradient(to top, #6A9C89, #fff)", // Gradient background
              padding: "16px",
            }}
          >
            {loadingBarangays ? (
              <Spin tip="Loading leaderboard..." />
            ) : error ? (
              <Text type="danger">{error}</Text>
            ) : topBarangays && topBarangays.length > 0 ? (
              <div>
                {/* Top 1 */}
                {topBarangays[0] && (
                  <div
                    style={{
                      marginBottom: "24px",
                      textAlign: "center",
                      padding: "16px",
                      background: "rgba(255, 255, 255, 0.8)", // Slightly transparent background
                      borderRadius: "8px",
                    }}
                  >
                    <Text
                      strong
                      style={{
                        fontSize: 24,
                        fontFamily: "'Open Sans', sans-serif",
                        color: "#6A9C89", // Dark green for emphasis
                      }}
                    >
                      🥇 {topBarangays[0].barangay_name}
                    </Text>
                    <br />
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "bold",
                        color: "#555",
                      }}
                    >
                      Total Livestock:{" "}
                      {topBarangays[0].total_livestock.toLocaleString()}
                    </Text>
                  </div>
                )}

                {/* Top 2 and 3 */}
                <div>
                  {topBarangays.slice(1, 3).map((barangay, index) => (
                    <div
                      key={barangay.barangay_id}
                      style={{
                        marginBottom: "12px",
                        padding: "12px",
                        background: "rgba(255, 255, 255, 0.9)", // Slightly transparent background
                        borderRadius: "8px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        strong
                        style={{
                          fontSize: 16,
                          fontFamily: "'Open Sans', sans-serif",
                          color: "#6A9C89", // Dark green
                        }}
                      >
                        {index === 0 ? "🥈" : "🥉"} {barangay.barangay_name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "bold",
                          color: "#555",
                        }}
                      >
                        {barangay.total_livestock.toLocaleString()}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Text>No data available</Text>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}