import { create } from "zustand";
import { Exam, OrganizerData } from "@/types/organizer";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

interface OrganizerStore {
	data: OrganizerData | null;
	selectedId: string | null;
	isLoading: boolean;
	error: string | null;
	fetchData: () => Promise<void>;
	setSelectedId: (id: string | null) => void;
	createExam: (name: string) => Promise<void>;
	createSection: (examId: string, name: string) => Promise<void>;
	createTopic: (
		examId: string,
		sectionId: string,
		name: string
	) => Promise<void>;
}

export const useOrganizerStore = create<OrganizerStore>((set, get) => ({
	data: null,
	selectedId: null,
	isLoading: false,
	error: null,
	fetchData: async () => {
		try {
			console.log("Starting to fetch data..."); // Debug log
			set({ isLoading: true, error: null });

			const querySnapshot = await getDocs(collection(db, "organizer"));
			console.log(
				"Raw Firestore data:",
				querySnapshot.docs.map((doc) => ({
					id: doc.id,
					data: doc.data(),
				}))
			); // Debug log

			const exams = querySnapshot.docs.map((doc) => ({
				...doc.data(),
				id: doc.id,
			}));

			console.log("Processed exams data:", exams); // Debug log

			set({
				data: {
					exams: exams as unknown as Exam[],
				},
				isLoading: false,
			});

			// Log the state after update
			const state = get();
			console.log("Store state after update:", state.data);
		} catch (error) {
			console.error("Error fetching data:", error);
			set({
				error: "Failed to fetch organizer data",
				isLoading: false,
			});
		}
	},
	setSelectedId: (id) => set({ selectedId: id }),
	createExam: async (name: string) => {
		try {
			set({ isLoading: true, error: null });
			const response = await fetch("/api/organizer/exam", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name }),
			});
			if (!response.ok) throw new Error("Failed to create exam");
			await get().fetchData();
		} catch (error) {
			set({ error: "Failed to create exam", isLoading: false });
		}
	},
	createSection: async (examId: string, name: string) => {
		try {
			set({ isLoading: true, error: null });
			console.log("Creating section:", { examId, name }); // Debug log
			const response = await fetch("/api/organizer/section", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ examId, name }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				console.error("Section creation failed:", errorData);
				throw new Error("Failed to create section");
			}

			await get().fetchData();
		} catch (error) {
			console.error("Error in createSection:", error);
			set({ error: "Failed to create section", isLoading: false });
		}
	},
	createTopic: async (examId: string, sectionId: string, name: string) => {
		try {
			set({ isLoading: true, error: null });
			const response = await fetch("/api/organizer/topic", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ examId, sectionId, name }),
			});
			if (!response.ok) throw new Error("Failed to create topic");
			await get().fetchData();
		} catch (error) {
			set({ error: "Failed to create topic", isLoading: false });
		}
	},
}));
