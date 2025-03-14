import { Card, Typography, Spin } from "antd";
import { AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, ResponsiveContainer } from "recharts";
import useFetchChartData from "../../hooks/useFetchChartData";

const { Title } = Typography;

export default function Graphs() {
  const { data: yearlyLivestockData, loading } = useFetchChartData("http://localhost:8000/api/livestock/YearsData");

  return (
    <Card bordered={false} style={{ height: "100%", borderRadius: 0 }}>
      {loading ? <Spin tip="Loading chart..." /> : (
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={yearlyLivestockData}>
            <Title level={3} style={{ textAlign: "center" }}>Yearly Total Livestock Count</Title>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(value) => value.toLocaleString()} />
            <Tooltip />
            <Legend />
            <Area dataKey="total_livestock_count" stroke="#FFA500" fill="#6A9C89" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
