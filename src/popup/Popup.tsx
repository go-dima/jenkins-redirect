import { useEffect, useState } from "react";
import "./Popup.css";
import React from "react";
import BuildsList from "./BuildsList";

export const Popup = () => {
  const [data, setData] = useState([]);
  useEffect(() => {
    chrome.runtime.sendMessage({ getBuildUrls: true }, (response) => {
      setData(response);
    });
  }, [data]);

  return (
    <div className="popupComponent">
      <BuildsList className="popupList" jobs={data} />
    </div>
  );
};

export default Popup;
