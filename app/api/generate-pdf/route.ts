import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import sampleData from "@/data/sample-quiz.json";
import katex from "katex";

export async function POST(request: Request) {
	try {
		const browser = await puppeteer.launch({ headless: "new" });
		const page = await browser.newPage();

		// Generate HTML content with the quiz data
		const htmlContent = generateQuizHTML(sampleData);
		await page.setContent(htmlContent, {
			waitUntil: "networkidle0",
		});

		// Generate PDF
		const pdf = await page.pdf({
			format: "A4",
			margin: {
				top: "20mm",
				right: "20mm",
				bottom: "20mm",
				left: "20mm",
			},
		});

		await browser.close();

		// Return the PDF as a response
		return new NextResponse(pdf, {
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": "attachment; filename=quiz.pdf",
			},
		});
	} catch (error) {
		console.error("PDF generation failed:", error);
		return NextResponse.json(
			{ error: "PDF generation failed" },
			{ status: 500 }
		);
	}
}

function renderLatex(text: string): string {
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
}

function generateQuizHTML(quizData: any) {
	const content = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>${quizData.title}</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css">
        <style>
          body { font-family: Arial, sans-serif; }
          .section { margin: 20px 0; }
          .question { margin: 15px 0; }
          .options { margin-left: 20px; }
          .explanation { margin-top: 10px; color: #666; }
        </style>
      </head>
      <body>
        <h1>${quizData.title}</h1>
        <p>${quizData.description}</p>
        ${quizData.sections
			.map(
				(section: any) => `
          <div class="section">
            <h2>${section.name}</h2>
            ${section.questions
				.map(
					(q: any, qIndex: number) => `
              <div class="question">
                <p><strong>Q${qIndex + 1}.</strong> ${renderLatex(
						q.question
					)}</p>
                <div class="options">
                  ${q.options
						.map(
							(opt: string, i: number) => `
                    <p>${String.fromCharCode(65 + i)}. ${renderLatex(opt)}</p>
                  `
						)
						.join("")}
                </div>
                <div class="explanation">
                  <p><strong>Explanation:</strong> ${renderLatex(
						q.explanation
					)}</p>
                </div>
              </div>
            `
				)
				.join("")}
          </div>
        `
			)
			.join("")}
      </body>
    </html>
  `;

	return content;
}
