import { create } from "zustand";

interface UploadState {
	file: File | null;
	isUploading: boolean;
	progress: number;
	setFile: (file: File | null) => void;
	setIsUploading: (isUploading: boolean) => void;
	setProgress: (progress: number) => void;
	reset: () => void;
}

export const useUploadStore = create<UploadState>((set) => ({
	file: null,
	isUploading: false,
	progress: 0,
	setFile: (file) => set({ file }),
	setIsUploading: (isUploading) => set({ isUploading }),
	setProgress: (progress) => set({ progress }),
	reset: () => set({ file: null, isUploading: false, progress: 0 }),
}));
