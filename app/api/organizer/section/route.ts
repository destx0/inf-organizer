import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
	collection,
	addDoc,
	doc,
	getDoc,
	updateDoc,
	arrayUnion,
} from "firebase/firestore";

export async function POST(request: Request) {
	try {
		const { examId, name } = await request.json();
		console.log("Received request:", { examId, name }); // Debug log

		// Create a temporary batch ID for the section
		const sectionBatchRef = await addDoc(collection(db, "tmpbatches"), {
			type: "section",
			examId,
			createdAt: new Date(),
		});

		// Get the exam document
		const examRef = doc(db, "organizer", examId);
		const examDoc = await getDoc(examRef);

		if (!examDoc.exists()) {
			console.error("Exam not found:", examId);
			return NextResponse.json(
				{ error: "Exam not found" },
				{ status: 404 }
			);
		}

		const examData = examDoc.data();
		console.log("Current exam data:", examData); // Debug log

		// Add the new section to the sections array
		const newSection = {
			name,
			section_batchid: sectionBatchRef.id,
			createdAt: new Date(),
			topics: [],
		};

		const currentSections = examData.sections || [];
		await updateDoc(examRef, {
			sections: [...currentSections, newSection],
		});

		return NextResponse.json({
			success: true,
			sectionId: sectionBatchRef.id,
		});
	} catch (error) {
		console.error("Error creating section:", error);
		return NextResponse.json(
			{ error: "Failed to create section" },
			{ status: 500 }
		);
	}
}
