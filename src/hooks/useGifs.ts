import { useState, useEffect, useCallback } from 'react';
import { searchGifs, getTrendingGifs, getGifById, getRandomGif } from '../services/giphy';

export const useGifs = () => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [trendingGifs, setTrendingGifs] = useState<any[]>([]);
  const [selectedGif, setSelectedGif] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrendingGifs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await getTrendingGifs();
      setTrendingGifs(results);
    } catch (err: any) {
      setError(err.message || 'Error fetching trending GIFs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchForGifs = useCallback(async (query: string, limit = 20, offset = 0) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const results = await searchGifs(query, limit, offset);
      setSearchResults(results);
    } catch (err: any) {
      setError(err.message || 'Error searching for GIFs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGifById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const gif = await getGifById(id);
      setSelectedGif(gif);
      return gif;
    } catch (err: any) {
      setError(err.message || 'Error fetching GIF by ID');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRandomGif = useCallback(async (tag?: string) => {
    setLoading(true);
    setError(null);
    try {
      const gif = await getRandomGif(tag);
      return gif;
    } catch (err: any) {
      setError(err.message || 'Error fetching random GIF');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrendingGifs();
  }, [fetchTrendingGifs]);

  return {
    searchResults,
    trendingGifs,
    selectedGif,
    loading,
    error,
    searchForGifs,
    fetchTrendingGifs,
    fetchGifById,
    fetchRandomGif,
    setSelectedGif
  };
};