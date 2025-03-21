/* eslint-disable @typescript-eslint/no-explicit-any */
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useUploaderStore } from "@/lib/store/uploader-store";
import {
	Language,
	OrganizerData,
	Exam,
	Section,
	Topic,
} from "@/types/organizer";
import { Book } from "lucide-react";
import { useOrganizerStore } from "@/lib/store/organizer-store";
import { TreeView } from "@/components/tree-view";
import { CreateButton } from "@/components/ui/create-button";
import { useCallback, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/lib/store/auth-store";
import { useRouter } from "next/navigation";
import { setIntendedPath } from "@/lib/utils/path-utils";

function isExamArray(data: any): data is OrganizerData {
	return data && Array.isArray(data.exams);
}

export function UploaderSection() {
	const router = useRouter();
	const { user } = useAuthStore();
	const { selectedLanguage, setSelectedLanguage } = useUploaderStore();

	const {
		data,

		setSelectedId,
		createExam,
		createSection,
		createTopic,
		fetchData,
		isLoading,
		error,
	} = useOrganizerStore();

	useEffect(() => {
		if (!user) {
			setIntendedPath("/uploader");
			router.push("/login");
			return;
		}
		console.log("UploaderSection mounted, fetching data...");
		fetchData();
	}, [fetchData, user, router]);

	useEffect(() => {
		console.log("Data changed:", data);
	}, [data]);

	const handleCreateExam = async (name: string | string[]) => {
		if (typeof name === "string") {
			await createExam(name);
		}
	};

	const handleCreateSection = async (
		examId: string,
		names: string | string[]
	) => {
		await createSection(examId, names);
	};

	const handleCreateTopic = async (
		examId: string,
		sectionId: string,
		names: string | string[]
	) => {
		if (Array.isArray(names)) {
			for (const name of names) {
				await createTopic(examId, sectionId, name);
			}
		} else {
			await createTopic(examId, sectionId, names);
		}
	};

	const handleNodeClick = useCallback(
		(nodeId: string) => {
			// Check if it's a section, topic, full mock, or pyq
			const isValidNode = data?.exams?.some((exam: any) => {
				// Check if it's a full mock or pyq
				if (exam.full_mock === nodeId || exam.pyqs === nodeId) {
					return true; // Allow selection of full mock and pyq nodes
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

			if (isValidNode) {
				setSelectedId(nodeId);
			}
		},
		[data, setSelectedId]
	);

	const treeData = isExamArray(data)
		? data.exams.map((exam: Exam) => ({
				id: exam.name.toLowerCase().replace(/\s+/g, ""),
				name: exam.name,
				icon: Book,
				actions: (
					<CreateButton
						type="section"
						onSubmit={(names) =>
							handleCreateSection(
								exam.name.toLowerCase().replace(/\s+/g, ""),
								names
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
						isLeaf: true, // This makes it selectable
					},
					{
						id: exam.pyqs,
						name: "PYQ",
						icon: Book,
						isLeaf: true, // This makes it selectable
					},
					...exam.sections.map((section: Section) => ({
						id: section.section_batchid,
						name: section.name,
						icon: Book,
						actions: (
							<CreateButton
								type="topic"
								onSubmit={(names) =>
									handleCreateTopic(
										exam.name
											.toLowerCase()
											.replace(/\s+/g, ""),
										section.section_batchid,
										names
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
				],
		  }))
		: [];

	// If not authenticated, don't render the component
	if (!user) {
		return null;
	}

	return (
		<div className="">
			<Separator className="mb-4" />
			<div className="mb-4 space-y-2">
				<h4 className="text-sm font-medium text-muted-foreground">
					Select Language
				</h4>
				<RadioGroup
					value={selectedLanguage}
					onValueChange={(value) =>
						setSelectedLanguage(value as Language)
					}
					className="flex flex-row space-x-4"
				>
					<div className="flex items-center space-x-2">
						<RadioGroupItem value="english" id="english" />
						<Label htmlFor="english">Eng</Label>
					</div>
					<div className="flex items-center space-x-2">
						<RadioGroupItem value="bengali" id="bengali" />
						<Label htmlFor="bengali">Ben</Label>
					</div>
					<div className="flex items-center space-x-2">
						<RadioGroupItem value="hindi" id="hindi" />
						<Label htmlFor="hindi">Hin</Label>
					</div>
				</RadioGroup>
			</div>
			<div className="flex items-center justify-between ">
				<h3 className="text-sm font-medium text-muted-foreground">
					Exam Categories
				</h3>
				<CreateButton
					type="exam"
					onSubmit={(name) => {
						if (typeof name === "string") {
							handleCreateExam(name);
						}
					}}
				/>
			</div>

			{isLoading ? (
				<div className="text-center py-4">
					Loading exam categories...
				</div>
			) : error ? (
				<div className="text-red-500 py-4">{error}</div>
			) : data?.exams?.length === 0 ? (
				<div className="text-center py-4">
					No exams found. Create one to get started.
				</div>
			) : (
				<TreeView
					data={treeData}
					className="[&>li]:pl-0"
					onNodeClick={handleNodeClick}
				/>
			)}
		</div>
	);
}
