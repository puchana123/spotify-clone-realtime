import { axiosInstance } from '@/lib/axios';
import { Message, User } from '@/types';
import { create } from 'zustand';
import { io } from 'socket.io-client';

interface ChatStore {
    users: User[];
    isLoading: boolean;
    error: string | null;
    socket: any;
    isConnected: boolean;
    onlineUsers: Set<string>;
    userActivities: Map<string, string>;
    messages: Message[];
    selectedUser: User | null;

    fetchUsers: () => Promise<void>;
    initSocket: (userId: string) => void;
    disconnectSocket: () => void;
    sendMessage: (receiverId: string, senderId: string, content: string) => void;
    fetchMessages: (userId: string) => Promise<void>;
    setSelectedUser: (user: User | null) => void;
}

const baseURL = 'http://localhost:5000';
const socket = io(baseURL, {
    autoConnect: false, // only conneecct if user is authenticated
    withCredentials: true
})

export const useChatStore = create<ChatStore>((set, get) => ({
    users: [],
    isLoading: false,
    error: null,
    socket: null,
    isConnected: false,
    onlineUsers: new Set(),
    userActivities: new Map(),
    messages: [],
    selectedUser: null,

    fetchUsers: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get('/users');
            set({ users: response.data });
        } catch (error: any) {
            set({ error: error.response.data.message });
        } finally {
            set({ isLoading: false });
        }
    },

    initSocket: (userId) => {
        // Connect to socket server
        if (!get().isConnected) {
            socket.auth = { userId };
            socket.connect();
            socket.emit("user_connected", userId);
            // Update online users
            socket.on("users_online", (users: string[]) => {
                set({ onlineUsers: new Set(users) });
            });
            // Update users activities
            socket.on("activities", (activities: [string, string][]) => {
                set({ userActivities: new Map(activities) });
            });
            // Update this user connection
            socket.on("user_connected", (userId: string) => {
                set((state) => ({
                    onlineUsers: new Set([...state.onlineUsers, userId])
                }));
            });
            // Update disconnected users
            socket.on('user_disconnected', (userId: string) => {
                set((state) => {
                    const newOnlineUsers = new Set(state.onlineUsers);
                    newOnlineUsers.delete(userId);
                    return { onlineUsers: newOnlineUsers };
                });
            })
            // Update messages recived
            socket.on("receive_message", (message: Message) => {
                set((state) => ({
                    messages: [...state.messages, message]
                }));
            });

            // Update messages sent
            socket.on("message_sent", (message: Message) => {
                set((state) => ({
                    messages: [...state.messages, message]
                }));
            });

            // Update this user activity
            socket.on("activity_updated", (userId: string, activity: string) => {
                set((state) => {
                    const newActivities = new Map(state.userActivities);
                    newActivities.set(userId, activity);
                    return { userActivities: newActivities };
                });
            })

            // Set user connection
            set({ isConnected: true });
        }
    },

    disconnectSocket: () => {
        // Disconnect only when connected
        if (get().isConnected) {
            socket.disconnect();
            set({ isConnected: false });
        }
    },

    sendMessage: async (receiverId, senderId, content) => {
        const socket = get().socket;
        if (!socket) return;

        socket.emit("send_message", { receiverId, senderId, content });
    },

    fetchMessages: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get(`/users/messages/${userId}`);
            set({ messages: response.data });
        } catch (error: any) {
            set({ error: error.response.data.message });
        } finally {
            set({ isLoading: false });
        }
    },

    setSelectedUser: (user: User | null) => {
        set({ selectedUser: user });
    }
}));