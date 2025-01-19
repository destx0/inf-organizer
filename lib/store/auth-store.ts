import { create } from "zustand";
import { auth } from "@/lib/firebase";
import { User } from "firebase/auth";

interface AuthState {
	user: User | null;
	setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	setUser: (user) => set({ user }),
}));

// Subscribe to auth state changes
auth.onAuthStateChanged((user) => {
	useAuthStore.getState().setUser(user);
});
