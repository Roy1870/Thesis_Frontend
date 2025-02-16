import LivestockInsights from "./LiveStockInsights";

function Analytics() {
  return (
    <div style={{ margin: "10px" }}>
      <h2
        style={{
          fontWeight: "bold",
          margin: 0,
          lineHeight: "1", // Ensures consistent alignment
        }}
      >
        Analytics
      </h2>
      <LivestockInsights />
    </div>
  );
}

export default Analytics;
