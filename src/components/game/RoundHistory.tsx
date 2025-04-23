import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Trophy, ChevronDown, ChevronUp, X } from 'lucide-react';
import type { Game, Round, GifSubmission } from '../../types';

interface RoundHistoryProps {
  game: Game;
  isOpen: boolean;
  onClose: () => void;
}

const RoundHistory: React.FC<RoundHistoryProps> = ({ game, isOpen, onClose }) => {
  const [expandedRound, setExpandedRound] = useState<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const toggleRound = (roundId: number) => {
    if (expandedRound === roundId) {
      setExpandedRound(null);
    } else {
      setExpandedRound(roundId);
    }
  };

  // Handle click outside to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Only show completed rounds
  const completedRounds = game.rounds.filter(round => round.isComplete);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-90 z-[100] flex items-start md:items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleBackdropClick}
      >
        <motion.div
          ref={modalRef}
          className="bg-black md:bg-gray-900 w-full h-full md:h-auto md:max-w-3xl md:max-h-[90vh] md:rounded-xl md:border md:border-purple-600 flex flex-col overflow-hidden"
          initial={{ 
            opacity: 0,
            y: typeof window !== 'undefined' && window.innerWidth < 768 ? 100 : 0 
          }}
          animate={{ 
            opacity: 1,
            y: 0
          }}
          exit={{ 
            opacity: 0,
            y: typeof window !== 'undefined' && window.innerWidth < 768 ? 100 : 0
          }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-purple-600 flex justify-between items-center sticky top-0 bg-black md:bg-gray-900 z-10">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Clock size={20} className="text-cyan-400" />
              <span>Round History</span>
            </h2>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
              aria-label="Close round history"
            >
              <X size={20} />
            </button>
          </div>

          <div className="overflow-y-auto flex-grow pb-safe overscroll-contain">
            {completedRounds.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>No completed rounds yet</p>
              </div>
            ) : (
              <div className="space-y-1 p-4">
                {completedRounds.map((round) => (
                  <RoundHistoryItem 
                    key={round.id} 
                    round={round} 
                    isExpanded={expandedRound === round.id}
                    onToggle={() => toggleRound(round.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

interface RoundHistoryItemProps {
  round: Round;
  isExpanded: boolean;
  onToggle: () => void;
}

const RoundHistoryItem: React.FC<RoundHistoryItemProps> = ({ round, isExpanded, onToggle }) => {
  return (
    <motion.div 
      className="bg-gray-800 rounded-lg overflow-hidden border-b border-gray-700 md:border-none mb-2"
      initial={{ opacity: 0.9 }}
      whileHover={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.button 
        onClick={onToggle}
        className="w-full p-4 flex justify-between items-center hover:bg-gray-750 transition-colors text-left"
        whileTap={{ backgroundColor: 'rgba(31, 41, 55, 0.8)' }}
      >
        <div className="flex-1 mr-2">
          <h3 className="font-medium text-lg">Round {round.id}</h3>
          <p className="text-gray-400 text-sm">{round.prompt.text}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown size={20} />
          </motion.div>
        </div>
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t border-gray-700">
              <h4 className="text-md font-medium mb-3">Submissions:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {round.submissions.map((submission) => (
                  <SubmissionCard 
                    key={submission.id} 
                    submission={submission} 
                    isWinner={round.winningSubmission?.id === submission.id}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface SubmissionCardProps {
  submission: GifSubmission;
  isWinner: boolean;
}

const SubmissionCard: React.FC<SubmissionCardProps> = ({ submission, isWinner }) => {
  return (
    <motion.div 
      className={`bg-gray-850 rounded-xl overflow-hidden relative ${isWinner ? 'ring-2 ring-yellow-500' : ''}`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {isWinner && (
        <div className="absolute top-2 right-2 z-10 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
          <Trophy size={12} />
          <span>Winner</span>
        </div>
      )}
      <div className="aspect-video overflow-hidden bg-black flex items-center justify-center">
        <img 
          src={submission.gifUrl} 
          alt={`Submission by ${submission.playerName}`}
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>
      <div className="p-3 flex justify-between items-center">
        <span className="text-sm font-medium">{submission.playerName}</span>
      </div>
    </motion.div>
  );
};

export default RoundHistory; 