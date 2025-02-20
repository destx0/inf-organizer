"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EditFormData } from "@/lib/types";
import { QuizMetadata } from "@/lib/types";
import { Progress } from "@/components/ui/progress";

interface BatchEditDialogProps {
	onBatchEdit: (
		updates: {
			quizIndex: number;
			batchId: string;
			title?: string;
			duration?: number;
			positiveScore?: number;
			negativeScore?: number;
			description?: string;
		}[]
	) => Promise<void>;
	quizzes: QuizMetadata[];
	batchId: string;
}

export function BatchEditDialog({
	onBatchEdit,
	quizzes,
	batchId,
}: BatchEditDialogProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [progress, setProgress] = useState(0);
	const [isProcessing, setIsProcessing] = useState(false);
	const [editForm, setEditForm] = useState<EditFormData>({
		duration: "",
		positiveScore: "",
		negativeScore: "",
		title: "",
		description: "",
	});
	const [titlePreviews, setTitlePreviews] = useState<
		{ old: string; new: string }[]
	>([]);

	function extractNumber(title: string): number | null {
		const match = title.match(/\d+/);
		return match ? parseInt(match[0]) : null;
	}

	function replacePlaceholder(pattern: string, number: number): string {
		return pattern.replaceAll("$$", number.toString());
	}

	useEffect(() => {
		if (editForm.title && editForm.title.includes("$$")) {
			const previews = quizzes.map((quiz, index) => {
				const existingNumber = extractNumber(quiz.title) || index + 1;
				const newTitle = replacePlaceholder(
					editForm.title,
					existingNumber
				);
				return {
					old: quiz.title,
					new: newTitle,
				};
			});
			setTitlePreviews(previews);
		} else {
			setTitlePreviews([]);
		}
	}, [editForm.title, quizzes]);

	const handleSave = async () => {
		try {
			setIsProcessing(true);
			const baseUpdate: Partial<QuizMetadata> = {};

			if (editForm.duration) {
				baseUpdate.duration = parseInt(editForm.duration);
			}
			if (editForm.positiveScore) {
				baseUpdate.positiveScore = parseInt(editForm.positiveScore);
			}
			if (editForm.negativeScore) {
				baseUpdate.negativeScore = parseInt(editForm.negativeScore);
			}

			if (editForm.title) {
				const updates = quizzes.map((quiz, index) => {
					const existingNumber =
						extractNumber(quiz.title) || index + 1;
					const processedTitle = editForm.title.includes("$$")
						? replacePlaceholder(editForm.title, existingNumber)
						: editForm.title;

					return {
						...baseUpdate,
						title: processedTitle,
						batchId,
						quizIndex: index,
					};
				});

				await onBatchEdit(updates);
			} else if (Object.keys(baseUpdate).length > 0) {
				// If we have updates but no title changes
				const updates = quizzes.map((quiz, index) => ({
					...baseUpdate,
					batchId,
					quizIndex: index,
				}));
				await onBatchEdit(updates);
			}

			setIsOpen(false);
			setEditForm({
				duration: "",
				positiveScore: "",
				negativeScore: "",
				title: "",
				description: "",
			});
			setTitlePreviews([]);
		} catch (error) {
			console.error("Failed to update all quizzes:", error);
		} finally {
			setIsProcessing(false);
			setProgress(0);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" className="mb-4">
					Batch Edit Quizzes
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Edit All Quizzes</DialogTitle>
				</DialogHeader>
				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label>Title Pattern</Label>
						<Input
							value={editForm.title}
							onChange={(e) =>
								setEditForm({
									...editForm,
									title: e.target.value,
								})
							}
							placeholder="Use $$ for number (e.g. 'Quiz Set $$')"
						/>
						<p className="text-sm text-muted-foreground">
							Use $$ as a placeholder for numbers. Example:
							&quot;Comprehensive Quiz - Set $$&quot; will become
							&quot;Comprehensive Quiz - Set 1&quot;,
							&quot;Comprehensive Quiz - Set 2&quot;, etc.
						</p>
						{titlePreviews.length > 0 && (
							<div className="mt-4 border rounded-lg p-4 space-y-2">
								<Label>Title Preview:</Label>
								<div className="max-h-40 overflow-y-auto space-y-2">
									{titlePreviews.map((preview, index) => (
										<div
											key={index}
											className="text-sm grid grid-cols-2 gap-2"
										>
											<div className="text-muted-foreground">
												{preview.old}
											</div>
											<div className="font-medium">
												→ {preview.new}
											</div>
										</div>
									))}
								</div>
							</div>
						)}
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
							placeholder="Leave empty to keep existing values"
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
									positiveScore: e.target.value,
								})
							}
							placeholder="Leave empty to keep existing values"
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
									negativeScore: e.target.value,
								})
							}
							placeholder="Leave empty to keep existing values"
						/>
					</div>
					{isProcessing && (
						<div className="space-y-2">
							<Progress value={progress} className="w-full" />
							<p className="text-sm text-center text-muted-foreground">
								Updating quizzes... {Math.round(progress)}%
							</p>
						</div>
					)}
					<Button
						onClick={handleSave}
						className="w-full"
						disabled={isProcessing}
					>
						{isProcessing ? "Updating..." : "Update All Quizzes"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
