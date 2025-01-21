import React, { useRef } from "react";
import { Button } from "./button";
import { Upload } from "lucide-react";

interface FileInputProps {
	onChange: (files: FileList | null) => void;
	disabled?: boolean;
	accept?: string;
	multiple?: boolean;
}

export function FileInput({
	onChange,
	disabled,
	accept,
	multiple,
}: FileInputProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleClick = () => {
		fileInputRef.current?.click();
	};

	return (
		<div className="relative">
			<input
				type="file"
				ref={fileInputRef}
				onChange={(e) => onChange(e.target.files)}
				className="hidden"
				accept={accept}
				multiple={multiple}
			/>
			<Button
				type="button"
				variant="outline"
				onClick={handleClick}
				disabled={disabled}
				className="w-full"
			>
				<Upload className="mr-2 h-4 w-4" />
				Choose Files
			</Button>
		</div>
	);
}
