import React, { useEffect, useState } from "react";
import { fetchJson } from "../utils";
import { Build } from "./BuildsList.types";
import ResultIcon from "./ResultIcon";
import { mockBuilds } from "../mockData/buildsResponse";
import { Button } from "antd";

interface BuildsListProps extends React.HTMLProps<HTMLDivElement> {
  jobs: {
    _class: string;
    number: number;
    url: string;
  }[];
  isStory?: boolean;
}

const BuildsList: React.FC<BuildsListProps> = ({ jobs, isStory }) => {
  const [builds, setBuilds] = useState<Build[]>(
    isStory ? mockBuilds : undefined
  );

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

    if (!isStory) fetchBuilds();
  }, [jobs]);

  return (
    <div
      className="popupList items-stretch content-between"
      key={`${new Date()}`}>
      {builds?.map((build, index) => (
        <div className="popupList-item" key={index}>
          <Button
            onClick={() => chrome.tabs.create({ url: build.url })}
            icon={<ResultIcon build={build} />}
            block>
            {build.displayName}
          </Button>
        </div>
      ))}
    </div>
  );
};

export default BuildsList;
