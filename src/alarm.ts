import { getActiveTab, setBadge } from "./shared.helpers";
import { tabIdToJobObj } from "./shared.state";
import { fetchJson } from "./utils";

const updateAlarm = "updateAlarm";

async function handleAlarm(alarm: chrome.alarms.Alarm) {
  if (alarm.name === updateAlarm) {
    const { id: tabId } = await getActiveTab();
    if (tabId in tabIdToJobObj) {
      const job = tabIdToJobObj[tabId];
      const { lastBuild } = await fetchJson(job?.url);

      if (lastBuild) {
        const { building, result } = await fetchJson(lastBuild.url);
        setBadge(tabId, building, result);
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
        console.warn("Alarm error count exceeded 3, clearing alarms");
        chrome.alarms.clear(updateAlarm);
      }
    }
  });
}
