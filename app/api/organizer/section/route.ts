import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { Exam, Section } from "@/types/organizer";

function generateSectionId(examId: string, sectionName: string): string {
	const sanitizedName = sectionName
		.toLowerCase()
		.replace(/[^a-z0-9]/g, "_")
		.replace(/_+/g, "_")
		.replace(/^_|_$/g, "");

	return `${examId}_section_${sanitizedName}`;
}

export async function POST(request: Request) {
	try {
		const { examId, name } = await request.json();
		console.log("Received request:", { examId, name });

		// Generate a human-readable section ID
		const sectionId = generateSectionId(examId, name);

		// Create a section batch document
		await setDoc(doc(db, "tmpbatches", sectionId), {
			type: "section",
			examId,
			sectionName: name,
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

		// Add the new section
		const newSection: Section = {
			name,
			section_batchid: sectionId,
			topics: [],
			createdAt: new Date(),
		};

		const currentSections = examData.sections || [];
		await updateDoc(examRef, {
			sections: [...currentSections, newSection],
		});

		return NextResponse.json({
			success: true,
			sectionId,
		});
	} catch (error) {
		console.error("Error creating section:", error);
		return NextResponse.json(
			{ error: "Failed to create section" },
			{ status: 500 }
		);
	}
}
