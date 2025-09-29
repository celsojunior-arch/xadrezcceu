import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PlayerList } from './PlayerList';
import { PlayerForm } from './PlayerForm';
import { ImportPlayersModal } from './ImportPlayersModal';
import { Player } from '../../types';

export const Players: React.FC = () => {
  const { isAdmin } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | undefined>();

  const handleCreatePlayer = () => {
    setEditingPlayer(undefined);
    setShowForm(true);
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setShowForm(true);
  };

  const handleImportPlayers = () => {
    setShowImport(true);
  };
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPlayer(undefined);
  };

  const handleSavePlayer = () => {
    setShowForm(false);
    setEditingPlayer(undefined);
  };

  const handleImportComplete = () => {
    setShowImport(false);
  };

  // Redirect non-admin users
  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Users size={48} className="mx-auto" />
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
    <>
      <PlayerList
        onCreatePlayer={handleCreatePlayer}
        onEditPlayer={handleEditPlayer}
        onImportPlayers={handleImportPlayers}
      />
      
      {showForm && (
        <PlayerForm
          player={editingPlayer}
          onClose={handleCloseForm}
          onSave={handleSavePlayer}
        />
      )}
      
      {showImport && (
        <ImportPlayersModal
          onClose={() => setShowImport(false)}
          onImportComplete={handleImportComplete}
        />
      )}
    </>
  );
};