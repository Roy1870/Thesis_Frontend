import { useState, useEffect } from "react";
import axios from "axios";
import { Form, Input, Button, Upload, message, Avatar, Modal } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const Profile = () => {
  const [userData, setUserData] = useState({
    email: "",
    phone_number: "",
    address: "",
    profile_picture: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProfilePicture, setNewProfilePicture] = useState(null);

  const getAuthToken = () => localStorage.getItem("authToken");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = getAuthToken();
        const response = await axios.get(
          "http://localhost:8000/api/user/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (
          response.data.error &&
          response.data.error === "Profile not found for this user."
        ) {
          await storeAndUpdateProfile();
        } else {
          setUserData(response.data.user);
          setLoading(false);
        }
      } catch (err) {
        setError("Failed to fetch user data");
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const storeAndUpdateProfile = async () => {
    const formData = new FormData();
    const token = getAuthToken();

    formData.append("email", userData.email || "default@example.com");
    formData.append("phone_number", userData.phone_number || "");
    formData.append("address", userData.address || "");

    if (newProfilePicture) {
      formData.append("profile_picture", newProfilePicture);
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/user/profile",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      //message.success("Profile created/updated successfully!");
      setUserData({
        ...userData,
        profile_picture: response.data.profile.profile_picture,
      });
      setLoading(false);
    } catch (err) {
      setError("Failed to create/update profile");
      message.error("Failed to create/update profile!");
    }
  };

  const handleSubmit = async (values) => {
    const formData = new FormData();
    formData.append("phone_number", values.phone_number);
    formData.append("address", values.address);

    if (newProfilePicture) {
      formData.append("profile_picture", newProfilePicture);
    }

    try {
      const token = getAuthToken();
      const response = await axios.post(
        "https://thesis-backend-tau.vercel.app/api/api/user/profile",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      message.success("Profile updated successfully!");
      setUserData({
        ...userData,
        phone_number: values.phone_number,
        address: values.address,
        profile_picture: response.data.profile.profile_picture,
      });
      setIsModalOpen(false);
    } catch (err) {
      setError("Failed to update profile");
      message.error("Failed to update profile!");
    }
  };

  const handleProfilePictureChange = (info) => {
    if (info.file && info.file.originFileObj) {
      setNewProfilePicture(info.file.originFileObj);
    }
  };

  if (loading) {
    return (
      <div style={{ fontSize: "24px", textAlign: "center" }}>Loading...</div>
    );
  }

  if (error) {
    return <div style={{ fontSize: "24px", textAlign: "center" }}>{error}</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      {/* Adjusted h2 to align better */}
      <h2
        style={{
          fontWeight: "bold",
          margin: 0,
          lineHeight: "1", // Ensures consistent alignment
        }}
      >
        Profile Details
      </h2>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <Avatar
          size={150}
          src={userData.profile_picture ? userData.profile_picture : null}
          style={{ marginBottom: "20px", fontSize: "36px" }}
        />
      </div>
      <Form
        layout="vertical"
        style={{ fontSize: "20px", maxWidth: "600px", margin: "auto" }}
      >
        <Form.Item label="Email">
          <Input value={userData.email} disabled style={{ fontSize: "18px" }} />
        </Form.Item>
        <Form.Item label="Phone Number">
          <Input
            value={userData.phone_number}
            disabled
            style={{ fontSize: "18px" }}
          />
        </Form.Item>
        <Form.Item label="Address">
          <Input
            value={userData.address}
            disabled
            style={{ fontSize: "18px" }}
          />
        </Form.Item>
        <Button
          type="primary"
          style={{
            width: "100%",
            fontSize: "18px",
            marginTop: "20px",
            padding: "10px",
            backgroundColor: "#6A9C89",
            borderColor: "#6A9C89",
          }}
          onClick={() => setIsModalOpen(true)}
        >
          Edit Profile
        </Button>
      </Form>

      <Modal
        title="Edit Profile"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <Upload
            listType="picture-card"
            showUploadList={false}
            beforeUpload={(file) => {
              setNewProfilePicture(file);
              return false;
            }}
            onChange={handleProfilePictureChange}
          >
            {newProfilePicture ? (
              <img
                src={URL.createObjectURL(newProfilePicture)}
                alt="Profile"
                style={{ width: "100%" }}
              />
            ) : (
              <div>
                <UploadOutlined />
                <div>Upload</div>
              </div>
            )}
          </Upload>
        </div>
        <Form
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            phone_number: userData.phone_number,
            address: userData.address,
          }}
          style={{ fontSize: "18px" }}
        >
          <Form.Item
            label="Phone Number"
            name="phone_number"
            rules={[
              { required: true, message: "Please input your phone number!" },
            ]}
          >
            <Input placeholder="Enter your phone number" />
          </Form.Item>

          <Form.Item
            label="Address"
            name="address"
            rules={[{ required: true, message: "Please input your address!" }]}
          >
            <Input placeholder="Enter your address" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{
                width: "100%",
                backgroundColor: "#6A9C89",
                borderColor: "#6A9C89",
              }}
            >
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;
