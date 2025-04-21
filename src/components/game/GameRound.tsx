import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Search, 
  ThumbsUp, 
  Gift, 
  Timer, 
  UserCheck,
  RefreshCw,
  Trophy
} from 'lucide-react';
import useGameStore from '../../store/gameStore';
import { useGifs } from '../../hooks/useGifs';
import { nanoid } from 'nanoid';
import toast from 'react-hot-toast';
import type { Game, Player, User, GifSubmission, Round } from '../../types';
import PlayersList from './PlayersList';

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
    loading 
  } = useGameStore();
  
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
  
  const currentRound = game.rounds[game.currentRound - 1];
  const isJudge = currentPlayer.isJudge;
  const hasSubmitted = currentRound.submissions.some(s => s.playerId === currentPlayer.id);
  const allPlayersSubmitted = currentRound.submissions.length === game.players.filter(p => p.isActive && !p.isJudge).length;
  const roundComplete = currentRound.isComplete;
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchForGifs(searchTerm);
    }
  };
  
  const handleSelectGif = (gif: any) => {
    setSelectedGif(gif);
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
  
  const handleSubmitCustomPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customPrompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }
    
    try {
      await setCustomGamePrompt(game.id, customPrompt);
      toast.success('Custom prompt set!');
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
            
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <Timer size={18} className="text-cyan-400" />
              <span className="text-sm">Time remaining: 2:00</span>
            </div>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-2">
                <MessageCircle size={24} className="text-pink-500 mt-1" />
                <div>
                  <p className="text-gray-400 text-sm">The prompt is:</p>
                  <p className="text-xl font-medium">{currentRound.prompt.text}</p>
                </div>
              </div>
              
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
          
          {!isJudge && !hasSubmitted && !roundComplete && (
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
              
              <div className="mb-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto p-2">
                  {loadingGifs ? (
                    <div className="col-span-full text-center py-4">
                      <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="mt-2 text-gray-400">Loading GIFs...</p>
                    </div>
                  ) : searchTerm ? (
                    searchResults.length > 0 ? (
                      searchResults.map((gif) => (
                        <motion.div
                          key={gif.id}
                          onClick={() => handleSelectGif(gif)}
                          className={`aspect-video relative rounded-lg overflow-hidden cursor-pointer border-2 hover:border-cyan-400 ${
                            selectedGif?.id === gif.id ? 'border-cyan-400 ring-2 ring-cyan-400' : 'border-transparent'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <img 
                            src={gif.images.fixed_height_small.url} 
                            alt="GIF search result"
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-4 text-gray-400">
                        <p>No GIFs found for "{searchTerm}"</p>
                      </div>
                    )
                  ) : (
                    trendingGifs.slice(0, 8).map((gif) => (
                      <motion.div
                        key={gif.id}
                        onClick={() => handleSelectGif(gif)}
                        className={`aspect-video relative rounded-lg overflow-hidden cursor-pointer border-2 hover:border-cyan-400 ${
                          selectedGif?.id === gif.id ? 'border-cyan-400 ring-2 ring-cyan-400' : 'border-transparent'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <img 
                          src={gif.images.fixed_height_small.url} 
                          alt="Trending GIF"
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
              
              {selectedGif && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Selected GIF:</h3>
                  <div className="max-w-sm mx-auto">
                    <div className="aspect-video rounded-lg overflow-hidden">
                      <img 
                        src={selectedGif.images.fixed_height.url} 
                        alt="Selected GIF"
                        className="w-full h-full object-contain bg-gray-800"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-center">
                <motion.button
                  onClick={handleSubmitGif}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-lg shadow-lg flex items-center gap-2 hover:from-cyan-700 hover:to-blue-700 disabled:opacity-70 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading || !selectedGif}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Gift size={20} />
                      <span>Submit GIF</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          )}
          
          {!isJudge && hasSubmitted && !roundComplete && (
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
          
          {isJudge && !roundComplete && (
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
                  <p className="mb-4 text-center font-medium">All players have submitted! Choose the winning GIF:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {currentRound.submissions.map((submission) => (
                      <motion.div 
                        key={submission.id}
                        className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-cyan-400 transition-all"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelectWinner(submission)}
                      >
                        <img 
                          src={submission.gifUrl} 
                          alt="Player submission"
                          className="w-full aspect-video object-contain"
                        />
                        <div className="p-3 border-t border-gray-700">
                          <button className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white font-medium">
                            Select Winner
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {roundComplete && (
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Trophy size={20} className="text-yellow-500" />
                <span>Round Results</span>
              </h3>
              
              <div className="text-center mb-6">
                <p className="mb-2">The winning GIF for the prompt:</p>
                <p className="text-xl font-medium mb-4">"{currentRound.prompt.text}"</p>
                
                <div className="max-w-md mx-auto mb-4">
                  <motion.div 
                    className="bg-gray-800 rounded-lg overflow-hidden border-4 border-yellow-500"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                  >
                    <img 
                      src={currentRound.winningSubmission?.gifUrl} 
                      alt="Winning GIF"
                      className="w-full aspect-video object-contain"
                    />
                  </motion.div>
                </div>
                
                <p className="text-lg font-semibold mb-1">
                  Submitted by: 
                  <span className="text-cyan-400 ml-2">
                    {currentRound.winningSubmission?.playerName}
                  </span>
                </p>
                
                <p className="text-gray-400 mb-6">
                  +1 point
                </p>
                
                {isJudge && (
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
              </div>
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
            className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-gray-900 rounded-xl border border-purple-600 p-6 max-w-md w-full"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <h3 className="text-xl font-semibold mb-4">Set Custom Prompt</h3>
              
              <form onSubmit={handleSubmitCustomPrompt}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Enter your prompt:
                  </label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="w-full h-24 p-3 text-gray-200 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., When you realize you forgot to turn in your assignment"
                  />
                </div>
                
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCustomPromptOpen(false)}
                    className="px-4 py-2 text-gray-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg shadow-md hover:from-purple-700 hover:to-pink-700"
                  >
                    Set Prompt
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameRound;