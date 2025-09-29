import React, { useState } from 'react';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './components/Dashboard/Dashboard';
import { Players } from './components/Players/Players';
import { Tournaments } from './components/Tournaments/Tournaments';
import { DesafioQuinzenal } from './components/DesafioQuinzenal/DesafioQuinzenal';
import { Reports } from './components/Reports/Reports';
import { Settings } from './components/Settings/Settings';
import { Classificacao } from './components/Classificacao/Classificacao';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'classificacao':
        return <Classificacao />;
      case 'players':
        return <Players />;
      case 'tournaments':
        return <Tournaments />;
      case 'desafio-quinzenal':
        return <DesafioQuinzenal />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderCurrentPage()}
    </Layout>
  );
}

export default App;