export interface Build {
  displayName: string;
  result: string;
  url: string;
  building: boolean;
}

export interface BuildsListProps extends React.HTMLProps<HTMLUListElement> {
  jobs: {
    _class: string;
    number: number;
    url: string;
  }[];
}
