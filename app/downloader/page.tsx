"use client";

import { useDownloaderStore } from "@/lib/store/downloader-store";
import { QuizCard } from "./components/quiz-card";
import { BatchEditDialog } from "./components/batch-edit-dialog";

export default function DownloaderPage() {
	const {
		quizzes,
		isLoading: isLoadingQuizzes,
		toggleQuizPremium,
		updateQuiz,
		updateAllQuizzes,
	} = useDownloaderStore();

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">Quiz Downloader</h1>
			{isLoadingQuizzes ? (
				<div className="text-center py-4">Loading quizzes...</div>
			) : quizzes.length > 0 ? (
				<div className="space-y-4">
					<BatchEditDialog onBatchEdit={updateAllQuizzes} />
					<h2 className="text-lg font-semibold">Available Quizzes</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{quizzes.map((quiz, index) => (
							<QuizCard
								key={quiz.primaryQuizId}
								quiz={quiz}
								index={index}
								toggleQuizPremium={toggleQuizPremium}
								updateQuiz={updateQuiz}
							/>
						))}
					</div>
				</div>
			) : (
				<p className="text-muted-foreground">
					Select a quiz from the sidebar to view its details.
				</p>
			)}
		</div>
	);
}
