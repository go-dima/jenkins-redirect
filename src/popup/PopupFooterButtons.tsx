import React from "react";
import logoImg from "../../assets/logo.png";
import buildImg from "../../assets/build.png";

const PopupFooterButtons = () => {
  return (
    <>
      <img
        className="popupList-image"
        src={logoImg}
        alt={"Go to Jenkins"}
        onClick={() => {
          chrome.runtime.sendMessage({ loadJenkinsPage: true });
        }}
      />
      <img
        className="popupList-image"
        src={buildImg}
        alt={"Build branch"}
        onClick={() => {
          chrome.runtime.sendMessage({ loadBuildPage: true });
        }}
      />
      <img
        className="popupList-image"
        src={buildImg}
        alt={"Build main"}
        onClick={() => {
          chrome.runtime.sendMessage({ loadMainPage: true });
        }}
      />
    </>
  );
};

export default PopupFooterButtons;
