export interface Job {
  displayName: string;
  name: string;
  url: string;
  jobs?: Job[];
  builds?: { url: string }[];
}

export type ParsedUrl = {
  repoName: string;
  branchName: string;
  inPrPage: boolean;
};

export type PrBranches = {
  sourceBranch: string;
  targetBranch: string;
};

export interface JobWithMain extends Job {
  main: string;
}
