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

interface CreateButtonProps {
	type: "exam" | "section" | "topic";
	onSubmit: (name: string) => void;
	parentName?: string;
}

export function CreateButton({
	type,
	onSubmit,
	parentName,
}: CreateButtonProps) {
	const [name, setName] = useState("");
	const [open, setOpen] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit(name);
		setName("");
		setOpen(false);
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
					<Input
						placeholder={`Enter ${type} name`}
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>
					<Button type="submit" disabled={!name.trim()}>
						Create {type}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
