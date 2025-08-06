import { JENKINS_URL } from "../settings";
import { Job } from "../shared.types";

export interface JenkinsApiResult {
  ok: boolean;
  statusCode: number;
  jobs: Job[] | null;
  error: string | null;
}

export async function fetchJenkinsJobs(): Promise<JenkinsApiResult> {
  try {
    const response = await fetch(`${JENKINS_URL}/api/json`);
    const data = await response.json();
    return {
      ok: response.ok,
      statusCode: response.status,
      jobs: response.ok ? data.jobs : null,
      error: null,
    };
  } catch (error) {
    return {
      ok: false,
      statusCode: 0,
      jobs: null,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
