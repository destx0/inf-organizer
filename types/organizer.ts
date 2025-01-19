export interface Topic {
	name: string;
	no_of_questions: number;
	topic_batchid: string;
}

export interface Section {
	name: string;
	description: string;
	section_batchid: string;
	topics: Topic[];
}

export interface Exam {
	full_mock: string;
	name: string;
	pyqs_batchid: string;
	section_batchid: string;
	sections: {
		[key: string]: Section;
	};
}

export interface OrganizerData {
	exams: Exam[];
}
