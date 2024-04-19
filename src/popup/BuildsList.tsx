import React, { useEffect, useState } from "react";
import { fetchJson } from "../utils";
import { Build, BuildsListProps } from "./BuildsList.types";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

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
  const [builds, setBuilds] = useState<Build[]>(undefined);

  useEffect(() => {
    const fetchBuilds = async () => {
      try {
        const fetchedBuilds = await Promise.all(
          jobs?.map((job) => fetchJson(job.url))
        );

        const sortedBuilds = fetchedBuilds.sort(
          (a, b) => jobs?.indexOf(a.url) - jobs.indexOf(b.url)
        );

        setBuilds(sortedBuilds);
      } catch (error) {}
    };

    fetchBuilds();
  }, [jobs]);

  return (
    <div {...props}>
      {!!builds?.length ? (
        <ul className="pupupList">
          {builds?.map((build, index) => (
            <li key={index}>
              {build.building ? (
                <span>🚧</span>
              ) : (
                <span>{getIconForResult(build.result)}</span>
              )}
              <a href={build.url}>{build.displayName}</a>
            </li>
          ))}
        </ul>
      ) : (
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
      )}
    </div>
  );
};

export default BuildsList;
