import { useEffect, useState } from "react";
import "./Popup.css";
import React from "react";
import BuildsList from "./BuildsList";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

export const Popup = () => {
  // Long living connection to the background script
  const [port] = useState(chrome.runtime.connect({ name: "popup" }));
  const [data, setData] = useState([]);
  const [jenkinsErr, setJenkinsErr] = useState("");

  useEffect(() => {
    port.onMessage.addListener((response) => {
      const { data, err } = response;
      if (err) {
        setJenkinsErr(err);
        return;
      }
      setData(data);
    });
    port.postMessage({ getBuildUrls: true });
  }, [data]);

  return (
    <div className="popupComponent">
      <div className="popupList-header">
        {!jenkinsErr &&
          (!!data?.length ? (
            <BuildsList jobs={data} />
          ) : (
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
            />
          ))}
        {jenkinsErr && <div className="popupList-error">{jenkinsErr}</div>}
      </div>
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
