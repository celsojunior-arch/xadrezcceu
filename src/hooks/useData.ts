import { useState, useEffect } from 'react';
import { Player, Tournament, Round, Pairing, RatingEntry, TournamentStanding, ImportResult, CSVPlayerData, DesafioCiclo, DesafioConfronto, HistoricoCoresDupla, EstadoQuinzenaJogador, TournamentPlayer, RatingSystemConfig, SystemSettings, UserPermissions, TournamentSettings, UndoAction } from '../types';

// Mock data
const mockPlayers: Player[] = [
  {
    id: '1',
    name: 'João Silva',
    birthDate: '1985-03-15',
    nickname: 'João',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-9999',
    isActive: true,
    currentRating: 1850,
    ratingHistory: [
      {
        id: '1',
        playerId: '1',
        rating: 1800,
        change: 0,
        date: '2024-01-01',
        reason: 'initial',
        timestamp: '2024-01-01T10:00:00Z'
      },
      {
        id: '2',
        playerId: '1',
        rating: 1850,
        change: 50,
        tournamentId: '1',
        date: '2024-01-15',
        reason: 'tournament',
        timestamp: '2024-01-15T15:30:00Z'
      }
    ],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Maria Santos',
    birthDate: '1990-07-22',
    email: 'maria.santos@email.com',
    isActive: true,
    currentRating: 1750,
    ratingHistory: [
      {
        id: '3',
        playerId: '2',
        rating: 1750,
        change: 0,
        date: '2024-01-01',
        reason: 'initial',
        timestamp: '2024-01-01T10:00:00Z'
      }
    ],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '3',
    name: 'Pedro Costa',
    birthDate: '1988-11-08',
    email: 'pedro.costa@email.com',
    nickname: 'Pedrão',
    currentRating: 1920,
    ratingHistory: [
      {
        id: '4',
        playerId: '3',
        rating: 1900,
        change: 0,
        date: '2024-01-01',
        reason: 'initial',
        timestamp: '2024-01-01T10:00:00Z'
      },
      {
        id: '5',
        playerId: '3',
        rating: 1920,
        change: 20,
        tournamentId: '1',
        date: '2024-01-15',
        reason: 'tournament',
        timestamp: '2024-01-15T15:30:00Z'
      }
    ],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: '4',
    name: 'Ana Oliveira',
    birthDate: '1992-05-10',
    isActive: false,
    currentRating: 1680,
    ratingHistory: [
      {
        id: '6',
        playerId: '4',
        rating: 1680,
        change: 0,
        date: '2024-01-01',
        reason: 'initial',
        timestamp: '2024-01-01T10:00:00Z'
      }
    ],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
];

const mockTournaments: Tournament[] = [
  {
    id: '1',
    name: 'Torneio Municipal Janeiro 2024',
    location: 'Centro Cultural Municipal',
    description: 'Primeiro torneio do ano',
    startDate: '2024-01-15',
    numberOfRounds: 5,
    status: 'completed',
    participants: ['1', '2', '3', '4'],
    presentPlayers: ['1', '2', '3', '4'],
    rounds: [],
    createdAt: '2024-01-10',
    organizerId: 'org1',
    participantsLocked: true,
    tiebreakEnabled: true,
    allowNoShow: true,
    byePoints: 1.0,
    byeAffectsRating: false,
    settings: {
      tiebreakCriteria: ['initialRating', 'headToHead', 'random'],
      allowManualPairings: true,
      ratingSystem: 'municipal'
    }
  },
  {
    id: '2',
    name: 'Torneio Municipal Fevereiro 2024',
    location: 'Clube de Xadrez',
    description: 'Segundo torneio do ano',
    startDate: '2024-02-15',
    numberOfRounds: 4,
    status: 'active',
    participants: ['1', '3', '4'],
    presentPlayers: ['1', '3'],
    rounds: [],
    createdAt: '2024-02-10',
    organizerId: 'org1',
    participantsLocked: false,
    tiebreakEnabled: false,
    allowNoShow: false,
    byePoints: 0.5,
    byeAffectsRating: true,
    settings: {
      tiebreakCriteria: ['initialRating'],
      allowManualPairings: false,
      ratingSystem: 'municipal'
    }
  }
];

const mockTournamentPlayers: TournamentPlayer[] = [
  {
    id: '1',
    tournamentId: '1',
    playerId: '1',
    initialRating: 1800,
    currentScore: 1.0,
    isPresent: true,
    receivedBye: false
  },
  {
    id: '2',
    tournamentId: '1',
    playerId: '2',
    initialRating: 1750,
    currentScore: 0.0,
    isPresent: true,
    receivedBye: false
  },
  {
    id: '3',
    tournamentId: '1',
    playerId: '3',
    initialRating: 1900,
    currentScore: 1.0,
    isPresent: true,
    receivedBye: false
  },
  {
    id: '4',
    tournamentId: '1',
    playerId: '4',
    initialRating: 1680,
    currentScore: 0.0,
    isPresent: true,
    receivedBye: false
  },
  {
    id: '5',
    tournamentId: '2',
    playerId: '1',
    initialRating: 1850,
    currentScore: 0.0,
    isPresent: true,
    receivedBye: false
  },
  {
    id: '6',
    tournamentId: '2',
    playerId: '3',
    initialRating: 1920,
    currentScore: 0.0,
    isPresent: true,
    receivedBye: false
  }
];

// Mock data for Desafio Quinzenal
const mockDesafioCiclos: DesafioCiclo[] = [
  {
    id: '1',
    mes: 1,
    ano: 2024,
    quinzena: 1,
    status: 'concluido',
    criadoEm: '2024-01-01T09:00:00-03:00',
    atualizadoEm: '2024-01-15T18:30:00-03:00'
  },
  {
    id: '2',
    mes: 1,
    ano: 2024,
    quinzena: 2,
    status: 'ativo',
    criadoEm: '2024-01-16T09:00:00-03:00',
    atualizadoEm: '2024-01-16T09:00:00-03:00'
  }
];

const mockDesafioConfrontos: DesafioConfronto[] = [
  {
    id: '1',
    cicloId: '1',
    jogadorBrancasId: '3', // Pedro (maior rating)
    jogadorPretasId: '1', // João
    posBrancas: 1,
    posPretas: 2,
    ratingBrancasSnapshot: 1920,
    ratingPretasSnapshot: 1850,
    responsavelId: '1', // João (pior classificado)
    resultado: '1-0',
    aplicadoEm: '2024-01-05T14:30:00-03:00',
    criadoEm: '2024-01-01T09:00:00-03:00',
    atualizadoEm: '2024-01-05T14:30:00-03:00'
  },
  {
    id: '2',
    cicloId: '1',
    jogadorBrancasId: '2', // Maria (maior rating)
    jogadorPretasId: '4', // Ana
    posBrancas: 3,
    posPretas: 4,
    ratingBrancasSnapshot: 1750,
    ratingPretasSnapshot: 1680,
    responsavelId: '4', // Ana (pior classificado)
    resultado: '0-1',
    aplicadoEm: '2024-01-08T16:00:00-03:00',
    criadoEm: '2024-01-01T09:00:00-03:00',
    atualizadoEm: '2024-01-08T16:00:00-03:00'
  },
  {
    id: '3',
    cicloId: '2',
    jogadorBrancasId: '1', // João (alternância - jogou de pretas antes)
    jogadorPretasId: '3', // Pedro
    posBrancas: 2,
    posPretas: 1,
    ratingBrancasSnapshot: 1850,
    ratingPretasSnapshot: 1920,
    responsavelId: '1', // João (pior classificado)
    criadoEm: '2024-01-16T09:00:00-03:00',
    atualizadoEm: '2024-01-16T09:00:00-03:00'
  }
];

const mockHistoricoCoresDupla: HistoricoCoresDupla[] = [
  {
    id: '1',
    jogadorAId: '1', // João
    jogadorBId: '3', // Pedro
    ultimaCorDeA: 'PRETAS',
    ultimaCorDeB: 'BRANCAS',
    atualizadoEm: '2024-01-05T14:30:00-03:00'
  },
  {
    id: '2',
    jogadorAId: '2', // Maria
    jogadorBId: '4', // Ana
    ultimaCorDeA: 'BRANCAS',
    ultimaCorDeB: 'PRETAS',
    atualizadoEm: '2024-01-08T16:00:00-03:00'
  }
];

// Municipal Rating System Configuration
const municipalRatingConfig: RatingSystemConfig = {
  vpTable: [
    { minDelta: 0, maxDelta: 9, vp: 20 },
    { minDelta: 10, maxDelta: 24, vp: 22 },
    { minDelta: 25, maxDelta: 49, vp: 24 },
    { minDelta: 50, maxDelta: 99, vp: 28 },
    { minDelta: 100, maxDelta: 149, vp: 32 },
    { minDelta: 150, maxDelta: 199, vp: 36 },
    { minDelta: 200, maxDelta: 299, vp: 40 },
    { minDelta: 300, maxDelta: Infinity, vp: 44 }
  ],
  baseVP: 20,
  zeroSum: true
};

export const useData = () => {
  const [players, setPlayers] = useState<Player[]>(mockPlayers);
  const [tournaments, setTournaments] = useState<Tournament[]>(mockTournaments);
  const [tournamentPlayers, setTournamentPlayers] = useState<TournamentPlayer[]>(mockTournamentPlayers);
  const [desafioCiclos, setDesafioCiclos] = useState<DesafioCiclo[]>(mockDesafioCiclos);
  const [desafioConfrontos, setDesafioConfrontos] = useState<DesafioConfronto[]>(mockDesafioConfrontos);
  const [historicoCoresDupla, setHistoricoCoresDupla] = useState<HistoricoCoresDupla[]>(mockHistoricoCoresDupla);
  const [estadoQuinzenaJogador, setEstadoQuinzenaJogador] = useState<EstadoQuinzenaJogador[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    ratingSystem: municipalRatingConfig,
    defaultTournamentSettings: {
      tiebreakCriteria: ['initialRating', 'headToHead', 'random'],
      allowManualPairings: true,
      ratingSystem: 'municipal'
    },
    permissions: {
      canManageSystem: true,
      canManageTournaments: true,
      canManagePlayers: true,
      canViewReports: true
    }
  });
  const [undoHistory, setUndoHistory] = useState<UndoAction[]>([]);
  const [loading, setLoading] = useState(false);

  // CA-01: Validate birth date is required
  const validateBirthDate = (birthDate: string): boolean => {
    if (!birthDate || birthDate.trim() === '') {
      return false;
    }
    const date = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    return age >= 5 && age <= 120;
  };

  // CA-03: R1 Maximum Distance Algorithm
  const calculateR1Pairings = (presentPlayers: Player[]): { playerA: Player; playerB: Player; delta: number }[] => {
    // Sort by rating (descending)
    const sortedPlayers = [...presentPlayers].sort((a, b) => b.currentRating - a.currentRating);
    const pairings: { playerA: Player; playerB: Player; delta: number }[] = [];
    
    // Greedy algorithm: pair highest with lowest available
    for (let i = 0; i < Math.floor(sortedPlayers.length / 2); i++) {
      const playerA = sortedPlayers[i];
      const playerB = sortedPlayers[sortedPlayers.length - 1 - i];
      const delta = Math.abs(playerA.currentRating - playerB.currentRating);
      
      pairings.push({ playerA, playerB, delta });
    }
    
    return pairings;
  };

  // CA-05: Zero-sum validation
  const validateZeroSum = (whiteChange: number, blackChange: number): boolean => {
    return Math.abs(whiteChange + blackChange) < 0.01; // Account for floating point precision
  };
  // Player operations
  const createPlayer = async (playerData: Omit<Player, 'id' | 'createdAt' | 'updatedAt' | 'currentRating' | 'ratingHistory'> & { initialRating?: number }): Promise<Player> => {
    // CA-01: Block save without birth date
    if (!validateBirthDate(playerData.birthDate)) {
      throw new Error('Data de nascimento é obrigatória e deve ser válida');
    }
    
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newPlayer: Player = {
      id: Date.now().toString(),
      ...playerData,
      currentRating: playerData.initialRating || 1200,
      ratingHistory: [{
        id: Date.now().toString(),
        playerId: Date.now().toString(),
        rating: playerData.initialRating || 1200,
        change: 0,
        date: new Date().toISOString().split('T')[0],
        reason: 'initial',
        timestamp: new Date().toISOString()
      }],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    setPlayers(prev => [...prev, newPlayer]);
    setLoading(false);
    return newPlayer;
  };

  // Tournament operations
  const createTournament = async (tournamentData: Omit<Tournament, 'id' | 'createdAt' | 'rounds'>): Promise<Tournament> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newTournament: Tournament = {
      id: Date.now().toString(),
      ...tournamentData,
      rounds: [],
      createdAt: new Date().toISOString().split('T')[0],
      participantsLocked: false,
      tiebreakEnabled: tournamentData.tiebreakEnabled || false,
      allowNoShow: tournamentData.allowNoShow || false,
      byePoints: tournamentData.byePoints || 1.0,
      byeAffectsRating: tournamentData.byeAffectsRating || false,
      settings: tournamentData.settings || {
        tiebreakCriteria: ['initialRating', 'headToHead', 'random'],
        allowManualPairings: true,
        ratingSystem: 'municipal'
      }
    };
    
    setTournaments(prev => [...prev, newTournament]);
    setLoading(false);
    return newTournament;
  };

  // Mock implementations for missing functions
  const updatePlayer = async (id: string, playerData: Partial<Player>): Promise<Player> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const updatedPlayers = players.map(player => 
      player.id === id ? { ...player, ...playerData, updatedAt: new Date().toISOString().split('T')[0] } : player
    );
    setPlayers(updatedPlayers);
    setLoading(false);
    return updatedPlayers.find(p => p.id === id)!;
  };

  const checkDuplicatePlayer = (name: string, birthDate: string): Player | null => {
    return players.find(p => p.name === name && p.birthDate === birthDate) || null;
  };

  const deletePlayer = async (id: string): Promise<void> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setPlayers(prev => prev.filter(p => p.id !== id));
    setLoading(false);
  };

  const importPlayersFromCSV = async (csvData: CSVPlayerData[]): Promise<ImportResult> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const result: ImportResult = {
      success: true,
      playersImported: csvData.length,
      playersUpdated: 0,
      errors: [],
      duplicates: []
    };
    
    setLoading(false);
    return result;
  };

  const generateFirstRound = async (tournamentId: string): Promise<Round> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (!tournament) {
      setLoading(false);
      throw new Error('Tournament not found');
    }

    const presentPlayers = tournament.presentPlayers
      .map(id => players.find(p => p.id === id))
      .filter(Boolean) as Player[];

    if (presentPlayers.length < 2) {
      setLoading(false);
      throw new Error('Need at least 2 present players');
    }

    // Generate pairings using R1 algorithm
    const pairings = calculateR1Pairings(presentPlayers);
    
    const matches: Match[] = pairings.map((pairing, index) => ({
      id: `${Date.now()}_${index}`,
      roundId: `${Date.now()}`,
      playerAId: pairing.playerA.id,
      playerBId: pairing.playerB.id,
      tableNumber: index + 1,
      scoreA: 0,
      scoreB: 0,
      createdAt: new Date().toISOString()
    }));

    const newRound: Round = {
      id: Date.now().toString(),
      tournamentId,
      number: 1,
      status: 'pending',
      matches,
      createdAt: new Date().toISOString()
    };
    
    // Update tournament with new round
    setTournaments(prev => prev.map(t => 
      t.id === tournamentId 
        ? { ...t, rounds: [...t.rounds, newRound] }
        : t
    ));
    
    setLoading(false);
    return newRound;
  };

  const generateSubsequentRound = async (tournamentId: string, roundNumber: number): Promise<Round> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newRound: Round = {
      id: Date.now().toString(),
      tournamentId,
      number: roundNumber,
      status: 'pending',
      matches: [],
      createdAt: new Date().toISOString()
    };
    
    setLoading(false);
    return newRound;
  };

  const updatePairingResult = async (matchId: string, result: string): Promise<void> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    // Mock implementation
    setLoading(false);
  };

  const addUndoAction = (action: Omit<UndoAction, 'id' | 'timestamp'>): void => {
    const newAction: UndoAction = {
      ...action,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    setUndoHistory(prev => [newAction, ...prev.slice(0, 9)]);
  };

  const undoLastAction = async (): Promise<void> => {
    if (undoHistory.length === 0) return;
    
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setUndoHistory(prev => prev.slice(1));
    setLoading(false);
  };

  const getCicloAtivo = (): DesafioCiclo | null => {
    return desafioCiclos.find(ciclo => ciclo.status === 'ativo') || null;
  };

  const getConfrontosDoCiclo = (cicloId: string): DesafioConfronto[] => {
    return desafioConfrontos.filter(confronto => confronto.cicloId === cicloId);
  };

  const getConfrontosComResultado = (cicloId?: string): DesafioConfronto[] => {
    let confrontos = desafioConfrontos.filter(confronto => confronto.resultado);
    if (cicloId) {
      confrontos = confrontos.filter(confronto => confronto.cicloId === cicloId);
    }
    return confrontos;
  };

  const finalizarCicloQuinzenal = async (cicloId: string): Promise<void> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setDesafioCiclos(prev => prev.map(ciclo => 
      ciclo.id === cicloId 
        ? { ...ciclo, status: 'concluido' as const, atualizadoEm: new Date().toISOString() }
        : ciclo
    ));
    
    setLoading(false);
  };

  const getTournamentStandings = (tournamentId: string): TournamentStanding[] => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (!tournament) return [];
    
    return tournament.participants.map((playerId, index) => {
      const player = players.find(p => p.id === playerId);
      const tournamentPlayer = tournamentPlayers.find(tp => tp.tournamentId === tournamentId && tp.playerId === playerId);
      
      return {
        playerId,
        playerName: player?.name || 'Unknown',
        rating: player?.currentRating || 1200,
        initialRating: tournamentPlayer?.initialTournamentRating || player?.currentRating || 1200,
        points: tournamentPlayer?.currentScore || 0,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        opponents: [],
        position: index + 1
      };
    });
  };

  const updateTournament = async (id: string, tournamentData: Partial<Tournament>): Promise<Tournament> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const updatedTournaments = tournaments.map(tournament => 
      tournament.id === id ? { ...tournament, ...tournamentData } : tournament
    );
    setTournaments(updatedTournaments);
    setLoading(false);
    return updatedTournaments.find(t => t.id === id)!;
  };

  const exportRankingCSV = (): string => {
    const sortedPlayers = [...players].sort((a, b) => b.currentRating - a.currentRating);
    const csvHeader = 'Posição,Nome,Rating,Clube\n';
    const csvRows = sortedPlayers.map((player, index) => 
      `${index + 1},${player.name},${player.currentRating},${player.club || ''}`
    ).join('\n');
    return csvHeader + csvRows;
  };

  const exportTournamentStandingsCSV = (tournamentId: string): string => {
    const standings = getTournamentStandings(tournamentId);
    const csvHeader = 'Posição,Nome,Pontos,Rating Inicial,Rating Atual\n';
    const csvRows = standings.map(standing => 
      `${standing.position},${standing.playerName},${standing.points},${standing.initialRating},${standing.rating}`
    ).join('\n');
    return csvHeader + csvRows;
  };

  const criarDesafioCiclo = async (): Promise<DesafioCiclo> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const now = new Date();
    const mes = now.getMonth() + 1;
    const ano = now.getFullYear();
    const dia = now.getDate();
    const quinzena = dia <= 15 ? 1 : 2;
    
    const novoCiclo: DesafioCiclo = {
      id: Date.now().toString(),
      mes,
      ano,
      quinzena: quinzena as 1 | 2,
      status: 'ativo',
      criadoEm: now.toISOString(),
      atualizadoEm: now.toISOString()
    };
    
    setDesafioCiclos(prev => [...prev, novoCiclo]);
    setLoading(false);
    return novoCiclo;
  };

  const calcularMunicipalRating = (ratingA: number, ratingB: number, resultado: '1-0' | '0-1' | '0-0'): { changeA: number; changeB: number } => {
    const delta = Math.abs(ratingA - ratingB);
    const vpEntry = municipalRatingConfig.vpTable.find(entry => delta >= entry.minDelta && delta <= entry.maxDelta);
    const vp = vpEntry ? vpEntry.vp : municipalRatingConfig.baseVP;
    
    let changeA = 0;
    let changeB = 0;
    
    if (resultado === '1-0') {
      changeA = ratingA > ratingB ? vp * 0.5 : vp;
      changeB = -changeA;
    } else if (resultado === '0-1') {
      changeB = ratingB > ratingA ? vp * 0.5 : vp;
      changeA = -changeB;
    } else if (resultado === '0-0') {
      if (ratingA > ratingB) {
        changeA = -vp * 0.25;
        changeB = vp * 0.25;
      } else if (ratingB > ratingA) {
        changeB = -vp * 0.25;
        changeA = vp * 0.25;
      }
    }
    
    return { changeA, changeB };
  };

  const lancarResultadoDesafio = async (confrontoId: string, resultado: '1-0' | '0-1' | '0-0'): Promise<void> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const confronto = desafioConfrontos.find(c => c.id === confrontoId);
    if (!confronto) {
      setLoading(false);
      throw new Error('Confronto não encontrado');
    }
    
    const jogadorBrancas = players.find(p => p.id === confronto.jogadorBrancasId);
    const jogadorPretas = players.find(p => p.id === confronto.jogadorPretasId);
    
    if (!jogadorBrancas || !jogadorPretas) {
      setLoading(false);
      throw new Error('Jogadores não encontrados');
    }
    
    const { changeA: changeBrancas, changeB: changePretas } = calcularMunicipalRating(
      confronto.ratingBrancasSnapshot,
      confronto.ratingPretasSnapshot,
      resultado
    );
    
    // Update confronto
    setDesafioConfrontos(prev => prev.map(c => 
      c.id === confrontoId 
        ? { ...c, resultado, aplicadoEm: new Date().toISOString(), atualizadoEm: new Date().toISOString() }
        : c
    ));
    
    // Update players ratings and history
    const now = new Date().toISOString();
    const date = now.split('T')[0];
    
    setPlayers(prev => prev.map(player => {
      if (player.id === confronto.jogadorBrancasId) {
        const newRating = player.currentRating + changeBrancas;
        const newEntry: RatingEntry = {
          id: Date.now().toString() + '_b',
          playerId: player.id,
          previousRating: player.currentRating,
          newRating,
          variation: changeBrancas,
          reason: 'desafio_quinzenal',
          desafioConfrontoId: confrontoId,
          date,
          timestamp: now
        };
        return {
          ...player,
          currentRating: newRating,
          ratingHistory: [...player.ratingHistory, newEntry],
          updatedAt: date
        };
      } else if (player.id === confronto.jogadorPretasId) {
        const newRating = player.currentRating + changePretas;
        const newEntry: RatingEntry = {
          id: Date.now().toString() + '_p',
          playerId: player.id,
          previousRating: player.currentRating,
          newRating,
          variation: changePretas,
          reason: 'desafio_quinzenal',
          desafioConfrontoId: confrontoId,
          date,
          timestamp: now
        };
        return {
          ...player,
          currentRating: newRating,
          ratingHistory: [...player.ratingHistory, newEntry],
          updatedAt: date
        };
      }
      return player;
    }));
    
    setLoading(false);
  };

  const editarResultadoDesafio = async (confrontoId: string, novoResultado: '1-0' | '0-1' | '0-0'): Promise<void> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const confronto = desafioConfrontos.find(c => c.id === confrontoId);
    if (!confronto || !confronto.resultado) {
      setLoading(false);
      throw new Error('Confronto não encontrado ou sem resultado aplicado');
    }
    
    // Revert previous rating changes
    setPlayers(prev => prev.map(player => {
      const entriesToRevert = player.ratingHistory.filter(entry => entry.desafioConfrontoId === confrontoId);
      if (entriesToRevert.length > 0) {
        const lastEntry = entriesToRevert[entriesToRevert.length - 1];
        return {
          ...player,
          currentRating: lastEntry.previousRating,
          ratingHistory: player.ratingHistory.filter(entry => entry.desafioConfrontoId !== confrontoId),
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return player;
    }));
    
    // Apply new result
    await lancarResultadoDesafio(confrontoId, novoResultado);
    
    setLoading(false);
  };

  const obterRankingAtual = (): Player[] => {
    return [...players]
      .filter(player => player.isActive)
      .sort((a, b) => b.currentRating - a.currentRating);
  };
  return {
    // State
    players,
    tournaments,
    tournamentPlayers,
    desafioCiclos,
    desafioConfrontos,
    historicoCoresDupla,
    estadoQuinzenaJogador,
    systemSettings,
    undoHistory,
    loading,
    
    // Functions
    createPlayer,
    createTournament,
    updatePlayer,
    checkDuplicatePlayer,
    deletePlayer,
    importPlayersFromCSV,
    generateFirstRound,
    generateSubsequentRound,
    updatePairingResult,
    addUndoAction,
    undoLastAction,
    getCicloAtivo,
    getConfrontosDoCiclo,
    getConfrontosComResultado,
    finalizarCicloQuinzenal,
    getTournamentStandings,
    updateTournament,
    criarDesafioCiclo,
    lancarResultadoDesafio,
    editarResultadoDesafio,
    obterRankingAtual,
    calcularMunicipalRating,
    validateBirthDate,
    calculateR1Pairings,
    validateZeroSum,
    exportRankingCSV,
    exportTournamentStandingsCSV
  };
};