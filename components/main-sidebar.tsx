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
	Book,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { useOrganizerStore } from "@/lib/store/organizer-store";
import { useEffect, useCallback } from "react";
import { CreateButton } from "@/components/ui/create-button";
import { OrganizerData, Exam, Section, Topic } from "@/types/organizer";

function isExamArray(data: any): data is OrganizerData {
	return data && Array.isArray(data.exams);
}

export function MainSidebar() {
	const user = useAuthStore((state) => state.user);
	const {
		data,
		fetchData,
		setSelectedId,
		createExam,
		createSection,
		createTopic,
	} = useOrganizerStore();

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const handleCreateExam = async (name: string) => {
		await createExam(name);
	};

	const handleCreateSection = async (examId: string, name: string) => {
		await createSection(examId, name);
	};

	const handleCreateTopic = async (
		examId: string,
		sectionId: string,
		name: string
	) => {
		await createTopic(examId, sectionId, name);
	};

	const treeData = isExamArray(data)
		? data.exams.map((exam: Exam) => ({
				id: exam.name.toLowerCase().replace(/\s+/g, ""),
				name: exam.name,
				icon: Book,
				actions: (
					<CreateButton
						type="section"
						onSubmit={(name) =>
							handleCreateSection(
								exam.name.toLowerCase().replace(/\s+/g, ""),
								name
							)
						}
						parentName={exam.name}
					/>
				),
				children: [
					{
						id: exam.full_mock,
						name: "Full Mock",
						icon: Book,
						isLeaf: true,
					},
					{
						id: exam.pyqs,
						name: "PYQ",
						icon: Book,
						isLeaf: true,
					},
					{
						id: `${exam.name
							.toLowerCase()
							.replace(/\s+/g, "")}-divider`,
						name: "Sections",
						icon: Book,
						isSection: true,
						children: exam.sections.map((section: Section) => ({
							id: section.section_batchid,
							name: section.name,
							actions: (
								<CreateButton
									type="topic"
									onSubmit={(name) =>
										handleCreateTopic(
											exam.name
												.toLowerCase()
												.replace(/\s+/g, ""),
											section.section_batchid,
											name
										)
									}
									parentName={section.name}
								/>
							),
							children: section.topics.map((topic: Topic) => ({
								id: topic.topic_batchid,
								name: `${topic.name} (${topic.no_of_questions})`,
							})),
						})),
					},
				],
		  }))
		: [];

	const handleNodeClick = useCallback(
		(nodeId: string) => {
			// Check if it's a section, topic, full mock, or pyq
			const isValidNode = data?.exams?.some((exam: any) => {
				// Check if it's a full mock or pyq
				if (exam.full_mock === nodeId || exam.pyqs === nodeId) {
					return true;
				}

				// Check if it's a section or topic
				return (exam.sections || []).some(
					(section: any) =>
						section.section_batchid === nodeId || // Check if it's a section
						(section.topics || []).some(
							(topic: any) => topic.topic_batchid === nodeId
						) // Check if it's a topic
				);
			});

			// Add more detailed console.log for debugging
			console.log({
				nodeId,
				isValidNode,
				sections: data?.exams?.flatMap((exam) => [
					{
						id: exam.full_mock,
						name: "Full Mock",
						type: "full_mock",
					},
					{
						id: exam.pyqs,
						name: "PYQ",
						type: "pyq",
					},
					...(exam.sections || []).map((section) => ({
						id: section.section_batchid,
						name: section.name,
						type: "section",
						topics: (section.topics || []).map((topic) => ({
							id: topic.topic_batchid,
							name: topic.name,
							type: "topic",
						})),
					})),
				]),
			});

			if (isValidNode) {
				setSelectedId(nodeId);
			}
		},
		[data, setSelectedId]
	);

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
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-sm font-medium text-muted-foreground">
							Exam Categories
						</h3>
						<CreateButton type="exam" onSubmit={handleCreateExam} />
					</div>
					<TreeView
						data={treeData}
						className="[&>li]:pl-0"
						onNodeClick={handleNodeClick}
					/>
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
