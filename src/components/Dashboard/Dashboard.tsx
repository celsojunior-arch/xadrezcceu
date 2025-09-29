import React from 'react';
import { Users, Trophy, TrendingUp, Calendar, Download, BarChart } from 'lucide-react';
import { useData } from '../../hooks/useData';

export const Dashboard: React.FC = () => {
  const { players, tournaments, exportRankingCSV } = useData();

  const stats = {
    totalPlayers: players.length,
    activeTournaments: tournaments.filter(t => t.status === 'active').length,
    completedTournaments: tournaments.filter(t => t.status === 'completed').length,
    avgRating: Math.round(players.reduce((sum, p) => sum + p.currentRating, 0) / players.length)
  };

  const topPlayers = [...players]
    .sort((a, b) => b.currentRating - a.currentRating)
    .slice(0, 5);

  const ratingDistribution = {
    '2000+': players.filter(p => p.currentRating >= 2000).length,
    '1800-1999': players.filter(p => p.currentRating >= 1800 && p.currentRating < 2000).length,
    '1600-1799': players.filter(p => p.currentRating >= 1600 && p.currentRating < 1800).length,
    '1400-1599': players.filter(p => p.currentRating >= 1400 && p.currentRating < 1600).length,
    '<1400': players.filter(p => p.currentRating < 1400).length,
  };
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white text-shadow-lg">Dashboard</h2>
            <p className="text-white/90 mt-1 font-medium">Visão geral do ranking de xadrez</p>
          </div>
          <button
            onClick={exportRankingCSV}
            className="flex items-center gap-2 bg-chess-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-chess-cyan-600 glow-cyan transition-all duration-300 hover:scale-105"
          >
            <Download size={20} />
            Exportar Ranking
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-xl hover:glow-blue transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/70">Total de Jogadores</p>
              <p className="text-3xl font-bold text-white">{stats.totalPlayers}</p>
            </div>
            <div className="p-3 bg-chess-blue-500/20 rounded-full animate-float">
              <Users className="text-chess-cyan-300" size={24} />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl hover:glow-blue transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/70">Torneios Ativos</p>
              <p className="text-3xl font-bold text-white">{stats.activeTournaments}</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-full animate-float" style={{ animationDelay: '1s' }}>
              <Trophy className="text-green-300" size={24} />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl hover:glow-blue transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/70">Rating Médio</p>
              <p className="text-3xl font-bold text-white">{stats.avgRating}</p>
            </div>
            <div className="p-3 bg-orange-500/20 rounded-full animate-float" style={{ animationDelay: '2s' }}>
              <TrendingUp className="text-orange-300" size={24} />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl hover:glow-blue transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/70">Torneios Finalizados</p>
              <p className="text-3xl font-bold text-white">{stats.completedTournaments}</p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-full animate-float" style={{ animationDelay: '3s' }}>
              <Calendar className="text-purple-300" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Players */}
        <div className="glass-card p-6 rounded-xl">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Trophy className="text-chess-cyan-300" size={20} />
            Top 5 Jogadores
          </h3>
          <div className="space-y-3">
            {topPlayers.map((player, index) => (
              <div key={player.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg
                    ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 glow-cyan' : 
                      index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500' : 
                      index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' : 
                      'bg-gradient-to-r from-chess-blue-500 to-chess-blue-700'}
                  `}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-white">{player.name}</p>
                    <p className="text-sm text-chess-cyan-300">Rating: {player.currentRating}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="glass-card p-6 rounded-xl">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart className="text-chess-cyan-300" size={20} />
            Distribuição de Rating
          </h3>
          <div className="space-y-3">
            {Object.entries(ratingDistribution).map(([range, count]) => (
              <div key={range} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                <div>
                  <p className="font-medium text-white">{range}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-gradient-to-r from-chess-cyan-400 to-chess-blue-500 h-3 rounded-full shadow-sm" style={{ width: `${Math.max(count * 20, 10)}px` }}></div>
                  <span className="text-sm font-medium text-chess-cyan-300 min-w-[2rem] text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Recent Tournaments */}
      <div className="glass-card p-6 rounded-xl">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="text-chess-cyan-300" size={20} />
          Torneios Recentes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tournaments.slice(0, 6).map((tournament) => (
            <div key={tournament.id} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-white truncate">{tournament.name}</h4>
                <div className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  ${tournament.status === 'active' 
                    ? 'bg-green-500/20 text-green-300' 
                    : tournament.status === 'completed'
                    ? 'bg-chess-blue-500/20 text-chess-blue-300'
                    : 'bg-gray-500/20 text-gray-300'
                  }
                `}>
                  {tournament.status === 'active' ? 'Ativo' : 
                   tournament.status === 'completed' ? 'Concluído' : 'Rascunho'}
                </div>
              </div>
              <p className="text-sm text-white/70">
                {new Date(tournament.startDate).toLocaleDateString('pt-BR')}
              </p>
              <p className="text-sm text-white/70">
                {tournament.participants.length} participantes
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};