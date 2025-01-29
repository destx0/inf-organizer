"use client";

import { useDownloaderStore } from "@/lib/store/downloader-store";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

function formatDate(timestamp: { seconds: number; nanoseconds: number }) {
	if (!timestamp) return "";
	const date = new Date(timestamp.seconds * 1000);
	return date.toLocaleString("en-IN", {
		day: "numeric",
		month: "long",
		year: "numeric",
		hour: "numeric",
		minute: "numeric",
		hour12: true,
	});
}

export default function DownloaderPage() {
	const {
		quizzes,
		isLoading: isLoadingQuizzes,
		toggleQuizPremium,
	} = useDownloaderStore();

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">Quiz Downloader</h1>
			{isLoadingQuizzes ? (
				<div className="text-center py-4">Loading quizzes...</div>
			) : quizzes.length > 0 ? (
				<div className="space-y-4">
					<h2 className="text-lg font-semibold">Available Quizzes</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{quizzes.map((quiz, index) => (
							<div
								key={quiz.primaryQuizId}
								className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
							>
								<div className="flex flex-col space-y-2">
									<div className="flex items-center justify-between">
										<h3 className="font-medium">
											{quiz.title}
										</h3>
										<div className="flex items-center space-x-2">
											<Switch
												id={`premium-${quiz.primaryQuizId}`}
												checked={quiz.isPremium}
												onCheckedChange={(checked) =>
													toggleQuizPremium(
														index,
														checked
													)
												}
											/>
											<Label
												htmlFor={`premium-${quiz.primaryQuizId}`}
												className="text-sm"
											>
												Premium
											</Label>
										</div>
									</div>
									{quiz.description && (
										<p className="text-sm text-muted-foreground">
											{quiz.description}
										</p>
									)}
									<div className="flex flex-wrap gap-1">
										{quiz.quizIds?.map(({ language }) => (
											<Badge
												key={language}
												variant="secondary"
												className="capitalize"
											>
												{language}
											</Badge>
										))}
									</div>
									<div className="space-y-1 text-sm">
										{quiz.duration && (
											<p>
												Duration: {quiz.duration}{" "}
												minutes
											</p>
										)}
										{quiz.positiveScore && (
											<p>
												Positive Score:{" "}
												{quiz.positiveScore}
											</p>
										)}
										{quiz.negativeScore && (
											<p>
												Negative Score:{" "}
												{quiz.negativeScore}
											</p>
										)}
									</div>
									{quiz.createdAt && (
										<p className="text-xs text-muted-foreground mt-2">
											Created:{" "}
											{formatDate(quiz.createdAt)}
										</p>
									)}
									{quiz.isPremium && (
										<Badge
											variant="default"
											className="self-start"
										>
											Premium
										</Badge>
									)}
								</div>
							</div>
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
