import { Select } from "antd";
import { FilterOutlined } from "@ant-design/icons"; // Import Filter Icon
const { Option } = Select;

const FilterSelect = ({ currentComponent, setCurrentComponent }) => {
  const handleChange = (value) => {
    setCurrentComponent(value); // Update the component in Inventory
  };

  return (
    <Select
      defaultValue={currentComponent}
      style={{ width: 150 }}
      onChange={handleChange}
      suffixIcon={<FilterOutlined />} // Add filter icon
    >
      <Option value="farmerDetails">Farmer Details</Option>
      <Option value="animalDataTable">Animal Data</Option>
      <Option value="barangayData">Barangay Data</Option>
    </Select>
  );
};

export default FilterSelect;
