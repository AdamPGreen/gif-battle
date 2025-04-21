import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ChakraProvider } from '@chakra-ui/react';
import HomePage from './pages/HomePage';
import GameRoom from './components/game/GameRoom';
import InvitePage from './pages/InvitePage';
import { useAuth } from './hooks/useAuth';
import ErrorBoundary from './components/ErrorBoundary';
import { trackEvent } from './config/firebase';

function App() {
  const { user, loading } = useAuth();
  
  // Track app initialization
  React.useEffect(() => {
    trackEvent('app_initialized');
  }, []);

  return (
    <ErrorBoundary>
      <ChakraProvider>
        <Router>
          <div className="font-sans text-white bg-gray-900 min-h-screen">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/game/:gameId" element={
                user ? (
                  <ErrorBoundary
                    fallback={
                      <div className="p-6 text-center">
                        <h2 className="text-2xl font-bold mb-4">Game Room Error</h2>
                        <p className="mb-4">There was a problem loading the game room.</p>
                        <a href="/" className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">
                          Return Home
                        </a>
                      </div>
                    }
                  >
                    <GameRoom user={user} />
                  </ErrorBoundary>
                ) : <HomePage />
              } />
              <Route path="/invite/:gameId" element={
                <ErrorBoundary>
                  <InvitePage />
                </ErrorBoundary>
              } />
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
      </ChakraProvider>
    </ErrorBoundary>
  );
}

export default App;