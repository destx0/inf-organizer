import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { Exam, Topic } from "@/types/organizer";

function generateTopicId(
	examId: string,
	sectionId: string,
	topicName: string
): string {
	const sanitizedName = topicName
		.toLowerCase()
		.replace(/[^a-z0-9]/g, "_")
		.replace(/_+/g, "_")
		.replace(/^_|_$/g, "");

	return `${sectionId}_topic_${sanitizedName}`;
}

export async function POST(request: Request) {
	try {
		const { examId, sectionId, name } = await request.json();

		// Generate a human-readable topic ID
		const topicId = generateTopicId(examId, sectionId, name);

		// Create a topic batch document
		await setDoc(doc(db, "tmpbatches", topicId), {
			type: "topic",
			examId,
			sectionId,
			topicName: name,
			createdAt: new Date(),
		});

		// Get the exam document
		const examRef = doc(db, "organizer", examId);
		const examDoc = await getDoc(examRef);

		if (!examDoc.exists()) {
			throw new Error("Exam not found");
		}

		const examData = examDoc.data() as Exam;
		const sectionIndex = examData.sections.findIndex(
			(s) => s.section_batchid === sectionId
		);

		if (sectionIndex === -1) {
			throw new Error("Section not found");
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
