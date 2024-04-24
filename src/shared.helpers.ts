import { ParsedUrl } from "./shared.types";

export async function setResultBadge(
  tabId: number,
  building: boolean,
  result: string
) {
  try {
    const statusToBadgeInfo: Record<string, any> = {
      SUCCESS: { text: "V", color: "#00FF00" },
      FAILURE: { text: "X", color: "#FF0000" },
      ABORTED: { text: "-", color: "#FFA500" },
    };

    const { text, color } = statusToBadgeInfo[result] || {};
    chrome.action.setBadgeText({ text, tabId });
    chrome.action.setBadgeBackgroundColor({
      color: building ? "#0000FF" : color,
      tabId,
    });
  } catch (error) {
    // Don't care
  }
}

export async function setLoadingBadge(tabId: number) {
  chrome.action.setBadgeText({ text: ".", tabId });
  chrome.action.setBadgeBackgroundColor({
    color: "#808080",
    tabId,
  });
}

export function clearBadge(tabId: number) {
  chrome.action.setBadgeText({ text: "", tabId });
}

export async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

export function parseRepoUrl(url: URL): ParsedUrl {
  const pathParts = url.pathname.split("/").filter(Boolean);
  const repoName = pathParts[1];
  let branchName = "main";
  let inPrPage = false;

  if (pathParts[2] === "tree") {
    branchName = pathParts.slice(3).join("/");
  } else if (pathParts[2] === "pull") {
    branchName = "";
    inPrPage = true;
  }

  return { repoName, branchName, inPrPage };
}
