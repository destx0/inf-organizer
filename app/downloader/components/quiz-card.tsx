"use client";

import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { QuizMetadata, EditFormData } from "@/lib/types";

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

interface QuizCardProps {
	quiz: QuizMetadata;
	index: number;
	toggleQuizPremium: (index: number, checked: boolean) => void;
	updateQuiz: (index: number, data: Partial<QuizMetadata>) => Promise<void>;
}

export function QuizCard({
	quiz,
	index,
	toggleQuizPremium,
	updateQuiz,
}: QuizCardProps) {
	const [editingQuiz, setEditingQuiz] = useState<QuizMetadata | null>(null);
	const [editForm, setEditForm] = useState<EditFormData>({
		title: "",
		description: "",
		duration: "",
		positiveScore: "",
		negativeScore: "",
	});
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const handleEditClick = (quiz: QuizMetadata) => {
		setEditingQuiz(quiz);
		setEditForm({
			title: quiz.title,
			description: quiz.description || "",
			duration: quiz.duration?.toString() || "",
			positiveScore: quiz.positiveScore?.toString() || "",
			negativeScore: quiz.negativeScore?.toString() || "",
		});
		setIsDialogOpen(true);
	};

	const handleSaveEdit = async () => {
		if (!editingQuiz) return;

		const updatedData: Partial<QuizMetadata> = {
			title: editForm.title,
			description: editForm.description,
			duration: parseInt(editForm.duration) || editingQuiz.duration,
			positiveScore:
				parseInt(editForm.positiveScore) || editingQuiz.positiveScore,
			negativeScore:
				parseInt(editForm.negativeScore) || editingQuiz.negativeScore,
		};

		try {
			await updateQuiz(index, updatedData);
			setIsDialogOpen(false);
			setEditingQuiz(null);
		} catch (error) {
			console.error("Failed to update quiz:", error);
		}
	};

	return (
		<div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
			<div className="flex flex-col space-y-2">
				<div className="flex items-center justify-between">
					<h3 className="font-medium">{quiz.title}</h3>
					<div className="flex items-center space-x-2">
						<Switch
							id={`premium-${quiz.primaryQuizId}`}
							checked={quiz.isPremium}
							onCheckedChange={(checked) =>
								toggleQuizPremium(index, checked)
							}
						/>
						<Label
							htmlFor={`premium-${quiz.primaryQuizId}`}
							className="text-sm"
						>
							Premium
						</Label>
						<Dialog
							open={isDialogOpen}
							onOpenChange={setIsDialogOpen}
						>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon">
										<MoreVertical className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<DialogTrigger asChild>
										<DropdownMenuItem
											onSelect={() =>
												handleEditClick(quiz)
											}
										>
											<Edit className="h-4 w-4 mr-2" />
											Edit Quiz
										</DropdownMenuItem>
									</DialogTrigger>
								</DropdownMenuContent>
							</DropdownMenu>

							<DialogContent>
								<DialogHeader>
									<DialogTitle>Edit Quiz</DialogTitle>
								</DialogHeader>
								<div className="space-y-4 py-4">
									<div className="space-y-2">
										<Label>Title</Label>
										<Input
											value={editForm.title}
											onChange={(e) =>
												setEditForm({
													...editForm,
													title: e.target.value,
												})
											}
										/>
									</div>
									<div className="space-y-2">
										<Label>Description</Label>
										<Textarea
											value={editForm.description}
											onChange={(e) =>
												setEditForm({
													...editForm,
													description: e.target.value,
												})
											}
										/>
									</div>
									<div className="space-y-2">
										<Label>Duration (minutes)</Label>
										<Input
											type="number"
											value={editForm.duration}
											onChange={(e) =>
												setEditForm({
													...editForm,
													duration: e.target.value,
												})
											}
										/>
									</div>
									<div className="space-y-2">
										<Label>Positive Score</Label>
										<Input
											type="number"
											value={editForm.positiveScore}
											onChange={(e) =>
												setEditForm({
													...editForm,
													positiveScore:
														e.target.value,
												})
											}
										/>
									</div>
									<div className="space-y-2">
										<Label>Negative Score</Label>
										<Input
											type="number"
											value={editForm.negativeScore}
											onChange={(e) =>
												setEditForm({
													...editForm,
													negativeScore:
														e.target.value,
												})
											}
										/>
									</div>
									<Button
										onClick={handleSaveEdit}
										className="w-full"
									>
										Save Changes
									</Button>
								</div>
							</DialogContent>
						</Dialog>
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
					{quiz.duration && <p>Duration: {quiz.duration} minutes</p>}
					{quiz.positiveScore && (
						<p>Positive Score: {quiz.positiveScore}</p>
					)}
					{quiz.negativeScore && (
						<p>Negative Score: {quiz.negativeScore}</p>
					)}
				</div>
				{quiz.createdAt && (
					<p className="text-xs text-muted-foreground mt-2">
						Created: {formatDate(quiz.createdAt)}
					</p>
				)}
				{quiz.isPremium && (
					<Badge variant="default" className="self-start">
						Premium
					</Badge>
				)}
			</div>
		</div>
	);
}
