import {
  getActiveTab,
  setLoadingBadge,
  setResultBadge,
} from "./shared.helpers";
import { state } from "./shared.state";
import { fetchJson } from "./utils";

const updateAlarm = "updateAlarm";

async function handleAlarm(alarm: chrome.alarms.Alarm) {
  if (alarm.name === updateAlarm) {
    const { id: tabId } = await getActiveTab();
    if (tabId && state.isTabExist(tabId)) {
      try {
        const { url } = state.getTab(tabId);
        setLoadingBadge(tabId);
        const { lastBuild } = await fetchJson(url);
        const { building, result } = await fetchJson(lastBuild.url);
        setResultBadge(tabId, building, result);
      } catch (error) {
        // No url or no lastBuild
      }
    }
  }
}

let alarmErrCount: number = 0;

export default function resetAlarm() {
  alarmErrCount = 0;
  chrome.alarms.create(updateAlarm, { periodInMinutes: 2 });
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    try {
      await handleAlarm(alarm);
    } catch (error) {
      alarmErrCount++;
      if (alarmErrCount > 3) {
        console.warn("Extension alarm error count exceeded 3, clearing alarms");
        chrome.alarms.clear(updateAlarm);
      }
    }
  });
}
