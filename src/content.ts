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

  fetch(`${url}/api/json`)
    .then((response) => response.json())
    .then((asJson) => {
      const lastBuildUrl = asJson?.lastBuild?.url;
      if (!lastBuildUrl) {
        return;
      }

      fetch(`${lastBuildUrl}/api/json`)
        .then((response) => response.json())
        .then((lastBuildAsJson) => {
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
    .catch((error) => {
      console.error("Error:", error);
    });
};

// check that the href matches jenkins.*.dev
const jenkinsRegex = /jenkins\..*\.dev/;
if (jenkinsRegex.test(window.location.href)) {
  changeTitle();
}
