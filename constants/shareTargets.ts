export type ShareTarget = {
  id: string;
  label: string;
  icon: any;
  action: (url: string) => Promise<void>;
};