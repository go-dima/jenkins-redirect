// parseRepoUrl.test.ts

import { parseRepoUrl } from "./shared.helpers";

describe("parseRepoUrl", () => {
  it("parses a URL for a specific branch", () => {
    const tabUrl = new URL("https://github.com/myorg/my-repo/tree/branch-name");
    expect(parseRepoUrl(tabUrl)).toEqual({
      repoName: "my-repo",
      branchName: "branch-name",
      inPrPage: false,
    });
  });

  it("parses a URL for a complex branch", () => {
    const tabUrl = new URL(
      "https://github.com/myorg/my-repo/tree/prefix/branch-name"
    );
    expect(parseRepoUrl(tabUrl)).toEqual({
      repoName: "my-repo",
      branchName: "prefix/branch-name",
      inPrPage: false,
    });
  });

  it("parses a URL for a specific branch with a path", () => {
    const tabUrl = new URL(
      "https://github.com/myorg/my-repo/tree/branch-name/sub-folder"
    );
    expect(parseRepoUrl(tabUrl)).toEqual({
      repoName: "my-repo",
      branchName: "branch-name",
      inPrPage: false,
    });
  });

  it("parses a URL for the main branch", () => {
    const tabUrl = new URL("https://github.com/myorg/my-repo");
    expect(parseRepoUrl(tabUrl)).toEqual({
      repoName: "my-repo",
      branchName: "main",
      inPrPage: false,
    });
  });

  it("parses a URL for a pull request page", () => {
    const tabUrl = new URL("https://github.com/myorg/my-repo/pull/123");
    expect(parseRepoUrl(tabUrl)).toEqual({
      repoName: "my-repo",
      branchName: "",
      inPrPage: true,
    });
  });
});
