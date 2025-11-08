import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useMapboxToken = () => {
  return useQuery({
    queryKey: ['mapbox-token'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-mapbox-token');
      
      if (error) throw error;
      if (!data?.token) throw new Error('No Mapbox token received');
      
      return data.token as string;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 2,
  });
};
