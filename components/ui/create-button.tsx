import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./dialog";
import { Input } from "./input";
import { useState } from "react";
import { Checkbox } from "./checkbox";
import {
	PREDEFINED_SECTIONS,
	getPredefinedTopics,
} from "@/lib/config/exam-structure";

interface CreateButtonProps {
	type: "exam" | "section" | "topic";
	onSubmit: (name: string | string[]) => void;
	parentName?: string;
}

export function CreateButton({
	type,
	onSubmit,
	parentName,
}: CreateButtonProps) {
	const [name, setName] = useState("");
	const [open, setOpen] = useState(false);
	const [selectedItems, setSelectedItems] = useState<string[]>([]);

	const predefinedItems =
		type === "section"
			? PREDEFINED_SECTIONS
			: type === "topic" && parentName
			? getPredefinedTopics(parentName)
			: [];

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (
			(type === "section" || type === "topic") &&
			selectedItems.length > 0
		) {
			onSubmit(selectedItems);
		} else {
			onSubmit(name);
		}
		setName("");
		setSelectedItems([]);
		setOpen(false);
	};

	const toggleItem = (item: string) => {
		setSelectedItems((prev) =>
			prev.includes(item)
				? prev.filter((s) => s !== item)
				: [...prev, item]
		);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="ghost" size="icon" className="h-8 w-8">
					<Plus className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create new {type}</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					{parentName && (
						<p className="text-sm text-muted-foreground">
							Creating in: {parentName}
						</p>
					)}
					{(type === "section" || type === "topic") &&
					predefinedItems.length > 0 ? (
						<div className="space-y-4">
							<div className="space-y-2 max-h-[300px] overflow-y-auto">
								{predefinedItems.map((item) => (
									<div
										key={item}
										className="flex items-center space-x-2"
									>
										<Checkbox
											id={item}
											checked={selectedItems.includes(
												item
											)}
											onCheckedChange={() =>
												toggleItem(item)
											}
										/>
										<label
											htmlFor={item}
											className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
										>
											{item}
										</label>
									</div>
								))}
							</div>
							<div className="relative">
								<div className="absolute inset-0 flex items-center">
									<span className="w-full border-t" />
								</div>
								<div className="relative flex justify-center text-xs uppercase">
									<span className="bg-background px-2 text-muted-foreground">
										Or create custom {type}
									</span>
								</div>
							</div>
							<Input
								placeholder={`Enter custom ${type} name`}
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</div>
					) : (
						<Input
							placeholder={`Enter ${type} name`}
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					)}
					<Button
						type="submit"
						disabled={
							type === "section" || type === "topic"
								? !name.trim() && selectedItems.length === 0
								: !name.trim()
						}
					>
						Create {type}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
