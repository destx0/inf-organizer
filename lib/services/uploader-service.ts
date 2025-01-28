/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/lib/firebase";
import { collection, doc, getDoc, setDoc, addDoc } from "firebase/firestore";

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

interface QuizMetadata {
	description?: string;
	duration?: number;
	negativeScore?: number;
	positiveScore?: number;
	primaryQuizId?: string;
	quizIds?: {
		language: string;
		quizId: string;
	}[];
	thumbnailLink?: string;
	title: string;
	sectionName?: string;
	type?: string;
}

interface BatchMetadata {
	createdAt: Date;
	updatedAt: Date;
	examId: string;
	totalQuizzes: number;
	examDetails: QuizMetadata[];
}

interface QuizQuestion {
	question: string;
	options: string[];
	correctAnswer: number;
	explanation: string;
}

interface QuizSection {
	name: string;
	questions: QuizQuestion[];
}

interface QuizContent {
	title: string;
	description?: string;
	duration?: number;
	negativeScore?: number;
	positiveScore?: number;
	thumbnailLink?: string;
	sections: QuizSection[];
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

			// First upload questions
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
								collection(db, "questions"),
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

			// Generate quiz ID and prepare quiz data
			const quizId = this.generateDocumentId(
				examId,
				language,
				nodeType,
				jsonContent.title
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

			// Upload quiz data
			await setDoc(doc(db, "fullQuizzes", quizId), quizData);

			// Update batch metadata
			const batchMetadata = {
				title: jsonContent.title,
				description: jsonContent.description || "",
				duration: jsonContent.duration || 0,
				negativeScore: jsonContent.negativeScore || 0,
				positiveScore: jsonContent.positiveScore || 0,
				thumbnailLink: jsonContent.thumbnailLink || "",
				quizId,
				language,
			};

			console.log("Updating batch metadata for:", nodeId, batchMetadata);
			await this.updateBatchMetadata(
				nodeId,
				batchMetadata,
				examId,
				nodeType
			);

			console.log("Quiz data uploaded with ID:", quizId);
			return quizId;
		} catch (error) {
			console.error("Error uploading quiz data:", error);
			throw error;
		}
	}

	private static validateQuizStructure(quiz: QuizContent): boolean {
		if (!quiz || typeof quiz !== "object") return false;

		const requiredFields = ["title", "sections"];
		const hasRequiredFields = requiredFields.every(
			(field) => field in quiz
		);
		if (!hasRequiredFields) return false;

		if (!Array.isArray(quiz.sections)) return false;

		return quiz.sections.every((section: QuizSection) => {
			if (!section.name || !Array.isArray(section.questions))
				return false;

			return section.questions.every((question: QuizQuestion) => {
				return (
					question.question !== undefined &&
					Array.isArray(question.options) &&
					typeof question.correctAnswer === "number" &&
					question.explanation !== undefined
				);
			});
		});
	}

	private static async readJsonFile(file: File): Promise<QuizContent> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.onload = (event) => {
				try {
					const jsonData = JSON.parse(
						event.target?.result as string
					) as QuizContent;
					resolve(jsonData);
				} catch (error) {
					console.error("Error parsing JSON file:", error);
					reject(new Error("Invalid JSON file"));
				}
			};

			reader.onerror = () => {
				reject(new Error("Error reading file"));
			};

			reader.readAsText(file);
		});
	}

	private static async updateBatchMetadata(
		batchId: string,
		quizInfo: {
			title: string;
			description: string;
			duration: number;
			negativeScore: number;
			positiveScore: number;
			thumbnailLink: string;
			quizId: string;
			language: string;
		},
		examId: string,
		nodeType: string
	) {
		try {
			console.log("Starting batch metadata update for:", batchId);
			const batchRef = doc(db, "testBatches", batchId);
			const batchDoc = await getDoc(batchRef);

			const now = new Date();
			let batchData: BatchMetadata;

			if (!batchDoc.exists()) {
				console.log("Creating new batch metadata");
				batchData = {
					createdAt: now,
					updatedAt: now,
					examId: examId,
					totalQuizzes: 1,
					examDetails: [
						{
							description: quizInfo.description,
							duration: quizInfo.duration,
							negativeScore: quizInfo.negativeScore,
							positiveScore: quizInfo.positiveScore,
							primaryQuizId: quizInfo.quizId,
							quizIds: [
								{
									language: quizInfo.language,
									quizId: quizInfo.quizId,
								},
							],
							thumbnailLink: quizInfo.thumbnailLink,
							title: quizInfo.title,
							sectionName: batchId,
							type: nodeType,
						},
					],
				};
			} else {
				console.log("Updating existing batch metadata");
				const existingData = batchDoc.data() as BatchMetadata;

				// Initialize examDetails array if it doesn't exist
				if (!existingData.examDetails) {
					existingData.examDetails = [];
					existingData.totalQuizzes = 0;
				}

				const existingQuizIndex = existingData.examDetails.findIndex(
					(q) => q.title === quizInfo.title
				);

				if (existingQuizIndex === -1) {
					console.log("Adding new quiz to batch");
					existingData.examDetails.push({
						description: quizInfo.description,
						duration: quizInfo.duration,
						negativeScore: quizInfo.negativeScore,
						positiveScore: quizInfo.positiveScore,
						primaryQuizId: quizInfo.quizId,
						quizIds: [
							{
								language: quizInfo.language,
								quizId: quizInfo.quizId,
							},
						],
						thumbnailLink: quizInfo.thumbnailLink,
						title: quizInfo.title,
						sectionName: batchId,
						type: nodeType,
					});
					existingData.totalQuizzes =
						(existingData.totalQuizzes || 0) + 1;
				} else {
					console.log("Updating existing quiz in batch");
					const existingQuiz =
						existingData.examDetails[existingQuizIndex];

					// Initialize quizIds array if it doesn't exist
					if (!existingQuiz.quizIds) {
						existingQuiz.quizIds = [];
					}

					// Always ensure primaryQuizId exists
					existingQuiz.primaryQuizId =
						existingQuiz.primaryQuizId || quizInfo.quizId;

					const existingLanguageIndex =
						existingQuiz.quizIds.findIndex(
							(q) => q.language === quizInfo.language
						);

					if (existingLanguageIndex === -1) {
						existingQuiz.quizIds.push({
							language: quizInfo.language,
							quizId: quizInfo.quizId,
						});
					} else {
						existingQuiz.quizIds[existingLanguageIndex].quizId =
							quizInfo.quizId;
					}

					// Update other fields in case they've changed
					existingQuiz.description = quizInfo.description;
					existingQuiz.duration = quizInfo.duration;
					existingQuiz.negativeScore = quizInfo.negativeScore;
					existingQuiz.positiveScore = quizInfo.positiveScore;
					existingQuiz.thumbnailLink = quizInfo.thumbnailLink;
					existingQuiz.sectionName = batchId;
					existingQuiz.type = nodeType;
				}

				batchData = {
					...existingData,
					updatedAt: now,
				};
			}

			console.log("Saving batch metadata:", batchData);
			await setDoc(batchRef, batchData);
			console.log("Batch metadata updated successfully");
		} catch (error) {
			console.error("Error updating batch metadata:", error);
			throw error;
		}
	}
}
