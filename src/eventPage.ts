import resetAlarm from "./alarm";
import { JENKINS_URL, TARGET_GITHUB_URL } from "./settings";
import {
  clearBadge,
  getActiveTab,
  parseRepoUrl,
  setLoadingBadge,
  setResultBadge,
} from "./shared.helpers";
import { tabIdToJobObj } from "./shared.state";
import { Job } from "./shared.types";
import { fetchJson } from "./utils";

chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener(async (msg) => {
    if (!msg.getBuildUrls) return;

    try {
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
    } catch (error) {
      // Port disconnected
    }
    return true;
  });
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  const activeTab = await getActiveTab();
  if (request.loadJenkinsPage) {
    loadJenkinsPage(activeTab);
  } else if (request.loadBuildPage) {
    if (tabIdToJobObj[activeTab.id]) {
      chrome.tabs.create({ url: `${tabIdToJobObj[activeTab.id].url}/build` });
      return;
    }
  } else if (request.loadMainPage) {
    if (tabIdToJobObj[activeTab.id]) {
      chrome.tabs.create({ url: `${tabIdToJobObj[activeTab.id].main}/build` });
      return;
    }
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId in tabIdToJobObj) {
    delete tabIdToJobObj[tabId];
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    await onInit(tabId);
  }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await onInit(activeInfo.tabId);
});

async function onInit(tabId: number) {
  try {
    clearBadge(tabId);
    const job = await updateDirectJobObj(tabId);
    const { lastBuild } = await fetchJson(job?.url);
    const { building, result } = await fetchJson(lastBuild.url);
    setResultBadge(tabId, building, result);
  } catch (error) {
    console.warn("Error onInit", error);
  }
}

async function getLatestBuilds(jobUrl: string) {
  const { builds } = await fetchJson(jobUrl);
  return builds?.slice(0, 5);
}

async function updateDirectJobObj(tabId: number) {
  const { repoName, branchName } = await getGitHubRepoBranch();
  if (repoName) {
    setLoadingBadge(tabId);
    const job = await getBranchJob(repoName, branchName);
    if (job) {
      tabIdToJobObj[tabId] = job;
    }
    resetAlarm();
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

async function getGitHubRepoBranch(): Promise<{
  repoName: string;
  branchName: string;
}> {
  const activeTab = await getActiveTab();
  if (notGithubPage(activeTab)) {
    return { repoName: "", branchName: "" };
  }

  const {
    repoName,
    branchName: urlBranchName,
    inPrPage,
  } = parseRepoUrl(new URL(activeTab.url));

  let branchName = urlBranchName;
  if (!!inPrPage) {
    const { sourceBranch } = await chrome.tabs.sendMessage(activeTab.id, {
      inPrPage: true,
    });
    branchName = sourceBranch;
  }

  return { repoName, branchName };
}

function notGithubPage(activeTab: chrome.tabs.Tab) {
  return activeTab && !activeTab.url.startsWith(TARGET_GITHUB_URL);
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
          (branchBuild: Job) =>
            branchBuild.name === encodeURIComponent(branchName)
        );
        branchJob.main = branchJob.url.replace(
          encodeURIComponent(encodeURIComponent(branchName)),
          "main"
        );
        return branchJob;
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}
