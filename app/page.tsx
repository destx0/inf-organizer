"use client";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/auth-store";

export default function Home() {
	const router = useRouter();
	const { user } = useAuthStore();

	useEffect(() => {
		// If user is logged in, redirect to uploader
		if (user) {
			// Don't automatically redirect
			// router.push("/uploader");
		}
	}, [user, router]);

	const handleGoogleLogin = async () => {
		try {
			const provider = new GoogleAuthProvider();
			await signInWithPopup(auth, provider);
			router.push("/uploader");
		} catch (error) {
			console.error("Error signing in with Google:", error);
		}
	};

	const handleSignOut = async () => {
		try {
			await signOut(auth);
		} catch (error) {
			console.error("Error signing out:", error);
		}
	};

	// Don't return null when user is logged in
	return (
		<div className="container mx-auto max-w-2xl min-h-screen flex flex-col items-center justify-center">
			<div className="space-y-6 text-center">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold">
						Welcome to Infinity Organizer
					</h1>
					<p className="text-muted-foreground">
						Your comprehensive exam preparation companion.
					</p>
				</div>
				{!user ? (
					<Button
						onClick={handleGoogleLogin}
						size="lg"
						className="min-w-[200px]"
					>
						Get Started
					</Button>
				) : (
					<div className="space-y-4">
						<div className="flex gap-4 justify-center">
							<Button
								onClick={() => router.push("/uploader")}
								size="lg"
							>
								Go to Uploader
							</Button>
							<Button
								onClick={() => router.push("/pdf-downloader")}
								size="lg"
							>
								Go to PDF Downloader
							</Button>
						</div>
						<Button
							onClick={handleSignOut}
							variant="outline"
							size="lg"
						>
							Sign Out
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
