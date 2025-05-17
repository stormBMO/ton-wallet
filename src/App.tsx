import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor } from './store';
import { SwapPage } from './pages/SwapPage';
import Header from './components/Header';
import CreateWalletModal from './components/modals/CreateWalletModal';
import { Dashboard } from './pages/DashboardPage';
import ConnectWalletModal from './components/modals/ConnectWalletModal';

function App() {
  return (
	<PersistGate loading={null} persistor={persistor}>
	  <Router>
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
		  <Header />
		  <Routes>
			<Route path="/dashboard" element={<Dashboard />} />
			<Route path="/swap" element={<SwapPage />} />
		  </Routes>
		  <CreateWalletModal />
		  <ConnectWalletModal />
		</div>
	  </Router>
	</PersistGate>
  );
}

export default App;
