export interface Subscription {
    id: string; // UUID or generated ID
    name: string;
    description?: string;
    url: string; // The base URL (e.g. https://val.example.com)
    api: {
        supabaseUrl: string;
        supabaseAnonKey: string;
    };
    addedAt: number;
}

const STORAGE_KEY = 'valpoint_subscriptions';

// Helper to get local config from env
const getLocalSubscription = (): Subscription => {
    return {
        id: 'local',
        name: 'ValPoint 官方库',
        description: 'ValPoint 官方公共点位库，汇集全网热门实战投掷物演示。',
        url: window.location.origin,
        api: {
            supabaseUrl: (window as any).__ENV__?.VITE_SUPABASE_SHARE_URL || import.meta.env.VITE_SUPABASE_SHARE_URL,
            supabaseAnonKey: (window as any).__ENV__?.VITE_SUPABASE_SHARE_ANON_KEY || import.meta.env.VITE_SUPABASE_SHARE_ANON_KEY
        },
        addedAt: 0
    };
};

export const getSubscriptionList = (): Subscription[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const list: Subscription[] = stored ? JSON.parse(stored) : [];
        // Always prepend local/official subscription
        return [getLocalSubscription(), ...list];
    } catch (e) {
        console.error('Failed to parse subscriptions', e);
        return [getLocalSubscription()];
    }
};

export const addSubscription = (sub: Subscription) => {
    const list = getSubscriptionList().filter(s => s.id !== 'local'); // Exclude virtual local
    // Check duplicates by URL
    if (list.some(s => s.url === sub.url)) {
        throw new Error('This library is already subscribed.');
    }
    list.push(sub);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
};

export const removeSubscription = (id: string) => {
    if (id === 'local') return;
    const list = getSubscriptionList().filter(s => s.id !== 'local' && s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
};

export const updateSubscription = (sub: Subscription) => {
    if (sub.id === 'local') return;
    const list = getSubscriptionList();
    const index = list.findIndex(s => s.id === sub.id);
    if (index !== -1) {
        list[index] = sub;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list.filter(s => s.id !== 'local')));
    }
};

export const reorderSubscription = (id: string, direction: 'up' | 'down') => {
    if (id === 'local') return;
    const list = getSubscriptionList().filter(s => s.id !== 'local');
    const index = list.findIndex(s => s.id === id);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
        [list[index - 1], list[index]] = [list[index], list[index - 1]];
    } else if (direction === 'down' && index < list.length - 1) {
        [list[index + 1], list[index]] = [list[index], list[index + 1]];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
};

export const fetchManifest = async (url: string): Promise<Subscription> => {
    // Normalize URL
    let baseUrl = url.replace(/\/$/, ''); // Remove trailing slash
    if (!baseUrl.startsWith('http')) {
        baseUrl = `https://${baseUrl}`;
    }

    try {
        const response = await fetch(`${baseUrl}/valpoint.json`);
        if (!response.ok) {
            throw new Error(`Failed to fetch manifest: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();

        // Validate manifest
        if (!data.api || !data.api.supabaseUrl || !data.api.supabaseAnonKey) {
            throw new Error('Invalid manifest: Missing API configuration');
        }

        return {
            id: crypto.randomUUID(),
            name: data.name || 'Unknown Library',
            description: data.description,
            url: baseUrl,
            api: {
                supabaseUrl: data.api.supabaseUrl,
                supabaseAnonKey: data.api.supabaseAnonKey
            },
            addedAt: Date.now()
        };
    } catch (e: any) {
        throw new Error(`Connection failed: ${e.message}`);
    }
};


