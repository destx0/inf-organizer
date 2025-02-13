import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { QuizMetadata } from "@/lib/types";

interface BatchData {
	examDetails: QuizMetadata[];
	createdAt: {
		seconds: number;
		nanoseconds: number;
	};
	totalQuizzes: number;
}

export async function fetchQuizzes(batchId: string) {
	try {
		console.log("Fetching quizzes for batch:", batchId);
		const batchRef = doc(db, "testBatches", batchId);
		const batchSnap = await getDoc(batchRef);

		if (batchSnap.exists()) {
			const batchData = batchSnap.data() as BatchData;

			// Fetch premium status from primary quizzes if not present in batch
			const updatedExamDetails = await Promise.all(
				batchData.examDetails.map(async (exam) => {
					if (exam.isPremium === undefined && exam.primaryQuizId) {
						const quizRef = doc(
							db,
							"fullQuizzes",
							exam.primaryQuizId
						);
						const quizSnap = await getDoc(quizRef);
						if (quizSnap.exists()) {
							const quizData = quizSnap.data();
							return {
								...exam,
								isPremium: quizData.isPremium || false,
							};
						}
					}
					return exam;
				})
			);

			return {
				data: {
					...batchData,
					examDetails: updatedExamDetails,
				},
				error: null,
			};
		} else {
			return {
				data: { examDetails: [], totalQuizzes: 0 },
				error: "No quizzes found",
			};
		}
	} catch (error) {
		console.error("Error fetching quizzes:", error);
		return {
			data: { examDetails: [], totalQuizzes: 0 },
			error: "Error fetching quizzes: " + (error as Error).message,
		};
	}
}

export async function togglePremium(
	batchId: string,
	quizIndex: number,
	isPremium: boolean
) {
	console.log("Starting togglePremium:", { batchId, quizIndex, isPremium });
	try {
		const batchRef = doc(db, "testBatches", batchId);
		const batchSnap = await getDoc(batchRef);

		if (!batchSnap.exists()) {
			console.error("Batch not found:", batchId);
			throw new Error("Batch not found");
		}

		const batchData = batchSnap.data() as BatchData;
		console.log("Batch data:", batchData);

		// Update the premium status for the specific quiz in batch
		if (batchData.examDetails[quizIndex]) {
			const quizData = batchData.examDetails[quizIndex];
			console.log("Found quiz data:", quizData);

			quizData.isPremium = isPremium;
			console.log("Updated quiz premium status to:", isPremium);

			// Update batch document
			console.log("Updating batch document...");
			await updateDoc(batchRef, {
				examDetails: batchData.examDetails,
			});
			console.log("Batch document updated successfully");

			// Update all related quiz documents
			if (quizData.quizIds && quizData.quizIds.length > 0) {
				console.log(
					"Updating related quiz documents:",
					quizData.quizIds
				);
				await Promise.all(
					quizData.quizIds.map(async ({ quizId, language }) => {
						console.log(
							`Updating quiz ${quizId} for language ${language}`
						);
						const quizRef = doc(db, "fullQuizzes", quizId);
						await updateDoc(quizRef, {
							isPremium: isPremium,
						});
						console.log(`Quiz ${quizId} updated successfully`);
					})
				);
			} else {
				console.log("No related quiz documents found");
			}

			// Update primary quiz document if it exists
			if (quizData.primaryQuizId) {
				console.log(
					"Updating primary quiz document:",
					quizData.primaryQuizId
				);
				const primaryQuizRef = doc(
					db,
					"fullQuizzes",
					quizData.primaryQuizId
				);
				await updateDoc(primaryQuizRef, {
					isPremium: isPremium,
				});
				console.log("Primary quiz document updated successfully");
			} else {
				console.log("No primary quiz document found");
			}

			console.log("Toggle premium completed successfully");
			return { success: true, error: null };
		} else {
			console.error(
				"Quiz not found in batch at index:",
				quizIndex,
				"Available indices:",
				batchData.examDetails.length
			);
			throw new Error("Quiz not found in batch");
		}
	} catch (error) {
		console.error("Error in togglePremium:", error);
		return {
			success: false,
			error: (error as Error).message,
			details: error,
		};
	}
}

interface UpdateResponse {
	success: boolean;
	error?: string;
	details?: string;
}

export const updateQuizDetails = async (
	batchId: string,
	quizIndex: number,
	updatedData: Partial<QuizMetadata>
): Promise<UpdateResponse> => {
	try {
		console.log("Making update request:", {
			batchId,
			quizIndex,
			updatedData,
		});

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

		console.log("Response status:", response.status);
		const data = await response.json();
		console.log("Response data:", data);

		return data as UpdateResponse;
	} catch (error) {
		console.error("Detailed error in updateQuizDetails:", {
			error,
			message: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
		});
		return {
			success: false,
			error: "Failed to update quiz",
			details: error instanceof Error ? error.message : String(error),
		};
	}
};
