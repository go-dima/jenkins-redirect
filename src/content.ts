import React from "react";
import ReactDOM from "react-dom/client";
import JenkinsButtons from "./popup/JenkinsButtons";
import "./styles/content.css";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message.inPrPage) {
    return;
  }

  const branchElements = Array.from(
    document.querySelectorAll("span.commit-ref > a > span.css-truncate-target")
  );
  const branchNames = branchElements.map(
    (element: HTMLElement) => element.innerText
  );

  // Remove duplicates - return the first instance of each branch name
  const [targetBranch, sourceBranch] = branchNames.filter(
    (item, index) => branchNames.indexOf(item) === index
  );
  sendResponse({ sourceBranch, targetBranch });
});

const addFooter = () => {
  const parentElement = document.getElementsByClassName(
    "discussion-timeline-actions"
  )[0];

  const existingButtons = document.getElementsByClassName(buttonsClassName);
  if (!!existingButtons.length) {
    return; // No buttons to add
  }

  if (parentElement) {
    const newElement = createElement();

    // Render the React component
    const root = ReactDOM.createRoot(newElement);
    root.render(React.createElement(JenkinsButtons));
    // add root as first child of parentElement
    parentElement.prepend(newElement);
  }
};

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.initFooter) {
    addFooter();
  }
});

const buttonsClassName = "popupList-buttons";

function createElement(): HTMLDivElement {
  const newElement = document.createElement("div");
  newElement.className = buttonsClassName;
  newElement.style.display = "flex";
  newElement.style.alignItems = "center";
  newElement.style.justifyContent = "space-around";
  newElement.style.marginTop = "4px";
  return newElement;
}
