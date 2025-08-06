import React, { useEffect, useState } from "react";

interface ButtonProps {
  src: string;
  alt: string;
  text: string;
  onClick: () => void;
  disabled?: boolean;
}

const JenkinsButton: React.FC<ButtonProps> = ({
  src,
  alt,
  text,
  onClick,
  disabled,
}) => (
  <button
    onClick={onClick}
    className={`jenkins-button ${disabled ? "disabled" : ""}`}
    disabled={disabled}>
    <div className="jenkins-button-content">
      <img
        className="jenkins-button-img"
        src={chrome.runtime.getURL(src)}
        alt={alt}
      />
      <span className="jenkins-button-text">{text}</span>
    </div>
  </button>
);

export const JenkinsButtons: React.FC = () => {
  const [jenkinsReachable, setjenkinsReachable] = useState<boolean>(false);
  const [foundJob, setFound] = useState<boolean>(false);
  const [port] = useState(chrome.runtime.connect({ name: "github" }));

  useEffect(() => {
    port.onMessage.addListener(
      (response: { foundJob: boolean; jenkinsReachable: boolean }) => {
        setjenkinsReachable(response.jenkinsReachable);
        setFound(response.foundJob);
      }
    );
    port.postMessage({ loadProbe: true });
  }, [jenkinsReachable]);

  return (
    <div className="jenkins-buttons-container">
      <JenkinsButton
        src={"assets/logo.png"}
        alt={"Go to Jenkins"}
        text={"Go to Jenkins"}
        onClick={() => {
          chrome.runtime.sendMessage({ loadJenkinsPage: true });
        }}
      />

      <JenkinsButton
        src={"assets/build.png"}
        alt={"Build branch"}
        text={"Build branch"}
        disabled={!foundJob}
        onClick={() => {
          chrome.runtime.sendMessage({ loadBuildPage: true });
        }}
      />
      <JenkinsButton
        src={"assets/build.png"}
        alt={"Build main"}
        text={"Build main"}
        // disabled={!jenkinsReachable}
        onClick={() => {
          chrome.runtime.sendMessage({ loadMainPage: true });
        }}
      />
    </div>
  );
};

export default JenkinsButtons;
