import { create } from 'zustand';
import { regenerateRoundPrompt, setCustomPrompt } from '../services/game';

interface PromptState {
  promptText: string;
  promptId: string;
  isLoading: boolean;
  error: string | null;
  setPrompt: (text: string, id: string) => void;
  regeneratePrompt: (gameId: string) => Promise<void>;
  setCustomPrompt: (gameId: string, promptText: string) => Promise<void>;
}

const usePromptStore = create<PromptState>((set) => ({
  promptText: '',
  promptId: '',
  isLoading: false,
  error: null,
  
  setPrompt: (text, id) => set({ promptText: text, promptId: id }),
  
  regeneratePrompt: async (gameId) => {
    set({ isLoading: true, error: null });
    try {
      // Only call the API to get a new prompt
      const newPrompt = await regenerateRoundPrompt(gameId);
      
      // Just update the prompt text and ID in this store
      set({ 
        promptText: newPrompt.text,
        promptId: newPrompt.id,
        isLoading: false 
      });
      
      return newPrompt;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  setCustomPrompt: async (gameId, promptText) => {
    set({ isLoading: true, error: null });
    try {
      // Call the API to set a custom prompt
      const customPrompt = await setCustomPrompt(gameId, promptText);
      
      // Update our local state
      set({ 
        promptText: customPrompt.text,
        promptId: customPrompt.id,
        isLoading: false 
      });
      
      return customPrompt;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  }
}));

// Custom hook that combines the store with initialization
export const usePrompt = (initialText?: string, initialId?: string) => {
  const promptStore = usePromptStore();
  
  // Initialize the store if values are provided and store is empty
  if (initialText && initialId && !promptStore.promptText) {
    promptStore.setPrompt(initialText, initialId);
  }
  
  return promptStore;
};

export default usePrompt; 