import React, { useState } from 'react';
import { PlayerList } from './PlayerList';
import { PlayerForm } from './PlayerForm';
import { ImportPlayersModal } from './ImportPlayersModal';
import { Player } from '../../types';

export const Players: React.FC = () => {
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