import { db } from "@/lib/firebase";
import { collection, doc, setDoc, addDoc } from "firebase/firestore";

interface QuizData {
	examId: string;
	nodeId: string;
	nodeType: "full_mock" | "pyq" | "section" | "topic";
	language: string;
	title: string;
	description?: string;
	thumbnailLink?: string;
	duration?: number;
	positiveScore?: number;
	negativeScore?: number;
	sections: any[];
	uploadedBy: string;
	uploadedAt: Date;
}

interface QuestionData {
	question: string;
	options: string[];
	correctAnswer: number;
	explanation: string;
	uploadedBy: string;
	uploadedAt: Date;
	examId: string;
	language: string;
}

export class UploaderService {
	private static generateDocumentId(
		examId: string,
		language: string,
		nodeType: string,
		title: string
	): string {
		// Remove special characters and spaces, convert to lowercase
		const sanitizedTitle = title
			.toLowerCase()
			.replace(/[^a-z0-9]/g, "_")
			.replace(/_+/g, "_") // Replace multiple underscores with single
			.replace(/^_|_$/g, ""); // Remove leading/trailing underscores

		// Truncate title if too long (Firestore has a 1500-byte limit for document IDs)
		const maxTitleLength = 50;
		const truncatedTitle = sanitizedTitle.slice(0, maxTitleLength);

		return `${examId}_${language}_${nodeType}_${truncatedTitle}`;
	}

	static async uploadQuizData(
		file: File,
		nodeId: string,
		nodeType: "full_mock" | "pyq" | "section" | "topic",
		examId: string,
		language: string,
		userId: string
	): Promise<string> {
		try {
			const jsonContent = await this.readJsonFile(file);

			if (typeof jsonContent !== "object" || Array.isArray(jsonContent)) {
				throw new Error(
					"Invalid JSON format: Expected a single quiz object"
				);
			}

			if (!this.validateQuizStructure(jsonContent)) {
				throw new Error("Invalid quiz structure");
			}

			const sectionsWithQuestionIds = await Promise.all(
				jsonContent.sections.map(async (section: any) => {
					const questionsWithIds = await Promise.all(
						section.questions.map(async (question: any) => {
							const questionData: QuestionData = {
								...question,
								uploadedBy: userId,
								uploadedAt: new Date(),
								examId,
								language,
							};

							const questionDoc = await addDoc(
								collection(db, "tmpQuestions"),
								questionData
							);

							return {
								...question,
								questionId: questionDoc.id,
							};
						})
					);

					return {
						...section,
						questions: questionsWithIds,
					};
				})
			);

			const quizData: QuizData = {
				...jsonContent,
				examId,
				nodeId,
				nodeType,
				language,
				uploadedBy: userId,
				uploadedAt: new Date(),
				sections: sectionsWithQuestionIds,
			};

			// Generate a readable document ID
			const docId = this.generateDocumentId(
				examId,
				language,
				nodeType,
				jsonContent.title
			);

			// Use setDoc instead of addDoc to specify the document ID
			await setDoc(doc(db, "tmpQuizzes", docId), quizData);

			console.log("Quiz data uploaded with ID:", docId);
			return docId;
		} catch (error) {
			console.error("Error uploading quiz data:", error);
			throw error;
		}
	}

	private static validateQuizStructure(quiz: any): boolean {
		// Basic structure validation
		if (!quiz || typeof quiz !== "object") return false;

		// Check for required fields with flexible content
		const requiredFields = ["title", "sections"];

		const hasRequiredFields = requiredFields.every(
			(field) => field in quiz
		);
		if (!hasRequiredFields) return false;

		// Validate sections array
		if (!Array.isArray(quiz.sections)) return false;

		// Basic section validation
		return quiz.sections.every((section: any) => {
			if (!section.name || !Array.isArray(section.questions))
				return false;

			// Basic question validation
			return section.questions.every((question: any) => {
				return (
					question.question !== undefined &&
					Array.isArray(question.options) &&
					typeof question.correctAnswer === "number" &&
					question.explanation !== undefined
				);
			});
		});
	}

	private static async readJsonFile(file: File): Promise<any> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.onload = (event) => {
				try {
					const jsonData = JSON.parse(event.target?.result as string);
					resolve(jsonData);
				} catch (error) {
					reject(new Error("Invalid JSON file"));
				}
			};

			reader.onerror = () => {
				reject(new Error("Error reading file"));
			};

			reader.readAsText(file);
		});
	}
}
