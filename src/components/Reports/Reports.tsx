import React, { useState } from 'react';
import { FileText, Download, TrendingUp, Users, Trophy, Calendar, BarChart } from 'lucide-react';
import { useData } from '../../hooks/useData';

export const Reports: React.FC = () => {
  const { players, tournaments, exportRankingCSV, exportTournamentStandingsCSV } = useData();
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const [ageFilter, setAgeFilter] = useState<string>('all');

  const getAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const filteredPlayers = players.filter(player => {
    if (ageFilter === 'all') return true;
    const age = getAge(player.birthDate);
    switch (ageFilter) {
      case 'youth': return age < 18;
      case 'adult': return age >= 18 && age < 60;
      case 'senior': return age >= 60;
      default: return true;
    }
  });

  const ratingRanges = [
    { label: '2000+', min: 2000, max: Infinity, color: 'bg-purple-500' },
    { label: '1800-1999', min: 1800, max: 1999, color: 'bg-blue-500' },
    { label: '1600-1799', min: 1600, max: 1799, color: 'bg-green-500' },
    { label: '1400-1599', min: 1400, max: 1599, color: 'bg-yellow-500' },
    { label: '1200-1399', min: 1200, max: 1399, color: 'bg-orange-500' },
    { label: '<1200', min: 0, max: 1199, color: 'bg-red-500' }
  ];

  const ratingDistribution = ratingRanges.map(range => ({
    ...range,
    count: filteredPlayers.filter(p => p.currentRating >= range.min && p.currentRating <= range.max).length
  }));

  const totalPlayers = filteredPlayers.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white text-shadow-lg">Relatórios</h2>
          <p className="text-white/90 mt-1 font-medium">Análises e exportações do sistema</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportRankingCSV}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <Download size={20} />
            Exportar Ranking
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card-light p-6 rounded-lg shadow-sm border border-blue-200/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black font-bold">Total de Jogadores</p>
              <p className="text-2xl font-bold text-black">{players.length}</p>
            </div>
            <Users className="text-blue-600" size={24} />
          </div>
        </div>

        <div className="glass-card-light p-6 rounded-lg shadow-sm border border-blue-200/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black font-bold">Torneios Realizados</p>
              <p className="text-2xl font-bold text-black">
                {tournaments.filter(t => t.status === 'completed').length}
              </p>
            </div>
            <Trophy className="text-green-600" size={24} />
          </div>
        </div>

        <div className="glass-card-light p-6 rounded-lg shadow-sm border border-blue-200/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black font-bold">Rating Médio</p>
              <p className="text-2xl font-bold text-black">
                {Math.round(players.reduce((sum, p) => sum + p.currentRating, 0) / players.length)}
              </p>
            </div>
            <TrendingUp className="text-orange-600" size={24} />
          </div>
        </div>

        <div className="glass-card-light p-6 rounded-lg shadow-sm border border-blue-200/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black font-bold">Partidas Disputadas</p>
              <p className="text-2xl font-bold text-black">
                {tournaments.reduce((total, t) => 
                  total + t.rounds.reduce((roundTotal, r) => 
                    roundTotal + r.pairings.filter(p => p.result).length, 0
                  ), 0
                )}
              </p>
            </div>
            <Calendar className="text-purple-600" size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ranking Report */}
        <div className="glass-card-light rounded-lg shadow-sm border border-blue-200/30">
          <div className="p-6 border-b border-blue-200/30">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-black flex items-center gap-2">
                <BarChart size={20} />
                Ranking Atual
              </h3>
              <div className="flex items-center gap-2">
                <select
                  value={ageFilter}
                  onChange={(e) => setAgeFilter(e.target.value)}
                  className="text-sm bg-white/80 border border-blue-300 rounded px-2 py-1 text-gray-800"
                >
                  <option value="all">Todas as idades</option>
                  <option value="youth">Juvenil (&lt;18)</option>
                  <option value="adult">Adulto (18-59)</option>
                  <option value="senior">Senior (60+)</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredPlayers
                .sort((a, b) => b.currentRating - a.currentRating)
                .slice(0, 20)
                .map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white
                        ${index < 3 ? 'bg-yellow-500' : 'bg-blue-500'}
                      `}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-bold text-black">{index + 1}. {player.name}</p>
                        <p className="text-sm font-bold text-black">
                          {getAge(player.birthDate)} anos
                          {player.club && ` • ${player.club}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">{player.currentRating}</p>
                      {player.ratingHistory.length > 1 && (
                        <p className={`text-sm ${
                          player.ratingHistory[player.ratingHistory.length - 1].change > 0 
                            ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {player.ratingHistory[player.ratingHistory.length - 1].change > 0 ? '+' : ''}
                          {player.ratingHistory[player.ratingHistory.length - 1].change}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="glass-card-light rounded-lg shadow-sm border border-blue-200/30">
          <div className="p-6 border-b border-blue-200/30">
            <h3 className="text-lg font-bold text-black flex items-center gap-2">
              <BarChart size={20} />
              Distribuição de Rating
            </h3>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {ratingDistribution.map((range) => (
                <div key={range.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-black">{range.label}</span>
                    <span className="text-sm font-bold text-black">
                      {range.count} ({totalPlayers > 0 ? Math.round((range.count / totalPlayers) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${range.color}`}
                      style={{ 
                        width: `${totalPlayers > 0 ? (range.count / totalPlayers) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tournament Reports */}
      <div className="glass-card-light rounded-lg shadow-sm border border-blue-200/30">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-black flex items-center gap-2">
              <Trophy size={20} />
              Relatórios de Torneios
            </h3>
            <div className="flex items-center gap-2">
              <select
                value={selectedTournament}
                onChange={(e) => setSelectedTournament(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Selecione um torneio</option>
                {tournaments.map((tournament) => (
                  <option key={tournament.id} value={tournament.id}>
                    {tournament.name}
                  </option>
                ))}
              </select>
              {selectedTournament && (
                <button
                  onClick={() => exportTournamentStandingsCSV(selectedTournament)}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  <Download size={16} />
                  Exportar
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {selectedTournament ? (
            <div className="space-y-4">
              {(() => {
                const tournament = tournaments.find(t => t.id === selectedTournament);
                if (!tournament) return <p className="text-gray-600">Torneio não encontrado</p>;
                
                const totalRounds = tournament.rounds.length;
                const completedRounds = tournament.rounds.filter(r => 
                  r.pairings.every(p => p.result)
                ).length;
                const totalMatches = tournament.rounds.reduce((sum, r) => sum + r.pairings.length, 0);
                const completedMatches = tournament.rounds.reduce((sum, r) => 
                  sum + r.pairings.filter(p => p.result).length, 0
                );

                return (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-600">Participantes</p>
                        <p className="text-2xl font-bold text-blue-900">{tournament.participants.length}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-green-600">Rodadas</p>
                        <p className="text-2xl font-bold text-green-900">{completedRounds}/{totalRounds}</p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="text-sm text-orange-600">Partidas</p>
                        <p className="text-2xl font-bold text-orange-900">{completedMatches}/{totalMatches}</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-purple-600">Status</p>
                        <p className="text-lg font-bold text-purple-900 capitalize">
                          {tournament.status === 'active' ? 'Ativo' : 
                           tournament.status === 'completed' ? 'Concluído' : 'Rascunho'}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Progresso das Rodadas</h4>
                      <div className="space-y-2">
                        {tournament.rounds.map((round) => {
                          const roundCompleted = round.pairings.every(p => p.result);
                          const roundProgress = round.pairings.filter(p => p.result).length;
                          const roundTotal = round.pairings.length;
                          
                          return (
                            <div key={round.id} className="flex items-center gap-4">
                              <span className="w-20 text-sm text-gray-600">Rodada {round.number}</span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${roundCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
                                  style={{ width: `${roundTotal > 0 ? (roundProgress / roundTotal) * 100 : 0}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600 w-16">
                                {roundProgress}/{roundTotal}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Selecione um torneio para ver os relatórios detalhados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};