import React from "react";

interface ButtonProps {
  src: string;
  alt: string;
  text: string;
  onClick: () => void;
}

const JenkinsButton: React.FC<ButtonProps> = ({ src, alt, text, onClick }) => (
  <button onClick={onClick} className="jenkins-button">
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
        onClick={() => {
          chrome.runtime.sendMessage({ loadBuildPage: true });
        }}
      />
      <JenkinsButton
        src={"assets/build.png"}
        alt={"Build main"}
        text={"Build main"}
        onClick={() => {
          chrome.runtime.sendMessage({ loadMainPage: true });
        }}
      />
    </div>
  );
};

export default JenkinsButtons;
