export interface Topic {
	name: string;
	no_of_questions: number;
	topic_batchid: string;
	createdAt: Date;
}

export interface Section {
	name: string;
	section_batchid: string;
	topics: Topic[];
	createdAt: Date;
}

export interface Exam {
	name: string;
	full_mock: string;
	pyqs: string;
	sections: Section[];
	createdAt: Date;
}

export interface OrganizerData {
	exams: Exam[];
}
