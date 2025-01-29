import { create } from "zustand";
import { DownloaderService } from "@/lib/services/downloader-service";
import { fetchQuizzes, togglePremium } from "@/lib/services/quiz-service";

interface QuizMetadata {
	createdAt?: { seconds: number; nanoseconds: number };
	isPremium: boolean | undefined;
	title: string;
	description?: string;
	duration?: number;
	negativeScore?: number;
	positiveScore?: number;
	thumbnailLink?: string;
	primaryQuizId?: string;
	quizIds?: {
		language: string;
		quizId: string;
	}[];
}

interface DownloaderStore {
	isDownloading: boolean;
	progress: number;
	selectedBatchId: string | null;
	quizzes: QuizMetadata[];
	isLoading: boolean;
	error: string | null;
	setSelectedBatchId: (batchId: string | null) => void;
	fetchQuizzesByBatchId: (batchId: string) => Promise<void>;
	setIsDownloading: (isDownloading: boolean) => void;
	setProgress: (progress: number) => void;
	handleDownload: (quizId: string) => Promise<void>;
	toggleQuizPremium: (quizIndex: number, isPremium: boolean) => Promise<void>;
}

export const useDownloaderStore = create<DownloaderStore>((set, get) => ({
	isDownloading: false,
	progress: 0,
	selectedBatchId: null,
	quizzes: [],
	isLoading: false,
	error: null,
	setSelectedBatchId: (batchId) => set({ selectedBatchId: batchId }),
	fetchQuizzesByBatchId: async (batchId) => {
		try {
			set({ isLoading: true, error: null, selectedBatchId: batchId });
			const { data, error } = await fetchQuizzes(batchId);

			if (error) {
				set({ error, quizzes: [] });
				return;
			}

			// Cast the exam details to ensure they match QuizMetadata type
			const quizzes = (data.examDetails || []) as QuizMetadata[];
			set({ quizzes });
		} catch (error) {
			set({ error: (error as Error).message, quizzes: [] });
		} finally {
			set({ isLoading: false });
		}
	},
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
	toggleQuizPremium: async (quizIndex: number, isPremium: boolean) => {
		const batchId = get().selectedBatchId;
		console.log("Starting toggleQuizPremium in store:", {
			batchId,
			quizIndex,
			isPremium,
		});

		if (!batchId) {
			console.error("No batch ID selected");
			return;
		}

		try {
			const { success, error, details } = await togglePremium(
				batchId,
				quizIndex,
				isPremium
			);
			console.log("Toggle premium result:", { success, error, details });
			if (!success) {
				throw new Error(error ?? "Failed to toggle premium status");
			}

			// Refresh the quiz list
			console.log("Refreshing quiz list...");
			await get().fetchQuizzesByBatchId(batchId);
			console.log("Quiz list refreshed successfully");
		} catch (error) {
			console.error("Error in toggleQuizPremium:", error);
		}
	},
}));
