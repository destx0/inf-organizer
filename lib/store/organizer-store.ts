import { create } from "zustand";
import { OrganizerData } from "@/types/organizer";

interface OrganizerStore {
	data: OrganizerData | null;
	selectedId: string | null;
	isLoading: boolean;
	error: string | null;
	fetchData: () => Promise<void>;
	setSelectedId: (id: string | null) => void;
}

export const useOrganizerStore = create<OrganizerStore>((set) => ({
	data: null,
	selectedId: null,
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
	setSelectedId: (id) => set({ selectedId: id }),
}));
