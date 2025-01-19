"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
} from "@/components/ui/sidebar";
import { TreeView } from "@/components/tree-view";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import {
	Home,
	LogIn,
	LogOut,
	Settings,
	Upload,
	User,
	FileText,
	Book,
	Brain,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { useOrganizerStore } from "@/lib/store/organizer-store";
import { useEffect } from "react";

function isExamArray(data: any): data is { exams: any[] } {
	return data && Array.isArray(data.exams);
}

export function MainSidebar() {
	const user = useAuthStore((state) => state.user);
	const { data, fetchData } = useOrganizerStore();

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const treeData = isExamArray(data)
		? data.exams.map((exam) => ({
				id: exam.full_mock,
				name: exam.name,
				icon: Book,
				children: Object.entries(exam.sections).map(
					([key, section]) => ({
						id: section.section_batchid,
						name: section.name,
						children: section.topics.map((topic) => ({
							id: topic.topic_batchid,
							name: `${topic.name} (${topic.no_of_questions})`,
						})),
					})
				),
		  }))
		: [];

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
							<a href="/">
								<Home className="h-4 w-4" />
								<span>Home</span>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
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
							<a href="/settings">
								<Settings className="h-4 w-4" />
								<span>Settings</span>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>

				<div className="mt-6 px-4">
					<h3 className="mb-4 text-sm font-medium text-muted-foreground">
						Exam Categories
					</h3>
					<TreeView data={treeData} className="[&>li]:pl-0" />
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
