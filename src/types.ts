export interface Comic {
  id: string;
  publisher: string;
  series: string;
  volume?: string;
  years: string;
  type: string;
  issue: string;
  issueNumber: number;
  currentValue: number;
  collected: boolean;
}
