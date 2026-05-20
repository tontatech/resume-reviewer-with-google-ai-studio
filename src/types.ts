export interface Suggestion {
  sentence: string;
  improvement: string;
}

export interface ReviewCategory {
  title: string;
  score: number;
  suggestions: Suggestion[];
}

export interface ResumeReview {
  overallScore: number;
  categories: {
    objective: ReviewCategory;
    jobDescription: ReviewCategory;
    sideProjects: ReviewCategory;
    formatting: ReviewCategory;
    language: ReviewCategory;
  };
  summary: string;
}
