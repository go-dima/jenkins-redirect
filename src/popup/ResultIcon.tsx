import React from "react";
import { Build } from "./BuildsList.types";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const getIconForResult = (isBuilding: boolean, result: string) => {
  if (isBuilding) {
    return <Spin indicator={<LoadingOutlined spin />} size="small" />;
  }

  switch (result) {
    case "SUCCESS":
      return "✅";
    case "FAILURE":
      return "❌";
    case "ABORTED":
      return "⛔";
    default:
      return "🔵"; // Default icon for other results
  }
};

const ResultIcon: React.FC<{ build: Build }> = ({ build }) => {
  return <span>{getIconForResult(build.building, build.result)}</span>;
};

export default ResultIcon;
