export interface Objective {
  id: string;
  title: string;
  description: string;
  resolutionDate: string; // ISO string of future resolution date
  published: boolean;
  committers?: string[]; // List of people if published
}
