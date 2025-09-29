import React from 'react';
import { ArrowLeft, CreditCard as Edit2, Calendar, Users, Trophy, Target, UserCheck, Lock, Unlock, Download } from 'lucide-react';
import { Tournament } from '../../types';
import { useData } from '../../hooks/useData';
import { TournamentRounds } from './TournamentRounds';

interface TournamentDetailProps {
  tournament: Tournament;
  onBack: () => void;
  onEdit: () => void;
}

export const TournamentDetail: React.FC<TournamentDetailProps> = ({ tournament, onBack, onEdit }) => {
  const { players, getTournamentStandings, updateTournament, exportTournamentStandingsCSV } = useData();
  const [activeTab, setActiveTab] = React.useState<'overview' | 'rounds' | 'standings'>('overview');
  const [refreshKey, setRefreshKey] = React.useState(0);
  
  const standings = getTournamentStandings(tournament.id);

  const getStatusColor = (status: Tournament['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'active': return 'bg-green-50 text-green-700 border-green-200';
      case 'completed': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: Tournament['status']) => {
    switch (status) {
      case 'draft': return 'Rascunho';
      case 'active': return 'Em Andamento';
      case 'completed': return 'Concluído';
      default: return 'Desconhecido';
    }
  };

  const participantPlayers = tournament.participants
    .map(id => players.find(p => p.id === id))
    .filter(Boolean);

  const presentPlayers = tournament.presentPlayers
    .map(id => players.find(p => p.id === id))
    .filter(Boolean);

  const handleTogglePresent = async (playerId: string) => {
    if (tournament.participantsLocked) return;
    
    const newPresentPlayers = tournament.presentPlayers.includes(playerId)
      ? tournament.presentPlayers.filter(id => id !== playerId)
      : [...tournament.presentPlayers, playerId];
    
    await updateTournament(tournament.id, { presentPlayers: newPresentPlayers });
    setRefreshKey(prev => prev + 1);
  };

  const handleToggleLock = async () => {
    await updateTournament(tournament.id, { participantsLocked: !tournament.participantsLocked });
    setRefreshKey(prev => prev + 1);
  };

  const handleTournamentUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{tournament.name}</h2>
            <p className="text-gray-600 mt-1">
              {tournament.location && `${tournament.location} • `}
              {new Date(tournament.startDate).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
        <button
          onClick={onEdit}
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Edit2 size={20} />
          Editar
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('rounds')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'rounds'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Rodadas ({tournament.rounds.length})
          </button>
          <button
            onClick={() => setActiveTab('standings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'standings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Classificação
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tournament Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Status and Dates */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações</h3>
            
            <div className="space-y-4">
              <div className={`inline-flex px-3 py-2 rounded-lg text-sm font-medium border ${getStatusColor(tournament.status)}`}>
                {getStatusText(tournament.status)}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={16} className="text-gray-500" />
                  <span className="text-gray-600">Início:</span>
                  <span className="font-medium">{new Date(tournament.startDate).toLocaleDateString('pt-BR')}</span>
                </div>
                
                {tournament.endDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={16} className="text-gray-500" />
                    <span className="text-gray-600">Fim:</span>
                    <span className="font-medium">{new Date(tournament.endDate).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Users size={16} className="text-gray-500" />
                  <span className="text-gray-600">Participantes:</span>
                  <span className="font-medium">{tournament.participants.length}</span>
                </div>
              </div>
                <div className="flex items-center gap-2 text-sm">
                  <UserCheck size={16} className="text-gray-500" />
                  <span className="text-gray-600">Presentes:</span>
                  <span className="font-medium">{tournament.presentPlayers.length}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Trophy size={16} className="text-gray-500" />
                  <span className="text-gray-600">Rodadas:</span>
                  <span className="font-medium">{tournament.numberOfRounds}</span>
                </div>

              {tournament.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Descrição</h4>
                  <p className="text-sm text-gray-600">{tournament.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Tournament Stats */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Rodadas</span>
                <span className="font-medium">{tournament.rounds.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Partidas</span>
                <span className="font-medium">
                  {tournament.rounds.reduce((total, round) => total + round.pairings.length, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rating Médio</span>
                <span className="font-medium">
                  {participantPlayers.length > 0 
                    ? Math.round(participantPlayers.reduce((sum, p) => sum + p!.currentRating, 0) / participantPlayers.length)
                    : 0
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Present Players Selection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <UserCheck size={20} />
                  Seleção de Presentes
                </h3>
                <button
                  onClick={handleToggleLock}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    tournament.participantsLocked
                      ? 'bg-red-50 text-red-700 hover:bg-red-100'
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                >
                  {tournament.participantsLocked ? <Lock size={16} /> : <Unlock size={16} />}
                  {tournament.participantsLocked ? 'Lista Bloqueada' : 'Lista Aberta'}
                </button>
              </div>
              {tournament.participantsLocked && (
                <p className="text-sm text-red-600 mt-2">
                  Lista de presentes bloqueada. Desbloqueie para fazer alterações.
                </p>
              )}
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {participantPlayers.map((player) => (
                  <label
                    key={player!.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      tournament.presentPlayers.includes(player!.id)
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    } ${tournament.participantsLocked ? 'cursor-not-allowed opacity-60' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={tournament.presentPlayers.includes(player!.id)}
                      onChange={() => handleTogglePresent(player!.id)}
                      disabled={tournament.participantsLocked}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{player!.name}</div>
                      {player!.nickname && (
                        <div className="text-sm text-blue-600">"{player!.nickname}"</div>
                      )}
                      <div className="text-sm text-gray-600">Rating: {player!.currentRating}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {activeTab === 'rounds' && (
        <TournamentRounds 
          key={refreshKey}
          tournament={{ ...tournament, presentPlayers: tournament.presentPlayers, participantsLocked: tournament.participantsLocked }}
          onTournamentUpdate={handleTournamentUpdate}
        />
      )}

      {activeTab === 'standings' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Trophy size={20} />
                Classificação Atual
              </h3>
              <button
                onClick={() => exportTournamentStandingsCSV(tournament.id)}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
              >
                <Download size={16} />
                Exportar CSV
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Pos</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Jogador</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Rating</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Pontos</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Partidas</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">V/E/D</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {standings
                  .sort((a, b) => b.points - a.points)
                  .map((standing, index) => (
                    <tr key={standing.playerId} className="hover:bg-gray-50">
                      <td className="py-3 px-6">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white
                          ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'}
                        `}>
                          {index + 1}
                        </div>
                      </td>
                      <td className="py-3 px-6">
                        <div className="font-medium text-gray-900">{standing.playerName}</div>
                      </td>
                      <td className="py-3 px-6">
                        <div className="font-medium text-blue-600">{standing.rating}</div>
                      </td>
                      <td className="py-3 px-6">
                        <div className="font-medium">{standing.points.toFixed(1)}</div>
                      </td>
                      <td className="py-3 px-6">
                        <div>{standing.played}</div>
                      </td>
                      <td className="py-3 px-6">
                        <div className="text-sm text-gray-600">
                          {standing.wins}/{standing.draws}/{standing.losses}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {standings.length === 0 && (
            <div className="text-center py-12">
              <Target size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Nenhuma partida disputada ainda</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};