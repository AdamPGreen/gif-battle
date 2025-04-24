import React, { useEffect, useRef, memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import type { Round, GifSubmission, Player } from '../../types';
import confetti from 'canvas-confetti';

// Define keyframe animation for the gradient text
const gradientAnimation = `
  @keyframes gradient {
    0% {
      background-position: 0% center;
    }
    100% {
      background-position: 200% center;
    }
  }
`;

interface RoundResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  round: Round;
  currentPlayer: Player;
}

// Memoize the modal to prevent unnecessary renders
const RoundResultsModal: React.FC<RoundResultsModalProps> = memo(({ 
  isOpen, 
  onClose, 
  round, 
  currentPlayer 
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const isWinner = round.winningSubmission?.playerId === currentPlayer.id;
  const [confettiTriggered, setConfettiTriggered] = useState(false);
  
  // Reset confetti state if the round changes
  useEffect(() => {
    setConfettiTriggered(false);
  }, [round.id]);
  
  // Add a close handler that resets state properly
  const handleClose = () => {
    setConfettiTriggered(false);
    onClose();
  };
  
  // Prevent event propagation to ensure clicks inside modal don't close it
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Trigger confetti animation if current player is the winner
  useEffect(() => {
    // Only trigger once when modal opens and user is winner
    if (isOpen && isWinner && !confettiTriggered) {
      setConfettiTriggered(true);
      
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
    
    // Reset confetti trigger when modal closes
    if (!isOpen) {
      setConfettiTriggered(false);
    }
  }, [isOpen, isWinner, confettiTriggered]);

  // Only render content when modal is open to improve performance
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          {/* Inject the CSS animation */}
          <style dangerouslySetInnerHTML={{ __html: gradientAnimation }} />
          
          <motion.div
            ref={modalRef}
            className="bg-black md:bg-gray-900 w-full max-w-4xl rounded-xl border border-purple-600 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto relative"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", bounce: 0.2 }}
            onClick={handleModalClick}
          >
            <button 
              onClick={handleClose}
              className="absolute top-3 right-3 p-1 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors z-10"
            >
              <X size={20} />
            </button>
            
            <div className="p-4 md:p-6">
              <div className="text-center mb-4">
                <h2 className="text-base md:text-lg font-medium mb-2 text-gray-300">
                  Round {round.id} Results
                </h2>
                
                {isWinner ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                      opacity: 1, 
                      y: 0
                    }}
                    transition={{ 
                      opacity: { delay: 0.3, duration: 0.5 },
                      y: { delay: 0.3, duration: 0.5 }
                    }}
                  >
                    <span 
                      className="text-2xl md:text-3xl font-bold flex items-center justify-center gap-2 bg-clip-text text-transparent"
                      style={{
                        backgroundImage: "linear-gradient(90deg, #6E00FF 0%, #FF0099 50%, #00D1FF 100%)",
                        backgroundSize: "200% auto",
                        backgroundPosition: "0% center",
                        animation: "gradient 10s linear infinite",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      <Sparkles size={20} className="text-yellow-400" />
                      <span>You won this round!</span>
                      <Sparkles size={20} className="text-yellow-400" />
                    </span>
                  </motion.div>
                ) : (
                  <motion.div 
                    animate={{ 
                      opacity: 1
                    }}
                    transition={{ 
                      duration: 0.5
                    }}
                  >
                    <span 
                      className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent"
                      style={{
                        backgroundImage: "linear-gradient(90deg, #6E00FF 0%, #FF0099 50%, #00D1FF 100%)",
                        backgroundSize: "200% auto",
                        backgroundPosition: "0% center",
                        animation: "gradient 10s linear infinite",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {round.winningSubmission?.playerName} won this round!
                    </span>
                  </motion.div>
                )}
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <span>Round Prompt:</span>
                </h3>
                <div className="bg-gray-800 p-3 rounded-lg mb-4">
                  <p className="text-base text-white">{round.prompt.text}</p>
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
                        loading="lazy"
                      />
                    </div>
                    <div className="p-2 flex justify-between items-center">
                      <span className="text-sm font-medium">{round.winningSubmission?.playerName}</span>
                      <div className="bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
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
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default RoundResultsModal; 