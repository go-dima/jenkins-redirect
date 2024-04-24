import { fetchJson } from "./utils";

const changeTitle = async () => {
  const url = new URL(window.location.href);
  const pathParts = url.pathname
    .split("/")
    .filter((part) => part && part != "job");
  if (pathParts.length >= 3) {
    const jobName = pathParts[1];
    const branch = pathParts[2];

    const buildPart = pathParts[3] ? ` #${pathParts[3]}` : "";
    document.title = `${jobName} [${branch}${buildPart}]`;
  }

  fetchJson(url.href)
    .then((asJson) => {
      const lastBuildUrl = asJson?.lastBuild?.url;
      if (!lastBuildUrl) {
        return;
      }

      fetchJson(lastBuildUrl).then((lastBuildAsJson) => {
        const { inProgress, result } = lastBuildAsJson;
        const statusToEmoji: Record<string, string> = {
          SUCCESS: "✅",
          FAILURE: "❌",
          ABORTED: "⛔",
        };

        const emoji = (inProgress ? "🔄" : statusToEmoji[result]) || "🤷‍♂️";
        document.title = emoji + " " + document.title;
      });
    })
    .catch(() => {});
};

// check that the href matches jenkins.*.dev
const jenkinsRegex = /jenkins\..*\.dev/;
if (jenkinsRegex.test(window.location.href)) {
  changeTitle();
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.inPrPage) {
    const branchElements = Array.from(
      document.querySelectorAll(
        "span.commit-ref > a > span.css-truncate-target"
      )
    );
    const branchNames = branchElements.map(
      (element: HTMLElement) => element.innerText
    );

    // Remove duplicates - return the first instance of each branch name
    const [targetBranch, sourceBranch] = branchNames.filter(
      (item, index) => branchNames.indexOf(item) === index
    );
    sendResponse({ sourceBranch, targetBranch });
  }
});
