import React, { useEffect, useState } from "react";
import { fetchJson } from "../utils";
import { Build, BuildsListProps } from "./BuildsList.types";

const getIconForResult = (result: string) => {
  switch (result) {
    case "SUCCESS":
      return "✅";
    case "FAILURE":
      return "❌";
    case "ABORTED":
      return "⛔";
    default:
      return "🔵"; // Default icon for other results
  }
};

const BuildsList: React.FC<BuildsListProps> = ({ jobs, ...props }) => {
  const [builds, setBuilds] = useState<Build[]>([]);

  useEffect(() => {
    const fetchBuilds = async () => {
      try {
        const fetchedBuilds = await Promise.all(
          jobs.map((job) => fetchJson(job.url))
        );

        const sortedBuilds = fetchedBuilds.sort(
          (a, b) => jobs.indexOf(a.url) - jobs.indexOf(b.url)
        );

        setBuilds(sortedBuilds);
      } catch (error) {}
    };

    fetchBuilds();
  }, [jobs]);

  return (
    <ul {...props}>
      {builds.map((build, index) => (
        <li key={index}>
          {build.building ? (
            <span>🚧</span>
          ) : (
            <span>{getIconForResult(build.result)}</span>
          )}
          <a href={build.url}>{build.displayName}</a>
        </li>
      ))}

      <li>
        <img
          src="../logo.png"
          alt={"Go to Jenkins"}
          onClick={() => {
            chrome.runtime.sendMessage({ loadJenkinsPage: true });
          }}
          className="popupList-image"
        />
      </li>
    </ul>
  );
};

export default BuildsList;
