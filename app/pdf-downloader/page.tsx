"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { useRouter } from "next/navigation";

export default function PdfDownloaderPage() {
	const [isDownloading, setIsDownloading] = useState(false);
	const router = useRouter();
	const { user } = useAuthStore();

	useEffect(() => {
		if (!user) {
			router.push("/login?redirect=/pdf-downloader");
		}
	}, [user, router]);

	const handleDownload = async () => {
		try {
			setIsDownloading(true);
			const response = await fetch("/api/generate-pdf", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ docId: "sample" }), // You can pass the actual docId here
			});

			if (!response.ok) throw new Error("PDF generation failed");

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "quiz.pdf";
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Download failed:", error);
		} finally {
			setIsDownloading(false);
		}
	};

	// Don't render content if user is not authenticated
	if (!user) {
		return null;
	}

	return (
		<div className="container mx-auto max-w-2xl space-y-6 p-4">
			<div className="space-y-2">
				<h1 className="text-xl font-bold">PDF Downloader</h1>
			</div>

			<div className="flex flex-col gap-4 rounded-lg border p-4">
				<Button
					onClick={handleDownload}
					disabled={isDownloading}
					className="w-full"
				>
					<Download className="mr-2 h-4 w-4" />
					{isDownloading ? "Generating PDF..." : "Download PDF"}
				</Button>
			</div>
		</div>
	);
}
