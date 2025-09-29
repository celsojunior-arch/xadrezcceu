import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Play, Users, Clock, CheckCircle, AlertCircle, CreditCard as Edit3 } from 'lucide-react';
import { Tournament, Round, Pairing } from '../../types';
import { useData } from '../../hooks/useData';

interface TournamentRoundsProps {
  tournament: Tournament;
  onTournamentUpdate: () => void;
}

export const TournamentRounds: React.FC<TournamentRoundsProps> = ({ tournament, onTournamentUpdate }) => {
  const { isAdmin } = useAuth();
  const { players, generateFirstRound, generateSubsequentRound, updatePairingResult, addUndoAction, undoLastAction, undoHistory, loading } = useData();
  const [selectedResult, setSelectedResult] = useState<{ pairingId: string; result: 'white' | 'black' | 'draw' } | null>(null);
  const [showUndoPanel, setShowUndoPanel] = useState(false);

  const getPlayerName = (playerId: string) => {
    return players.find(p => p.id === playerId)?.name || 'Jogador não encontrado';
  };

  const handleGenerateRound = async (roundNumber: number) => {
    try {
      if (roundNumber === 1) {
        await generateFirstRound(tournament.id);
      } else {
        await generateSubsequentRound(tournament.id, roundNumber);
      }
      onTournamentUpdate();
    } catch (error) {
      console.error('Error generating round:', error);
      alert('Erro ao gerar rodada. Verifique se há jogadores presentes suficientes.');
    }
  };

  const handleResultSubmit = async (pairingId: string, result: 'white' | 'black' | 'draw') => {
    try {
      const pairing = tournament.rounds
        .flatMap(r => r.pairings)
        .find(p => p.id === pairingId);
      
      if (!pairing) return;
      
      const whitePlayer = players.find(p => p.id === pairing.whitePlayerId);
      const blackPlayer = players.find(p => p.id === pairing.blackPlayerId);
      
      if (!whitePlayer || !blackPlayer) return;
      
      // Store undo data before making changes
      addUndoAction({
        type: 'result',
        description: `Resultado: ${whitePlayer.name} vs ${blackPlayer.name}`,
        data: {
          pairingId,
          whitePlayerId: whitePlayer.id,
          blackPlayerId: blackPlayer.id,
          previousWhiteRating: whitePlayer.currentRating,
          previousBlackRating: blackPlayer.currentRating,
          result
        }
      });
      
      await updatePairingResult(pairingId, result);
      onTournamentUpdate();
    } catch (error) {
      console.error('Error updating result:', error);
    }
  };

  const handleUndo = async (actionId: string) => {
    const success = await undoLastAction(actionId);
    if (success) {
      onTournamentUpdate();
      setShowUndoPanel(false);
    }
  };

  const canGenerateRound = (roundNumber: number) => {
    if (roundNumber === 1) {
      return tournament.presentPlayers.length >= 2;
    }
    
    const previousRound = tournament.rounds.find(r => r.number === roundNumber - 1);
    return previousRound && previousRound.pairings.every(p => p.result);
  };

  const getRoundStatus = (round: Round) => {
    const completedPairings = round.pairings.filter(p => p.result).length;
    const totalPairings = round.pairings.length;
    
    if (completedPairings === totalPairings && totalPairings > 0) {
      return { status: 'completed', text: 'Concluída', color: 'text-green-600' };
    } else if (completedPairings > 0) {
      return { status: 'in-progress', text: `${completedPairings}/${totalPairings} partidas`, color: 'text-yellow-600' };
    } else {
      return { status: 'pending', text: 'Aguardando resultados', color: 'text-gray-600' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Rodadas ({tournament.rounds.length}/{tournament.numberOfRounds})
        </h3>
        <div className="flex items-center gap-4">
          {isAdmin && undoHistory.filter(a => a.canUndo).length > 0 && (
            <button
              onClick={() => setShowUndoPanel(!showUndoPanel)}
              className="flex items-center gap-2 text-sm bg-yellow-50 text-yellow-700 px-3 py-2 rounded-lg hover:bg-yellow-100"
            >
              <AlertCircle size={16} />
              Desfazer ({undoHistory.filter(a => a.canUndo).length})
            </button>
          )}
          <div className="text-sm text-gray-600">
            Jogadores presentes: {tournament.presentPlayers.length}
          </div>
        </div>
      </div>

      {/* Undo Panel */}
      {showUndoPanel && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-3">Ações Disponíveis para Desfazer</h4>
          <div className="space-y-2">
            {undoHistory.filter(a => a.canUndo).slice(0, 5).map((action) => (
              <div key={action.id} className="flex items-center justify-between bg-white p-3 rounded border">
                <div>
                  <div className="font-medium text-gray-900">{action.description}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(action.timestamp).toLocaleString('pt-BR')}
                  </div>
                </div>
                <button
                  onClick={() => handleUndo(action.id)}
                  className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                >
                  Desfazer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Generate Next Round Button */}
      {isAdmin && tournament.rounds.length < tournament.numberOfRounds && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900">
                Rodada {tournament.rounds.length + 1}
              </h4>
              <p className="text-sm text-blue-700">
                {tournament.rounds.length === 0 
                  ? 'Primeira rodada - emparelhamento por distância de rating'
                  : 'Próxima rodada - emparelhamento por brackets de pontuação'
                }
              </p>
            </div>
            <button
              onClick={() => handleGenerateRound(tournament.rounds.length + 1)}
              disabled={loading || !canGenerateRound(tournament.rounds.length + 1)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Play size={16} />
              {loading ? 'Gerando...' : 'Gerar Rodada'}
            </button>
          </div>
          
          {!canGenerateRound(tournament.rounds.length + 1) && tournament.rounds.length > 0 && (
            <p className="text-sm text-red-600 mt-2">
              Complete todos os resultados da rodada anterior para gerar a próxima
            </p>
          )}
        </div>
      )}

      {/* Rounds List */}
      <div className="space-y-4">
        {tournament.rounds.map((round) => {
          const roundStatus = getRoundStatus(round);
          
          return (
            <div key={round.id} className="bg-white border border-gray-200 rounded-lg">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Rodada {round.number}
                    </h4>
                    <div className={`flex items-center gap-1 text-sm ${roundStatus.color}`}>
                      {roundStatus.status === 'completed' ? (
                        <CheckCircle size={16} />
                      ) : roundStatus.status === 'in-progress' ? (
                        <Clock size={16} />
                      ) : (
                        <AlertCircle size={16} />
                      )}
                      {roundStatus.text}
                    </div>
                  </div>
                  {round.startTime && (
                    <div className="text-sm text-gray-600">
                      Início: {new Date(round.startTime).toLocaleString('pt-BR')}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {round.pairings.map((pairing) => (
                    <div key={pairing.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-medium text-gray-700">
                          Mesa {pairing.tableNumber}
                        </div>
                        {pairing.result && (
                          <div className="text-sm text-green-600 font-medium">
                            {pairing.result === 'white' ? '1-0' : 
                             pairing.result === 'black' ? '0-1' : '½-½'}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-white border-2 border-gray-400 rounded"></div>
                            <span className="font-medium text-gray-900">
                              {getPlayerName(pairing.whitePlayerId)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {pairing.whiteRatingBefore}
                            {pairing.whiteRatingAfter && (
                              <span className={`ml-1 ${
                                pairing.whiteRatingAfter > pairing.whiteRatingBefore 
                                  ? 'text-green-600' : 'text-red-600'
                              }`}>
                                ({pairing.whiteRatingAfter > pairing.whiteRatingBefore ? '+' : ''}
                                {pairing.whiteRatingAfter - pairing.whiteRatingBefore})
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-800 rounded"></div>
                            <span className="font-medium text-gray-900">
                              {getPlayerName(pairing.blackPlayerId)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {pairing.blackRatingBefore}
                            {pairing.blackRatingAfter && (
                              <span className={`ml-1 ${
                                pairing.blackRatingAfter > pairing.blackRatingBefore 
                                  ? 'text-green-600' : 'text-red-600'
                              }`}>
                                ({pairing.blackRatingAfter > pairing.blackRatingBefore ? '+' : ''}
                                {pairing.blackRatingAfter - pairing.blackRatingBefore})
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {pairing.vpUsed && (
                          <div className="text-xs text-blue-600 text-center">
                            VP utilizado: {pairing.vpUsed}
                          </div>
                        )}
                      </div>

                      {!pairing.result && isAdmin && (
                        <div className="mt-3 flex gap-2">
                          <div className="flex gap-1">
                          <button
                            onClick={() => handleResultSubmit(pairing.id, 'white')}
                            className="bg-white border border-gray-300 text-gray-700 py-2 px-2 rounded text-sm hover:bg-gray-50"
                          >
                            1-0
                          </button>
                          {tournament.allowNoShow && (
                            <button
                              onClick={() => handleResultSubmit(pairing.id, 'white_wo')}
                              className="bg-orange-50 border border-orange-300 text-orange-700 py-2 px-1 rounded text-xs hover:bg-orange-100"
                              title="Vitória por W.O."
                            >
                              W.O.
                            </button>
                          )}
                          </div>
                          <button
                            onClick={() => handleResultSubmit(pairing.id, 'draw')}
                            className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-50"
                          >
                            ½-½
                          </button>
                          <div className="flex gap-1">
                          {tournament.allowNoShow && (
                            <button
                              onClick={() => handleResultSubmit(pairing.id, 'black_wo')}
                              className="bg-orange-50 border border-orange-300 text-orange-700 py-2 px-1 rounded text-xs hover:bg-orange-100"
                              title="Vitória por W.O."
                            >
                              W.O.
                            </button>
                          )}
                          <button
                            onClick={() => handleResultSubmit(pairing.id, 'black')}
                            className="bg-white border border-gray-300 text-gray-700 py-2 px-2 rounded text-sm hover:bg-gray-50"
                          >
                            0-1
                          </button>
                          </div>
                        </div>
                      )}

                      {pairing.manuallyAdjusted && (
                        <div className="mt-2 text-xs text-orange-600 flex items-center gap-1">
                          <Edit3 size={12} />
                          Ajuste manual: {pairing.adjustmentReason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {round.pairings.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users size={48} className="mx-auto mb-2" />
                    <p>Nenhum emparelhamento gerado para esta rodada</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {tournament.rounds.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Clock size={48} className="mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma rodada gerada</h3>
          <p>Selecione os jogadores presentes e gere a primeira rodada para começar o torneio</p>
        </div>
      )}
    </div>
  );
};