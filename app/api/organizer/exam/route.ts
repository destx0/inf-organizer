import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Exam } from "@/types/organizer";

function generateBatchId(examName: string, type: string): string {
	// Remove special characters and spaces, convert to lowercase
	const sanitizedName = examName
		.toLowerCase()
		.replace(/[^a-z0-9]/g, "_")
		.replace(/_+/g, "_") // Replace multiple underscores with single
		.replace(/^_|_$/g, ""); // Remove leading/trailing underscores

	return `${sanitizedName}_${type}`;
}

export async function POST(request: Request) {
	try {
		const { name } = await request.json();

		// Generate human-readable batch IDs
		const fullMockBatchId = generateBatchId(name, "full_mock");
		const pyqsBatchId = generateBatchId(name, "pyq");

		// Create batch documents with custom IDs
		await setDoc(doc(db, "testBatches", fullMockBatchId), {
			type: "exam",
			batchType: "full_mock",
			examName: name,
			createdAt: new Date(),
		});

		await setDoc(doc(db, "testBatches", pyqsBatchId), {
			type: "exam",
			batchType: "pyqs",
			examName: name,
			createdAt: new Date(),
		});

		// Create the exam document with human-readable ID
		const examId = name.toLowerCase().replace(/[^a-z0-9]/g, "_");
		const newExam: Exam = {
			name,
			full_mock: fullMockBatchId,
			pyqs: pyqsBatchId,
			sections: [],
			createdAt: new Date(),
		};

		await setDoc(doc(db, "organizer", examId), newExam);

		return NextResponse.json({
			success: true,
			examId,
			batchIds: {
				fullMock: fullMockBatchId,
				pyqs: pyqsBatchId,
			},
		});
	} catch (error) {
		console.error("Error creating exam:", error);
		return NextResponse.json(
			{ error: "Failed to create exam" },
			{ status: 500 }
		);
	}
}
