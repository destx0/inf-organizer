import { useCallback, useEffect } from "react";
import { useOrganizerStore } from "@/lib/store/organizer-store";
import { TreeView } from "@/components/tree-view";
import { Book } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/lib/store/auth-store";
import { useRouter } from "next/navigation";
import { setIntendedPath } from "@/lib/utils/path-utils";

export function DownloaderSection() {
	const router = useRouter();
	const { user } = useAuthStore();
	const { data, setSelectedId, fetchData, isLoading, error } =
		useOrganizerStore();

	useEffect(() => {
		if (!user) {
			setIntendedPath("/downloader");
			router.push("/login");
			return;
		}
		fetchData();
	}, [fetchData, user, router]);

	const handleNodeClick = useCallback(
		(nodeId: string) => {
			setSelectedId(nodeId);
		},
		[setSelectedId]
	);

	const treeData =
		data?.exams?.map((exam) => ({
			id: exam.name.toLowerCase().replace(/\s+/g, ""),
			name: exam.name,
			icon: Book,
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
				...exam.sections.map((section) => ({
					id: section.section_batchid,
					name: section.name,
					icon: Book,
					children: section.topics.map((topic) => ({
						id: topic.topic_batchid,
						name: `${topic.name} (${topic.no_of_questions})`,
					})),
				})),
			],
		})) || [];

	if (!user) {
		return null;
	}

	return (
		<div className="">
			<Separator className="mb-4" />
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-medium text-muted-foreground">
					Download Quiz Data
				</h3>
			</div>

			{isLoading ? (
				<div className="text-center py-4">
					Loading exam categories...
				</div>
			) : error ? (
				<div className="text-red-500 py-4">{error}</div>
			) : data?.exams?.length === 0 ? (
				<div className="text-center py-4">No exams found.</div>
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
