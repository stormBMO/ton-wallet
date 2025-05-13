import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor } from './store';
import { Dashboard } from './pages/Dashboard';
import { SwapPage } from './pages/SwapPage';
import Header from './components/Header';
import CreateWalletModal from './components/CreateWalletModal';

function App() {
  return (
    <PersistGate loading={null} persistor={persistor}>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Header />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/swap" element={<SwapPage />} />
          </Routes>
          <CreateWalletModal />
        </div>
      </Router>
    </PersistGate>
  );
}

export default App;
