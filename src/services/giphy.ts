import { GiphyFetch } from '@giphy/js-fetch-api';

// Create a new GiphyFetch with your API key
// Replace with your own Giphy API key or use environment variable
const giphyApiKey = import.meta.env.VITE_GIPHY_API_KEY || 'f4VxhYRTxEyAtMu3qbrONBhKvcezoWZW';
const gf = new GiphyFetch(giphyApiKey);

export const searchGifs = async (query: string, limit = 20, offset = 0) => {
  try {
    const { data } = await gf.search(query, { limit, offset });
    return data;
  } catch (error) {
    console.error('Error searching gifs:', error);
    throw error;
  }
};

export const getTrendingGifs = async (limit = 20, offset = 0) => {
  try {
    const { data } = await gf.trending({ limit, offset });
    return data;
  } catch (error) {
    console.error('Error getting trending gifs:', error);
    throw error;
  }
};

export const getGifById = async (id: string) => {
  try {
    const { data } = await gf.gif(id);
    return data;
  } catch (error) {
    console.error('Error getting gif by id:', error);
    throw error;
  }
};

export const getRandomGif = async (tag?: string) => {
  try {
    const { data } = await gf.random({ tag });
    return data;
  } catch (error) {
    console.error('Error getting random gif:', error);
    throw error;
  }
};