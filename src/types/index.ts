export interface AnomalyData {
  id: number;
  name: string;
  municipality: string;
  province: string;
  region: number;
  lat: number;
  lng: number;
  anomalyScore: number;
  priority: string;
  turnout: number;
  expected: number;
  residual: number;
  precinctNumber: number;
  spatialDevZScore: number;
  overvoteRate: number | null;
  undervoteRate: number | null;
  giStarZScore: number;
  registeredVoters: number;
  actualVoters: number;
  validVotes: number;
  overVotes: number;
  underVotes: number;
}
