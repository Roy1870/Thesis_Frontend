import { Card, Typography } from "antd";

const { Text } = Typography;

export default function Leaderboard() {
  return (
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
      <Text>No data available</Text>
    </Card>
  );
}
