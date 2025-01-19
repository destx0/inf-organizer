export default function UploaderLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex">
			<div className="flex-1">{children}</div>
		</div>
	);
}
