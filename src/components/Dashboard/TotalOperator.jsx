import { Card, Typography, Spin } from "antd";
import useFetchData from "../../hooks/useFetchData";

const { Text, Title } = Typography;

export default function TotalOperator() {
  const { data: operatorCount, loading } = useFetchData("http://localhost:8000/api/operator/total");

  return (
    <Card bordered={false} style={{ backgroundColor: "#6A9C89", borderRadius: 0, color: "#fff" }}>
      <Text strong style={{ fontSize: 24, fontWeight: "900", color: "#fff" }}>Total Operators</Text>
      <div>
        {loading ? <Spin tip="Loading..." /> : (
          <>
            <Title level={2} style={{ margin: 0, fontWeight: "900", color: "#fff" }}>
              {operatorCount ?? "N/A"}
            </Title>
          </>
        )}
      </div>
    </Card>
  );
}
