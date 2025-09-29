import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Watchlist {
  id: string;
  name: string;
  description?: string;
  is_default: boolean;
  is_system: boolean;
  watchlist_type: string;
  symbol_count: number;
}

interface WatchlistItem {
  symbol: string;
  priority_tier: number;
  added_at: string;
}

export const useWatchlists = () => {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWatchlists = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('stock-screener', {
        body: { action: 'get_watchlists' }
      });

      if (error) throw error;
      
      // Create default user watchlist if none exists
      const allWatchlists = data.data || [];
      const userWatchlists = allWatchlists.filter((w: any) => w.watchlist_type === 'user_watchlist');
      
      if (userWatchlists.length === 0) {
        await createDefaultUserWatchlist();
        // Refetch after creating default watchlist
        const { data: newData, error: newError } = await supabase.functions.invoke('stock-screener', {
          body: { action: 'get_watchlists' }
        });
        if (!newError) {
          setWatchlists(newData.data || []);
        }
      } else {
        setWatchlists(allWatchlists);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch watchlists');
      console.error('Error fetching watchlists:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create default user watchlist
  const createDefaultUserWatchlist = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { error } = await supabase
        .from('user_watchlists')
        .insert([{
          name: 'My List',
          description: 'Personal watchlist for tracking favorite stocks',
          user_id: user.id
        }]);
      
      if (error) throw error;
    } catch (err) {
      console.error('Error creating default user watchlist:', err);
    }
  };

  const fetchWatchlistSymbols = async (watchlistId: string, priorityTier?: number) => {
    try {
      // Find the watchlist to determine its type
      const watchlist = watchlists.find(w => w.id === watchlistId);
      const watchlistType = watchlist?.watchlist_type;
      
      const { data, error } = await supabase.functions.invoke('stock-screener', {
        body: { 
          action: 'get_watchlist_symbols',
          watchlist_id: watchlistId,
          watchlist_type: watchlistType,
          priority_tier: priorityTier
        }
      });

      if (error) throw error;
      return data.data || [];
    } catch (err) {
      console.error('Error fetching watchlist symbols:', err);
      return [];
    }
  };

  const addToWatchlist = async (watchlistId: string, symbol: string, priorityTier: number = 3) => {
    try {
      // Find the watchlist to determine its type
      const watchlist = watchlists.find(w => w.id === watchlistId);
      const watchlistType = watchlist?.watchlist_type;
      
      const { data, error } = await supabase.functions.invoke('stock-screener', {
        body: { 
          action: 'add_to_watchlist',
          watchlist_id: watchlistId,
          symbol: symbol.toUpperCase(),
          priority_tier: priorityTier,
          watchlist_type: watchlistType
        }
      });

      if (error) throw error;
      
      // Refresh watchlists to update symbol counts
      await fetchWatchlists();
      
      return data.data;
    } catch (err) {
      console.error('Error adding to watchlist:', err);
      throw err;
    }
  };

  const searchSymbol = async (symbol: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('stock-screener', {
        body: { 
          action: 'search_symbol',
          symbol: symbol.toUpperCase()
        }
      });

      if (error) throw error;
      return data.data;
    } catch (err) {
      console.error('Error searching symbol:', err);
      throw err;
    }
  };

  const getUniverseSelection = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('stock-screener', {
        body: { action: 'get_universe_selection' }
      });

      if (error) throw error;
      return data.data || [];
    } catch (err) {
      console.error('Error fetching universe selection:', err);
      return [];
    }
  };

  useEffect(() => {
    fetchWatchlists();
  }, []);

  return {
    watchlists,
    loading,
    error,
    fetchWatchlists,
    fetchWatchlistSymbols,
    addToWatchlist,
    searchSymbol,
    getUniverseSelection
  };
};