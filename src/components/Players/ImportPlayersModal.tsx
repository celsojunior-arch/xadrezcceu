import React, { useState } from 'react';
import { X, Upload, Download, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useData } from '../../hooks/useData';
import { CSVPlayerData, ImportResult } from '../../types';

interface ImportPlayersModalProps {
  onClose: () => void;
  onImportComplete: () => void;
}

export const ImportPlayersModal: React.FC<ImportPlayersModalProps> = ({ onClose, onImportComplete }) => {
  const { importPlayersFromCSV, loading } = useData();
  const [csvData, setCsvData] = useState<CSVPlayerData[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      // Skip header if present
      const dataLines = lines[0].toLowerCase().includes('nome') ? lines.slice(1) : lines;
      
      const parsedData: CSVPlayerData[] = [];
      
      dataLines.forEach((line, index) => {
        const parts = line.split(';').map(s => s.trim());
        const [name, birthDate, rating, observations] = parts;
        
        if (name && birthDate) {
          // Convert date format if needed (DD/MM/YYYY to YYYY-MM-DD)
          let formattedDate = birthDate;
          if (birthDate.includes('/')) {
            const [day, month, year] = birthDate.split('/');
            formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          }
          
          // Handle empty or invalid rating
          let playerRating = 1500; // Default rating
          if (rating && rating.trim() !== '' && !isNaN(parseInt(rating))) {
            playerRating = parseInt(rating);
          }
          
          parsedData.push({
            name,
            birthDate: formattedDate,
            rating: playerRating,
            observations: observations || undefined
          });
        }
      });
      
      setCsvData(parsedData);
      setStep('preview');
    };
    
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const result = await importPlayersFromCSV(csvData);
    setImportResult(result);
    setStep('result');
  };

  const downloadTemplate = () => {
    const template = 'nome;data_nasc;rating_atual;obs\nJoão Silva;15/03/1985;1800;Jogador experiente\nMaria Santos;22/07/1990;1600;';
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template_importacao_jogadores.csv';
    link.click();
  };

  const handleComplete = () => {
    onImportComplete();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Importar Jogadores via CSV</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {step === 'upload' && (
            <div className="space-y-6">
              <div className="text-center">
                <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Selecione o arquivo CSV
                </h3>
                <p className="text-gray-600 mb-6">
                  Formato: nome;data_nasc;rating_atual;obs
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="w-full"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Formato do arquivo:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>nome:</strong> Nome completo do jogador</li>
                  <li>• <strong>data_nasc:</strong> Data de nascimento (DD/MM/AAAA ou AAAA-MM-DD)</li>
                  <li>• <strong>rating_atual:</strong> Rating atual (número inteiro)</li>
                  <li>• <strong>obs:</strong> Observações (opcional)</li>
                </ul>
                <button
                  onClick={downloadTemplate}
                  className="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <Download size={16} />
                  Baixar modelo de exemplo
                </button>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Pré-visualização ({csvData.length} jogadores)
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStep('upload')}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={loading || csvData.length === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Importando...' : 'Confirmar Importação'}
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Nome</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Data Nasc.</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Rating</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Observações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {csvData.map((player, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-3 px-4">{player.name}</td>
                        <td className="py-3 px-4">
                          {new Date(player.birthDate).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 px-4">{player.rating}</td>
                        <td className="py-3 px-4">{player.observations || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === 'result' && importResult && (
            <div className="space-y-6">
              <div className="text-center">
                {importResult.success ? (
                  <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                ) : (
                  <XCircle size={48} className="mx-auto text-red-500 mb-4" />
                )}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Importação {importResult.success ? 'Concluída' : 'Concluída com Problemas'}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {importResult.playersImported}
                  </div>
                  <div className="text-sm text-green-700">Jogadores Importados</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {importResult.playersUpdated}
                  </div>
                  <div className="text-sm text-blue-700">Jogadores Atualizados</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {importResult.errors.length}
                  </div>
                  <div className="text-sm text-red-700">Erros</div>
                </div>
              </div>

              {importResult.duplicates.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-yellow-800 mb-2">
                    <AlertTriangle size={20} />
                    <span className="font-medium">Possíveis Duplicatas Detectadas</span>
                  </div>
                  <div className="space-y-2">
                    {importResult.duplicates.map((duplicate, index) => (
                      <div key={index} className="text-sm text-yellow-700">
                        Linha {duplicate.csvRow}: {duplicate.name} - Similar a jogador existente
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {importResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-800 mb-2">
                    <XCircle size={20} />
                    <span className="font-medium">Erros Encontrados</span>
                  </div>
                  <div className="space-y-1">
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-700">{error}</div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                <button
                  onClick={handleComplete}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Concluir
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};