import React, { useState } from 'react';
import { Plus, Search, Eye, CreditCard as Edit2, Calendar, Users, Trophy } from 'lucide-react';
import { useData } from '../../hooks/useData';
import { Tournament } from '../../types';

interface TournamentListProps {
  onCreateTournament: () => void;
  onEditTournament: (tournament: Tournament) => void;
  onViewTournament: (tournament: Tournament) => void;
}

export const TournamentList: React.FC<TournamentListProps> = ({ 
  onCreateTournament, 
  onEditTournament, 
  onViewTournament 
}) => {
  const { tournaments, players } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'active' | 'completed'>('all');

  const filteredTournaments = tournaments
    .filter(tournament => {
      const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tournament.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || tournament.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  const getStatusColor = (status: Tournament['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-50 text-gray-700';
      case 'active': return 'bg-green-50 text-green-700';
      case 'completed': return 'bg-blue-50 text-blue-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const getStatusText = (status: Tournament['status']) => {
    switch (status) {
      case 'draft': return 'Rascunho';
      case 'active': return 'Ativo';
      case 'completed': return 'Concluído';
      default: return 'Desconhecido';
    }
  };

  const getParticipantNames = (participantIds: string[]) => {
    return participantIds
      .map(id => players.find(p => p.id === id)?.name)
      .filter(Boolean)
      .slice(0, 3)
      .join(', ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white text-shadow-lg">Torneios</h2>
          <p className="text-white/90 mt-1 font-medium">{tournaments.length} torneios no sistema</p>
        </div>
        <button
          onClick={onCreateTournament}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Novo Torneio
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card-light p-4 rounded-lg shadow-sm border border-blue-200/30">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar torneios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/80 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'draft' | 'active' | 'completed')}
            className="px-3 py-2 bg-white/80 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800"
          >
            <option value="all">Todos os Status</option>
            <option value="draft">Rascunho</option>
            <option value="active">Ativo</option>
            <option value="completed">Concluído</option>
          </select>
        </div>
      </div>

      {/* Tournaments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTournaments.map((tournament) => (
          <div
            key={tournament.id}
            className="glass-card-light p-6 rounded-lg shadow-sm border border-blue-200/30 hover:shadow-md transition-all duration-300 hover:scale-105"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-black mb-2">{tournament.name}</h3>
                <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(tournament.status)}`}>
                  {getStatusText(tournament.status)}
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => onViewTournament(tournament)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => onEditTournament(tournament)}
                  className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-black">
                <Calendar size={16} />
                <span>{new Date(tournament.startDate).toLocaleDateString('pt-BR')}</span>
              </div>

              <div className="flex items-center gap-2 text-sm font-bold text-black">
                <Users size={16} />
                <span>{tournament.participants.length} participantes</span>
              </div>

              {tournament.participants.length > 0 && (
                <div className="flex items-start gap-2 text-sm font-bold text-black">
                  <Trophy size={16} className="mt-0.5" />
                  <div>
                    <div>{getParticipantNames(tournament.participants)}</div>
                    {tournament.participants.length > 3 && (
                      <div className="text-xs font-bold text-black">
                        +{tournament.participants.length - 3} outros
                      </div>
                    )}
                  </div>
                </div>
              )}

              {tournament.description && (
                <p className="text-sm font-bold text-black line-clamp-2">{tournament.description}</p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => onViewTournament(tournament)}
                className="w-full bg-blue-50 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Ver Detalhes
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTournaments.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Trophy size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all' 
              ? 'Nenhum torneio encontrado' 
              : 'Nenhum torneio cadastrado'
            }
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== 'all'
              ? 'Tente ajustar os filtros de busca'
              : 'Comece criando o primeiro torneio'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <button
              onClick={onCreateTournament}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Criar Primeiro Torneio
            </button>
          )}
        </div>
      )}
    </div>
  );
};