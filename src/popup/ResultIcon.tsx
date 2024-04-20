import React from "react";
import { Build } from "./BuildsList.types";

const getIconForResult = (isBuilding: boolean, result: string) => {
  if (isBuilding) {
    return "🛠️";
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
