import { create } from "zustand";
import { DownloaderService } from "@/lib/services/downloader-service";
import {
	fetchQuizzes,
	togglePremium,
	updateQuizDetails,
} from "@/lib/services/quiz-service";
import { QuizMetadata } from "@/lib/types";

interface QuizUpdate {
	quizIndex: number;
	batchId: string;
	title?: string;
	duration?: number;
	positiveScore?: number;
	negativeScore?: number;
	description?: string;
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
	updateQuiz: (
		quizIndex: number,
		updatedQuiz: Partial<QuizMetadata>
	) => Promise<void>;
	updateAllQuizzes: (updates: QuizUpdate[]) => Promise<void>;
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
	updateQuiz: async (
		quizIndex: number,
		updatedQuiz: Partial<QuizMetadata>
	) => {
		const batchId = get().selectedBatchId;

		if (!batchId) {
			console.error("No batch ID selected");
			return;
		}

		try {
			const { success, error } = await updateQuizDetails(
				batchId,
				quizIndex,
				updatedQuiz
			);

			if (!success) {
				throw new Error(error ?? "Failed to update quiz");
			}

			// Update local state
			set((state) => ({
				quizzes: state.quizzes.map((quiz, idx) =>
					idx === quizIndex ? { ...quiz, ...updatedQuiz } : quiz
				),
			}));
		} catch (error) {
			console.error("Error updating quiz:", error);
			throw error;
		}
	},
	updateAllQuizzes: async (updates: QuizUpdate[]) => {
		try {
			const chunkSize = 5;
			const chunks: QuizUpdate[][] = [];

			// Create chunks of updates
			for (let i = 0; i < updates.length; i += chunkSize) {
				chunks.push(updates.slice(i, i + chunkSize));
			}

			let completedUpdates = 0;

			await Promise.all(
				chunks.map(async (chunk) => {
					await Promise.all(
						chunk.map(async (update: QuizUpdate) => {
							const { quizIndex, batchId, ...updatedData } =
								update;
							const response = await fetch("/api/quiz/update", {
								method: "POST",
								headers: {
									"Content-Type": "application/json",
								},
								body: JSON.stringify({
									batchId,
									quizIndex,
									updatedData,
								}),
							});

							if (!response.ok) {
								throw new Error(
									`Failed to update quiz at index ${quizIndex}`
								);
							}

							completedUpdates++;
							set((state) => ({
								...state,
								updateProgress:
									(completedUpdates / updates.length) * 100,
							}));
						})
					);
				})
			);

			// Update local state
			set((state) => ({
				quizzes: state.quizzes.map((quiz, index) => {
					const update = updates.find(
						(u: QuizUpdate) => u.quizIndex === index
					);
					if (update) {
						const {
							quizIndex: _qIndex,
							batchId: _bId,
							...updatedData
						} = update;
						return { ...quiz, ...updatedData };
					}
					return quiz;
				}),
			}));

			// Refresh quizzes
			const selectedBatchId = get().selectedBatchId;
			if (selectedBatchId) {
				await get().fetchQuizzesByBatchId(selectedBatchId);
			}
		} catch (error) {
			console.error("Error updating all quizzes:", error);
			throw error;
		}
	},
}));
