import { create } from "zustand";
import { OrganizerData } from "@/types/organizer";

interface OrganizerStore {
	data: OrganizerData | null;
	isLoading: boolean;
	error: string | null;
	fetchData: () => Promise<void>;
}

export const useOrganizerStore = create<OrganizerStore>((set) => ({
	data: null,
	isLoading: false,
	error: null,
	fetchData: async () => {
		try {
			set({ isLoading: true, error: null });
			const response = await fetch("/api/organizer");
			const data = await response.json();
			set({ data, isLoading: false });
		} catch (error) {
			set({ error: "Failed to fetch organizer data", isLoading: false });
		}
	},
}));
