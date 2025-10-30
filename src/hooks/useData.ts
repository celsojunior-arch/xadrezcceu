import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Player, Tournament, Round, Match, RatingEntry, TournamentStanding, ImportResult, CSVPlayerData, DesafioCiclo, DesafioConfronto, HistoricoCoresDupla, EstadoQuinzenaJogador, TournamentPlayer, RatingSystemConfig, SystemSettings, UserPermissions, TournamentSettings, UndoAction } from '../types';

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
  const [players, setPlayers] = useState<Player[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [tournamentPlayers, setTournamentPlayers] = useState<TournamentPlayer[]>([]);
  const [desafioCiclos, setDesafioCiclos] = useState<DesafioCiclo[]>([]);
  const [desafioConfrontos, setDesafioConfrontos] = useState<DesafioConfronto[]>([]);
  const [historicoCoresDupla, setHistoricoCoresDupla] = useState<HistoricoCoresDupla[]>([]);
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

  // Load data from Supabase
  useEffect(() => {
    loadPlayers();
    loadTournaments();
    loadDesafioCiclos();
    loadDesafioConfrontos();
  }, []);

  const loadPlayers = async () => {
    try {
      const { data: playersData, error } = await supabase
        .from('players')
        .select('*')
        .order('current_rating', { ascending: false });

      if (error) throw error;

      if (playersData) {
        const playersWithHistory = await Promise.all(
          playersData.map(async (player) => {
            const { data: historyData } = await supabase
              .from('rating_history')
              .select('*')
              .eq('player_id', player.id)
              .order('timestamp', { ascending: true });

            return {
              id: player.id,
              name: player.name,
              birthDate: player.birth_date,
              nickname: player.nickname,
              email: player.email,
              phone: player.phone,
              isActive: player.is_active,
              currentRating: player.current_rating,
              ratingHistory: historyData?.map(h => ({
                id: h.id,
                playerId: h.player_id,
                previousRating: h.previous_rating,
                newRating: h.new_rating,
                variation: h.variation,
                reason: h.reason,
                tournamentId: h.tournament_id,
                roundNumber: h.round_number,
                desafioConfrontoId: h.desafio_confronto_id,
                date: h.date,
                timestamp: h.timestamp
              })) || [],
              createdAt: player.created_at,
              updatedAt: player.updated_at
            } as Player;
          })
        );

        setPlayers(playersWithHistory);
      }
    } catch (error) {
      console.error('Error loading players:', error);
    }
  };

  const loadTournaments = async () => {
    try {
      const { data: tournamentsData, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (tournamentsData) {
        const tournamentsWithRounds = await Promise.all(
          tournamentsData.map(async (tournament) => {
            const { data: roundsData } = await supabase
              .from('rounds')
              .select(`
                *,
                matches (*)
              `)
              .eq('tournament_id', tournament.id)
              .order('number', { ascending: true });

            return {
              id: tournament.id,
              name: tournament.name,
              description: tournament.description,
              location: tournament.location,
              startDate: tournament.start_date,
              endDate: tournament.end_date,
              numberOfRounds: tournament.number_of_rounds,
              status: tournament.status,
              participants: tournament.participants,
              presentPlayers: tournament.present_players,
              participantsLocked: tournament.participants_locked,
              tiebreakEnabled: tournament.tiebreak_enabled,
              allowNoShow: tournament.allow_no_show,
              byePoints: tournament.bye_points,
              byeAffectsRating: tournament.bye_affects_rating,
              organizerId: tournament.organizer_id,
              rounds: roundsData?.map(round => ({
                id: round.id,
                tournamentId: round.tournament_id,
                number: round.number,
                status: round.status,
                matches: round.matches?.map((match: any) => ({
                  id: match.id,
                  roundId: match.round_id,
                  playerAId: match.player_a_id,
                  playerBId: match.player_b_id,
                  tableNumber: match.table_number,
                  result: match.result,
                  scoreA: match.score_a,
                  scoreB: match.score_b,
                  vpUsed: match.vp_used,
                  ratingDelta: match.rating_delta,
                  manuallyAdjusted: match.manually_adjusted,
                  adjustmentReason: match.adjustment_reason,
                  modifiedBy: match.modified_by,
                  isBye: match.is_bye,
                  byePlayerId: match.bye_player_id,
                  createdAt: match.created_at
                })) || [],
                createdAt: round.created_at,
                confirmedAt: round.confirmed_at
              })) || [],
              createdAt: tournament.created_at,
              settings: {
                tiebreakCriteria: ['initialRating', 'headToHead', 'random'],
                allowManualPairings: true,
                ratingSystem: 'municipal'
              }
            } as Tournament;
          })
        );

        setTournaments(tournamentsWithRounds);
      }
    } catch (error) {
      console.error('Error loading tournaments:', error);
    }
  };

  const loadDesafioCiclos = async () => {
    try {
      const { data, error } = await supabase
        .from('desafio_ciclos')
        .select('*')
        .order('criado_em', { ascending: false });

      if (error) throw error;

      if (data) {
        setDesafioCiclos(data.map(ciclo => ({
          id: ciclo.id,
          mes: ciclo.mes,
          ano: ciclo.ano,
          quinzena: ciclo.quinzena as 1 | 2,
          status: ciclo.status as 'ativo' | 'concluido' | 'cancelado',
          criadoEm: ciclo.criado_em,
          atualizadoEm: ciclo.atualizado_em
        })));
      }
    } catch (error) {
      console.error('Error loading desafio ciclos:', error);
    }
  };

  const loadDesafioConfrontos = async () => {
    try {
      const { data, error } = await supabase
        .from('desafio_confrontos')
        .select('*')
        .order('criado_em', { ascending: false });

      if (error) throw error;

      if (data) {
        setDesafioConfrontos(data.map(confronto => ({
          id: confronto.id,
          cicloId: confronto.ciclo_id,
          jogadorBrancasId: confronto.jogador_brancas_id,
          jogadorPretasId: confronto.jogador_pretas_id,
          posBrancas: confronto.pos_brancas,
          posPretas: confronto.pos_pretas,
          ratingBrancasSnapshot: confronto.rating_brancas_snapshot,
          ratingPretasSnapshot: confronto.rating_pretas_snapshot,
          responsavelId: confronto.responsavel_id,
          resultado: confronto.resultado as '1-0' | '0-1' | '0-0' | undefined,
          aplicadoEm: confronto.aplicado_em,
          criadoEm: confronto.criado_em,
          atualizadoEm: confronto.atualizado_em
        })));
      }
    } catch (error) {
      console.error('Error loading desafio confrontos:', error);
    }
  };

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
    const sortedPlayers = [...presentPlayers].sort((a, b) => b.currentRating - a.currentRating);
    const pairings: { playerA: Player; playerB: Player; delta: number }[] = [];
    
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
    return Math.abs(whiteChange + blackChange) < 0.01;
  };

  // Player operations
  const createPlayer = async (playerData: Omit<Player, 'id' | 'createdAt' | 'updatedAt' | 'currentRating' | 'ratingHistory'> & { initialRating?: number }): Promise<Player> => {
    if (!validateBirthDate(playerData.birthDate)) {
      throw new Error('Data de nascimento é obrigatória e deve ser válida');
    }
    
    setLoading(true);
    
    try {
      const initialRating = playerData.initialRating || 1500;
      
      const { data: playerInsert, error: playerError } = await supabase
        .from('players')
        .insert({
          name: playerData.name,
          birth_date: playerData.birthDate,
          nickname: playerData.nickname,
          email: playerData.email,
          phone: playerData.phone,
          is_active: playerData.isActive,
          current_rating: initialRating
        })
        .select()
        .single();

      if (playerError) throw playerError;

      // Create initial rating history entry
      const { error: historyError } = await supabase
        .from('rating_history')
        .insert({
          player_id: playerInsert.id,
          previous_rating: initialRating,
          new_rating: initialRating,
          variation: 0,
          reason: 'initial',
          date: new Date().toISOString().split('T')[0]
        });

      if (historyError) throw historyError;

      await loadPlayers();
      
      const newPlayer = players.find(p => p.id === playerInsert.id);
      if (!newPlayer) throw new Error('Player not found after creation');
      
      return newPlayer;
    } catch (error) {
      console.error('Error creating player:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePlayer = async (id: string, playerData: Partial<Player>): Promise<Player> => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('players')
        .update({
          name: playerData.name,
          birth_date: playerData.birthDate,
          nickname: playerData.nickname,
          email: playerData.email,
          phone: playerData.phone,
          is_active: playerData.isActive,
          current_rating: playerData.currentRating,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      await loadPlayers();
      
      const updatedPlayer = players.find(p => p.id === id);
      if (!updatedPlayer) throw new Error('Player not found after update');
      
      return updatedPlayer;
    } catch (error) {
      console.error('Error updating player:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deletePlayer = async (id: string): Promise<void> => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadPlayers();
    } catch (error) {
      console.error('Error deleting player:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const checkDuplicatePlayer = (name: string, birthDate: string): Player | null => {
    return players.find(p => p.name === name && p.birthDate === birthDate) || null;
  };

  const importPlayersFromCSV = async (csvData: CSVPlayerData[]): Promise<ImportResult> => {
    setLoading(true);
    
    try {
      const result: ImportResult = {
        success: true,
        playersImported: 0,
        playersUpdated: 0,
        errors: [],
        duplicates: []
      };

      for (const playerData of csvData) {
        try {
          await createPlayer({
            name: playerData.name,
            birthDate: playerData.birthDate,
            isActive: true,
            initialRating: playerData.rating
          });
          result.playersImported++;
        } catch (error) {
          result.errors.push(`Erro ao importar ${playerData.name}: ${error}`);
        }
      }

      return result;
    } catch (error) {
      console.error('Error importing players:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Tournament operations
  const createTournament = async (tournamentData: Omit<Tournament, 'id' | 'createdAt' | 'rounds'>): Promise<Tournament> => {
    setLoading(true);
    
    try {
      const { data: tournamentInsert, error } = await supabase
        .from('tournaments')
        .insert({
          name: tournamentData.name,
          description: tournamentData.description,
          location: tournamentData.location,
          start_date: tournamentData.startDate,
          end_date: tournamentData.endDate,
          number_of_rounds: tournamentData.numberOfRounds,
          status: tournamentData.status,
          participants: tournamentData.participants,
          present_players: tournamentData.presentPlayers || [],
          participants_locked: tournamentData.participantsLocked || false,
          tiebreak_enabled: tournamentData.tiebreakEnabled || false,
          allow_no_show: tournamentData.allowNoShow || false,
          bye_points: tournamentData.byePoints || 1.0,
          bye_affects_rating: tournamentData.byeAffectsRating || false,
          organizer_id: tournamentData.organizerId
        })
        .select()
        .single();

      if (error) throw error;

      await loadTournaments();
      
      const newTournament = tournaments.find(t => t.id === tournamentInsert.id);
      if (!newTournament) throw new Error('Tournament not found after creation');
      
      return newTournament;
    } catch (error) {
      console.error('Error creating tournament:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTournament = async (id: string, tournamentData: Partial<Tournament>): Promise<Tournament> => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('tournaments')
        .update({
          name: tournamentData.name,
          description: tournamentData.description,
          location: tournamentData.location,
          start_date: tournamentData.startDate,
          end_date: tournamentData.endDate,
          number_of_rounds: tournamentData.numberOfRounds,
          status: tournamentData.status,
          participants: tournamentData.participants,
          present_players: tournamentData.presentPlayers,
          participants_locked: tournamentData.participantsLocked,
          tiebreak_enabled: tournamentData.tiebreakEnabled,
          allow_no_show: tournamentData.allowNoShow,
          bye_points: tournamentData.byePoints,
          bye_affects_rating: tournamentData.byeAffectsRating,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      await loadTournaments();
      
      const updatedTournament = tournaments.find(t => t.id === id);
      if (!updatedTournament) throw new Error('Tournament not found after update');
      
      return updatedTournament;
    } catch (error) {
      console.error('Error updating tournament:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const generateFirstRound = async (tournamentId: string): Promise<Round> => {
    setLoading(true);
    
    try {
      const tournament = tournaments.find(t => t.id === tournamentId);
      if (!tournament) throw new Error('Tournament not found');

      const presentPlayers = tournament.presentPlayers
        .map(id => players.find(p => p.id === id))
        .filter(Boolean) as Player[];

      if (presentPlayers.length < 2) {
        throw new Error('Need at least 2 present players');
      }

      // Create round
      const { data: roundInsert, error: roundError } = await supabase
        .from('rounds')
        .insert({
          tournament_id: tournamentId,
          number: 1,
          status: 'pending'
        })
        .select()
        .single();

      if (roundError) throw roundError;

      // Generate pairings using R1 algorithm
      const pairings = calculateR1Pairings(presentPlayers);
      
      // Create matches
      const matchInserts = pairings.map((pairing, index) => ({
        round_id: roundInsert.id,
        player_a_id: pairing.playerA.id,
        player_b_id: pairing.playerB.id,
        table_number: index + 1,
        score_a: 0,
        score_b: 0
      }));

      const { error: matchError } = await supabase
        .from('matches')
        .insert(matchInserts);

      if (matchError) throw matchError;

      await loadTournaments();
      
      const updatedTournament = tournaments.find(t => t.id === tournamentId);
      const newRound = updatedTournament?.rounds.find(r => r.id === roundInsert.id);
      
      if (!newRound) throw new Error('Round not found after creation');
      
      return newRound;
    } catch (error) {
      console.error('Error generating first round:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const generateSubsequentRound = async (tournamentId: string, roundNumber: number): Promise<Round> => {
    setLoading(true);
    
    try {
      // Create round
      const { data: roundInsert, error: roundError } = await supabase
        .from('rounds')
        .insert({
          tournament_id: tournamentId,
          number: roundNumber,
          status: 'pending'
        })
        .select()
        .single();

      if (roundError) throw roundError;

      await loadTournaments();
      
      const updatedTournament = tournaments.find(t => t.id === tournamentId);
      const newRound = updatedTournament?.rounds.find(r => r.id === roundInsert.id);
      
      if (!newRound) throw new Error('Round not found after creation');
      
      return newRound;
    } catch (error) {
      console.error('Error generating subsequent round:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePairingResult = async (matchId: string, result: string): Promise<void> => {
    setLoading(true);
    
    try {
      let scoreA = 0;
      let scoreB = 0;
      let matchResult = '';

      switch (result) {
        case 'white':
        case '1-0':
          scoreA = 1;
          scoreB = 0;
          matchResult = 'A';
          break;
        case 'black':
        case '0-1':
          scoreA = 0;
          scoreB = 1;
          matchResult = 'B';
          break;
        case 'draw':
        case '0-0':
          scoreA = 0.5;
          scoreB = 0.5;
          matchResult = 'E';
          break;
        case 'white_wo':
          scoreA = 1;
          scoreB = 0;
          matchResult = 'WO_A';
          break;
        case 'black_wo':
          scoreA = 0;
          scoreB = 1;
          matchResult = 'WO_B';
          break;
      }

      const { error } = await supabase
        .from('matches')
        .update({
          result: matchResult,
          score_a: scoreA,
          score_b: scoreB
        })
        .eq('id', matchId);

      if (error) throw error;

      await loadTournaments();
    } catch (error) {
      console.error('Error updating pairing result:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Utility functions
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
    
    try {
      const { error } = await supabase
        .from('desafio_ciclos')
        .update({
          status: 'concluido',
          atualizado_em: new Date().toISOString()
        })
        .eq('id', cicloId);

      if (error) throw error;

      await loadDesafioCiclos();
    } catch (error) {
      console.error('Error finalizing cycle:', error);
      throw error;
    } finally {
      setLoading(false);
    }
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

  const exportRankingCSV = (): string => {
    const sortedPlayers = [...players].filter(p => p.isActive).sort((a, b) => b.currentRating - a.currentRating);
    const csvHeader = 'Posição,Nome,Rating\n';
    const csvRows = sortedPlayers.map((player, index) => 
      `${index + 1},${player.name},${player.currentRating}`
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
    
    try {
      const now = new Date();
      const mes = now.getMonth() + 1;
      const ano = now.getFullYear();
      const dia = now.getDate();
      const quinzena = dia <= 15 ? 1 : 2;
      
      const { data: cicloInsert, error } = await supabase
        .from('desafio_ciclos')
        .insert({
          mes,
          ano,
          quinzena: quinzena as 1 | 2,
          status: 'ativo'
        })
        .select()
        .single();

      if (error) throw error;

      await loadDesafioCiclos();
      
      const newCiclo = desafioCiclos.find(c => c.id === cicloInsert.id);
      if (!newCiclo) throw new Error('Cycle not found after creation');
      
      return newCiclo;
    } catch (error) {
      console.error('Error creating cycle:', error);
      throw error;
    } finally {
      setLoading(false);
    }
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
    
    try {
      const { error } = await supabase
        .from('desafio_confrontos')
        .update({
          resultado,
          aplicado_em: new Date().toISOString(),
          atualizado_em: new Date().toISOString()
        })
        .eq('id', confrontoId);

      if (error) throw error;

      await loadDesafioConfrontos();
    } catch (error) {
      console.error('Error updating confronto result:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const editarResultadoDesafio = async (confrontoId: string, novoResultado: '1-0' | '0-1' | '0-0'): Promise<void> => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('desafio_confrontos')
        .update({
          resultado: novoResultado,
          aplicado_em: new Date().toISOString(),
          atualizado_em: new Date().toISOString()
        })
        .eq('id', confrontoId);

      if (error) throw error;

      await loadDesafioConfrontos();
    } catch (error) {
      console.error('Error editing confronto result:', error);
      throw error;
    } finally {
      setLoading(false);
    }
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