import { useState, useEffect, useCallback } from 'react';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { User } from '../types';

type UsersCache = {
  [userId: string]: User;
};

interface UseUsersOptions {
  initialUsers?: UsersCache;
}

/**
 * Hook to fetch and cache user data for multiple user IDs
 */
export const useUsers = (initialUserIds: string[] = [], options?: UseUsersOptions) => {
  const [users, setUsers] = useState<UsersCache>(options?.initialUsers || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch a single user by ID
  const fetchUser = useCallback(async (userId: string) => {
    try {
      // Check if we already have this user in our cache
      if (users[userId]) {
        return users[userId];
      }

      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data() as User;
        setUsers(prevUsers => ({
          ...prevUsers,
          [userId]: userData
        }));
        return userData;
      } else {
        // If user doesn't exist, just create a placeholder
        const placeholderUser = {
          id: userId,
          displayName: null,
          email: null,
          photoURL: null
        };
        
        setUsers(prevUsers => ({
          ...prevUsers,
          [userId]: placeholderUser
        }));
        
        return placeholderUser;
      }
    } catch (err: any) {
      console.error('Error fetching user:', err);
      setError(err.message || 'Failed to fetch user');
      return null;
    }
  }, [users]);

  // Fetch multiple users
  const fetchUsers = useCallback(async (userIds: string[]) => {
    if (!userIds.length) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Filter out user IDs we already have cached
      const userIdsToFetch = userIds.filter(id => !users[id]);
      
      if (userIdsToFetch.length) {
        // Fetch each user in parallel
        await Promise.all(userIdsToFetch.map(fetchUser));
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [fetchUser, users]);

  // Update users state with a new user
  const updateUser = useCallback((user: User) => {
    setUsers(prevUsers => ({
      ...prevUsers,
      [user.id]: user
    }));
  }, []);

  // Initial fetch of users
  useEffect(() => {
    if (initialUserIds.length) {
      fetchUsers(initialUserIds);
    }
  }, [initialUserIds, fetchUsers]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    fetchUser,
    updateUser
  };
};

export default useUsers; 