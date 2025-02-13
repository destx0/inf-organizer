import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { QuizMetadata } from "@/lib/types";

interface UpdateRequestBody {
	batchId: string;
	quizIndex: number;
	updatedData: Partial<QuizMetadata>;
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
			updatePromises.push(
				updateDoc(primaryQuizRef, {
					title: updatedData.title,
					description: updatedData.description,
					duration: updatedData.duration,
					positiveScore: updatedData.positiveScore,
					negativeScore: updatedData.negativeScore,
				})
			);
		}

		// Update all language-specific quizzes
		if (currentQuiz.quizIds && currentQuiz.quizIds.length > 0) {
			currentQuiz.quizIds.forEach(({ quizId }: { quizId: string }) => {
				const quizRef = doc(db, "fullQuizzes", quizId);
				updatePromises.push(
					updateDoc(quizRef, {
						title: updatedData.title,
						description: updatedData.description,
						duration: updatedData.duration,
						positiveScore: updatedData.positiveScore,
						negativeScore: updatedData.negativeScore,
					})
				);
			});
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
