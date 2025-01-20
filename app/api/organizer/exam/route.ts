import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
	collection,
	addDoc,
	doc,
	setDoc,
	writeBatch,
} from "firebase/firestore";
import { Exam } from "@/types/organizer";

export async function POST(request: Request) {
	try {
		const { name } = await request.json();
		const batch = writeBatch(db);

		// Create batch IDs for both full_mock and pyqs
		const fullMockBatchRef = await addDoc(collection(db, "tmpbatches"), {
			type: "exam",
			batchType: "full_mock",
			createdAt: new Date(),
		});

		const pyqsBatchRef = await addDoc(collection(db, "tmpbatches"), {
			type: "exam",
			batchType: "pyqs",
			createdAt: new Date(),
		});

		// Create the exam document with the new structure
		const examId = name.toLowerCase().replace(/\s+/g, "");
		const newExam: Exam = {
			name,
			full_mock: fullMockBatchRef.id,
			pyqs: pyqsBatchRef.id,
			sections: [],
			createdAt: new Date(),
		};

		await setDoc(doc(db, "organizer", examId), newExam);

		return NextResponse.json({
			success: true,
			examId,
			batchIds: {
				fullMock: fullMockBatchRef.id,
				pyqs: pyqsBatchRef.id,
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
