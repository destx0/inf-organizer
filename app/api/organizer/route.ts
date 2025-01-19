import { NextResponse } from "next/server";

const mockData = {
	exams: [
		{
			full_mock: "ipla9A33OmSvYwp39Ibb",
			name: "CGL",
			pyqs_batchid: "bJj0oDJ33OwNE7DmGzkE",
			section_batchid: "ipla9A33OmSvYwp39Ibb",
			sections: {
				ga: {
					name: "General Awareness",
					description:
						"Covers topics like history, science, and current events to test the candidate's overall awareness.",
					section_batchid: "tQcVQ44SE6INwQAKmA0Y",
					topics: [
						{
							name: "General Awareness",
							no_of_questions: 50,
							topic_batchid: "ga_topic_1",
						},
						{
							name: "History",
							no_of_questions: 30,
							topic_batchid: "ga_topic_2",
						},
						{
							name: "Science",
							no_of_questions: 20,
							topic_batchid: "ga_topic_3",
						},
					],
				},
				// ... rest of the mock data
			},
		},
		// ... other exams
	],
};

export async function GET() {
	return NextResponse.json(mockData);
}
