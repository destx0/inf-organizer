"use client";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { useState, useEffect } from "react";

export default function Home() {
	const [user, setUser] = useState<any>(null);

	useEffect(() => {
		const unsubscribe = auth.onAuthStateChanged((user) => {
			setUser(user);
		});

		return () => unsubscribe();
	}, []);

	const handleGoogleLogin = async () => {
		try {
			const provider = new GoogleAuthProvider();
			await signInWithPopup(auth, provider);
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

	return (
		<div className="container mx-auto max-w-2xl space-y-6">
			<div className="space-y-2">
				<h1 className="text-3xl font-bold">
					Welcome to Infinity Organizer
				</h1>
				<p className="text-muted-foreground">
					Your comprehensive exam preparation companion.
				</p>
			</div>
			{user ? (
				<div className="text-center">
					<p className="mb-4">Welcome, {user.displayName}!</p>
					<Button onClick={handleSignOut} variant="destructive">
						Sign Out
					</Button>
				</div>
			) : (
				<Button onClick={handleGoogleLogin}>Sign in with Google</Button>
			)}
		</div>
	);
}
