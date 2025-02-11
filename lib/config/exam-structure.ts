export const examStructure = {
  sections: [
    {
      name: "English Language",
      topics: [
        "Active Passive",
        "Cloze Test", 
        "Error Spotting",
        "Fill in the Blanks",
        "Idioms and Phrases",
        "Narration - Direct Indirect Speech",
        "One Word Substitution",
        "Reading Comprehension",
        "Sentence Correction",
        "Sentence Improvement",
        "Sentence Rearrangement",
        "Spellings Correction",
        "Synonyms-Antonyms"
      ]
    },
    {
      name: "General Awareness",
      topics: [
        "Ancient History",
        "Biology",
        "Chemistry",
        "Economics",
        "Geography",
        "Medieval History",
        "Miscellaneous",
        "Modern History",
        "Physics",
        "Polity",
        "Static"
      ]
    },
    {
      name: "General Intelligence",
      topics: [
        "Analogies",
        "Calendar",
        "Coding and Decoding",
        "Dice and Cube",
        "Direction Test",
        "Discrimination Skills (Odd One Out)",
        "General Reasoning (Observation)",
        "Logical Reasoning (Decision Making)",
        "Logical Reasoning (Judgment)",
        "Logical Reasoning (Statement Conclusion)",
        "Logical Reasoning (Syllogistic Reasoning)",
        "Non-Verbal",
        "Number Series",
        "Problem-Solving",
        "Venn Diagram",
        "Word Skills (Word Arrangement)",
        "Blood Relations"
      ]
    },
    {
      name: "Quantitative Aptitude",
      topics: [
        "Algebra",
        "Average",
        "Boat & Stream",
        "Compound Interest",
        "Discount",
        "Divisibility Rules",
        "Geometry",
        "Height & Distance",
        "LCM & HCF",
        "Mensuration 2D",
        "Mensuration 3D",
        "Mixture",
        "Number System",
        "Partnership",
        "Percentage",
        "Profit & Loss",
        "Ratio & Proportion",
        "Simple Interest",
        "Time & Distance",
        "Trigonometry"
      ]
    }
  ]
};

export const getPredefinedTopics = (sectionName: string): string[] => {
  const section = examStructure.sections.find(s => s.name === sectionName);
  return section?.topics || [];
};

export const PREDEFINED_SECTIONS = examStructure.sections.map(s => s.name); 