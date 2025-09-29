import React, { useState } from 'react';
import { TournamentList } from './TournamentList';
import { TournamentForm } from './TournamentForm';
import { TournamentDetail } from './TournamentDetail';
import { Tournament } from '../../types';

export const Tournaments: React.FC = () => {
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'edit' | 'detail'>('list');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | undefined>();

  const handleCreateTournament = () => {
    setSelectedTournament(undefined);
    setCurrentView('create');
  };

  const handleEditTournament = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setCurrentView('edit');
  };

  const handleViewTournament = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedTournament(undefined);
  };

  return (
    <>
      {currentView === 'list' && (
        <TournamentList
          onCreateTournament={handleCreateTournament}
          onEditTournament={handleEditTournament}
          onViewTournament={handleViewTournament}
        />
      )}
      
      {(currentView === 'create' || currentView === 'edit') && (
        <TournamentForm
          tournament={selectedTournament}
          onBack={handleBackToList}
        />
      )}

      {currentView === 'detail' && selectedTournament && (
        <TournamentDetail
          tournament={selectedTournament}
          onBack={handleBackToList}
          onEdit={() => setCurrentView('edit')}
        />
      )}
    </>
  );
};