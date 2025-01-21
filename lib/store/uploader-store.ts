import { create } from "zustand";
import { Language } from "@/types/organizer";
import { UploaderService } from "@/lib/services/uploader-service";
import { useAuthStore } from "./auth-store";

interface UploaderStore {
	files: File[];
	isUploading: boolean;
	progress: number;
	selectedLanguage: Language;
	setSelectedLanguage: (language: Language) => void;
	setFiles: (files: File[]) => void;
	setIsUploading: (isUploading: boolean) => void;
	setProgress: (progress: number) => void;
	reset: () => void;
	handleUpload: (
		nodeId: string | null,
		nodeType: "full_mock" | "pyq" | "section" | "topic",
		examId: string,
		file: File
	) => Promise<void>;
}

export const useUploaderStore = create<UploaderStore>((set, get) => ({
	files: [],
	isUploading: false,
	progress: 0,
	selectedLanguage: "english",
	setSelectedLanguage: (language) => set({ selectedLanguage: language }),
	setFiles: (files) => set({ files }),
	setIsUploading: (isUploading) => set({ isUploading }),
	setProgress: (progress) => set({ progress }),
	reset: () => set({ files: [], progress: 0, isUploading: false }),
	handleUpload: async (nodeId, nodeType, examId, file) => {
		const { setIsUploading, setProgress, selectedLanguage } = get();
		const user = useAuthStore.getState().user;

		if (!nodeId || !user) return;

		try {
			setIsUploading(true);
			setProgress(10);

			await UploaderService.uploadQuizData(
				file,
				nodeId,
				nodeType,
				examId,
				selectedLanguage,
				user.uid
			);

			setProgress(100);
		} catch (error) {
			console.error("Error uploading file:", error);
			throw error;
		} finally {
			setIsUploading(false);
		}
	},
}));
