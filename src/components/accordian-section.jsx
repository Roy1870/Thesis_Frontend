"use client";

import React, { useState } from "react";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { Button } from "antd";

const AccordionSection = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        marginBottom: "16px",
        border: "1px solid #e8e8e8",
        borderRadius: "8px",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px 8px 0 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          borderBottom: isOpen ? "1px solid #e8e8e8" : "none",
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ fontWeight: 500 }}>{title}</span>
        <Button
          type="text"
          icon={isOpen ? <UpOutlined /> : <DownOutlined />}
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
        />
      </div>
      {isOpen && (
        <div style={{ padding: "16px", maxHeight: "400px", overflowY: "auto" }}>
          {children}
        </div>
      )}
    </div>
  );
};

export default AccordionSection;
