// Listen to messages sent from other parts of the extension.

import { fetchJson } from "./utils";

// Config?
const JENKINS_URL = "";
const TARGET_GITHUB_URL = "";

// State
const tabIdToJobObj = {};
let activeTabId: number = null;

// types
interface Job {
  name: string;
  url: string;
  jobs?: Job[];
  builds?: { url: string }[];
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (!request.getBuildUrls) return;

  if ("latestBuilds" in tabIdToJobObj[activeTabId]) {
    const latestBuilds = tabIdToJobObj[activeTabId].latestBuilds;
    sendResponse(latestBuilds);
  } else {
    sendResponse([]);
  }
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
    await updateDirectJobObj(tabId);
    const badge = {
      tabId,
      text: tabIdToJobObj[tabId] ? "V" : "",
    };
    chrome.action.setBadgeText(badge);
  }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await updateDirectJobObj(activeInfo.tabId);
  const badge = {
    tabId: activeInfo.tabId,
    text: tabIdToJobObj[activeInfo.tabId] ? "V" : "",
  };
  chrome.action.setBadgeText(badge);
});

async function getLatestBuilds(tabId: number) {
  const jobDetails = tabIdToJobObj[tabId];
  const { builds } = await fetchJson(jobDetails.url);
  return builds.slice(0, 5);
}

async function updateDirectJobObj(tabId: number) {
  const { repoName, branchName } = await getGitHubRepoBranch();
  if (repoName) {
    const job = await getBranch(repoName, branchName);
    if (job) {
      activeTabId = tabId;
      tabIdToJobObj[tabId] = job;
      const latestBuilds = await getLatestBuilds(tabId);
      tabIdToJobObj[tabId].latestBuilds = latestBuilds;
    }
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

async function getBranch(projectName: string, branchName: string = "main") {
  try {
    const data: { jobs: Job[] } = await fetchJson(JENKINS_URL);
    const jobs = data.jobs || [];
    const jobData = await Promise.all(jobs.map((job) => fetchJson(job.url)));

    for (let i = 0; i < jobData.length; i++) {
      const projectJobs = jobData[i].jobs || [];
      const projectJob = projectJobs.find((job: Job) =>
        job.name.includes(projectName)
      );

      if (projectJob) {
        const branchData = await fetchJson(projectJob.url);
        const branches = branchData.jobs || [];
        const branch = branches.find(
          (branchBuild: Job) => branchBuild.name === branchName
        );

        if (branch) {
          return branch;
        }
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}
