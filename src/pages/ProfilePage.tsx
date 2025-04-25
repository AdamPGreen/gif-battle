import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, UserCircle, Upload, Save, Loader2, Bell, PhoneCall } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { updateUserProfile } from '../services/auth';
import NotificationSettings from '../components/NotificationSettings';
import toast from 'react-hot-toast';
import { carriers, formatPhoneNumber, isValidPhoneNumber } from '../utils/smsGateways';

const ProfilePage: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  const [displayName, setDisplayName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New phone and carrier state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [mobileCarrier, setMobileCarrier] = useState('');
  const [phoneError, setPhoneError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    // If user is null after loading completes, redirect to home
    if (!loading && !user) {
      navigate('/');
    }
    
    // Set initial display name from user data
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
    
    // Set initial avatar preview from user data
    if (user?.photoURL) {
      setAvatarPreview(user.photoURL);
    }
    
    // Set initial phone number and carrier
    if (user?.phoneNumber) {
      setPhoneNumber(user.phoneNumber);
    }
    
    if (user?.mobileCarrier) {
      setMobileCarrier(user.mobileCarrier);
    }
  }, [user, loading, navigate]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);
    
    // Validate when non-empty
    if (value && !isValidPhoneNumber(value)) {
      setPhoneError('Please enter a valid 10-digit phone number');
    } else {
      setPhoneError('');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    // Validate phone number if provided
    if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
      setPhoneError('Please enter a valid 10-digit phone number');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Format phone number for storage
      const formattedPhone = phoneNumber ? formatPhoneNumber(phoneNumber) : undefined;
      
      await updateUserProfile(
        displayName, 
        avatarFile, 
        formattedPhone,
        mobileCarrier || undefined
      );
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className="min-h-screen bg-gray-900 flex flex-col items-center p-4"
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(110, 0, 255, 0.15) 0%, transparent 25%),
          radial-gradient(circle at 80% 20%, rgba(0, 209, 255, 0.15) 0%, transparent 20%),
          radial-gradient(circle at 50% 80%, rgba(255, 0, 153, 0.15) 0%, transparent 30%)
        `
      }}
    >
      <div className="w-full max-w-2xl mt-16">
        <motion.button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-300 hover:text-white mb-6"
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </motion.button>
        
        <motion.div 
          className="bg-black bg-opacity-70 border border-purple-800 rounded-xl p-6 shadow-xl backdrop-blur-sm mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <UserCircle size={24} className="text-purple-400" />
            <span>Edit Profile</span>
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center mb-6">
              <div 
                className="w-32 h-32 rounded-full mb-4 bg-gray-800 overflow-hidden border-2 border-purple-500 flex items-center justify-center relative"
              >
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Profile preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserCircle size={80} className="text-gray-600" />
                )}
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              
              <motion.button
                type="button"
                onClick={triggerFileInput}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Upload size={18} />
                <span>Upload Photo</span>
              </motion.button>
            </div>
            
            <div>
              <label htmlFor="displayName" className="block mb-2 text-sm font-medium text-gray-300">
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your display name"
                required
              />
            </div>
            
            {/* New Phone Number Field */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <PhoneCall size={18} className="text-purple-400" />
                <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-300">
                  Phone Number (for SMS notifications)
                </label>
              </div>
              <input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                className={`w-full px-4 py-3 bg-gray-800 border ${
                  phoneError ? 'border-red-500' : 'border-gray-700'
                } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500`}
                placeholder="10-digit number (e.g., 1234567890)"
              />
              {phoneError && (
                <p className="mt-1 text-sm text-red-500">{phoneError}</p>
              )}
              <p className="mt-1 text-xs text-gray-400">
                For SMS notifications via carrier email gateways. We don't share this information.
              </p>
            </div>
            
            {/* New Mobile Carrier Field */}
            <div>
              <label htmlFor="mobileCarrier" className="block mb-2 text-sm font-medium text-gray-300">
                Mobile Carrier
              </label>
              <select
                id="mobileCarrier"
                value={mobileCarrier}
                onChange={(e) => setMobileCarrier(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select your carrier</option>
                {carriers.map((carrier) => (
                  <option key={carrier} value={carrier}>
                    {carrier}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-400">
                Required for SMS notifications. Select the carrier associated with your phone number.
              </p>
            </div>
            
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg shadow-lg flex items-center justify-center gap-2 hover:from-purple-700 hover:to-pink-700 disabled:opacity-70 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>Save Profile</span>
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
        
        {user && (
          <motion.div 
            className="bg-black bg-opacity-70 border border-purple-800 rounded-xl p-6 shadow-xl backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Bell size={24} className="text-purple-400" />
              <span>Notifications</span>
            </h2>
            
            <NotificationSettings userId={user.uid} />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage; 