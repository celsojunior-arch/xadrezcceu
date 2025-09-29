import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Calendar, Users, FileText, Trophy, MapPin, Hash } from 'lucide-react';
import { Tournament } from '../../types';
import { useData } from '../../hooks/useData';

interface TournamentFormProps {
  tournament?: Tournament;
  onBack: () => void;
}

export const TournamentForm: React.FC<TournamentFormProps> = ({ tournament, onBack }) => {
  const { players, createTournament, updateTournament, loading } = useData();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    startDate: '',
    endDate: '',
    numberOfRounds: 5,
    status: 'draft' as Tournament['status'],
    participants: [] as string[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (tournament) {
      setFormData({
        name: tournament.name,
        location: tournament.location || '',
        description: tournament.description || '',
        startDate: tournament.startDate,
        endDate: tournament.endDate || '',
        numberOfRounds: tournament.numberOfRounds,
        status: tournament.status,
        participants: tournament.participants
      });
    }
  }, [tournament]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome do torneio é obrigatório';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Data de início é obrigatória';
    }

    if (formData.endDate && formData.startDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'Data de fim deve ser posterior à data de início';
    }

    if (formData.numberOfRounds < 1 || formData.numberOfRounds > 20) {
      newErrors.numberOfRounds = 'Número de rodadas deve estar entre 1 e 20';
    }
    if (formData.participants.length < 2) {
      newErrors.participants = 'Selecione pelo menos 2 participantes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (tournament) {
        await updateTournament(tournament.id, {
          name: formData.name,
          location: formData.location || undefined,
          description: formData.description || undefined,
          startDate: formData.startDate,
          endDate: formData.endDate || undefined,
          numberOfRounds: formData.numberOfRounds,
          status: formData.status,
          participants: formData.participants,
          tiebreakEnabled: formData.tiebreakEnabled,
          allowNoShow: formData.allowNoShow,
          byePoints: formData.byePoints,
          byeAffectsRating: formData.byeAffectsRating
        });
      } else {
        await createTournament({
          name: formData.name,
          location: formData.location || undefined,
          description: formData.description || undefined,
          startDate: formData.startDate,
          endDate: formData.endDate || undefined,
          numberOfRounds: formData.numberOfRounds,
          status: formData.status,
          participants: formData.participants,
          organizerId: 'org1', // Mock organizer ID
          tiebreakEnabled: formData.tiebreakEnabled,
          allowNoShow: formData.allowNoShow,
          byePoints: formData.byePoints,
          byeAffectsRating: formData.byeAffectsRating
        });
      }
      onBack();
    } catch (error) {
      console.error('Error saving tournament:', error);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleParticipant = (playerId: string) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.includes(playerId)
        ? prev.participants.filter(id => id !== playerId)
        : [...prev.participants, playerId]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {tournament ? 'Editar Torneio' : 'Novo Torneio'}
          </h2>
          <p className="text-gray-600 mt-1">
            {tournament ? 'Atualize as informações do torneio' : 'Configure um novo torneio'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Trophy size={20} />
                Informações Básicas
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Torneio *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ex: Torneio Municipal Janeiro 2024"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin size={16} className="inline mr-1" />
                    Local
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Centro Cultural Municipal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText size={16} className="inline mr-1" />
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descreva o torneio..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Hash size={16} className="inline mr-1" />
                    Número de Rodadas *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.numberOfRounds}
                    onChange={(e) => handleChange('numberOfRounds', parseInt(e.target.value) || 1)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.numberOfRounds ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.numberOfRounds && <p className="text-red-500 text-sm mt-1">{errors.numberOfRounds}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Rascunho</option>
                    <option value="active">Ativo</option>
                    <option value="completed">Concluído</option>
                  </select>
                </div>
                
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.tiebreakEnabled}
                      onChange={(e) => handleChange('tiebreakEnabled', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Ativar critérios de desempate</span>
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.allowNoShow}
                      onChange={(e) => handleChange('allowNoShow', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Permitir W.O. (No-show)</span>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pontos por BYE
                  </label>
                  <select
                    value={formData.byePoints}
                    onChange={(e) => handleChange('byePoints', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1.0}>1.0 (Vitória completa)</option>
                    <option value={0.5}>0.5 (Meio ponto)</option>
                  </select>
                </div>
                
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.byeAffectsRating}
                      onChange={(e) => handleChange('byeAffectsRating', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">BYE afeta rating</span>
                  </label>
                  <p className="text-xs text-gray-500 ml-6">Recomendado: desabilitado</p>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar size={20} />
                Datas
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Início *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.startDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Fim
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.endDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Participants */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users size={20} />
              Participantes ({formData.participants.length})
            </h3>
            
            {errors.participants && (
              <p className="text-red-500 text-sm mb-4">{errors.participants}</p>
            )}

            <div className="max-h-96 overflow-y-auto space-y-2">
              {players.map((player) => (
                <label
                  key={player.id}
                  className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.participants.includes(player.id)}
                    onChange={() => toggleParticipant(player.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="ml-3 flex-1">
                    <div className="font-medium text-gray-900">{player.name}</div>
                    {player.nickname && (
                      <div className="text-sm text-blue-600">"{player.nickname}"</div>
                    )}
                    <div className="text-sm text-gray-600">Rating: {player.currentRating}</div>
                    {player.club && (
                      <div className="text-xs text-gray-500">{player.club}</div>
                    )}
                  </div>
                </label>
              ))}
            </div>

            {players.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                Nenhum jogador cadastrado no sistema
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save size={20} />
            {loading ? 'Salvando...' : 'Salvar Torneio'}
          </button>
        </div>
      </form>
    </div>
  );
};