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
      <BuildsList className="popupList-header" jobs={data} />
      <div className="popupList-footer">
        <img
          className="popupList-image"
          src="../logo.png"
          alt={"Go to Jenkins"}
          onClick={() => {
            chrome.runtime.sendMessage({ loadJenkinsPage: true });
          }}
        />
      </div>
    </div>
  );
};

export default Popup;
