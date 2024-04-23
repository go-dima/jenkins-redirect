import { getActiveTab, setBadge } from "./shared.helpers";
import { tabIdToJobObj } from "./shared.state";
import { fetchJson } from "./utils";

const updateAlarm = "updateAlarm";
const updateAlarmWhenBuilding = "updateAlarmWhenBuilding";

async function handleAlarm(alarm: chrome.alarms.Alarm) {
  if (alarm.name === updateAlarm || alarm.name === updateAlarmWhenBuilding) {
    const { id: tabId } = await getActiveTab();
    if (tabId in tabIdToJobObj) {
      const job = tabIdToJobObj[tabId];
      const { lastBuild } = await fetchJson(job?.url);

      if (lastBuild) {
        const { building, result } = await fetchJson(lastBuild.url);
        setBadge(tabId, building, result);
        resetBuildingAlarm(building);
      }
    }
  }
}

function resetBuildingAlarm(building: boolean) {
  if (building) {
    chrome.alarms.create(updateAlarmWhenBuilding, { periodInMinutes: 1 / 2 });
  } else {
    chrome.alarms.clear(updateAlarmWhenBuilding);
  }
}

export default function initAlarm() {
  chrome.alarms.create(updateAlarm, { periodInMinutes: 2 });
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    await handleAlarm(alarm);
  });
}
