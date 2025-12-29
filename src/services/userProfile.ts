import { supabase } from '../supabaseClient';
import { Subscription } from '../apps/shared/logic/subscription';

export const fetchUserSubscriptions = async (userId: string): Promise<Subscription[]> => {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('subscriptions')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching subscriptions:', error);
        return [];
    }

    // Ensure we return an array
    return (data?.subscriptions as Subscription[]) || [];
};

export const updateUserSubscriptions = async (userId: string, subscriptions: Subscription[]) => {
    const { error } = await supabase
        .from('user_profiles')
        .update({ subscriptions })
        .eq('id', userId);

    if (error) {
        throw new Error('Failed to sync subscriptions to cloud');
    }
};
