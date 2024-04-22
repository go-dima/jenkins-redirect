import type { Meta, StoryObj } from "@storybook/react";
import { mockJobs } from "../mockData/popupResponse";
import BuildList from "./BuildsList";

const meta = {
  title: "Popup/BuildList",
  component: BuildList,
} satisfies Meta<typeof BuildList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    jobs: mockJobs,
    isStory: true,
  },
};
