import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { Exam, Section } from "@/types/organizer";

function sanitizeId(id: string): string {
	return id
		.toLowerCase()
		.replace(/[^a-z0-9]/g, "_")
		.replace(/_+/g, "_")
		.replace(/^_|_$/g, "");
}

function generateSectionId(examId: string, sectionName: string): string {
	const sanitizedExamId = sanitizeId(examId);
	const sanitizedName = sanitizeId(sectionName);
	return `${sanitizedExamId}_section_${sanitizedName}`;
}

export async function POST(request: Request) {
	try {
		const { examId, name } = await request.json();
		console.log("Received request:", { examId, name });

		// Sanitize the examId to match the database format
		const sanitizedExamId = sanitizeId(examId);

		// Generate a human-readable section ID
		const sectionId = generateSectionId(examId, name);

		// Create a section batch document
		await setDoc(doc(db, "testBatches", sectionId), {
			type: "section",
			examId: sanitizedExamId, // Use sanitized examId
			sectionName: name,
			createdAt: new Date(),
		});

		// Get the exam document using sanitized ID
		const examRef = doc(db, "organizer", sanitizedExamId);
		const examDoc = await getDoc(examRef);

		if (!examDoc.exists()) {
			console.error("Exam not found:", sanitizedExamId);
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
