import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor } from './store';
import { SwapPage } from './pages/SwapPage';
import Header from './components/Header';
import CreateWalletModal from './components/modals/CreateWalletModal';
import { Dashboard } from './pages/DashboardPage';
import ConnectWalletModal from './components/modals/ConnectWalletModal';
import { ImportWalletModal } from './components/modals/ImportWalletModal';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  return (
	<PersistGate loading={null} persistor={persistor}>
	  <Router>
		<div className="min-h-screen">
		  <Header />
		  <Routes>
			<Route path="/" element={<Dashboard />} />
			<Route path="/connect-wallet" element={<ConnectWalletModal />} />
			<Route path="/swap" element={<SwapPage />} />
			<Route path="/settings" element={<SettingsPage />} />
		  </Routes>
		  <ConnectWalletModal />
		  <CreateWalletModal />
		  <ImportWalletModal />
		</div>
	  </Router>
	</PersistGate>
  );
}

export default App;
