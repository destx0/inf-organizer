import { create } from "zustand";
import { DownloaderService } from "@/lib/services/downloader-service";

interface DownloaderStore {
	isDownloading: boolean;
	progress: number;
	setIsDownloading: (isDownloading: boolean) => void;
	setProgress: (progress: number) => void;
	handleDownload: (quizId: string) => Promise<void>;
}

export const useDownloaderStore = create<DownloaderStore>((set) => ({
	isDownloading: false,
	progress: 0,
	setIsDownloading: (isDownloading) => set({ isDownloading }),
	setProgress: (progress) => set({ progress }),
	handleDownload: async (quizId) => {
		try {
			set((state) => ({ ...state, isDownloading: true }));
			set((state) => ({ ...state, progress: 10 }));

			const quizData = await DownloaderService.downloadQuizData(quizId);
			// Create a blob and download it
			const blob = new Blob([JSON.stringify(quizData, null, 2)], {
				type: "application/json",
			});
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `${quizData.title}.json`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);

			set((state) => ({ ...state, progress: 100 }));
		} catch (error) {
			console.error("Error downloading file:", error);
			throw error;
		} finally {
			set((state) => ({ ...state, isDownloading: false }));
		}
	},
}));
