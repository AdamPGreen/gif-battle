import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Camera, X, Check, LogOut, Copy, Clock, Trophy, Users, Bell } from 'lucide-react';
import { updateUserProfile } from '../../services/auth';
import NotificationSettings from '../NotificationSettings';
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';
import type { User as UserType } from '../../types';

interface UserProfileMenuProps {
  user: UserType;
  onUserUpdate: (updatedUser: UserType) => void;
  // New game-related props
  gameActions?: {
    onCopyInvite: () => void;
    onLeaveGame: () => void;
    onOpenHistory: () => void;
    onViewLastRoundResults: () => void;
    hasCompletedRounds: boolean;
    playersCount: number;
    maxPlayers: number;
    copied: boolean;
  };
}

const UserProfileMenu: React.FC<UserProfileMenuProps> = ({ 
  user, 
  onUserUpdate,
  gameActions 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.photoURL);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const handleAvatarClick = () => {
    setIsOpen(!isOpen);
  };
  
  const handleEditProfile = () => {
    setIsEditing(true);
    setIsOpen(false);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };
  
  const handleSelectAvatar = () => {
    fileInputRef.current?.click();
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      toast.error('Display name cannot be empty');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await updateUserProfile(displayName, avatarFile);
      
      // Update the user state with the new profile info
      onUserUpdate({
        ...user,
        displayName,
        photoURL: result.photoURL
      });
      
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    // Reset form state
    setDisplayName(user.displayName || '');
    setAvatarFile(null);
    setAvatarPreview(user.photoURL);
    setIsEditing(false);
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isEditing) {
        handleCancel();
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isEditing, isOpen]);

  // Handle click outside to close menu
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && isOpen) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isEditing) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isEditing]);
  
  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button */}
      <button 
        onClick={handleAvatarClick}
        className="h-9 w-9 rounded-full overflow-hidden focus:outline-none transition-transform hover:scale-110 flex items-center justify-center"
        aria-label="User Profile"
      >
        {user.photoURL ? (
          <img 
            src={user.photoURL} 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-500 to-purple-600">
            <User size={20} className="text-white" />
          </div>
        )}
      </button>
      
      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && !isEditing && (
          <motion.div 
            className="absolute right-0 top-11 bg-gray-900 border border-purple-600 rounded-lg shadow-lg min-w-[250px] z-50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                {user.photoURL ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img 
                      src={user.photoURL} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-pink-500 to-purple-600">
                    <User size={20} className="text-white" />
                  </div>
                )}
                <div>
                  <div className="font-medium">{user.displayName}</div>
                  <div className="text-sm text-gray-400">{user.email}</div>
                </div>
              </div>
              
              <div className="border-t border-gray-700 pt-3 mt-2 space-y-3">
                <button
                  onClick={handleEditProfile}
                  className="w-full py-2 px-3 text-left text-sm hover:bg-gray-700 bg-gray-800 rounded-md transition-colors flex items-center gap-2"
                >
                  <User size={16} />
                  <span>Edit Profile</span>
                </button>
              
                <button
                  onClick={() => {
                    handleEditProfile();
                    // Add a small delay to ensure modal is open before scrolling
                    setTimeout(() => {
                      const notificationSection = document.querySelector('.notification-settings-section');
                      notificationSection?.scrollIntoView({ behavior: 'smooth' });
                    }, 200);
                  }}
                  className="w-full py-2 px-3 text-left text-sm hover:bg-gray-700 bg-gray-800 rounded-md transition-colors flex items-center gap-2"
                >
                  <Bell size={16} />
                  <span>Notification Settings</span>
                </button>
              
                {/* Game-specific actions */}
                {gameActions && gameActions.hasCompletedRounds && (
                  <>
                    <motion.button
                      onClick={() => {
                        gameActions.onOpenHistory();
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-2 w-full text-white bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-md text-sm"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Clock size={16} />
                      <span>Round History</span>
                    </motion.button>
                    
                    <motion.button
                      onClick={() => {
                        gameActions.onViewLastRoundResults();
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-2 w-full text-white bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-md text-sm"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Trophy size={16} />
                      <span>Last Round Results</span>
                    </motion.button>
                  </>
                )}
                
                {gameActions && (
                  <motion.button
                    onClick={() => {
                      gameActions.onLeaveGame();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-2 w-full text-white bg-red-600 hover:bg-red-700 px-3 py-2 rounded-md text-sm"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <LogOut size={16} />
                    <span>Exit Game</span>
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Edit Profile Modal - Using Portal to render at document root */}
      {isEditing && createPortal(
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-[9999]"
          onClick={(e) => {
            // Close modal when clicking on the backdrop
            if (e.target === e.currentTarget) {
              handleCancel();
            }
          }}
        >
          <motion.div 
            className="bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4 my-4 text-white overflow-y-auto max-h-[90vh]"
            initial={{ opacity: 0, scale: 0.9, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Edit Profile</h2>
              <button 
                onClick={handleCancel}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-700">
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt="Avatar preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-500 to-purple-600">
                        <User size={36} className="text-white" />
                      </div>
                    )}
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleSelectAvatar}
                    className="absolute bottom-0 right-0 bg-purple-600 rounded-full p-2 shadow-lg hover:bg-purple-700 transition-colors"
                  >
                    <Camera size={16} className="text-white" />
                  </button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-white mb-1">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full py-2 px-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-1"
                >
                  {isSubmitting ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check size={16} /> 
                      <span>Save</span>
                    </>
                  )}
                </button>
              </div>
            </form>
            
            {/* Notification Settings Section */}
            <div className="mt-8 border-t border-gray-700 pt-6 notification-settings-section">
              <div className="flex items-center gap-2 mb-4">
                <Bell size={20} className="text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Notifications</h3>
              </div>
              
              {user && <NotificationSettings userId={user.id} />}
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default UserProfileMenu; 