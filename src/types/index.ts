export interface User {
  id: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  phoneNumber?: string;
  mobileCarrier?: string;
  smsNotificationsEnabled?: boolean;
}

export interface Prompt {
  id: string;
  text: string;
  category?: string;
  createdBy?: string;
}

export interface GifSubmission {
  id: string;
  gifId: string;
  gifUrl: string;
  playerId: string;
  playerName: string;
  round: number;
}

export interface Round {
  id: number;
  prompt: Prompt;
  judgeId: string;
  submissions: GifSubmission[];
  winningSubmission?: GifSubmission;
  isComplete: boolean;
  hasStarted: boolean;
}

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isJudge: boolean;
  score: number;
  isActive: boolean;
}

export interface Game {
  id: string;
  name: string;
  hostId: string;
  players: Player[];
  rounds: Round[];
  currentRound: number;
  status: 'waiting' | 'playing' | 'completed';
  maxPlayers: number;
  maxRounds: number;
  maxScore: number;
  createdAt: number;
  updatedAt: number;
}

export interface GameState {
  game: Game | null;
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}