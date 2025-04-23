import React, { useState } from 'react';
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

  const toggleRound = (roundId: number) => {
    if (expandedRound === roundId) {
      setExpandedRound(null);
    } else {
      setExpandedRound(roundId);
    }
  };

  // Only show completed rounds
  const completedRounds = game.rounds.filter(round => round.isComplete);

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-75 z-[100] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gray-900 rounded-xl border border-purple-600 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="p-4 border-b border-purple-600 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Clock size={20} className="text-cyan-400" />
            <span>Round History</span>
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-800"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-4 flex-grow">
          {completedRounds.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No completed rounds yet</p>
            </div>
          ) : (
            <div className="space-y-4">
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
  );
};

interface RoundHistoryItemProps {
  round: Round;
  isExpanded: boolean;
  onToggle: () => void;
}

const RoundHistoryItem: React.FC<RoundHistoryItemProps> = ({ round, isExpanded, onToggle }) => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <button 
        onClick={onToggle}
        className="w-full p-4 flex justify-between items-center hover:bg-gray-750 transition-colors text-left"
      >
        <div>
          <h3 className="font-medium text-lg">Round {round.id}</h3>
          <p className="text-gray-400 text-sm">{round.prompt.text}</p>
        </div>
        <div className="flex items-center gap-2">
          {round.winningSubmission && (
            <Trophy size={18} className="text-yellow-500" />
          )}
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
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
    </div>
  );
};

interface SubmissionCardProps {
  submission: GifSubmission;
  isWinner: boolean;
}

const SubmissionCard: React.FC<SubmissionCardProps> = ({ submission, isWinner }) => {
  return (
    <div className={`bg-gray-850 rounded-lg overflow-hidden relative ${isWinner ? 'ring-2 ring-yellow-500' : ''}`}>
      <div className="aspect-video overflow-hidden bg-black flex items-center justify-center">
        <img 
          src={submission.gifUrl} 
          alt={`Submission by ${submission.playerName}`}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="p-2 flex justify-between items-center">
        <span className="text-sm font-medium truncate">{submission.playerName}</span>
        {isWinner && (
          <div className="flex items-center gap-1 text-yellow-500">
            <Trophy size={16} />
            <span className="text-xs">Winner</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoundHistory; 