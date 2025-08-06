import { useCallback, useEffect, useState } from "react";
import { fetchJenkinsJobs, JenkinsApiResult } from "../api/jenkinsApi";

export function useJenkinsJobs() {
  const [result, setResult] = useState<
    JenkinsApiResult & { isLoading: boolean }
  >({
    ok: false,
    statusCode: 0,
    jobs: null,
    error: null,
    isLoading: true,
  });

  const fetchJobs = useCallback(async () => {
    setResult((prev) => ({ ...prev, isLoading: true }));
    const apiResult = await fetchJenkinsJobs();
    setResult({ ...apiResult, isLoading: false });
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return { ...result, refetch: fetchJobs };
}
