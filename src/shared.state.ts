export class AppState {
  private jenkinsReachable: boolean = false;
  private tabIdToJobObj = {};

  getTab = (id: number) => {
    return this.tabIdToJobObj[id];
  };

  setTab = (id: number, job) => {
    this.tabIdToJobObj[id] = job;
  };

  removeTab = (id: number) => {
    delete this.tabIdToJobObj[id];
  };

  isTabExist = (id: number) => {
    return id in this.tabIdToJobObj;
  };

  setJenkinsReachable = (reachable: boolean) => {
    this.jenkinsReachable = reachable;
  };

  getJenkinsReachable = () => {
    return this.jenkinsReachable;
  };
}

export const state = new AppState();
