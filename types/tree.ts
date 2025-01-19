export interface TreeDataItem {
	id: string;
	name: string;
	icon?: any;
	selectedIcon?: any;
	openIcon?: any;
	children?: TreeDataItem[];
	actions?: React.ReactNode;
	onClick?: () => void;
}
