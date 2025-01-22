"use client";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/auth-store";

export default function LoginPage() {
	const router = useRouter();
	const { user } = useAuthStore();

	useEffect(() => {
		// If user is already logged in, redirect to uploader
		if (user) {
			// Get the redirect path from URL or default to uploader
			const urlParams = new URLSearchParams(window.location.search);
			const redirect = urlParams.get("redirect") || "/uploader";
			router.push(redirect);
		}
	}, [user, router]);

	const handleGoogleLogin = async () => {
		try {
			const provider = new GoogleAuthProvider();
			await signInWithPopup(auth, provider);
			// Get the redirect path from URL or default to uploader
			const urlParams = new URLSearchParams(window.location.search);
			const redirect = urlParams.get("redirect") || "/uploader";
			router.push(redirect);
		} catch (error) {
			console.error("Error signing in with Google:", error);
		}
	};

	// Don't render anything if user is already logged in (prevents flash)
	if (user) {
		return null;
	}

	return (
		<div className="container mx-auto max-w-2xl min-h-screen flex flex-col items-center justify-center">
			<div className="w-full max-w-sm space-y-6 text-center">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold tracking-tighter">
						Welcome back
					</h1>
					<p className="text-sm text-muted-foreground">
						Sign in to access the content uploader
					</p>
				</div>

				<Button
					onClick={handleGoogleLogin}
					className="w-full"
					size="lg"
				>
					<svg
						className="mr-2 h-4 w-4"
						aria-hidden="true"
						focusable="false"
						data-prefix="fab"
						data-icon="google"
						role="img"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 488 512"
					>
						<path
							fill="currentColor"
							d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
						></path>
					</svg>
					Sign in with Google
				</Button>
			</div>
		</div>
	);
}
