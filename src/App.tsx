import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor } from './store';
import { SwapPage } from './pages/SwapPage';
import Header from './components/Header';
import { Dashboard } from './pages/DashboardPage';
import ConnectWalletModal from './components/modals/ConnectWalletModal';
import { SettingsPage } from './pages/SettingsPage';
import TonConnectGate from './components/TonConnectGate';
import { TonConnectDebug } from './components/TonConnectDebug';

function App() {
    return (
        <PersistGate loading={null} persistor={persistor}>
            <Router>
                <div className='min-h-screen'>
                    <Header />
                    <TonConnectGate />
                    <TonConnectDebug />
                    <Routes>
                        <Route path='/' element={<Dashboard />} />
                        <Route path='/swap' element={<SwapPage />} />
                        <Route path='/settings' element={<SettingsPage />} />
                    </Routes>
                    <ConnectWalletModal />
                </div>
            </Router>
        </PersistGate>
    );
}

export default App;
