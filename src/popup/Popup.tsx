import { useEffect, useState } from "react";
import "./Popup.css";
import React from "react";

const Popup = () => {
  const [data, setData] = useState("");
  useEffect(() => {
    // Example of how to send a message to eventPage.ts.
    chrome.runtime.sendMessage({ popupMounted: true }, (response) => {
      setData(response.data);
    });
  }, []);

  return (
    <div className="popupComponent">
      <header className="popupHeader">
        <a>
          <button
            onClick={() => {
              chrome.tabs.create({
                url: "https://google.com",
              });
            }}>
            Open Google
          </button>
        </a>
        <p>{data}</p>
      </header>
    </div>
  );
};

export default Popup;
