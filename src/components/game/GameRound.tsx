import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Search, 
  ThumbsUp, 
  Gift, 
  UserCheck,
  RefreshCw,
  Trophy,
  Sparkles,
  PlayCircle,
  Wand2,
  ChevronDown,
  X,
  Zap
} from 'lucide-react';
import useGameStore from '../../store/gameStore';
import usePrompt from '../../hooks/usePrompt';
import { useGifs } from '../../hooks/useGifs';
import { nanoid } from 'nanoid';
import toast from 'react-hot-toast';
import type { Game, Player, User, GifSubmission, Round } from '../../types';
import PlayersList from './PlayersList';

// Separated prompt display component
const PromptCard = memo(({ onCustomPromptClick }: { onCustomPromptClick: () => void }) => {
  // Get prompt text from the dedicated hook
  const { promptText, promptId, isLoading, regeneratePrompt } = usePrompt();
  
  const handleRegeneratePrompt = async (gameId: string) => {
    try {
      await regeneratePrompt(gameId);
    } catch (error: any) {
      console.error('Error regenerating prompt:', error);
      toast.error(error.message || 'Failed to regenerate prompt');
    }
  };
  
  return (
    <>
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Wand2 size={20} className="text-cyan-400" />
        <span>Choose a Prompt</span>
      </h3>
      
      <div className="bg-gray-900 p-4 rounded-lg mb-4">
        <div>
          <p className="text-gray-400 text-sm">Current prompt:</p>
          <motion.p 
            key={promptId} 
            className="text-xl font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {promptText}
          </motion.p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <motion.button
          onClick={() => handleRegeneratePrompt(sessionStorage.getItem('currentGameId') || '')}
          className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isLoading}
        >
          <Sparkles size={18} />
          <span>{isLoading ? 'Generating...' : 'Generate New Prompt'}</span>
        </motion.button>
        
        <motion.button
          onClick={onCustomPromptClick}
          className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isLoading}
        >
          <MessageCircle size={18} />
          <span>Create Custom Prompt</span>
        </motion.button>
      </div>
    </>
  );
});

// Compact version for in-round display with isolated state
const InRoundPromptCard = memo(() => {
  // Get prompt text from the same dedicated hook
  const { promptText, promptId } = usePrompt();
  
  return (
    <div>
      <p className="text-gray-400 text-sm">The prompt is:</p>
      <motion.p 
        key={promptId}
        className="text-xl font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {promptText}
      </motion.p>
    </div>
  );
});

interface GameRoundProps {
  game: Game;
  currentPlayer: Player;
  user: User;
}

