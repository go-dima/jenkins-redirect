// Listen to messages sent from other parts of the extension.

import { JENKINS_URL, TARGET_GITHUB_URL } from "./settings";
import { fetchJson } from "./utils";

// State
const tabIdToJobObj = {};

// types
interface Job {
  name: string;
  url: string;
  jobs?: Job[];
  builds?: { url: string }[];
}

chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener(async (msg) => {
    if (!msg.getBuildUrls) return;

    const { id: activeTabId } = await getActiveTab();
    const job = tabIdToJobObj[activeTabId];
    if (!job) {
      port.postMessage({ data: [], err: "No access to Jenkins" });
      return;
    }

    const latestBuilds = await getLatestBuilds(job.url);
    if (latestBuilds) {
      port.postMessage({ data: latestBuilds });
    } else {
      port.postMessage({ data: [], err: "No builds found" });
    }
    return true;
  });
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.loadJenkinsPage) {
    const activeTab = await getActiveTab();
    loadJenkinsPage(activeTab);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId in tabIdToJobObj) {
    delete tabIdToJobObj[tabId];
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    const job = await updateDirectJobObj(tabId);
    setBadge(tabId, job);
  }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const job = await updateDirectJobObj(activeInfo.tabId);
  setBadge(activeInfo.tabId, job);
});

async function setBadge(tabId: number, job: any) {
  try {
    const { lastBuild } = await fetchJson(job?.url);
    const { building, result } = await fetchJson(lastBuild.url);
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

async function getLatestBuilds(jobUrl: string) {
  const { builds } = await fetchJson(jobUrl);
  return builds?.slice(0, 5);
}

async function updateDirectJobObj(tabId: number) {
  const { repoName, branchName } = await getGitHubRepoBranch();
  if (repoName) {
    const job = await getBranchJob(repoName, branchName);
    if (job) {
      tabIdToJobObj[tabId] = job;
    }
    return job;
  }
}

async function loadJenkinsPage(tab: chrome.tabs.Tab) {
  if (tabIdToJobObj[tab.id]) {
    chrome.tabs.create({ url: tabIdToJobObj[tab.id].url });
    return;
  } else {
    const { repoName, branchName } = await getGitHubRepoBranch();
    const searchTerm = repoName + (branchName ? ` ${branchName}` : "");
    chrome.tabs.create({
      url: `${JENKINS_URL}/search/?q=${searchTerm}`,
    });
  }
}

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

async function getGitHubRepoBranch(): Promise<{
  repoName: string;
  branchName: string;
}> {
  const activeTab = await getActiveTab();
  if (notGithubPage(activeTab)) {
    return { repoName: "", branchName: "" };
  }

  const { repoName, branchName } = parseRepoUrl(activeTab);
  return { repoName, branchName };
}

function notGithubPage(activeTab: chrome.tabs.Tab) {
  return activeTab && !activeTab.url.startsWith(TARGET_GITHUB_URL);
}

function parseRepoUrl(tab) {
  //'https://github.com/myorg/repo-name' -> ["https:", "", "github.com", "myorg", "repo-name"]
  const [repoUrl, urlSuffix] = tab.url.split("/tree/");
  const repoName = repoUrl.split("/")[4];
  const branchName = urlSuffix?.split("/")[0];
  return { repoName, branchName };
}

async function getBranchJob(projectName: string, branchName: string = "main") {
  try {
    const { jobs }: { jobs: Job[] } = await fetchJson(JENKINS_URL);
    const jobData = await Promise.all(jobs?.map((job) => fetchJson(job.url)));

    for (let i = 0; i < jobData.length; i++) {
      const projectJobs = jobData[i].jobs || [];
      const projectJob = projectJobs.find((job: Job) =>
        job.name.includes(projectName)
      );

      if (projectJob) {
        const { jobs: branches } = await fetchJson(projectJob.url);
        const branchJob = branches?.find(
          (branchBuild: Job) => branchBuild.name === branchName
        );

        return branchJob;
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}
