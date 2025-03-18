import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Row,
  Col,
  message,
  Space,
} from "antd";
import { PhoneOutlined, UserOutlined, PlusOutlined } from "@ant-design/icons";

const { Option } = Select;

const DataEntry = () => {
  const [form] = Form.useForm();
  const [cropType, setCropType] = useState(null);
  const containerRef = useRef(null);
  const [livestockDetails, setLivestockDetails] = useState([{}]);
  const [poultryDetails, setPoultryDetails] = useState([{}]);
  const [vegetableDetails, setVegetableDetails] = useState([{}]);
  const [bananaDetails, setBananaDetails] = useState([{}]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, []);

  const handleSubmit = async (values) => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      message.error("No authentication token found. Please log in again.");
      return;
    }

    const formData = { ...values };

    if (cropType === "LIVESTOCK") {
      formData.livestock = livestockDetails.map((detail) => ({
        type: detail.type,
        breed: detail.breed,
        quantity: detail.quantity,
      }));
    } else if (cropType === "POULTRY") {
      formData.poultry = poultryDetails.map((detail) => ({
        type: detail.type,
        breed: detail.breed,
        quantity: detail.quantity,
      }));
    } else if (cropType === "VEGETABLE") {
      formData.vegetable = vegetableDetails.map((detail) => ({
        marketOutletLocation: detail.marketOutletLocation,
        buyerName: detail.buyerName,
        association: detail.association,
        area: detail.area,
        plantType: detail.plantType,
        quantity: detail.quantity,
      }));
    } else if (cropType === "BANANA") {
      formData.banana = bananaDetails.map((detail) => ({
        marketOutletLocation: detail.marketOutletLocation,
        buyerName: detail.buyerName,
        association: detail.association,
        area: detail.area,
        plantType: detail.plantType,
        production: detail.production,
      }));
    }

    console.log("Form Values:", formData);

    const farmerData = {
      fname: formData.fname,
      lname: formData.lname,
      email: formData.email,
      home_address: formData.home_address,
      farm_address: formData.farm_address,
      crop_type: formData.crop_type,
      ...(cropType === "LIVESTOCK" && { livestock: formData.livestock }),
      ...(cropType === "POULTRY" && { poultry: formData.poultry }),
      ...(cropType === "VEGETABLE" && { vegetable: formData.vegetable }),
      ...(cropType === "BANANA" && { banana: formData.banana }),
      updated_by: formData.updated_by,
      remarks: formData.remarks,
    };

    console.log("Formatted Farmer Data:", farmerData);

    try {
      const farmerResponse = await axios.post(
        "http://localhost:8000/api/farmers/data",
        farmerData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Server Response:", farmerResponse);

      if (farmerResponse.status !== 200 && farmerResponse.status !== 201) {
        throw new Error("Failed to submit farmer data");
      }

      message.success("Farmer data submitted successfully!");
      form.resetFields();
      setCropType(null);
      setLivestockDetails([{}]);
      setPoultryDetails([{}]);
      setVegetableDetails([{}]);
      setBananaDetails([{}]);
    } catch (error) {
      console.error("Submission Error:", error);
      message.error(
        error.response?.data?.message ||
          "An error occurred while submitting the data."
      );
    }
  };

  const handleCropTypeChange = (value) => {
    setCropType(value);
    setLivestockDetails([{}]);
    setPoultryDetails([{}]);
    setVegetableDetails([{}]);
    setBananaDetails([{}]);
  };

  const handleAddLivestock = () => {
    setLivestockDetails([...livestockDetails, {}]);
  };

  const handleRemoveLivestock = (index) => {
    const newList = [...livestockDetails];
    newList.splice(index, 1);
    setLivestockDetails(newList);
  };

  const handleLivestockDetailChange = (index, name, value) => {
    const newList = [...livestockDetails];
    newList[index][name] = value;
    setLivestockDetails(newList);
  };

  const handleAddPoultry = () => {
    setPoultryDetails([...poultryDetails, {}]);
  };

  const handleRemovePoultry = (index) => {
    const newList = [...poultryDetails];
    newList.splice(index, 1);
    setPoultryDetails(newList);
  };

  const handlePoultryDetailChange = (index, name, value) => {
    const newList = [...poultryDetails];
    newList[index][name] = value;
    setPoultryDetails(newList);
  };

  const handleAddVegetable = () => {
    setVegetableDetails([...vegetableDetails, {}]);
  };

  const handleRemoveVegetable = (index) => {
    const newList = [...vegetableDetails];
    newList.splice(index, 1);
    setVegetableDetails(newList);
  };

  const handleVegetableDetailChange = (index, name, value) => {
    const newList = [...vegetableDetails];
    newList[index][name] = value;
    setVegetableDetails(newList);
  };

  const handleAddBanana = () => {
    setBananaDetails([...bananaDetails, {}]);
  };

  const handleRemoveBanana = (index) => {
    const newList = [...bananaDetails];
    newList.splice(index, 1);
    setBananaDetails(newList);
  };

  const handleBananaDetailChange = (index, name, value) => {
    const newList = [...bananaDetails];
    newList[index][name] = value;
    setBananaDetails(newList);
  };

  const headerColor = "#6A9C89";
  const lighterShade = "#E6F5E4";
  const borderColor = "#CBD5E0";

  const inputStyle = {
    borderRadius: "6px",
    border: `1px solid ${borderColor}`,
    padding: "8px",
    width: "100%",
  };

  const chickenOptions = ["Broiler", "Layer", "Freerange", "Gamefowl", "Fighting Cocks"];
  const duckOptions = ["Drake", "Hen"];
  const quailOptions = ["Cock", "Hen"];
  const turkeyOptions = ["Gobbler", "Hen"];
  const rabbitOptions = ["Buck", "Doe"];
  const cattleOptions = ["Carabull", "Caracow"];
  const carabaoOptions = ["Carabull", "Caracow"];
  const goatOptions = ["Buck", "Doe"];
  const sheepOptions = ["Ram", "Ewe"];
  const swineOptions = ["Sow", "Piglet", "Boar", "Fattener"];
  const plantTypeOptions = ["Eggplant", "Ampalaya", "Okra", "Pole", "Sitao", "Squash", "Tomato"];
  const bananaPlantTypeOptions = ["LAKATAN", "LATUNDAN", "CARDAVA"];

  return (
    <div style={{ margin: "20px" }}>
      <h2 style={{ fontWeight: "bold", margin: 0, marginBottom: "20px", color: headerColor }}>
        Data Entry Form
      </h2>
      <div
        ref={containerRef}
        style={{
          padding: "20px",
          backgroundColor: "#f7f7f7",
          borderRadius: "10px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          overflowY: "auto",
          maxHeight: "calc(100vh - 120px)",
        }}
      >
        <div style={{ backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "8px" }}>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            {/* Farmer Information */}
            <Card
              title="Farmer Information"
              style={{ marginBottom: "20px", borderRadius: "8px", backgroundColor: lighterShade, border: `1px solid ${borderColor}` }}
              headStyle={{ background: headerColor, color: "#ffffff", borderRadius: "8px 8px 0 0", fontWeight: "bold" }}
            >
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item label="First Name" name="fname" rules={[{ required: true, message: "Please enter first name" }]}>
                    <Input prefix={<UserOutlined style={{ color: headerColor }} />} placeholder="Enter first name" style={inputStyle} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Last Name" name="lname" rules={[{ required: true, message: "Please enter last name" }]}>
                    <Input prefix={<UserOutlined style={{ color: headerColor }} />} placeholder="Enter last name" style={inputStyle} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Email" name="email" rules={[{ required: true, message: "Please enter email" }]}>
                <Input type="email" placeholder="Enter email" style={inputStyle} />
              </Form.Item>

              <Form.Item label="Contact" name="contact" rules={[{ required: true, message: "Please enter contact number" }]}>
                <Input prefix={<PhoneOutlined style={{ color: headerColor }} />} placeholder="Enter contact number" style={inputStyle} />
              </Form.Item>

              <Form.Item label="Home Address" name="home_address" rules={[{ required: true, message: "Please enter home address" }]}>
                <Input placeholder="Enter home address" style={inputStyle} />
              </Form.Item>

              <Form.Item label="Farm Address" name="farm_address" rules={[{ required: true, message: "Please enter farm address" }]}>
                <Input placeholder="Enter farm address" style={inputStyle} />
              </Form.Item>

              {/* Crop Type Selection */}
              <Form.Item label="Select Crop Type" name="crop_type" rules={[{ required: true, message: "Please select a crop type" }]}>
                <Select placeholder="Select Crop Type" onChange={handleCropTypeChange} style={{ ...inputStyle, height: "40px" }}>
                  <Option value="RICE">Rice</Option>
                  <Option value="FISH">Fish</Option>
                  <Option value="LIVESTOCK">Livestock</Option>
                  <Option value="POULTRY">Poultry</Option>
                  <Option value="VEGETABLE">Vegetable</Option>
                  <Option value="BANANA">Banana</Option>
                  <Option value="LEGUMES">Legumes</Option>
                  <Option value="SPICES">Spices</Option>
                  <Option value="CACAO">Cacao</Option>
                </Select>
              </Form.Item>
            </Card>

            {/* Livestock Form (Conditional Rendering) */}
            {cropType === "LIVESTOCK" && (
              <Card
                title="Livestock Information"
                style={{ marginBottom: "20px", borderRadius: "8px", backgroundColor: lighterShade, border: `1px solid ${borderColor}` }}
                headStyle={{ background: headerColor, color: "#ffffff", borderRadius: "8px 8px 0 0", fontWeight: "bold" }}
              >
                {livestockDetails.map((detail, index) => (
                  <div key={index} style={{ marginBottom: "15px", borderBottom: index < livestockDetails.length - 1 ? `1px solid ${borderColor}` : 'none', paddingBottom: '15px' }}>
                    <Row gutter={24} align="middle">
                      {/* Livestock Type */}
                      <Col span={6}>
                        <Form.Item
                          label="Livestock Type"
                          rules={[{ required: true, message: "Please select livestock type" }]}
                        >
                          <Select
                            placeholder="Select Livestock"
                            value={detail.type}
                            onChange={(value) => handleLivestockDetailChange(index, "type", value)}
                            style={{ ...inputStyle, height: "40px" }}
                          >
                            <Option value="cattle">Cattle</Option>
                            <Option value="carabao">Carabao</Option>
                            <Option value="goat">Goat</Option>
                            <Option value="sheep">Sheep</Option>
                            <Option value="swine">Swine</Option>
                          </Select>
                        </Form.Item>
                      </Col>

                      {/* Breed */}
                      <Col span={6}>
                        <Form.Item
                          label="Breed"
                          rules={[{ required: true, message: "Please select breed" }]}
                        >
                          <Select
                            placeholder={`Select Breed`}
                            value={detail.breed}
                            onChange={(value) => handleLivestockDetailChange(index, "breed", value)}
                            style={{ ...inputStyle, height: "40px" }}
                            disabled={!detail.type}
                          >
                            {detail.type === "cattle" && cattleOptions.map((opt) => <Option key={opt} value={opt}>{opt}</Option>)}
                            {detail.type === "carabao" && carabaoOptions.map((opt) => <Option key={opt} value={opt}>{opt}</Option>)}
                            {detail.type === "goat" && goatOptions.map((opt) => <Option key={opt} value={opt}>{opt}</Option>)}
                            {detail.type === "sheep" && sheepOptions.map((opt) => <Option key={opt} value={opt}>{opt}</Option>)}
                            {detail.type === "swine" && swineOptions.map((opt) => <Option key={opt} value={opt}>{opt}</Option>)}
                          </Select>
                        </Form.Item>
                      </Col>

                      {/* Quantity */}
                      <Col span={6}>
                        <Form.Item
                          label="Quantity"
                          rules={[{ required: true, message: "Please enter quantity" }]}
                        >
                          <Input
                            type="number"
                            placeholder="Enter quantity"
                            value={detail.quantity}
                            onChange={(e) => handleLivestockDetailChange(index, "quantity", e.target.value)}
                            style={inputStyle}
                          />
                        </Form.Item>
                      </Col>

                      {/* Remove Button */}
                      <Col span={6}>
                        {livestockDetails.length > 1 && (
                          <Form.Item label=" "> {/* Empty label to align with other fields */}
                            <Button
                              onClick={() => handleRemoveLivestock(index)}
                              danger
                              style={{ width: "100%" }} // Full width to match other fields
                            >
                              Remove
                            </Button>
                          </Form.Item>
                        )}
                      </Col>
                    </Row>
                  </div>
                ))}
                <Button type="dashed" onClick={handleAddLivestock} block icon={<PlusOutlined />}>
                  Add More Livestock
                </Button>
              </Card>
            )}

            {/* Poultry Form (Conditional Rendering) */}
            {cropType === "POULTRY" && (
              <Card
                title="Poultry Information"
                style={{ marginBottom: "20px", borderRadius: "8px", backgroundColor: lighterShade, border: `1px solid ${borderColor}` }}
                headStyle={{ background: headerColor, color: "#ffffff", borderRadius: "8px 8px 0 0", fontWeight: "bold" }}
              >
                {poultryDetails.map((detail, index) => (
                  <div key={index} style={{ marginBottom: "15px", borderBottom: index < poultryDetails.length - 1 ? `1px solid ${borderColor}` : 'none', paddingBottom: '15px' }}>
                    <Row gutter={24} align="middle">
                      {/* Poultry Type */}
                      <Col span={6}>
                        <Form.Item
                          label="Poultry Type"
                          rules={[{ required: true, message: "Please select poultry type" }]}
                        >
                          <Select
                            placeholder="Select Poultry"
                            value={detail.type}
                            onChange={(value) => handlePoultryDetailChange(index, "type", value)}
                            style={{ ...inputStyle, height: "40px" }}
                          >
                            <Option value="chicken">Chicken</Option>
                            <Option value="duck">Duck</Option>
                            <Option value="quail">Quail</Option>
                            <Option value="turkey">Turkey</Option>
                            <Option value="rabbit">Rabbit</Option>
                          </Select>
                        </Form.Item>
                      </Col>

                      {/* Breed */}
                      <Col span={6}>
                        <Form.Item
                          label="Breed"
                          rules={[{ required: true, message: "Please select breed" }]}
                        >
                          <Select
                            placeholder={`Select Breed`}
                            value={detail.breed}
                            onChange={(value) => handlePoultryDetailChange(index, "breed", value)}
                            style={{ ...inputStyle, height: "40px" }}
                            disabled={!detail.type}
                          >
                            {detail.type === "chicken" && chickenOptions.map((opt) => <Option key={opt} value={opt}>{opt}</Option>)}
                            {detail.type === "duck" && duckOptions.map((opt) => <Option key={opt} value={opt}>{opt}</Option>)}
                            {detail.type === "quail" && quailOptions.map((opt) => <Option key={opt} value={opt}>{opt}</Option>)}
                            {detail.type === "turkey" && turkeyOptions.map((opt) => <Option key={opt} value={opt}>{opt}</Option>)}
                            {detail.type === "rabbit" && rabbitOptions.map((opt) => <Option key={opt} value={opt}>{opt}</Option>)}
                          </Select>
                        </Form.Item>
                      </Col>

                      {/* Quantity */}
                      <Col span={6}>
                        <Form.Item
                          label="Quantity"
                          rules={[{ required: true, message: "Please enter quantity" }]}
                        >
                          <Input
                            type="number"
                            placeholder="Enter quantity"
                            value={detail.quantity}
                            onChange={(e) => handlePoultryDetailChange(index, "quantity", e.target.value)}
                            style={inputStyle}
                          />
                        </Form.Item>
                      </Col>

                      {/* Remove Button */}
                      <Col span={6}>
                        {poultryDetails.length > 1 && (
                          <Form.Item label=" "> {/* Empty label to align with other fields */}
                            <Button
                              onClick={() => handleRemovePoultry(index)}
                              danger
                              style={{ width: "100%" }} // Full width to match other fields
                            >
                              Remove
                            </Button>
                          </Form.Item>
                        )}
                      </Col>
                    </Row>
                  </div>
                ))}
                <Button type="dashed" onClick={handleAddPoultry} block icon={<PlusOutlined />}>
                  Add More Poultry
                </Button>
              </Card>
            )}

            {/* Vegetables Form (Conditional Rendering) */}
            {cropType === "VEGETABLE" && (
              <Card
                title="Vegetable Information"
                style={{ marginBottom: "20px", borderRadius: "8px", backgroundColor: lighterShade, border: `1px solid ${borderColor}` }}
                headStyle={{ background: headerColor, color: "#ffffff", borderRadius: "8px 8px 0 0", fontWeight: "bold" }}
              >
                {vegetableDetails.map((detail, index) => (
                  <div key={index} style={{ marginBottom: "15px", borderBottom: index < vegetableDetails.length - 1 ? `1px solid ${borderColor}` : 'none', paddingBottom: '15px' }}>
                    <Row gutter={24} align="middle">
                      {/* Market Outlet Location */}
                      <Col span={12}>
                        <Form.Item
                          label="Market Outlet Location"
                          rules={[{ required: true, message: "Please enter market outlet location" }]}
                        >
                          <Input
                            placeholder="Enter market outlet location"
                            value={detail.marketOutletLocation}
                            onChange={(e) => handleVegetableDetailChange(index, "marketOutletLocation", e.target.value)}
                            style={inputStyle}
                          />
                        </Form.Item>
                      </Col>

                      {/* Name of Buyer */}
                      <Col span={12}>
                        <Form.Item
                          label="Name of Buyer"
                          rules={[{ required: true, message: "Please enter buyer name" }]}
                        >
                          <Input
                            placeholder="Enter buyer name"
                            value={detail.buyerName}
                            onChange={(e) => handleVegetableDetailChange(index, "buyerName", e.target.value)}
                            style={inputStyle}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={24} align="middle">
                      {/* Association/Organization */}
                      <Col span={12}>
                        <Form.Item
                          label="Association/Organization"
                          rules={[{ required: true, message: "Please enter association/organization" }]}
                        >
                          <Input
                            placeholder="Enter association/organization"
                            value={detail.association}
                            onChange={(e) => handleVegetableDetailChange(index, "association", e.target.value)}
                            style={inputStyle}
                          />
                        </Form.Item>
                      </Col>

                      {/* Area (hectare) */}
                      <Col span={12}>
                        <Form.Item
                          label="Area (hectare)"
                          rules={[{ required: true, message: "Please enter area" }]}
                        >
                          <Input
                            type="number"
                            placeholder="Enter area"
                            value={detail.area}
                            onChange={(e) => handleVegetableDetailChange(index, "area", e.target.value)}
                            style={inputStyle}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={24} align="middle">
                      {/* Plant Type */}
                      <Col span={12}>
                        <Form.Item
                          label="Plant Type"
                          rules={[{ required: true, message: "Please select plant type" }]}
                        >
                          <Select
                            placeholder="Select Plant Type"
                            value={detail.plantType}
                            onChange={(value) => handleVegetableDetailChange(index, "plantType", value)}
                            style={{ ...inputStyle, height: "40px" }}
                          >
                            {plantTypeOptions.map((opt) => (
                              <Option key={opt} value={opt}>
                                {opt}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>

                      {/* Quantity */}
                      <Col span={12}>
                        <Form.Item
                          label="Quantity"
                          rules={[{ required: true, message: "Please enter quantity" }]}
                        >
                          <Input
                            type="number"
                            placeholder="Enter quantity"
                            value={detail.quantity}
                            onChange={(e) => handleVegetableDetailChange(index, "quantity", e.target.value)}
                            style={inputStyle}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* Remove Button */}
                    <Row gutter={24} align="middle">
                      <Col span={24}>
                        {vegetableDetails.length > 1 && (
                          <Form.Item label=" "> {/* Empty label to align with other fields */}
                            <Button
                              onClick={() => handleRemoveVegetable(index)}
                              danger
                              style={{ width: "100%" }} // Full width to match other fields
                            >
                              Remove
                            </Button>
                          </Form.Item>
                        )}
                      </Col>
                    </Row>
                  </div>
                ))}
                <Button type="dashed" onClick={handleAddVegetable} block icon={<PlusOutlined />}>
                  Add More Vegetables
                </Button>
              </Card>
            )}

            {/* Banana Form (Conditional Rendering) */}
            {cropType === "BANANA" && (
              <Card
                title="Banana Information"
                style={{ marginBottom: "20px", borderRadius: "8px", backgroundColor: lighterShade, border: `1px solid ${borderColor}` }}
                headStyle={{ background: headerColor, color: "#ffffff", borderRadius: "8px 8px 0 0", fontWeight: "bold" }}
              >
                {bananaDetails.map((detail, index) => (
                  <div key={index} style={{ marginBottom: "15px", borderBottom: index < bananaDetails.length - 1 ? `1px solid ${borderColor}` : 'none', paddingBottom: '15px' }}>
                    {/* First Row: Market Outlet Location and Name of Buyer */}
                    <Row gutter={24} align="middle">
                      {/* Market Outlet Location */}
                      <Col span={12}>
                        <Form.Item
                          label="Market Outlet Location"
                          rules={[{ required: true, message: "Please enter market outlet location" }]}
                        >
                          <Input
                            placeholder="Enter market outlet location"
                            value={detail.marketOutletLocation}
                            onChange={(e) => handleBananaDetailChange(index, "marketOutletLocation", e.target.value)}
                            style={inputStyle}
                          />
                        </Form.Item>
                      </Col>

                      {/* Name of Buyer */}
                      <Col span={12}>
                        <Form.Item
                          label="Name of Buyer"
                          rules={[{ required: true, message: "Please enter buyer name" }]}
                        >
                          <Input
                            placeholder="Enter buyer name"
                            value={detail.buyerName}
                            onChange={(e) => handleBananaDetailChange(index, "buyerName", e.target.value)}
                            style={inputStyle}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* Second Row: Association/Organization and Area (hectare) */}
                    <Row gutter={24} align="middle">
                      {/* Association/Organization */}
                      <Col span={12}>
                        <Form.Item
                          label="Association/Organization"
                          rules={[{ required: true, message: "Please enter association/organization" }]}
                        >
                          <Input
                            placeholder="Enter association/organization"
                            value={detail.association}
                            onChange={(e) => handleBananaDetailChange(index, "association", e.target.value)}
                            style={inputStyle}
                          />
                        </Form.Item>
                      </Col>

                      {/* Area (hectare) */}
                      <Col span={12}>
                        <Form.Item
                          label="Area (hectare)"
                          rules={[{ required: true, message: "Please enter area" }]}
                        >
                          <Input
                            type="number"
                            placeholder="Enter area"
                            value={detail.area}
                            onChange={(e) => handleBananaDetailChange(index, "area", e.target.value)}
                            style={inputStyle}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* Third Row: Plant Type and Production (kg) */}
                    <Row gutter={24} align="middle">
                      {/* Plant Type */}
                      <Col span={12}>
                        <Form.Item
                          label="Plant Type"
                          rules={[{ required: true, message: "Please select plant type" }]}
                        >
                          <Select
                            placeholder="Select Plant Type"
                            value={detail.plantType}
                            onChange={(value) => handleBananaDetailChange(index, "plantType", value)}
                            style={{ ...inputStyle, height: "40px" }}
                          >
                            {bananaPlantTypeOptions.map((opt) => (
                              <Option key={opt} value={opt}>
                                {opt}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>

                      {/* Production (kg) */}
                      <Col span={12}>
                        <Form.Item
                          label="Production (kg)"
                          rules={[{ required: true, message: "Please enter production" }]}
                        >
                          <Input
                            type="number"
                            placeholder="Enter production"
                            value={detail.production}
                            onChange={(e) => handleBananaDetailChange(index, "production", e.target.value)}
                            style={inputStyle}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* Remove Button */}
                    <Row gutter={24} align="middle">
                      <Col span={24}>
                        {bananaDetails.length > 1 && (
                          <Form.Item label=" "> {/* Empty label to align with other fields */}
                            <Button
                              onClick={() => handleRemoveBanana(index)}
                              danger
                              style={{ width: "100%" }} // Full width to match other fields
                            >
                              Remove
                            </Button>
                          </Form.Item>
                        )}
                      </Col>
                    </Row>
                  </div>
                ))}
                <Button type="dashed" onClick={handleAddBanana} block icon={<PlusOutlined />}>
                  Add More Banana
                </Button>
              </Card>
            )}

            {/* Updated By and Remarks (Always Visible when Livestock, Poultry, Vegetable, or Banana is selected) */}
            {(cropType === "LIVESTOCK" || cropType === "POULTRY" || cropType === "VEGETABLE" || cropType === "BANANA") && (
              <Card
                title="Additional Information"
                style={{ marginBottom: "20px", borderRadius: "8px", backgroundColor: lighterShade, border: `1px solid ${borderColor}` }}
                headStyle={{ background: headerColor, color: "#ffffff", borderRadius: "8px 8px 0 0", fontWeight: "bold" }}
              >
                <Form.Item label="Updated By" name="updated_by">
                  <Input placeholder="Enter who updated the information" style={inputStyle} />
                </Form.Item>
                <Form.Item label="Remarks" name="remarks">
                  <Input.TextArea rows={4} placeholder="Enter any remarks" style={inputStyle} />
                </Form.Item>
              </Card>
            )}

            {/* Submit Button */}
            <Form.Item style={{ textAlign: "center", marginTop: "20px" }}>
              <Button
                type="primary"
                htmlType="submit"
                style={{ backgroundColor: headerColor, borderRadius: "8px", padding: "10px 30px", fontWeight: "bold" }}
              >
                Submit
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default DataEntry;