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
				children: Object.entries(exam.sections).map(([key, section]) => ({
					id: section.section_batchid,
					name: section.name,
					icon: FileText,
					children: section.topics.map((topic) => ({
						id: topic.topic_batchid,
						name: `${topic.name} (${topic.no_of_questions})`,
						icon: Brain,
					})),
				}))
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
			<SidebarHeader className="border-b p-4">
				<h2 className="font-semibold">Infinity Organizer</h2>
			</SidebarHeader>
			<SidebarContent>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton asChild>
							<a href="/">
								<Home className="h-4 w-4" />
								<span>Home</span>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton asChild>
							<a href="/uploader">
								<Upload className="h-4 w-4" />
								<span>Uploader</span>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton asChild>
							<a href="/settings">
								<Settings className="h-4 w-4" />
								<span>Settings</span>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>

				<div className="mt-6 px-4">
					<h3 className="mb-2 text-sm font-medium">
						Exam Categories
					</h3>
					<TreeView data={treeData} className="[&>li]:pl-0" />
				</div>
			</SidebarContent>
			<SidebarFooter className="border-t p-4">
				{user ? (
					<div className="flex flex-col gap-2">
						<div className="flex items-center gap-2">
							<User className="h-4 w-4" />
							<span className="text-sm font-medium">
								{user.displayName}
							</span>
						</div>
						<Button
							onClick={handleSignOut}
							variant="destructive"
							size="sm"
							className="w-full"
						>
							<LogOut className="mr-2 h-4 w-4" />
							Sign Out
						</Button>
					</div>
				) : (
					<Button
						onClick={handleGoogleLogin}
						size="sm"
						className="w-full"
					>
						<LogIn className="mr-2 h-4 w-4" />
						Sign in with Google
					</Button>
				)}
			</SidebarFooter>
		</Sidebar>
	);
}
