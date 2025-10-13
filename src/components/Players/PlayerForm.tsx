import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Phone, Calendar, Hash, Building, FileText } from 'lucide-react';
import { Player } from '../../types';
import { useData } from '../../hooks/useData';

interface PlayerFormProps {
  player?: Player;
  onClose: () => void;
  onSave: () => void;
}

export const PlayerForm: React.FC<PlayerFormProps> = ({ player, onClose, onSave }) => {
  const { createPlayer, updatePlayer, checkDuplicatePlayer, loading } = useData();
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    nickname: '',
    email: '',
    phone: '',
    isActive: true,
    observations: '',
    initialRating: 1500
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [duplicateWarning, setDuplicateWarning] = useState<Player[]>([]);

  useEffect(() => {
    if (player) {
      setFormData({
        name: player.name,
        birthDate: player.birthDate,
        nickname: player.nickname || '',
        email: player.email || '',
        phone: player.phone || '',
        isActive: player.isActive,
        observations: player.observations || '',
        initialRating: player.currentRating
      });
    }
  }, [player]);

  useEffect(() => {
    if (formData.name && formData.birthDate && !player) {
      const duplicates = checkDuplicatePlayer(formData.name, formData.birthDate);
      setDuplicateWarning(duplicates);
    } else {
      setDuplicateWarning([]);
    }
  }, [formData.name, formData.birthDate, player, checkDuplicatePlayer]);
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // CA-01: Birth date validation with clear message
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.birthDate) {
      newErrors.birthDate = 'Data de nascimento é obrigatória e deve ser preenchida';
    } else {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 5 || age > 120) {
        newErrors.birthDate = 'Data de nascimento deve resultar em idade entre 5 e 120 anos';
      }
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (formData.initialRating < 0) {
      newErrors.initialRating = 'Rating deve ser maior ou igual a 0';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // CA-01: Block save without birth date
    if (!validateForm()) return;

    if (duplicateWarning.length > 0 && !player) {
      const confirmed = window.confirm(
        `Possível jogador duplicado encontrado: ${duplicateWarning[0].name}. Deseja continuar mesmo assim?`
      );
      if (!confirmed) return;
    }
    try {
      if (player) {
        await updatePlayer(player.id, {
          name: formData.name,
          birthDate: formData.birthDate,
          nickname: formData.nickname || undefined,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          club: formData.club || undefined,
        });
      } else {
        await createPlayer({
          name: formData.name,
          birthDate: formData.birthDate,
          nickname: formData.nickname || undefined,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          club: formData.club || undefined,
          initialRating: formData.initialRating
        });
      }
      onSave();
    } catch (error) {
      // CA-01: Display clear error message
      if (error instanceof Error) {
        setErrors({ birthDate: error.message });
      } else {
        console.error('Error saving player:', error);
      }
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {player ? 'Editar Jogador' : 'Novo Jogador'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {duplicateWarning.length > 0 && (
          <div className="mx-6 mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <span className="font-medium">⚠️ Possível duplicata detectada:</span>
            </div>
            <div className="mt-2 text-sm text-yellow-700">
              Jogador similar encontrado: <strong>{duplicateWarning[0].name}</strong> 
              ({new Date(duplicateWarning[0].birthDate).toLocaleDateString('pt-BR')})
            </div>
          </div>
        )}
          {/* Required Fields */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Obrigatórias</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline mr-1" />
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Digite o nome completo"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              {/* Birth Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  Data de Nascimento *
                </label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleChange('birthDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.birthDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.birthDate && <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>}
              </div>
            </div>
          </div>

          {/* Optional Fields */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Opcionais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nickname */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline mr-1" />
                  Apelido
                </label>
                <input
                  type="text"
                  value={formData.nickname}
                  onChange={(e) => handleChange('nickname', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Como é conhecido"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} className="inline mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="jogador@email.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone size={16} className="inline mr-1" />
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(11) 99999-9999"
                />
              </div>

              {/* Status */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => handleChange('isActive', e.target.checked)}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Jogador ativo</span>
                </label>
                <p className="text-xs text-gray-500 ml-6 mt-1">
                  Jogadores inativos não aparecem na classificação nem nos confrontos quinzenais
                </p>
              </div>
            </div>

            {/* Rating */}
            {!player && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Hash size={16} className="inline mr-1" />
                  Rating Inicial
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.initialRating}
                  onChange={(e) => handleChange('initialRating', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.initialRating ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="1500"
                />
                {errors.initialRating && <p className="text-red-500 text-sm mt-1">{errors.initialRating}</p>}
              </div>
            )}

            {/* Observations */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText size={16} className="inline mr-1" />
                Observações
              </label>
              <textarea
                value={formData.observations}
                onChange={(e) => handleChange('observations', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Informações adicionais sobre o jogador..."
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save size={16} />
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};