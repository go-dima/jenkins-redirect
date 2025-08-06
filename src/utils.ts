import { JENKINS_URL } from "./settings";
import { state } from "./shared.state";

export async function fetchJson(url: string | URL) {
  try {
    const response = await fetch(`${url}/api/json`);
    if (!response.ok) {
      console.warn("Fetch error", response.status);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching json", error);
    return null;
  }
}

export async function loadJenkinsJobs() {
  try {
    const response = await fetch(`${JENKINS_URL}/api/json`);
    state.setJenkinsReachable(response.ok);

    if (!response.ok) {
      console.warn("Jenkins Unreachable", response.status);
      return { jobs: undefined };
    }
    return await response.json();
  } catch (error) {
    console.warn("Jenkins Unreachable");
    return { jobs: undefined };
  }
}
