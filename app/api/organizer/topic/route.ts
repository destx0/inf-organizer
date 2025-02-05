import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { Exam, Topic } from "@/types/organizer";

function sanitizeId(id: string): string {
	return id
		.toLowerCase()
		.replace(/[^a-z0-9]/g, "_")
		.replace(/_+/g, "_")
		.replace(/^_|_$/g, "");
}

function generateTopicId(sectionId: string, topicName: string): string {
	const sanitizedSectionId = sanitizeId(sectionId);
	const sanitizedName = sanitizeId(topicName);
	return `${sanitizedSectionId}_topic_${sanitizedName}`;
}

export async function POST(request: Request) {
	try {
		const { examId, sectionId, name } = await request.json();

		// Sanitize IDs
		const sanitizedExamId = sanitizeId(examId);
		const sanitizedSectionId = sanitizeId(sectionId);

		// Generate a human-readable topic ID
		const topicId = generateTopicId(sanitizedSectionId, name);

		// Create a topic batch document
		await setDoc(doc(db, "testBatches", topicId), {
			type: "topic",
			examId: sanitizedExamId,
			sectionId: sanitizedSectionId,
			topicName: name,
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
		const sectionIndex = examData.sections.findIndex(
			(s) => s.section_batchid === sanitizedSectionId
		);

		if (sectionIndex === -1) {
			console.error("Section not found:", sanitizedSectionId);
			return NextResponse.json(
				{ error: "Section not found" },
				{ status: 404 }
			);
		}

		// Add the new topic
		const newTopic: Topic = {
			name,
			topic_batchid: topicId,
			no_of_questions: 0,
			createdAt: new Date(),
		};

		const updatedSections = [...examData.sections];
		updatedSections[sectionIndex].topics.push(newTopic);

		await updateDoc(examRef, {
			sections: updatedSections,
		});

		return NextResponse.json({
			success: true,
			topicId,
		});
	} catch (error) {
		console.error("Error creating topic:", error);
		return NextResponse.json(
			{ error: "Failed to create topic" },
			{ status: 500 }
		);
	}
}
