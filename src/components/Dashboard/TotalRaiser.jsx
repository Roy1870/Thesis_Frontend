import { Card, Typography, Spin } from "antd";
import useFetchData from "../../hooks/useFetchData";

const { Text, Title } = Typography;

export default function TotalRaiser() {
  const { data: raiserCount, loading } = useFetchData("http://localhost:8000/api/raiser/total");

  return (
    <Card bordered={false} style={{ backgroundColor: "#6A9C89", borderRadius: 0, color: "#fff" }}>
      <Text strong style={{ fontSize: 24, fontWeight: "900", color: "#fff" }}>Total Raisers</Text>
      <div>
        {loading ? <Spin tip="Loading..." /> : (
          <>
            <Title level={2} style={{ margin: 0, fontWeight: "900", color: "#fff" }}>
              {raiserCount ?? "N/A"}
            </Title>
          </>
        )}
      </div>
    </Card>
  );
}
