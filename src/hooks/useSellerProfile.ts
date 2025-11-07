import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateSellerProfileData {
  businessName?: string;
  description?: string;
  phone?: string;
  email: string;
  location: string;
}

export const useSellerProfile = (userId?: string) => {
  const queryClient = useQueryClient();

  const profile = useQuery({
    queryKey: ['seller-profile', userId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) return null;

      const { data, error } = await supabase
        .from('seller_profiles')
        .select(`
          *,
          stats:seller_stats(*)
        `)
        .eq('user_id', targetUserId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!userId || !!supabase.auth.getUser()
  });

  const createOrUpdateProfile = useMutation({
    mutationFn: async (data: CreateSellerProfileData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: existing } = await supabase
        .from('seller_profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (existing) {
        // Update
        const { data: updated, error } = await supabase
          .from('seller_profiles')
          .update({
            business_name: data.businessName,
            description: data.description,
            phone: data.phone,
            email: data.email,
            location: data.location
          })
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        return updated;
      } else {
        // Create
        const { data: created, error } = await supabase
          .from('seller_profiles')
          .insert({
            user_id: user.id,
            business_name: data.businessName,
            description: data.description,
            phone: data.phone,
            email: data.email,
            location: data.location
          })
          .select()
          .single();

        if (error) throw error;
        return created;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-profile'] });
      toast.success('Seller profile updated!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update profile: ${error.message}`);
    }
  });

  return {
    profile: profile.data,
    isLoading: profile.isLoading,
    createOrUpdateProfile
  };
};
