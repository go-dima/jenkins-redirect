export interface Job {
  name: string;
  url: string;
  jobs?: Job[];
  builds?: { url: string }[];
}
