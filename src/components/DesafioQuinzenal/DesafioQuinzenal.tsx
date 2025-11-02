import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Trophy, Users, Clock, CheckCircle, AlertCircle, Play, Target, Search, FileText } from 'lucide-react';
import { useData } from '../../hooks/useData';

export const DesafioQuinzenal: React.FC = () => {
  const { isAdmin } = useAuth();
  const { 
    players, 
    desafioCiclos, 
    desafioConfrontos,
    getCicloAtivo, 
    getConfrontosDoCiclo,
    getConfrontosComResultado,
    criarDesafioCiclo,
    lancarResultadoDesafio,
    editarResultadoDesafio,
    finalizarCicloQuinzenal,
    gerarConfrontosDoCiclo,
    loadDesafioConfrontos,
    loading 
  } = useData();
  
  const [activeTab, setActiveTab] = useState<'atual' | 'historico' | 'resultados'>('atual');
  const [selectedResult, setSelectedResult] = useState<{ confrontoId: string; resultado: '1-0' | '0-1' | '0-0' } | null>(null);
  const [editingConfronto, setEditingConfronto] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const cicloAtivo = getCicloAtivo();
  const confrontosAtivos = cicloAtivo ? getConfrontosDoCiclo(cicloAtivo.id) : [];
  const confrontosComResultado = getConfrontosComResultado();

  const getPlayerName = (playerId: string) => {
    return players.find(p => p.id === playerId)?.name || 'Jogador não encontrado';
  };

  const getStatusColor = (confronto: any) => {
    if (confronto.resultado) {
      return 'text-green-600';
    }
    return 'text-yellow-600';
  };

  const getStatusText = (confronto: any) => {
    if (confronto.resultado) {
      return 'Concluído';
    }
    return 'Pendente';
  };

  const handleCriarCiclo = async () => {
    try {
      await criarDesafioCiclo();
    } catch (error) {
      console.error('Erro ao criar ciclo:', error);
      alert(error instanceof Error ? error.message : 'Erro ao criar novo ciclo quinzenal');
    }
  };

  const handleGerarConfrontos = async () => {
    if (!cicloAtivo) return;
    
    try {
      await gerarConfrontosDoCiclo(cicloAtivo.id);
      await loadDesafioConfrontos();
    } catch (error) {
      console.error('Erro ao gerar confrontos:', error);
      alert(error instanceof Error ? error.message : 'Erro ao gerar confrontos');
    }
  };
  const handleLancarResultado = async (confrontoId: string, resultado: '1-0' | '0-1' | '0-0') => {
    try {
      await lancarResultadoDesafio(confrontoId, resultado);
      setSelectedResult(null);
    } catch (error) {
      console.error('Erro ao lançar resultado:', error);
      alert('Erro ao lançar resultado');
    }
  };

  const handleEditarResultado = async (confrontoId: string, resultado: '1-0' | '0-1' | '0-0') => {
    try {
      await editarResultadoDesafio(confrontoId, resultado);
      setEditingConfronto(null);
    } catch (error) {
      console.error('Erro ao editar resultado:', error);
      alert('Erro ao editar resultado');
    }
  };

  const jogadorAtual = players[0]; // Mock do jogador atual

  const formatQuinzena = (ciclo: any) => {
    const quinzenaText = ciclo.quinzena === 1 ? '1ª Quinzena' : '2ª Quinzena';
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${quinzenaText} ${meses[ciclo.mes - 1]}/${ciclo.ano}`;
  };

  // Filtrar confrontos com resultado para a aba Resultados
  const filteredResultados = confrontosComResultado.filter(confronto => {
    const jogadorBrancas = getPlayerName(confronto.jogadorBrancasId).toLowerCase();
    const jogadorPretas = getPlayerName(confronto.jogadorPretasId).toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = !searchTerm || 
      jogadorBrancas.includes(searchLower) || 
      jogadorPretas.includes(searchLower);
    
    const matchesDate = !dateFilter || 
      (confronto.aplicadoEm && confronto.aplicadoEm.startsWith(dateFilter));
    
    return matchesSearch && matchesDate;
  }).sort((a, b) => {
    if (!a.aplicadoEm || !b.aplicadoEm) return 0;
    return new Date(b.aplicadoEm).getTime() - new Date(a.aplicadoEm).getTime();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white text-shadow-lg">Desafio Quinzenal</h2>
          <p className="text-white/90 mt-1 font-medium">Sistema automático de confrontos por ranking</p>
        </div>
        {!cicloAtivo && isAdmin && (
          <button
            onClick={handleCriarCiclo}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Play size={20} />
            {loading ? 'Criando...' : 'Criar Novo Ciclo'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('atual')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'atual'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Ciclo Atual
          </button>
          <button
            onClick={() => setActiveTab('resultados')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'resultados'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Resultados
          </button>
          <button
            onClick={() => setActiveTab('historico')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'historico'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Histórico
          </button>
        </nav>
      </div>

      {/* Ciclo Atual */}
      {activeTab === 'atual' && (
        <div className="space-y-6">
          {cicloAtivo ? (
            <>
              {/* Info do Ciclo */}
              <div className="glass-card-light p-6 rounded-lg shadow-sm border border-blue-200/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-blue-600" size={24} />
                    <div>
                      <h3 className="text-lg font-bold text-black">
                        {formatQuinzena(cicloAtivo)}
                      </h3>
                      <p className="text-sm font-bold text-black">
                        Criado em {new Date(cicloAtivo.criadoEm).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {confrontosAtivos.length}
                      </div>
                      <div className="text-sm font-bold text-black">Confrontos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {confrontosAtivos.filter(c => c.resultado).length}
                      </div>
                      <div className="text-sm font-bold text-black">Concluídos</div>
                    </div>
                  </div>
                </div>

                {/* Progresso */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${confrontosAtivos.length > 0 ? (confrontosAtivos.filter(c => c.resultado).length / confrontosAtivos.length) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>

              {/* Lista de Confrontos */}
              <div className="glass-card-light rounded-lg shadow-sm border border-blue-200/30">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-black flex items-center gap-2">
                      <Trophy size={20} />
                      Confrontos da Quinzena
                    </h3>
                    {isAdmin && confrontosAtivos.length === 0 && (
                      <button
                        onClick={handleGerarConfrontos}
                        disabled={loading}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        <Play size={16} />
                        {loading ? 'Gerando...' : 'Gerar Confrontos'}
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {confrontosAtivos.map((confronto) => (
                    <div key={confronto.id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          {/* Confronto */}
                          <div className="flex items-center gap-4 mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-white border-2 border-gray-400 rounded"></div>
                              <span className="font-bold text-black">
                                {getPlayerName(confronto.jogadorBrancasId)}
                              </span>
                              <span className="text-sm font-bold text-black">
                                ({confronto.ratingBrancasSnapshot})
                              </span>
                            </div>
                            
                            <span className="font-bold text-black">vs</span>
                            
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-gray-800 rounded"></div>
                              <span className="font-bold text-black">
                                {getPlayerName(confronto.jogadorPretasId)}
                              </span>
                              <span className="text-sm font-bold text-black">
                                ({confronto.ratingPretasSnapshot})
                              </span>
                            </div>
                          </div>

                          {/* Status e Responsável */}
                          <div className="flex items-center gap-4 text-sm">
                            <div className={`flex items-center gap-1 font-bold ${confronto.resultado ? 'text-green-600' : 'text-red-600'}`}>
                              {confronto.resultado ? (
                                <CheckCircle size={16} />
                              ) : (
                                <Clock size={16} />
                              )}
                              {confronto.resultado ? 'Realizado' : 'Pendente'}
                            </div>
                            
                            {!confronto.resultado && (
                              <div className="font-bold text-black">
                                Responsável: {getPlayerName(confronto.responsavelId)}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Resultado ou Ações */}
                        <div className="flex items-center gap-2">
                          {confronto.resultado ? (
                            <div className="flex items-center gap-2">
                              <div className="text-lg font-bold text-green-600">
                                {confronto.resultado}
                              </div>
                              {isAdmin && (
                                <button
                                  onClick={() => setEditingConfronto(confronto.id)}
                                  className="text-sm bg-yellow-50 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-100"
                                >
                                  Editar
                                </button>
                              )}
                            </div>
                          ) : isAdmin ? (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleLancarResultado(confronto.id, '1-0')}
                                disabled={loading}
                                className="bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                              >
                                1-0
                              </button>
                              <button
                                onClick={() => handleLancarResultado(confronto.id, '0-0')}
                                disabled={loading}
                                className="bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                              >
                                0-0
                              </button>
                              <button
                                onClick={() => handleLancarResultado(confronto.id, '0-1')}
                                disabled={loading}
                                className="bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                              >
                                0-1
                              </button>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-600 font-medium">
                              Aguardando resultado
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Modal de Edição */}
                {editingConfronto && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                      <h3 className="text-lg font-semibold mb-4">Editar Resultado</h3>
                      <p className="text-gray-600 mb-4">
                        Selecione o novo resultado para este confronto:
                      </p>
                      <div className="flex gap-2 mb-4">
                        <button
                          onClick={() => handleEditarResultado(editingConfronto, '1-0')}
                          className="flex-1 bg-green-50 border border-green-300 text-green-700 py-2 px-3 rounded hover:bg-green-100"
                        >
                          1-0
                        </button>
                        <button
                          onClick={() => handleEditarResultado(editingConfronto, '0-0')}
                          className="flex-1 bg-yellow-50 border border-yellow-300 text-yellow-700 py-2 px-3 rounded hover:bg-yellow-100"
                        >
                          0-0
                        </button>
                        <button
                          onClick={() => handleEditarResultado(editingConfronto, '0-1')}
                          className="flex-1 bg-red-50 border border-red-300 text-red-700 py-2 px-3 rounded hover:bg-red-100"
                        >
                          0-1
                        </button>
                      </div>
                      <button
                        onClick={() => setEditingConfronto(null)}
                        className="w-full bg-gray-100 text-gray-700 py-2 px-3 rounded hover:bg-gray-200"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {confrontosAtivos.length === 0 && (
                  <div className="text-center py-12">
                    <Target size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum confronto gerado ainda</h3>
                    <p className="font-bold text-black mb-4">
                      Os confrontos são gerados automaticamente seguindo a ordem do ranking: 1º vs 2º, 3º vs 4º, etc.
                    </p>
                    {isAdmin && (
                      <button
                        onClick={handleGerarConfrontos}
                        disabled={loading}
                        className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        <Play size={20} />
                        {loading ? 'Gerando Confrontos...' : 'Gerar Confrontos Agora'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Calendar size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum ciclo ativo
              </h3>
              <p className="font-bold text-black mb-6">
                Ciclos são criados automaticamente nos dias 1 e 16 de cada mês às 09:00
              </p>
              {isAdmin && (
                <button
                  onClick={handleCriarCiclo}
                  disabled={loading}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Play size={20} />
                  {loading ? 'Criando...' : 'Criar Ciclo Manualmente'}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Resultados */}
      {activeTab === 'resultados' && (
        <div className="space-y-6">
          {/* Filtros */}
          <div className="glass-card-light p-4 rounded-lg shadow-sm border border-blue-200/30">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar por nome do jogador..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/80 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                  />
                </div>
              </div>
              <div>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3 py-2 bg-white/80 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800"
                  placeholder="Filtrar por data"
                />
              </div>
            </div>
          </div>

          <div className="glass-card-light rounded-lg shadow-sm border border-blue-200/30">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-black flex items-center gap-2">
                <CheckCircle size={20} />
                Resultados da Quinzena ({filteredResultados.length})
              </h3>
            </div>
            
            {filteredResultados.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredResultados.map((confronto) => (
                  <div key={confronto.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-white border-2 border-gray-400 rounded"></div>
                            <span className="font-bold text-black">
                              {getPlayerName(confronto.jogadorBrancasId)}
                            </span>
                            <span className="text-sm font-bold text-black">
                              ({confronto.ratingBrancasSnapshot})
                            </span>
                          </div>
                          
                          <span className="font-bold text-black">vs</span>
                          
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-800 rounded"></div>
                            <span className="font-bold text-black">
                              {getPlayerName(confronto.jogadorPretasId)}
                            </span>
                            <span className="text-sm font-bold text-black">
                              ({confronto.ratingPretasSnapshot})
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-sm font-bold text-black">
                          Resultado aplicado em: {confronto.aplicadoEm ? new Date(confronto.aplicadoEm).toLocaleString('pt-BR') : 'N/A'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-lg font-bold text-green-600">
                          {confronto.resultado}
                        </div>
                        {isAdmin && (
                          <button
                            onClick={() => setEditingConfronto(confronto.id)}
                            className="text-sm bg-yellow-50 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-100"
                          >
                            Editar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="font-bold text-black">Nenhum resultado encontrado</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Histórico */}
      {activeTab === 'historico' && (
        <div className="space-y-6">
          <div className="glass-card-light rounded-lg shadow-sm border border-blue-200/30">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-black">Histórico de Ciclos</h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {desafioCiclos
                .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())
                .map((ciclo) => {
                  const confrontosDoCiclo = getConfrontosDoCiclo(ciclo.id);
                  const concluidos = confrontosDoCiclo.filter(c => c.resultado).length;
                  
                  return (
                    <div key={ciclo.id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-black">
                            {formatQuinzena(ciclo)}
                          </h4>
                          <p className="text-sm font-bold text-black">
                            {concluidos}/{confrontosDoCiclo.length} confrontos concluídos
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            ciclo.status === 'ativo' 
                              ? 'bg-green-50 text-green-700'
                              : ciclo.status === 'concluido'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-red-50 text-red-700'
                          }`}>
                            {ciclo.status === 'ativo' ? 'Ativo' : 
                             ciclo.status === 'concluido' ? 'Concluído' : 'Cancelado'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {desafioCiclos.length === 0 && (
              <div className="text-center py-12">
                <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="font-bold text-black">Nenhum ciclo criado ainda</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};