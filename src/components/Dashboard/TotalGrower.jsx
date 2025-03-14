import { Card, Typography, Spin } from "antd";
import useFetchData from "../../hooks/useFetchData";

const { Text, Title } = Typography;

export default function TotalGrower() {
  const { data: growerCount, loading } = useFetchData("http://localhost:8000/api/grower/total");

  return (
    <Card bordered={false} style={{ backgroundColor: "#6A9C89", borderRadius: 0, color: "#fff" }}>
      <Text strong style={{ fontSize: 24, fontWeight: "900", color: "#fff" }}>Total Growers</Text>
      <div>
        {loading ? <Spin tip="Loading..." /> : (
          <>
            <Title level={2} style={{ margin: 0, fontWeight: "900", color: "#fff" }}>
              {growerCount ?? "N/A"}
            </Title>
          </>
        )}
      </div>
    </Card>
  );
}
