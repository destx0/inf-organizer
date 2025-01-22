"use client";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
} from "@/components/ui/sidebar";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { Download, LogIn, LogOut, Upload, User } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { Button } from "@/components/ui/button";
import { UploaderSection } from "@/components/uploader-section";

export function MainSidebar() {
	const user = useAuthStore((state) => state.user);

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
		<Sidebar>
			<SidebarHeader className="border-b px-6 py-4">
				<h2 className="text-lg font-semibold tracking-tight">
					Infinity Organizer
				</h2>
			</SidebarHeader>
			<SidebarContent className="px-2">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="px-4 py-2 hover:bg-accent rounded-lg transition-colors"
						>
							<a href="/uploader">
								<Upload className="h-4 w-4" />
								<span>Uploader</span>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="px-4 py-2 hover:bg-accent rounded-lg transition-colors"
						>
							<a href="/pdf-downloader">
								<Download className="h-4 w-4" />
								<span>PDF Downloader</span>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>

				<div className=" px-4">
					<UploaderSection />
				</div>
			</SidebarContent>
			<SidebarFooter className="border-t p-4">
				{user ? (
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
								<User className="h-4 w-4" />
							</div>
							<span className="text-sm font-medium truncate">
								{user.displayName}
							</span>
						</div>
						<Button
							onClick={handleSignOut}
							variant="ghost"
							size="icon"
							className="h-8 w-8"
						>
							<LogOut className="h-4 w-4" />
						</Button>
					</div>
				) : (
					<Button
						onClick={handleGoogleLogin}
						variant="outline"
						size="sm"
						className="w-full"
					>
						<LogIn className="mr-2 h-4 w-4" />
						Sign in
					</Button>
				)}
			</SidebarFooter>
		</Sidebar>
	);
}
