import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { QuizMetadata } from "@/lib/types";

interface UpdateRequestBody {
	batchId: string;
	quizIndex: number;
	updatedData: Partial<QuizMetadata>;
}

function extractNumber(title: string): number | null {
	const match = title.match(/\d+/);
	return match ? parseInt(match[0]) : null;
}

function replacePlaceholder(pattern: string, number: number): string {
	return pattern.replaceAll("$$", number.toString());
}

export async function POST(request: Request) {
	try {
		const { batchId, quizIndex, updatedData } =
			(await request.json()) as UpdateRequestBody;
		console.log("Received update request:", {
			batchId,
			quizIndex,
			updatedData,
		});

		// Get the batch document reference
		const batchRef = doc(db, "testBatches", batchId);
		console.log("Created batch reference for:", batchId);

		const batchSnap = await getDoc(batchRef);
		console.log("Got batch snapshot, exists:", batchSnap.exists());

		if (!batchSnap.exists()) {
			console.log("Batch not found:", batchId);
			return NextResponse.json(
				{ success: false, error: "Batch not found" },
				{ status: 404 }
			);
		}

		// Get the current exam details array
		const batchData = batchSnap.data();
		console.log("Current batch data:", batchData);

		const examDetails = batchData?.examDetails || [];
		const currentQuiz = examDetails[quizIndex];

		if (!currentQuiz) {
			return NextResponse.json(
				{ success: false, error: "Quiz not found at specified index" },
				{ status: 404 }
			);
		}

		console.log("Current quiz data:", currentQuiz);

		// Update the specific quiz in batch
		examDetails[quizIndex] = {
			...currentQuiz,
			...updatedData,
		};

		// Update all associated quiz documents
		const updatePromises = [];

		// Update primary quiz if it exists
		if (currentQuiz.primaryQuizId) {
			const primaryQuizRef = doc(
				db,
				"fullQuizzes",
				currentQuiz.primaryQuizId
			);
			const primaryQuizSnap = await getDoc(primaryQuizRef);

			if (primaryQuizSnap.exists()) {
				const primaryQuizData = primaryQuizSnap.data();
				let newTitle = updatedData.title;

				if (newTitle && newTitle.includes("$$")) {
					const existingNumber =
						extractNumber(primaryQuizData.title) || quizIndex + 1;
					newTitle = replacePlaceholder(newTitle, existingNumber);
				}

				updatePromises.push(
					updateDoc(primaryQuizRef, {
						...primaryQuizData,
						title: newTitle || primaryQuizData.title,
						description:
							updatedData.description ||
							primaryQuizData.description,
						duration:
							updatedData.duration || primaryQuizData.duration,
						positiveScore:
							updatedData.positiveScore ||
							primaryQuizData.positiveScore,
						negativeScore:
							updatedData.negativeScore ||
							primaryQuizData.negativeScore,
					})
				);
			}
		}

		// Update all language-specific quizzes
		if (currentQuiz.quizIds && currentQuiz.quizIds.length > 0) {
			for (const { quizId } of currentQuiz.quizIds) {
				const quizRef = doc(db, "fullQuizzes", quizId);
				const quizSnap = await getDoc(quizRef);

				if (quizSnap.exists()) {
					const quizData = quizSnap.data();
					let newTitle = updatedData.title;

					if (newTitle && newTitle.includes("$$")) {
						const existingNumber =
							extractNumber(quizData.title) || quizIndex + 1;
						newTitle = replacePlaceholder(newTitle, existingNumber);
					}

					updatePromises.push(
						updateDoc(quizRef, {
							...quizData,
							title: newTitle || quizData.title,
							description:
								updatedData.description || quizData.description,
							duration: updatedData.duration || quizData.duration,
							positiveScore:
								updatedData.positiveScore ||
								quizData.positiveScore,
							negativeScore:
								updatedData.negativeScore ||
								quizData.negativeScore,
						})
					);
				}
			}
		}

		// Update the batch document
		updatePromises.push(
			updateDoc(batchRef, {
				examDetails,
			})
		);

		// Wait for all updates to complete
		console.log("Attempting to update all documents...");
		await Promise.all(updatePromises);
		console.log("All documents updated successfully");

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Detailed error in quiz update:", {
			error,
			message: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
		});
		return NextResponse.json(
			{
				success: false,
				error: "Failed to update quiz",
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 }
		);
	}
}
