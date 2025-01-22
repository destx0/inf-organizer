import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import "katex/dist/katex.min.css";
import katex from "katex";

interface LatexRendererProps {
	children: string;
}

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
	node?: any;
}

interface CellProps extends React.HTMLAttributes<HTMLTableCellElement> {
	node?: any;
}

const LatexRenderer: React.FC<LatexRendererProps> = ({ children }) => {
	const renderLatexString = (text: string): string => {
		// Match LaTeX expressions between $ signs
		return text.replace(/\$([^$]+)\$/g, (_, latex) => {
			try {
				return katex.renderToString(latex, {
					throwOnError: false,
					displayMode: false,
				});
			} catch (error) {
				console.error("LaTeX rendering error:", error);
				return latex;
			}
		});
	};

	const content = children;

	// If content contains HTML, render it with LaTeX
	if (/<[a-z][\s\S]*>/i.test(content)) {
		const renderedContent = renderLatexString(content);
		return <div dangerouslySetInnerHTML={{ __html: renderedContent }} />;
	}

	// Otherwise use ReactMarkdown
	return (
		<ReactMarkdown
			remarkPlugins={[remarkMath, remarkGfm]}
			rehypePlugins={[rehypeKatex]}
			components={{
				table: ({ node, ...props }: TableProps) => (
					<table
						className="border-collapse border border-gray-300"
						{...props}
					/>
				),
				td: ({ node, ...props }: CellProps) => (
					<td className="border border-gray-300 p-2" {...props} />
				),
				th: ({ node, ...props }: CellProps) => (
					<th
						className="border border-gray-300 p-2 font-bold"
						{...props}
					/>
				),
				sup: ({ node, ...props }) => <sup {...props} />,
				b: ({ node, ...props }) => <strong {...props} />,
			}}
		>
			{content}
		</ReactMarkdown>
	);
};

export default LatexRenderer;
