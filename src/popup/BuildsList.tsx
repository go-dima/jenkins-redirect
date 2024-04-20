import React, { useEffect, useState } from "react";
import { fetchJson } from "../utils";
import { Build } from "./BuildsList.types";
import ResultIcon from "./ResultIcon";

export interface BuildsListProps extends React.HTMLProps<HTMLDivElement> {
  jobs: {
    _class: string;
    number: number;
    url: string;
  }[];
}

const BuildsList: React.FC<BuildsListProps> = ({ jobs }) => {
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
    <ul className="popupList">
      {builds?.map((build, index) => (
        <li key={index}>
          <ResultIcon build={build} />
          <button onClick={() => chrome.tabs.create({ url: build.url })}>
            {build.displayName}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default BuildsList;
