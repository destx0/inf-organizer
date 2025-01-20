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
import { log } from "console";
import { Separator } from "@/components/ui/separator";

function isExamArray(data: any): data is OrganizerData {
	return data && Array.isArray(data.exams);
}

export function UploaderSection() {
	const { selectedLanguage, setSelectedLanguage } = useUploaderStore();

	const {
		data,
		selectedId,
		setSelectedId,
		createExam,
		createSection,
		createTopic,
		fetchData,
		isLoading,
		error,
	} = useOrganizerStore();

	useEffect(() => {
		console.log("UploaderSection mounted, fetching data...");
		fetchData();
	}, [fetchData]);

	useEffect(() => {
		console.log("Data changed:", data);
	}, [data]);

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

			if (isValidNode) {
				setSelectedId(nodeId);
			}
		},
		[data, setSelectedId]
	);

	const treeData = isExamArray(data)
		? data.exams.map((exam: Exam) => {
				console.log("Processing exam:", exam);
				return {
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
								children: section.topics.map(
									(topic: Topic) => ({
										id: topic.topic_batchid,
										name: `${topic.name} (${topic.no_of_questions})`,
									})
								),
							})),
						},
					],
				};
		  })
		: [];

	return (
		<div className="">
			<Separator className="my-4" />
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
				<CreateButton type="exam" onSubmit={handleCreateExam} />
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
