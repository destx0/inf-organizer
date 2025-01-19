"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { useUploadStore } from "@/lib/store/upload-store";
import { Progress } from "@/components/ui/progress";

export default function UploaderPage() {
	const {
		file,
		isUploading,
		progress,
		setFile,
		setIsUploading,
		setProgress,
		reset,
	} = useUploadStore();

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setFile(e.target.files[0]);
		}
	};

	const handleUpload = async () => {
		if (!file) return;

		try {
			setIsUploading(true);
			// TODO: Implement file upload logic here with Firebase Storage
			console.log("Uploading file:", file.name);

			// Simulate upload progress
			for (let i = 0; i <= 100; i += 10) {
				await new Promise((resolve) => setTimeout(resolve, 500));
				setProgress(i);
			}

			reset();
		} catch (error) {
			console.error("Error uploading file:", error);
		} finally {
			setIsUploading(false);
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

			<div className="flex flex-col gap-4 rounded-lg border p-4">
				<Input
					type="file"
					onChange={handleFileChange}
					className="cursor-pointer"
					disabled={isUploading}
				/>
				{isUploading && <Progress value={progress} />}
				<Button
					onClick={handleUpload}
					disabled={!file || isUploading}
					className="w-full"
				>
					<Upload className="mr-2 h-4 w-4" />
					{isUploading ? "Uploading..." : "Upload File"}
				</Button>
			</div>

			{file && !isUploading && (
				<div className="rounded-lg border p-4">
					<p className="font-medium">Selected file:</p>
					<p className="text-sm text-muted-foreground">
						{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
					</p>
				</div>
			)}
		</div>
	);
}
