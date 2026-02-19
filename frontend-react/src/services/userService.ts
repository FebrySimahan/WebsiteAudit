import api from "./api";

export interface User {
    id: number;
    name: string;
    email: string;
    level?: string;
    level_role: string;
    created_at?: string;
    updated_at?: string;
}

export interface UserResponse {
    success: boolean;
    data: User | User[];
    message?: string;
}

const userService = {
    /**
     * Ambil semua user
     */
    getAll: async (): Promise<User[]> => {
        try {
            const res = await api.get<UserResponse>("/users");
            return Array.isArray(res.data.data) ? res.data.data : [res.data.data];
        } catch (error) {
            throw error;
        }
    },

    /**
     * Ambil user berdasarkan role tertentu
     */
    getByRole: async (role: string): Promise<User[]> => {
        try {
            const allUsers = await userService.getAll();
            return allUsers.filter(user => user.level_role === role);
        } catch (error) {
            throw error;
        }
    },

    /**
     * Ambil user berdasarkan ID
     */
    getById: async (id: number): Promise<User> => {
        try {
            const res = await api.get<UserResponse>(`/users/${id}`);
            return res.data.data as User;
        } catch (error) {
            throw error;
        }
    },
};

export default userService;
