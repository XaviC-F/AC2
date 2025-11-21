export interface Objective {
  id: string;
  title: string;
  description: string;
  resolutionDate: string; // ISO string of future resolution date
  published: boolean;
  committers?: string[]; // List of people if published
}

export const objectives: Objective[] = [
  {
    id: '1',
    title: 'Sample Unresolved Objective',
    description: 'This objective is not yet published.',
    resolutionDate: '2025-01-01T00:00:00Z',
    published: false,
  },
  {
    id: '2',
    title: 'Sample Published Objective',
    description: 'This objective has been published with its committer list.',
    resolutionDate: '2025-06-01T00:00:00Z',
    published: true,
    committers: ['Alice', 'Bob', 'Charlie'],
  },
];

export function getObjectiveById(id: string): Objective | undefined {
  return objectives.find((obj) => obj.id === id);
}
