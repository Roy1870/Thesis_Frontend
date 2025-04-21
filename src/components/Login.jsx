"use client";

import { useState } from "react";
import { Button, Input, Form, message } from "antd";
import axios from "axios";
import { CheckCircleOutlined, LoadingOutlined } from "@ant-design/icons";
import logo from "../images/logo.png";
import backgroundImage from "../images/logo4.png";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/login",
        {
          email: values.email,
          password: values.password,
        },
        {
          // Add timeout to prevent hanging requests
          timeout: 10000,
          // Prevent multiple identical requests
          headers: {
            "Cache-Control": "no-cache",
          },
        }
      );

      if (response.data.token) {
        const { token, user_type, name: user_name } = response.data;

        // Store user data in localStorage
        localStorage.setItem("authToken", token);
        localStorage.setItem("userType", user_type);
        localStorage.setItem("userName", user_name);

        message.success({
          content: "Login successful!",
          duration: 2,
          icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
        });

        // Redirect after successful login
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        // Handle unexpected response format
        message.error(
          response.data.message || "Login failed. Please try again."
        );
      }
    } catch (error) {
      // Handle different error scenarios
      if (error.response) {
        // Server responded with an error status
        const status = error.response.status;
        const errorData = error.response.data;

        if (status === 401) {
          message.error("Invalid email or password. Please try again.");
        } else if (status === 404) {
          message.error("User not found. Please check your email.");
        } else if (status === 429) {
          message.error("Too many login attempts. Please try again later.");
        } else {
          message.error(errorData.message || "Login failed. Please try again.");
        }
      } else if (error.request) {
        // Request was made but no response received (network issues)
        message.error("Network error. Please check your internet connection.");
      } else if (error.code === "ECONNABORTED") {
        // Request timeout
        message.error("Request timed out. Please try again.");
      } else {
        // Something else happened while setting up the request
        message.error("An unexpected error occurred. Please try again.");
      }

      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-screen h-screen overflow-hidden">
      {/* Background image with blur */}
      <div
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center filter blur-sm z-[1]"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      ></div>

      {/* Logo container */}
      <div className="relative z-[2] flex flex-col items-center justify-center -mt-2.5 mb-2.5">
        <img
          src={logo || "/placeholder.svg"}
          alt="Logo"
          className="w-[120px] h-[120px] object-cover mb-2.5"
        />
        <h1 className="text-white font-serif text-[22px] text-center leading-tight">
          City Agriculture and Veterinary Department
        </h1>
      </div>

      {/* Login form wrapper */}
      <div className="relative z-[2] bg-white bg-opacity-90 p-10 rounded-lg shadow-lg text-center w-[320px] max-w-[90%]">
        <h2 className="mb-5 text-2xl text-gray-800">Sign in</h2>

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          className="w-full"
          validateTrigger={["onBlur", "onChange"]}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please enter your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input
              placeholder="Email"
              className="h-10 rounded"
              disabled={loading}
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please enter your password!" }]}
          >
            <Input.Password
              placeholder="Password"
              className="h-10 rounded"
              disabled={loading}
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full h-10 rounded bg-[#6a9c89] border-[#6a9c89] hover:bg-white hover:text-[#6a9c89] hover:border-[#57826d] transition-colors duration-300"
              loading={loading}
              icon={loading ? <LoadingOutlined /> : null}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
