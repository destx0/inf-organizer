import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { Exam, Topic } from "@/types/organizer";

export async function POST(request: Request) {
	try {
		const { examId, sectionId, name } = await request.json();

		// Create a temporary batch ID for the topic
		const topicBatchRef = await addDoc(collection(db, "tmpbatches"), {
			type: "topic",
			examId,
			sectionId,
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

		// Add the new topic to the section's topics array
		const newTopic: Topic = {
			name,
			topic_batchid: topicBatchRef.id,
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
			topicId: topicBatchRef.id,
		});
	} catch (error) {
		console.error("Error creating topic:", error);
		return NextResponse.json(
			{ error: "Failed to create topic" },
			{ status: 500 }
		);
	}
}
