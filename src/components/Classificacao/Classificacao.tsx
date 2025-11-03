import React, { useState } from 'react';
import { Trophy, Users, Search, Download } from 'lucide-react';
import { useData } from '../../hooks/useData';

export const Classificacao: React.FC = () => {
  const { players, exportRankingCSV } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'absoluto' | 'sub18' | 'sub15' | 'sub12'>('all');

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

  const getCategory = (birthDate: string) => {
    const age = getAge(birthDate);
    if (age >= 18) return 'Absoluto';
    if (age >= 15) return 'Sub-18';
    if (age >= 12) return 'Sub-15';
    return 'Sub-12';
  };

  const filteredPlayers = players
    .filter(player => {
      // Só incluir jogadores ativos na classificação
      if (!player.isActive) return false;
      
      const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (categoryFilter === 'all') return matchesSearch;
      
      const age = getAge(player.birthDate);
      let matchesCategory = false;
      
      switch (categoryFilter) {
        case 'absoluto':
          matchesCategory = age >= 18;
          break;
        case 'sub18':
          matchesCategory = age >= 15 && age < 18;
          break;
        case 'sub15':
          matchesCategory = age >= 12 && age < 15;
          break;
        case 'sub12':
          matchesCategory = age < 12;
          break;
      }
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => b.currentRating - a.currentRating);

  const getCategoryStats = () => {
    const stats = {
      absoluto: players.filter(p => p.isActive && getAge(p.birthDate) >= 18).length,
      sub18: players.filter(p => p.isActive && getAge(p.birthDate) >= 15 && getAge(p.birthDate) < 18).length,
      sub15: players.filter(p => p.isActive && getAge(p.birthDate) >= 12 && getAge(p.birthDate) < 15).length,
      sub12: players.filter(p => p.isActive && getAge(p.birthDate) < 12).length,
    };
    return stats;
  };

  const categoryStats = getCategoryStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white text-shadow-lg">Classificação</h2>
          <p className="text-white/90 mt-1 font-medium">Ranking geral por categorias</p>
        </div>
        <button
          onClick={exportRankingCSV}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <Download size={20} />
          Exportar Ranking
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card-light p-4 rounded-lg shadow-sm border border-blue-200/30">
          <div className="text-center">
            <div className="text-2xl font-bold text-black">{categoryStats.absoluto}</div>
            <div className="text-sm font-bold text-black">Absoluto (18+)</div>
          </div>
        </div>
        <div className="glass-card-light p-4 rounded-lg shadow-sm border border-blue-200/30">
          <div className="text-center">
            <div className="text-2xl font-bold text-black">{categoryStats.sub18}</div>
            <div className="text-sm font-bold text-black">Sub-18</div>
          </div>
        </div>
        <div className="glass-card-light p-4 rounded-lg shadow-sm border border-blue-200/30">
          <div className="text-center">
            <div className="text-2xl font-bold text-black">{categoryStats.sub15}</div>
            <div className="text-sm font-bold text-black">Sub-15</div>
          </div>
        </div>
        <div className="glass-card-light p-4 rounded-lg shadow-sm border border-blue-200/30">
          <div className="text-center">
            <div className="text-2xl font-bold text-black">{categoryStats.sub12}</div>
            <div className="text-sm font-bold text-black">Sub-12</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card-light p-4 rounded-lg shadow-sm border border-blue-200/30">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600" size={20} />
              <input
                type="text"
                placeholder="Buscar jogador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/80 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
              />
            </div>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="px-3 py-2 bg-white/80 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800"
          >
            <option value="all">Todas as Categorias</option>
            <option value="absoluto">Absoluto (18+)</option>
            <option value="sub18">Sub-18</option>
            <option value="sub15">Sub-15</option>
            <option value="sub12">Sub-12</option>
          </select>
        </div>
      </div>

      {/* Classification Table */}
      <div className="glass-card-light rounded-lg shadow-sm border border-blue-200/30">
        <div className="p-6 border-b border-blue-200/30">
          <h3 className="text-lg font-bold text-black flex items-center gap-2">
            <Trophy size={20} />
            Classificação Geral ({filteredPlayers.length} jogadores)
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-100/50">
              <tr>
                <th className="text-left py-4 px-6 font-bold text-black">Posição</th>
                <th className="text-left py-4 px-6 font-bold text-black">Nome Completo</th>
                <th className="text-left py-4 px-6 font-bold text-black">Categoria</th>
                <th className="text-left py-4 px-6 font-bold text-black">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-200/30">
              {filteredPlayers.map((player, index) => (
                <tr key={player.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white
                      ${index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-500' : 
                        'bg-blue-500'}
                    `}>
                      {index + 1}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-bold text-black text-lg">{player.name}</div>
                      {player.nickname && (
                        <div className="text-sm font-bold text-black">"{player.nickname}"</div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className={`
                      inline-flex px-3 py-1 rounded-full text-sm font-bold
                      ${getCategory(player.birthDate) === 'Absoluto' ? 'bg-purple-100 text-purple-800' :
                        getCategory(player.birthDate) === 'Sub-18' ? 'bg-blue-100 text-blue-800' :
                        getCategory(player.birthDate) === 'Sub-15' ? 'bg-green-100 text-green-800' :
                        'bg-orange-100 text-orange-800'}
                    `}>
                      {getCategory(player.birthDate)}
                    </div>
                    <div className="text-xs font-bold text-black mt-1">
                      {getAge(player.birthDate)} anos
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-2xl font-bold text-black">{player.currentRating}</div>
                    {player.ratingHistory.length > 1 && (
                      <div className="flex items-center gap-1">
                        {(() => {
                          const lastEntry = player.ratingHistory[player.ratingHistory.length - 1];
                          const variation = lastEntry.variation;
                          const isPositive = variation > 0;
                          const isDesafio = lastEntry.reason === 'desafio_quinzenal';
                          
                          return (
                            <div className={`text-sm font-bold flex items-center gap-1 ${
                              isPositive ? 'text-green-600' : variation < 0 ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {isDesafio && variation !== 0 && (
                                <span className="text-xs">
                                  {isPositive ? '↗️' : '↘️'}
                                </span>
                              )}
                              {variation > 0 ? '+' : ''}{variation}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPlayers.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="font-bold text-black">Nenhum jogador encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
};