const GameRound: React.FC<GameRoundProps> = ({ game, currentPlayer, user }) => {
  const { 
    submitGifToGame, 
    selectWinningGif, 
    startNextGameRound,
    setCustomGamePrompt,
    startCurrentGameRound,
    loading 
  } = useGameStore();
  
  // Initialize the prompt store with the current round's prompt
  const promptStore = usePrompt(
    game.rounds[game.currentRound - 1].prompt.text,
    game.rounds[game.currentRound - 1].prompt.id
  );
  
  // Save the current game ID for the isolated components
  useEffect(() => {
    sessionStorage.setItem('currentGameId', game.id);
  }, [game.id]);
  
  // Keep a reference to the last prompt to avoid update loops
  const lastPromptRef = useRef({
    text: game.rounds[game.currentRound - 1].prompt.text,
    id: game.rounds[game.currentRound - 1].prompt.id
  });
  
  // Update prompt store when the current round's prompt changes
  useEffect(() => {
    const currentPrompt = game.rounds[game.currentRound - 1].prompt;
    
    // Only update if the prompt has actually changed
    if (currentPrompt.id !== lastPromptRef.current.id || 
        currentPrompt.text !== lastPromptRef.current.text) {
      
      // Update our ref
      lastPromptRef.current = {
        text: currentPrompt.text,
        id: currentPrompt.id
      };
      
      // Update the store
      promptStore.setPrompt(currentPrompt.text, currentPrompt.id);
    }
  }, [game.rounds, game.currentRound]);
  
  const { 
    searchResults, 
    trendingGifs, 
    selectedGif,
    loading: loadingGifs,
    searchForGifs,
    setSelectedGif
  } = useGifs();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isCustomPromptOpen, setIsCustomPromptOpen] = useState(false);
  const [searchOffset, setSearchOffset] = useState(0);
  const [displayedSearchResults, setDisplayedSearchResults] = useState<any[]>([]);
  const [isGifModalOpen, setIsGifModalOpen] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const gridEndRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  const currentRound = game.rounds[game.currentRound - 1];
  const isJudge = currentPlayer.isJudge;
  const hasSubmitted = currentRound.submissions.some(s => s.playerId === currentPlayer.id);
  const allPlayersSubmitted = currentRound.submissions.length === game.players.filter(p => p.isActive && !p.isJudge).length;
  const roundComplete = currentRound.isComplete;
  const roundStarted = currentRound.hasStarted;
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchOffset(0);
      setDisplayedSearchResults([]);
      setHasSearched(true);
      searchForGifs(searchTerm);
    }
  };
  
  const loadMoreGifs = useCallback(() => {
    if (loadingGifs || !searchTerm || isLoadingMore) return;
    
    setIsLoadingMore(true);
    const newOffset = searchOffset + 20;
    setSearchOffset(newOffset);
    searchForGifs(searchTerm, 20, newOffset);
  }, [loadingGifs, searchTerm, searchOffset, searchForGifs, isLoadingMore]);
  
  useEffect(() => {
    if (searchOffset === 0) {
      setDisplayedSearchResults(searchResults);
    } else if (searchResults.length > 0) {
      // Use a Map to track unique GIFs by ID to avoid duplicates
      const uniqueGifs = new Map();
      
      // Add existing results to map
      displayedSearchResults.forEach(gif => {
        uniqueGifs.set(gif.id, gif);
      });
      
      // Add new results, overwriting any duplicates
      searchResults.forEach(gif => {
        uniqueGifs.set(gif.id, gif);
      });
      
      // Convert map values back to array
      setDisplayedSearchResults(Array.from(uniqueGifs.values()));
    }
    setIsLoadingMore(false);
  }, [searchResults, searchOffset]);
  
  // Setup intersection observer for infinite scroll
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5
    };
    
    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && searchTerm && displayedSearchResults.length > 0) {
        loadMoreGifs();
      }
    };
    
    observerRef.current = new IntersectionObserver(handleObserver, options);
    
    if (gridEndRef.current) {
      observerRef.current.observe(gridEndRef.current);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [searchTerm, displayedSearchResults.length, loadMoreGifs]);
  
  const handleSelectGif = (gif: any) => {
    setSelectedGif(gif);
    setIsGifModalOpen(true);
  };
  
  const handleSubmitGif = async () => {
    if (!selectedGif) {
      toast.error('Please select a GIF first');
      return;
    }
    
    const submission: GifSubmission = {
      id: nanoid(),
      gifId: selectedGif.id,
      gifUrl: selectedGif.images.original.url,
      playerId: user.id,
      playerName: user.displayName || 'Anonymous',
      round: currentRound.id
    };
    
    try {
      await submitGifToGame(game.id, submission);
      toast.success('GIF submitted!');
      setSelectedGif(null);
      setIsGifModalOpen(false);
    } catch (error: any) {
      console.error('Error submitting GIF:', error);
      toast.error(error.message || 'Failed to submit GIF');
    }
  };
  
  const handleSelectWinner = async (submission: GifSubmission) => {
    try {
      await selectWinningGif(game.id, submission.id);
      toast.success(`${submission.playerName}'s GIF wins this round!`);
    } catch (error: any) {
      console.error('Error selecting winner:', error);
      toast.error(error.message || 'Failed to select winner');
    }
  };
  
  const handleNextRound = async () => {
    try {
      await startNextGameRound(game.id);
      toast.success('Starting next round!');
      setSearchTerm('');
      setSelectedGif(null);
    } catch (error: any) {
      console.error('Error starting next round:', error);
      toast.error(error.message || 'Failed to start next round');
    }
  };
  
  const handleRegeneratePrompt = async () => {
    try {
      // Just use the promptStore to update the prompt
      await promptStore.regeneratePrompt(game.id);
    } catch (error: any) {
      console.error('Error regenerating prompt:', error);
      toast.error(error.message || 'Failed to regenerate prompt');
    }
  };
  
  const handleStartRound = async () => {
    try {
      await startCurrentGameRound(game.id);
      toast.success('Round started!');
    } catch (error: any) {
      console.error('Error starting round:', error);
      toast.error(error.message || 'Failed to start round');
    }
  };
  
  const handleSubmitCustomPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customPrompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }
    
    try {
      // Use our isolated prompt state
      await promptStore.setCustomPrompt(game.id, customPrompt);
      setCustomPrompt('');
      setIsCustomPromptOpen(false);
    } catch (error: any) {
      console.error('Error setting custom prompt:', error);
      toast.error(error.message || 'Failed to set custom prompt');
    }
  };
  
  return (
    <div className="grid md:grid-cols-4 gap-6">
      <div className="md:col-span-3">
        <motion.div 
          className="bg-black bg-opacity-90 backdrop-blur-sm border border-purple-600 rounded-xl p-6 shadow-lg mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold">Round {currentRound.id}</h2>
              <p className="text-gray-400 text-sm">
                {isJudge ? "You're the judge this round!" : "Submit your best GIF!"}
              </p>
            </div>
          </div>
          
          {isJudge && !roundStarted ? (
            <div className="bg-gray-800 p-6 rounded-lg mb-6">
              <PromptCard onCustomPromptClick={() => setIsCustomPromptOpen(true)} />
              
              <motion.button
                onClick={handleStartRound}
                className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-lg flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Starting round...</span>
                  </>
                ) : (
                  <>
                    <PlayCircle size={20} />
                    <span>Start Round</span>
                  </>
                )}
              </motion.button>
            </div>
          ) : roundStarted ? (
            <div className="bg-gray-800 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-start">
                <InRoundPromptCard />
                
                {isJudge && !roundComplete && (
                  <motion.button
                    onClick={() => setIsCustomPromptOpen(true)}
                    className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RefreshCw size={14} />
                    Change Prompt
                  </motion.button>
                )}
              </div>
            </div>
          ) : null}
          
          {!isJudge && !hasSubmitted && !roundComplete && roundStarted && (
            <div>
              <form onSubmit={handleSearch} className="mb-4 relative">
                <input
                  type="text"
                  placeholder="Search for GIFs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-3 pl-4 pr-12 text-gray-200 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-cyan-400 hover:text-cyan-300"
                >
                  <Search size={20} />
                </button>
              </form>
              
              <div className="mb-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[400px] overflow-y-auto p-2">
                  {loadingGifs && searchOffset === 0 ? (
                    <div className="col-span-full text-center py-4">
                      <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="mt-2 text-gray-400">Loading GIFs...</p>
                    </div>
                  ) : searchTerm ? (
                    displayedSearchResults.length > 0 ? (
                      <>
                        {displayedSearchResults.map((gif) => (
                          <motion.div
                            key={gif.id}
                            onClick={() => handleSelectGif(gif)}
                            className="aspect-video relative rounded-lg overflow-hidden cursor-pointer border-2 hover:border-cyan-400 border-transparent bg-gray-800"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <img 
                              src={gif.images.fixed_height_small.url} 
                              alt="GIF search result"
                              className="w-full h-full object-cover"
                            />
                          </motion.div>
                        ))}
                        <div 
                          ref={gridEndRef} 
                          className="col-span-full h-4 flex justify-center items-center"
                        >
                          {isLoadingMore && (
                            <div className="w-6 h-6 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                          )}
                        </div>
                      </>
                    ) : hasSearched ? (
                      searchOffset === 0 ? (
                        <div className="col-span-full text-center py-4 text-gray-400">
                          <p>No GIFs found for "{searchTerm}"</p>
                          <p className="text-sm mt-1">Try a different search term</p>
                        </div>
                      ) : (
                        <div className="col-span-full text-center py-4 text-gray-400">
                          <p>No more GIFs found for "{searchTerm}"</p>
                        </div>
                      )
                    ) : (
                      <div className="col-span-full text-center py-4 text-gray-400">
                        <p>Press enter to search for "{searchTerm}"</p>
                      </div>
                    )
                  ) : (
                    <>
                      <div className="col-span-full text-center py-2 text-gray-400">
                        <p>Search for GIFs or browse trending ones below</p>
                      </div>
                      {trendingGifs.slice(0, 8).map((gif) => (
                        <motion.div
                          key={gif.id}
                          onClick={() => handleSelectGif(gif)}
                          className="aspect-video relative rounded-lg overflow-hidden cursor-pointer border-2 hover:border-cyan-400 border-transparent bg-gray-800"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <img 
                            src={gif.images.fixed_height_small.url} 
                            alt="Trending GIF"
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {!isJudge && !roundStarted && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 text-purple-500">
                <Wand2 className="w-full h-full animate-pulse" />
              </div>
              <h3 className="text-xl font-medium mb-2">Waiting for the judge to start the round</h3>
              <p className="text-gray-400">
                The judge is currently choosing a prompt for this round.
              </p>
            </div>
          )}
          
          {!isJudge && hasSubmitted && !roundComplete && roundStarted && (
            <div className="text-center py-8">
              <motion.div
                className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 10 }}
              >
                <ThumbsUp size={32} className="text-white" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">GIF Submitted!</h3>
              <p className="text-gray-400">Waiting for other players to submit their GIFs...</p>
            </div>
          )}
          
          {isJudge && !roundComplete && roundStarted && (
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <UserCheck size={20} className="text-cyan-400" />
                <span>
                  Submissions ({currentRound.submissions.length}/{game.players.filter(p => p.isActive && !p.isJudge).length})
                </span>
              </h3>
              
              {currentRound.submissions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>Waiting for players to submit their GIFs...</p>
                </div>
              ) : !allPlayersSubmitted ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {currentRound.submissions.map((submission) => (
                    <div 
                      key={submission.id}
                      className="aspect-video bg-gray-800 rounded-lg overflow-hidden"
                    >
                      <img 
                        src={submission.gifUrl} 
                        alt="Player submission"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ))}
                  
                  {/* Placeholder for waiting submissions */}
                  {Array.from({ length: game.players.filter(p => p.isActive && !p.isJudge).length - currentRound.submissions.length }).map((_, i) => (
                    <div 
                      key={`placeholder-${i}`}
                      className="aspect-video bg-gray-800 bg-opacity-50 rounded-lg flex items-center justify-center animate-pulse"
                    >
                      <p className="text-gray-500 text-sm">Waiting...</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Trophy size={20} className="text-yellow-500" />
                    <span>Choose a Winner</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentRound.submissions.map((submission) => (
                      <motion.div
                        key={submission.id}
                        className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-cyan-400"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelectWinner(submission)}
                      >
                        <div className="aspect-video">
                          <img 
                            src={submission.gifUrl} 
                            alt="Player submission"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="p-2 text-sm text-center text-gray-300">
                          Click to select as winner
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {roundComplete && (
            <div className="text-center py-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-6">
                  <h3 className="text-2xl font-semibold mb-2 flex items-center justify-center gap-2">
                    <Trophy size={24} className="text-yellow-500" />
                    <span>Round Winner</span>
                  </h3>
                  
                  <p className="text-cyan-400 mb-4">
                    <span className="font-medium">{currentRound.winningSubmission?.playerName}</span> won this round!
                  </p>
                  
                  <div className="max-w-md mx-auto bg-gray-800 rounded-lg overflow-hidden">
                    <img 
                      src={currentRound.winningSubmission?.gifUrl} 
                      alt="Winning submission"
                      className="w-full object-contain"
                    />
                  </div>
                </div>
                
                {isJudge && game.currentRound < game.maxRounds && (
                  <motion.button
                    onClick={handleNextRound}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg shadow-lg flex items-center gap-2 mx-auto hover:from-purple-700 hover:to-pink-700 disabled:opacity-70 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Starting next round...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw size={20} />
                        <span>Next Round</span>
                      </>
                    )}
                  </motion.button>
                )}
                
                {!isJudge && (
                  <p className="text-gray-400">
                    Waiting for the judge to start the next round...
                  </p>
                )}
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
      
      <div className="md:col-span-1">
        <PlayersList game={game} currentPlayer={currentPlayer} />
      </div>
      
      {/* Custom prompt modal */}
      <AnimatePresence>
        {isCustomPromptOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-gray-900 rounded-xl p-6 w-full max-w-md"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <h3 className="text-xl font-semibold mb-4">Create Custom Prompt</h3>
              
              <form onSubmit={handleSubmitCustomPrompt}>
                <textarea
                  placeholder="Enter your custom prompt..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="w-full p-3 bg-gray-800 rounded-lg text-white resize-none h-32 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
                />
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCustomPromptOpen(false)}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    disabled={loading}
                  >
                    {loading ? 'Setting...' : 'Set Prompt'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* GIF Preview Modal */}
      <AnimatePresence>
        {isGifModalOpen && selectedGif && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-gray-900 rounded-xl p-6 w-full max-w-xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Preview</h3>
                <button 
                  onClick={() => setIsGifModalOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex justify-center mb-6 bg-gray-800 p-4 rounded-lg">
                <img 
                  src={selectedGif.images.original.url} 
                  alt="Selected GIF preview"
                  className="max-h-[300px] object-contain"
                />
              </div>
              
              <motion.button
                onClick={handleSubmitGif}
                className="w-full px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-lg shadow-lg flex items-center justify-center gap-2 hover:from-cyan-700 hover:to-blue-700 disabled:opacity-70 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Zap size={20} />
                    <span>Submit This GIF</span>
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameRound;