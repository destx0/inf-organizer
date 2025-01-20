import { create } from "zustand";
import { Language } from "@/types/organizer";

interface UploaderStore {
	file: File | null;
	isUploading: boolean;
	progress: number;
	selectedLanguage: Language;
	setSelectedLanguage: (language: Language) => void;
	setFile: (file: File | null) => void;
	setIsUploading: (isUploading: boolean) => void;
	setProgress: (progress: number) => void;
	reset: () => void;
	handleUpload: (nodeId: string | null) => Promise<void>;
}

export const useUploaderStore = create<UploaderStore>((set, get) => ({
	file: null,
	isUploading: false,
	progress: 0,
	selectedLanguage: "english",
	setSelectedLanguage: (language) => set({ selectedLanguage: language }),
	setFile: (file) => set({ file }),
	setIsUploading: (isUploading) => set({ isUploading }),
	setProgress: (progress) => set({ progress }),
	reset: () => set({ file: null, progress: 0, isUploading: false }),
	handleUpload: async (nodeId) => {
		const { file, setIsUploading, setProgress, reset, selectedLanguage } =
			get();

		if (!file || !nodeId) return;

		try {
			setIsUploading(true);
			// TODO: Implement file upload logic here with Firebase Storage
			console.log("Uploading file:", {
				fileName: file.name,
				nodeId,
				language: selectedLanguage,
			});

			// Simulate upload progress
			for (let i = 0; i <= 100; i += 10) {
				await new Promise((resolve) => setTimeout(resolve, 500));
				setProgress(i);
			}

			reset();
		} catch (error) {
			console.error("Error uploading file:", error);
		} finally {
			setIsUploading(false);
		}
	},
}));
