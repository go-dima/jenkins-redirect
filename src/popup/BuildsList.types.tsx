export interface Build {
  displayName: string;
  result: string;
  url: string;
  building: boolean;
}

export interface BuildsListProps extends React.HTMLProps<HTMLDivElement> {
  jobs: {
    _class: string;
    number: number;
    url: string;
  }[];
}
