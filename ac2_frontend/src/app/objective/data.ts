export interface Commitment {
  ciphertext: string;
  points: string[][]; // Array of [x, y] coordinate pairs as strings
  committed_at: string;
  decrypted: boolean;
  is_decline?: boolean;
  decrypted_name?: string;
  threshold?: number;
  coefficients?: string[]; // Polynomial coefficients as strings
  decryption_level?: number;
}

export interface Objective {
  id: string;
  title: string;
  description: string;
  resolutionDate: string; // ISO string of future resolution date
  published: boolean;
  requireIdentityVerification?: boolean;
  committers?: string[]; // List of people if published
  commitments?: Commitment[]; // List of encrypted commitments
  resolution_strategy?: string; // ASAP or DEADLINE
  minimum_number?: number; // Minimum commitments required for any decryption
  eligible_count?: number; // Total number of eligible people
  invited_count?: number; // Deprecated: Total number of invited people
  closed?: boolean;
}
