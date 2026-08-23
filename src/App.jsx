import React, { useState } from 'react';
import { AppShell } from './components/AppShell';
import MatrizProdutividadeTable from './components/MatrizProdutividadeTable';
import Equipe from './components/Equipe';
import TvMode from './components/TvMode';
import BiFinanceiro from './components/BiFinanceiro';
import DossieColaborador from './components/DossieColaborador';
import OperacaoTerminal from './components/OperacaoTerminal';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  if (currentView === 'tv') {
    return <TvMode onExit={() => setCurrentView('dashboard')} />;
  }

  return (
    <AppShell currentView={currentView} setCurrentView={setCurrentView}>
      <div className="max-w-7xl mx-auto">
        {currentView === 'dashboard' && <MatrizProdutividadeTable />}
        {currentView === 'equipe' && <Equipe />}
        {currentView === 'financeiro' && <BiFinanceiro />}
        {currentView === 'dossie' && <DossieColaborador />}
        {currentView === 'operacao' && <OperacaoTerminal />}
      </div>
    </AppShell>
  );
}

export default App;
