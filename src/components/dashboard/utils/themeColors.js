"use client";

import { useMemo } from "react";

export const useThemeColors = () => {
  return useMemo(
    () => ({
      primary: "#6A9C89",
      primaryLight: "#8DB5A5",
      primaryDark: "#4A7C69",
      secondary: "#E6F5E4",
      accent: "#4F6F7D",
      accentLight: "#6F8F9D",
      error: "#D32F2F",
      warning: "#FFA000",
      success: "#388E3C",
      info: "#0288D1",
      textDark: "#333333",
      textLight: "#666666",
      border: "#E0E0E0",
      background: "#F5F7F9",
      cardBg: "#FFFFFF",
      raiser: "#8884d8",
      operator: "#82ca9d",
      grower: "#ffc658",
    }),
    []
  );
};
