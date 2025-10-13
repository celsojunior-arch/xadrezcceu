export interface Player {
  id: string;
  name: string;
  birthDate: string; // Required field
  nickname?: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  currentRating: number;
  ratingHistory: RatingEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface RatingEntry {
  id: string;
  playerId: string;
  previousRating: number;
  newRating: number;
  variation: number;
  reason: string; // motivo
  tournamentId?: string;
  roundNumber?: number;
  desafioConfrontoId?: string;
  date: string;
  timestamp: string;
}

export interface Tournament {
  id: string;
  name: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  numberOfRounds: number;
  status: 'draft' | 'active' | 'completed';
  participants: string[];
  presentPlayers?: string[];
  rounds: Round[];
  createdAt: string;
  organizerId: string;
  participantsLocked?: boolean;
  tiebreakEnabled?: boolean;
  allowNoShow?: boolean;
  byePoints?: number;
  byeAffectsRating?: boolean;
  settings?: TournamentSettings;
}

export interface TournamentSettings {
  tiebreakCriteria: ('initialRating' | 'headToHead' | 'random')[];
  allowManualPairings: boolean;
  ratingSystem: 'municipal' | 'elo';
}

export interface TournamentConfiguration {
  allowNoShow: boolean;
  byePoints: number; // 1.0 or 0.5
  byeAffectsRating: boolean;
  tiebreakEnabled: boolean;
  tiebreakCriteria: ('initialRating' | 'headToHead' | 'random')[];
  allowManualPairings: boolean;
  ratingSystem: 'municipal' | 'elo';
  inactivityPenalty: boolean;
  inactivityDays: number;
  inactivityAmount: number;
  maxInactivityPenalty: number;
}

export interface TournamentPlayer {
  id: string;
  tournamentId: string;
  playerId: string;
  initialTournamentRating: number;
  currentScore: number;
  receivedBye: boolean;
  isPresent: boolean;
}


export interface Round {
  id: string;
  tournamentId: string;
  number: number;
  status: 'pending' | 'active' | 'completed' | 'locked';
  matches: Match[];
  createdAt: string;
  confirmedAt?: string;
}

export interface Match {
  id: string;
  roundId: string;
  playerAId: string;
  playerBId: string;
  tableNumber: number;
  result?: 'A' | 'B' | 'E' | 'WO_A' | 'WO_B';
  scoreA: number;
  scoreB: number;
  vpUsed?: number;
  ratingDelta?: number;
  manuallyAdjusted?: boolean;
  adjustmentReason?: string;
  modifiedBy?: string;
  isBye?: boolean;
  byePlayerId?: string;
  createdAt: string;
}

export interface Pairing {
  id: string;
  playerAId: string;
  playerBId: string;
  tableNumber: number;
}

export interface TournamentStanding {
  playerId: string;
  playerName: string;
  rating: number;
  initialRating: number;
  points: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  opponents: string[]; // Player IDs of opponents faced
  tiebreakScore?: number;
  position: number;
}

export interface ImportResult {
  success: boolean;
  playersImported: number;
  playersUpdated: number;
  errors: string[];
  duplicates: Array<{
    csvRow: number;
    name: string;
    birthDate: string;
    existingPlayer?: Player;
  }>;
}

export interface CSVPlayerData {
  name: string;
  birthDate: string;
  rating: number;
  observations?: string;
}

export interface RatingSystemConfig {
  vpTable: VPTableEntry[];
  baseVP: number;
  zeroSum: boolean;
}

export interface VPTableEntry {
  minDelta: number;
  maxDelta: number;
  vp: number;
}

export interface SystemSettings {
  ratingSystem: RatingSystemConfig;
  defaultTournamentSettings: TournamentSettings;
  permissions: UserPermissions;
}

export interface UserPermissions {
  canManageSystem: boolean;
  canManageTournaments: boolean;
  canManagePlayers: boolean;
  canViewReports: boolean;
}

export interface UndoAction {
  id: string;
  type: 'result' | 'rating' | 'pairing';
  description: string;
  timestamp: string;
  data: any;
  canUndo: boolean;
}

// Desafio Quinzenal Types
export interface DesafioCiclo {
  id: string;
  mes: number;
  ano: number;
  quinzena: 1 | 2; // 1 = primeira quinzena (dia 1), 2 = segunda quinzena (dia 16)
  status: 'ativo' | 'concluido' | 'cancelado';
  criadoEm: string;
  atualizadoEm: string;
}

export interface DesafioConfronto {
  id: string;
  cicloId: string;
  jogadorBrancasId: string;
  jogadorPretasId: string;
  posBrancas: number; // posição no ranking no momento da criação
  posPretas: number;
  ratingBrancasSnapshot: number;
  ratingPretasSnapshot: number;
  responsavelId: string; // sempre o pior classificado
  resultado?: '1-0' | '0-1' | '0-0';
  aplicadoEm?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface HistoricoCoresDupla {
  id: string;
  jogadorAId: string;
  jogadorBId: string;
  ultimaCorDeA: 'BRANCAS' | 'PRETAS';
  ultimaCorDeB: 'BRANCAS' | 'PRETAS';
  atualizadoEm: string;
}

export interface EstadoQuinzenaJogador {
  id: string;
  cicloId: string;
  jogadorId: string;
  corNaQuinzena?: 'BRANCAS' | 'PRETAS';
}

export type UserRole = 'admin' | 'organizer' | 'spectator';

export interface User {
  id: string;
  name: string;
  role: UserRole;
}