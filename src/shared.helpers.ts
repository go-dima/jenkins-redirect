export async function setBadge(
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

export async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}
