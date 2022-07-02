export type chartInfoList = {
  type: string;
  value: number;
}[];

export interface chartData {
  title: string;
  description: string;
  info: chartInfoList;
}
