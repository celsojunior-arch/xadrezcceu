import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Settings as SettingsIcon, Save, Users, Trophy, Shield, BarChart } from 'lucide-react';
import { useData } from '../../hooks/useData';
import { VPTableEntry, TournamentSettings } from '../../types';

export const Settings: React.FC = () => {
  const { isAdmin } = useAuth();
  const { systemSettings } = useData();
  const [activeTab, setActiveTab] = useState<'rating' | 'tournaments' | 'permissions'>('rating');
  const [vpTable, setVpTable] = useState<VPTableEntry[]>(systemSettings.ratingSystem.vpTable);
  const [defaultTournamentSettings, setDefaultTournamentSettings] = useState<TournamentSettings>(
    systemSettings.defaultTournamentSettings
  );

  const handleVPTableChange = (index: number, field: keyof VPTableEntry, value: number) => {
    const newTable = [...vpTable];
    newTable[index] = { ...newTable[index], [field]: value };
    setVpTable(newTable);
  };

  const addVPEntry = () => {
    const lastEntry = vpTable[vpTable.length - 1];
    const newEntry: VPTableEntry = {
      minDelta: lastEntry ? lastEntry.maxDelta + 1 : 0,
      maxDelta: lastEntry ? lastEntry.maxDelta + 50 : 50,
      vp: 20
    };
    setVpTable([...vpTable, newEntry]);
  };

  const removeVPEntry = (index: number) => {
    if (vpTable.length > 1) {
      setVpTable(vpTable.filter((_, i) => i !== index));
    }
  };

  const handleSave = () => {
    // In a real app, this would save to backend
    alert('Configurações salvas com sucesso!');
  };

  // Redirect non-admin users
  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <SettingsIcon size={48} className="mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Acesso Restrito
        </h3>
        <p className="text-gray-600">
          Esta seção é restrita a administradores. Faça login para acessar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white text-shadow-lg">Configurações do Sistema</h2>
        <p className="text-white/90 mt-1 font-medium">Gerencie parâmetros e configurações do sistema</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('rating')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'rating'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BarChart className="inline mr-2" size={16} />
            Sistema de Rating
          </button>
          <button
            onClick={() => setActiveTab('tournaments')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tournaments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Trophy className="inline mr-2" size={16} />
            Torneios
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'permissions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Shield className="inline mr-2" size={16} />
            Permissões
          </button>
        </nav>
      </div>

      {/* Rating System Settings */}
      {activeTab === 'rating' && (
        <div className="space-y-6">
          <div className="glass-card-light rounded-lg shadow-sm border border-blue-200/30">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-black">Tabela de VP (Valor de Pontos)</h3>
              <p className="text-sm font-bold text-black mt-1">
                Configure os valores de VP baseados na diferença de rating (Δ = |R₁ - R₂|)
              </p>
            </div>
            
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full border border-blue-200 rounded-lg">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-bold text-black">Δ Mínimo</th>
                      <th className="text-left py-3 px-4 font-bold text-black">Δ Máximo</th>
                      <th className="text-left py-3 px-4 font-bold text-black">VP</th>
                      <th className="text-left py-3 px-4 font-bold text-black">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-200">
                    {vpTable.map((entry, index) => (
                      <tr key={index}>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            value={entry.minDelta}
                            onChange={(e) => handleVPTableChange(index, 'minDelta', parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1 bg-white/80 border border-blue-300 rounded text-sm text-gray-800"
                            min="0"
                          />
                        </td>
                        <td className="py-3 px-4">
                          {entry.maxDelta === Infinity ? (
                            <span className="font-bold text-black">∞</span>
                          ) : (
                            <input
                              type="number"
                              value={entry.maxDelta}
                              onChange={(e) => handleVPTableChange(index, 'maxDelta', parseInt(e.target.value) || 0)}
                              className="w-20 px-2 py-1 bg-white/80 border border-blue-300 rounded text-sm text-gray-800"
                              min={entry.minDelta}
                            />
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            value={entry.vp}
                            onChange={(e) => handleVPTableChange(index, 'vp', parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1 bg-white/80 border border-blue-300 rounded text-sm text-gray-800"
                            min="1"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => removeVPEntry(index)}
                            disabled={vpTable.length <= 1}
                            className="font-bold text-red-600 hover:text-red-700 disabled:text-gray-400 text-sm"
                          >
                            Remover
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 flex gap-2">
                <button
                  onClick={addVPEntry}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                >
                  Adicionar Faixa
                </button>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Como funciona o Sistema Municipal:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Vitória:</strong> Vencedor +VP, Perdedor -VP</li>
              <li>• <strong>Empate:</strong> Favorito -ceil(VP×0.25), Underdog +ceil(VP×0.25)</li>
              <li>• <strong>Zero-sum:</strong> A soma das mudanças sempre é zero</li>
              <li>• <strong>Arredondamento:</strong> Sempre para o inteiro mais próximo (0.5 para cima)</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tournament Settings */}
      {activeTab === 'tournaments' && (
        <div className="space-y-6">
          <div className="glass-card-light rounded-lg shadow-sm border border-blue-200/30">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-black">Configurações Padrão de Torneios</h3>
              <p className="text-sm font-bold text-black mt-1">
                Estas configurações serão aplicadas por padrão em novos torneios
              </p>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={defaultTournamentSettings.allowManualPairings}
                    onChange={(e) => setDefaultTournamentSettings(prev => ({
                      ...prev,
                      allowManualPairings: e.target.checked
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="font-medium text-gray-900">Permitir emparelhamentos manuais</span>
                </label>
                <p className="text-sm text-gray-600 ml-6">
                  Organizadores podem ajustar pares manualmente antes de confirmar a rodada
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Critérios de Desempate (em ordem de prioridade)
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'initialRating', label: 'Rating inicial do torneio' },
                    { id: 'headToHead', label: 'Confronto direto' },
                    { id: 'random', label: 'Sorteio' }
                  ].map((criteria) => (
                    <label key={criteria.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={defaultTournamentSettings.tiebreakCriteria.includes(criteria.id as any)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setDefaultTournamentSettings(prev => ({
                              ...prev,
                              tiebreakCriteria: [...prev.tiebreakCriteria, criteria.id as any]
                            }));
                          } else {
                            setDefaultTournamentSettings(prev => ({
                              ...prev,
                              tiebreakCriteria: prev.tiebreakCriteria.filter(c => c !== criteria.id)
                            }));
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-gray-900">{criteria.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sistema de Rating
                </label>
                <select
                  value={defaultTournamentSettings.ratingSystem}
                  onChange={(e) => setDefaultTournamentSettings(prev => ({
                    ...prev,
                    ratingSystem: e.target.value as 'municipal' | 'elo'
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="municipal">Municipal (Base 20)</option>
                  <option value="elo">ELO Tradicional</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Permissions */}
      {activeTab === 'permissions' && (
        <div className="space-y-6">
          <div className="glass-card-light rounded-lg shadow-sm border border-blue-200/30">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-black">Controle de Permissões</h3>
              <p className="text-sm font-bold text-black mt-1">
                Configure as permissões padrão para diferentes tipos de usuário
              </p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Admin */}
                <div className="border border-blue-200 rounded-lg p-4 bg-white/50">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="text-red-600" size={20} />
                    <h4 className="font-bold text-black">Administrador</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 font-bold text-green-600">
                      <span>✓</span> Gerenciar sistema
                    </div>
                    <div className="flex items-center gap-2 font-bold text-green-600">
                      <span>✓</span> Gerenciar torneios
                    </div>
                    <div className="flex items-center gap-2 font-bold text-green-600">
                      <span>✓</span> Gerenciar jogadores
                    </div>
                    <div className="flex items-center gap-2 font-bold text-green-600">
                      <span>✓</span> Ver relatórios
                    </div>
                  </div>
                </div>

                {/* Organizer */}
                <div className="border border-blue-200 rounded-lg p-4 bg-white/50">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="text-blue-600" size={20} />
                    <h4 className="font-bold text-black">Organizador</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 font-bold text-red-600">
                      <span>✗</span> Gerenciar sistema
                    </div>
                    <div className="flex items-center gap-2 font-bold text-green-600">
                      <span>✓</span> Gerenciar torneios
                    </div>
                    <div className="flex items-center gap-2 font-bold text-green-600">
                      <span>✓</span> Gerenciar jogadores
                    </div>
                    <div className="flex items-center gap-2 font-bold text-green-600">
                      <span>✓</span> Ver relatórios
                    </div>
                  </div>
                </div>

                {/* Spectator */}
                <div className="border border-blue-200 rounded-lg p-4 bg-white/50">
                  <div className="flex items-center gap-2 mb-4">
                    <SettingsIcon className="text-gray-600" size={20} />
                    <h4 className="font-bold text-black">Espectador</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 font-bold text-red-600">
                      <span>✗</span> Gerenciar sistema
                    </div>
                    <div className="flex items-center gap-2 font-bold text-red-600">
                      <span>✗</span> Gerenciar torneios
                    </div>
                    <div className="flex items-center gap-2 font-bold text-red-600">
                      <span>✗</span> Gerenciar jogadores
                    </div>
                    <div className="flex items-center gap-2 font-bold text-green-600">
                      <span>✓</span> Ver relatórios
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          <Save size={20} />
          Salvar Configurações
        </button>
      </div>
    </div>
  );
};