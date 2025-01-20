import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { Exam, Section } from "@/types/organizer";

export async function POST(request: Request) {
	try {
		const { examId, name } = await request.json();
		console.log("Received request:", { examId, name });

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

		const examData = examDoc.data() as Exam;
		console.log("Current exam data:", examData);

		// Add the new section to the sections array
		const newSection: Section = {
			name,
			section_batchid: sectionBatchRef.id,
			topics: [],
			createdAt: new Date(),
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
