import { Layout } from "antd";
import Sidebar from "./components/Sidebar";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Dashboard from "./components/Dashboard";
import DataEntry from "./components/DataEntry";
import Inventory from "./components/Inventory";
import Analytics from "./components/Analytics";
import Settings from "./components/Settings";
import Login from "./components/Login";
import "./components/sidebar.css";
import Profile from "./components/Profile";
import UserManagement from "./components/UserManagement";

const { Content } = Layout;

function App() {
  const isAuthenticated = !!localStorage.getItem("authToken"); // Check if token is in localStorage

  return (
    <Router>
      {isAuthenticated ? (
        <Layout style={{ minHeight: "100vh", display: "flex" }}>
          <Sidebar />
          <Layout style={{ flex: 1 }}>
            <Content
              style={{
                padding: 16,
                background: "#fff",
                margin: 0,
                flex: 1,
              }}
            >
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/data-entry" element={<DataEntry />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/user-management" element={<UserManagement />} />
                <Route path="*" element={<Navigate to="/" />} />{" "}
                {/* Redirect unknown paths to Dashboard */}
              </Routes>
            </Content>
          </Layout>
        </Layout>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" />} />{" "}
          {/* Redirect unknown paths to Login */}
        </Routes>
      )}
    </Router>
  );
}

export default App;
