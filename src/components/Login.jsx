import { Button, Input, Form, message } from "antd";
import axios from "axios";
import { CheckCircleOutlined } from "@ant-design/icons";
import logo from "../images/logo.png";
import backgroundImage from "../images/logo4.png"; // Import the background image

const Login = () => {
  const onFinish = async (values) => {
    try {
      const response = await axios.post(
        "thesis-backend-tau.vercel.app/api/api/login",
        {
          email: values.email,
          password: values.password,
        }
      );

      if (response.data.token) {
        const token = response.data.token;
        const user_type = response.data.user_type;
        const user_name = response.data.name;

        localStorage.setItem("authToken", token);
        localStorage.setItem("userType", user_type);
        localStorage.setItem("userName", user_name);

        message.success({
          content: "Login success!",
          duration: 4,
          icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
        });

        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        message.error(
          response.data.message || "Login failed. Please try again."
        );
      }
    } catch (error) {
      message.error("An error occurred during login. Please try again.");
      console.error("Login error:", error);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
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
      <div className="relative z-[2] bg-white bg-opacity-90 p-10 rounded-lg shadow-lg text-center w-[300px]">
        <h2 className="mb-5 text-2xl text-gray-800">Sign in</h2>

        <Form
          name="login"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          className="w-full"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please enter your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input placeholder="Email" className="h-10 rounded" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please enter your password!" }]}
          >
            <Input.Password placeholder="Password" className="h-10 rounded" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full h-10 rounded bg-[#6a9c89] border-[#6a9c89] hover:bg-white hover:border-[#57826d] transition-colors duration-300"
            >
              Log In
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
