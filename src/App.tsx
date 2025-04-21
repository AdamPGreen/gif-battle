import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import GameRoom from './components/game/GameRoom';
import InvitePage from './pages/InvitePage';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, loading } = useAuth();

  return (
    <Router>
      <div className="font-sans text-white bg-gray-900 min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/game/:gameId" element={
            user ? <GameRoom user={user} /> : <HomePage />
          } />
          <Route path="/invite/:gameId" element={<InvitePage />} />
        </Routes>
        
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#333',
              color: '#fff',
              borderRadius: '8px',
            },
            success: {
              iconTheme: {
                primary: '#6E00FF',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#FF0099',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;