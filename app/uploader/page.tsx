"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Download } from "lucide-react";
import { useUploaderStore } from "@/lib/store/uploader-store";
import { useOrganizerStore } from "@/lib/store/organizer-store";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileInput } from "@/components/ui/file-input";
import { useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function UploaderPage() {
	const { files, isUploading, progress, setFiles, handleUpload } =
		useUploaderStore();

	const { data, selectedId } = useOrganizerStore();
	const [uploadedDocId, setUploadedDocId] = useState<string | null>(null);
	const [isDownloading, setIsDownloading] = useState(false);

	// Find the selected node and its type
	const getSelectedNode = () => {
		if (!selectedId || !data?.exams) return null;

		for (const exam of data.exams) {
			// Check if it's a full mock or pyq
			if (exam.full_mock === selectedId) {
				return {
					id: selectedId,
					name: `${exam.name} Full Mock`,
					type: "full_mock",
				};
			}
			if (exam.pyqs === selectedId) {
				return {
					id: selectedId,
					name: `${exam.name} PYQ`,
					type: "pyq",
				};
			}

			// Check sections and topics
			for (const section of exam.sections) {
				if (section.section_batchid === selectedId) {
					return {
						id: selectedId,
						name: section.name,
						type: "section",
					};
				}
				for (const topic of section.topics) {
					if (topic.topic_batchid === selectedId) {
						return {
							id: selectedId,
							name: topic.name,
							type: "topic",
						};
					}
				}
			}
		}
		return null;
	};

	const selectedNode = getSelectedNode();

	// Add console.log for debugging
	console.log({
		selectedId,
		selectedNode,
		data: data?.exams,
	});

	const handleFileChange = (files: FileList | null) => {
		if (files) {
			setFiles(Array.from(files));
		}
	};

	const handleUploadClick = async () => {
		if (!selectedNode || !selectedId || !files.length) return;

		try {
			const examId =
				data?.exams
					.find(
						(exam) =>
							exam.full_mock === selectedId ||
							exam.pyqs === selectedId ||
							exam.sections.some(
								(s) =>
									s.section_batchid === selectedId ||
									s.topics.some(
										(t) => t.topic_batchid === selectedId
									)
							)
					)
					?.name.toLowerCase()
					.replace(/\s+/g, "") || "";

			// Upload all files and store the last document ID
			for (const file of files) {
				const docId = await handleUpload(
					selectedId,
					selectedNode.type as
						| "section"
						| "full_mock"
						| "pyq"
						| "topic",
					examId,
					file
				);
				setUploadedDocId(docId);
			}
		} catch (error) {
			console.error("Upload failed:", error);
		}
	};

	const handleDownload = async () => {
		if (!uploadedDocId) return;

		try {
			setIsDownloading(true);
			const docRef = doc(db, "tmpQuizzes", uploadedDocId);
			const docSnap = await getDoc(docRef);

			if (docSnap.exists()) {
				const data = docSnap.data();
				const blob = new Blob([JSON.stringify(data, null, 2)], {
					type: "application/json",
				});
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `${uploadedDocId}.json`;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
			}
		} catch (error) {
			console.error("Download failed:", error);
		} finally {
			setIsDownloading(false);
		}
	};

	return (
		<div className="container mx-auto max-w-2xl space-y-6">
			<div className="space-y-2">
				<h1 className="text-3xl font-bold">Content Uploader</h1>
				<p className="text-muted-foreground">
					Upload and organize your exam content.
				</p>
			</div>

			{selectedNode ? (
				<Alert>
					<AlertDescription>
						Uploading to {selectedNode.type}:{" "}
						<span className="font-medium">{selectedNode.name}</span>
					</AlertDescription>
				</Alert>
			) : (
				<Alert variant="destructive">
					<AlertDescription>
						Please select a section, topic, full mock, or PYQ from
						the sidebar to upload content
					</AlertDescription>
				</Alert>
			)}

			<div className="flex flex-col gap-4 rounded-lg border p-4">
				<FileInput
					onChange={handleFileChange}
					disabled={isUploading || !selectedId}
					accept=".json"
					multiple={true}
				/>
				{isUploading && <Progress value={progress} />}
				<Button
					onClick={handleUploadClick}
					disabled={!files.length || isUploading || !selectedId}
					className="w-full"
				>
					<Upload className="mr-2 h-4 w-4" />
					{isUploading
						? "Uploading..."
						: `Upload ${files.length} File${
								files.length !== 1 ? "s" : ""
						  }`}
				</Button>
			</div>

			{files.length > 0 && !isUploading && (
				<div className="rounded-lg border p-4">
					<p className="font-medium">Selected files:</p>
					<div className="space-y-2">
						{files.map((file, index) => (
							<p
								key={index}
								className="text-sm text-muted-foreground"
							>
								{file.name} (
								{(file.size / 1024 / 1024).toFixed(2)} MB)
							</p>
						))}
					</div>
				</div>
			)}

			{uploadedDocId && (
				<div className="rounded-lg border p-4 space-y-4">
					<div className="space-y-2">
						<p className="font-medium">Uploaded Document ID:</p>
						<p className="text-sm font-mono bg-muted p-2 rounded">
							{uploadedDocId}
						</p>
					</div>
					<Button
						onClick={handleDownload}
						disabled={isDownloading}
						variant="outline"
						className="w-full"
					>
						<Download className="mr-2 h-4 w-4" />
						{isDownloading
							? "Downloading..."
							: "Download Firebase Document"}
					</Button>
				</div>
			)}
		</div>
	);
}
