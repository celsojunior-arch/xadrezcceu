import React, { useState } from 'react';
import { Plus, Search, CreditCard as Edit2, Trash2, TrendingUp, Calendar, Upload, Users } from 'lucide-react';
import { useData } from '../../hooks/useData';
import { Player } from '../../types';

interface PlayerListProps {
  onPlayerSelect?: (player: Player) => void;
  onCreatePlayer: () => void;
  onEditPlayer: (player: Player) => void;
  onImportPlayers: () => void;
}

export const PlayerList: React.FC<PlayerListProps> = ({ onPlayerSelect, onCreatePlayer, onEditPlayer, onImportPlayers }) => {
  const { players, deletePlayer, loading } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<'name-asc' | 'name-desc' | 'rating-asc' | 'rating-desc' | 'age-asc' | 'age-desc'>('name-asc');

  const filteredPlayers = players
    .filter(player => 
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.club?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      switch (sortOption) {
        case 'name-asc':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'name-desc':
          comparison = b.name.localeCompare(a.name);
          break;
        case 'rating-asc':
          comparison = a.currentRating - b.currentRating;
          break;
        case 'rating-desc':
          comparison = b.currentRating - a.currentRating;
          break;
        case 'age-asc':
          comparison = new Date(a.birthDate).getTime() - new Date(b.birthDate).getTime();
          break;
        case 'age-desc':
          comparison = new Date(b.birthDate).getTime() - new Date(a.birthDate).getTime();
          break;
      }
      return comparison;
    });

  const handleDelete = async (player: Player) => {
    if (window.confirm(`Tem certeza que deseja excluir o jogador ${player.name}?`)) {
      await deletePlayer(player.id);
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white text-shadow-lg">Jogadores</h2>
          <p className="text-white/90 mt-1 font-medium">{players.length} jogadores cadastrados</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onImportPlayers}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Upload size={20} />
            Importar CSV
          </button>
          <button
            onClick={onCreatePlayer}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Novo Jogador
          </button>
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
                placeholder="Buscar por nome, email, apelido ou clube..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/80 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
              />
            </div>
          </div>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as any)}
            className="px-3 py-2 bg-white/80 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800"
          >
            <option value="name-asc">Alfabética (A-Z)</option>
            <option value="name-desc">Alfabética (Z-A)</option>
            <option value="rating-desc">Rating (Maior-Menor)</option>
            <option value="rating-asc">Rating (Menor-Maior)</option>
            <option value="age-asc">Idade (Menor-Maior)</option>
            <option value="age-desc">Idade (Maior-Menor)</option>
          </select>
        </div>
      </div>

      {/* Players Grid */}
      <div className="glass-card-light rounded-lg shadow-sm border border-blue-200/30">
        <div className="p-6 border-b border-blue-200/30">
          <h3 className="text-lg font-bold text-black flex items-center gap-2">
            <Users size={20} />
            Lista de Jogadores ({filteredPlayers.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-100/50">
              <tr>
                <th className="text-left py-4 px-6 font-bold text-black">Nome</th>
                <th className="text-left py-4 px-6 font-bold text-black">Idade</th>
                <th className="text-left py-4 px-6 font-bold text-black">Rating</th>
                <th className="text-left py-4 px-6 font-bold text-black">Clube</th>
                <th className="text-left py-4 px-6 font-bold text-black">Contato</th>
                <th className="text-left py-4 px-6 font-bold text-black">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-200/30">
              {filteredPlayers.map((player) => {
                const lastRatingChange = player.ratingHistory[player.ratingHistory.length - 1]?.variation || 0;
                
                return (
                  <tr 
                    key={player.id} 
                    className="hover:bg-blue-50/30 transition-colors cursor-pointer"
                    onClick={() => onPlayerSelect?.(player)}
                  >
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-bold text-black text-lg">{player.name}</div>
                        {player.nickname && (
                          <div className="text-sm font-bold text-black">"{player.nickname}"</div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-black">{getAge(player.birthDate)} anos</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-2xl font-bold text-black">{player.currentRating}</div>
                      {lastRatingChange !== 0 && (
                        <div className={`text-sm font-bold ${lastRatingChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {lastRatingChange > 0 ? '+' : ''}{lastRatingChange}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-black">{player.club || '-'}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-black">{player.email || '-'}</div>
                      {player.phone && (
                        <div className="text-sm font-bold text-black">{player.phone}</div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditPlayer(player);
                          }}
                          className="p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-100/50 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(player);
                          }}
                          className="p-2 text-gray-700 hover:text-red-600 hover:bg-red-100/50 rounded-lg transition-colors"
                          disabled={loading}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredPlayers.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Nenhum jogador encontrado' : 'Nenhum jogador cadastrado'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Tente ajustar os termos de busca'
                : 'Comece adicionando o primeiro jogador ao sistema'
              }
            </p>
            {!searchTerm && (
              <div className="flex justify-center gap-4">
                <button
                  onClick={onImportPlayers}
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Upload size={20} />
                  Importar Jogadores
                </button>
                <button
                  onClick={onCreatePlayer}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={20} />
                  Adicionar Primeiro Jogador
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};