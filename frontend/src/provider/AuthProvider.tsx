import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { useAuth } from "@clerk/clerk-react";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";

const updateToken = (token: string | null) => {
    if (token) axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
    else delete axiosInstance.defaults.headers.common['Authorization']

}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const { getToken, userId } = useAuth();
    const [loading, setLoading] = useState(true);
    const { checkAdminStatus } = useAuthStore();
    const { initSocket, disconnectSocket } = useChatStore();

    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = await getToken()
                updateToken(token)
                if (token) {
                    await checkAdminStatus();
                    // init socket
                    if (userId) {
                        initSocket(userId);
                    }
                }
            } catch (error: any) {
                updateToken(null);
                console.log("Error in auth provider", error);
            } finally {
                setLoading(false);
            }

        }
        initAuth();

        // clean up
        return () => {
            disconnectSocket();
        }
    }, [getToken, userId, checkAdminStatus, initSocket, disconnectSocket])

    if (loading) return (
        <div className="h-screen w-full flex justify-center items-center">
            <Loader className="size-8 text-emerald-500 animate-spin" />
        </div>
    );

    return <>{children}</>
}

export default AuthProvider