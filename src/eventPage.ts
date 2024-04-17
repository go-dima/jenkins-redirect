// Listen to messages sent from other parts of the extension.

// Config?
const JENKINS_URL = "";
const TARGET_GITHUB_URL = "";

// State
const tabIdToJobObj = {};

// types
interface Job {
  name: string;
  url: string;
  jobs?: Job[];
}

chrome.action.onClicked.addListener(loadJenkinsPage);

chrome.tabs.onRemoved.addListener((tabId) => {
  delete tabIdToJobObj[tabId];
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

async function updateDirectJobObj(tabId: number) {
  const { repoName, branchName } = await getGitHubRepoBranch();
  if (repoName) {
    const job = await getBranch(repoName, branchName);
    if (job) {
      tabIdToJobObj[tabId] = job;
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
  console.log(repoName, branchName);
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
    const response = await fetch(`${JENKINS_URL}/api/json`);
    const data: { jobs: Job[] } = await response.json();

    const jobs = data.jobs || [];
    const jobPromises = jobs.map((job) => fetch(`${job.url}api/json`));
    const jobResponses = await Promise.all(jobPromises);
    const jobData = await Promise.all(jobResponses.map((res) => res.json()));

    for (let i = 0; i < jobData.length; i++) {
      const projectJobs = jobData[i].jobs || [];
      const projectJob = projectJobs.find((job: Job) =>
        job.name.includes(projectName)
      );

      if (projectJob) {
        const branchResponse = await fetch(`${projectJob.url}api/json`);
        const branchData = await branchResponse.json();
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
    // console.error(error);
    return null;
  }
}
