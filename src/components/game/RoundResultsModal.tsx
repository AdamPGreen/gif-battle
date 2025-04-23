import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ThumbsUp, Sparkles } from 'lucide-react';
import type { Round, GifSubmission, Player } from '../../types';
import confetti from 'canvas-confetti';

interface RoundResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  round: Round;
  currentPlayer: Player;
}

const RoundResultsModal: React.FC<RoundResultsModalProps> = ({ 
  isOpen, 
  onClose, 
  round, 
  currentPlayer 
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const isWinner = round.winningSubmission?.playerId === currentPlayer.id;
  
  // Prevent event propagation to ensure clicks inside modal don't close it
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Trigger confetti animation if current player is the winner
  useEffect(() => {
    if (isOpen && isWinner) {
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      
      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };
      
      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        
        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }
        
        const particleCount = 50 * (timeLeft / duration);
        
        // Launch confetti from both sides
        confetti({
          particleCount: Math.floor(randomInRange(particleCount * 0.5, particleCount)),
          angle: randomInRange(55, 125),
          spread: randomInRange(50, 70),
          origin: { x: randomInRange(0.1, 0.3), y: randomInRange(0.4, 0.6) },
          colors: ['#6E00FF', '#FF0099', '#00D1FF', '#FFD700'],
          zIndex: 1100
        });
        
        confetti({
          particleCount: Math.floor(randomInRange(particleCount * 0.5, particleCount)),
          angle: randomInRange(55, 125),
          spread: randomInRange(50, 70),
          origin: { x: randomInRange(0.7, 0.9), y: randomInRange(0.4, 0.6) },
          colors: ['#6E00FF', '#FF0099', '#00D1FF', '#FFD700'],
          zIndex: 1100
        });
      }, 250);
      
      return () => clearInterval(interval);
    }
  }, [isOpen, isWinner]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            ref={modalRef}
            className="bg-black md:bg-gray-900 w-full max-w-4xl rounded-xl border border-purple-600 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", bounce: 0.2 }}
            onClick={handleModalClick}
          >
            <div className="p-4 md:p-6">
              <div className="text-center mb-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3"
                >
                  <Trophy size={24} className="text-white" />
                </motion.div>
                
                <h2 className="text-xl md:text-2xl font-bold mb-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                  Round {round.id} Results
                </h2>
                
                {isWinner ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-center gap-2 text-cyan-400 text-lg font-medium"
                  >
                    <Sparkles size={16} className="text-yellow-400" />
                    <span>You won this round!</span>
                    <Sparkles size={16} className="text-yellow-400" />
                  </motion.div>
                ) : (
                  <p className="text-gray-300">
                    <span className="font-medium text-cyan-400">{round.winningSubmission?.playerName}</span> won this round!
                  </p>
                )}
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <span>Round Prompt:</span>
                </h3>
                <div className="bg-gray-800 p-3 rounded-lg mb-4">
                  <p className="text-base italic text-white">{round.prompt.text}</p>
                </div>
                
                <h3 className="text-lg font-semibold mb-3">All Submissions:</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Winning submission */}
                  <motion.div 
                    className="bg-gray-800 rounded-lg overflow-hidden col-span-1 border-2 border-yellow-500"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="aspect-video overflow-hidden bg-black flex items-center justify-center">
                      <img 
                        src={round.winningSubmission?.gifUrl} 
                        alt={`Winning GIF by ${round.winningSubmission?.playerName}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="p-2 flex justify-between items-center">
                      <span className="text-sm font-medium">{round.winningSubmission?.playerName}</span>
                      <div className="bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Trophy size={10} />
                        <span>Winner</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Other submissions */}
                  {round.submissions
                    .filter(submission => submission.id !== round.winningSubmission?.id)
                    .map(submission => (
                      <motion.div 
                        key={submission.id}
                        className="bg-gray-800 rounded-lg overflow-hidden"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="aspect-video overflow-hidden bg-black flex items-center justify-center">
                          <img 
                            src={submission.gifUrl} 
                            alt={`Submission by ${submission.playerName}`}
                            className="w-full h-full object-contain"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-2 flex justify-between items-center">
                          <span className="text-sm font-medium">{submission.playerName}</span>
                          {submission.playerId === currentPlayer.id && (
                            <div className="bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                              You
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>
              
              <div className="flex justify-center">
                <motion.button
                  onClick={onClose}
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-medium rounded-lg shadow-lg flex items-center gap-2 hover:from-purple-700 hover:to-cyan-700"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ThumbsUp size={18} />
                  <span>Continue</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RoundResultsModal; 