export interface TestCategory {
  id: number
  name: string
  slug: string
  order: number
  question_count: number
  license_groups: string[]
}

export interface Answer {
  id?: number
  text: string
  is_correct: boolean
  order: number
}

export interface QuestionListItem {
  id: number
  number: number
  text: string
  image: string | null
  category: number
  category_name: string
  is_hard: boolean
  answers_count: number
  has_image: boolean
}

export interface QuestionDetail {
  id: number
  number: number
  text: string
  image: string | null
  explanation: string | null
  category: number
  category_name: string
  is_hard: boolean
  answers: Answer[]
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface AdminTestStats {
  total_questions: number
  total_categories: number
  categories: TestCategory[]
}

export interface AdminHardQuestionStats {
  hard_questions: number
  total_questions: number
}

export interface TestWeakestTopic {
  category_id: number
  category_name: string
  percent: number
}

export interface TestCategoryStat {
  category_id: number
  category_name: string
  attempts: number
  correct: number
  wrong: number
  total: number
  percent: number
  total_in_topic: number
  unique_answered: number
  unique_correct: number
  completion_percent: number
}

export interface TestStats {
  total_attempts: number
  total_correct: number
  total_wrong: number
  total_questions: number
  avg_percent: number
  passed_count: number
  failed_count: number
  overall_progress_percent: number
  unique_questions_answered: number
  unique_questions_correct: number
  total_pool_questions: number
  weakest_topic: TestWeakestTopic | null
  achievements_earned: number
  achievements_total: number
  by_category: TestCategoryStat[]
}

export interface WrongAnswer {
  question_id: number
  question_number: number
  question_text: string
  question_image: string | null
  explanation: string | null
  category_name: string | null
  selected_answer_id: number | null
  answers: Array<{ id: number; text: string; is_correct: boolean }>
}

export interface SavedQuestionItem {
  id: number
  question: {
    id: number
    number: number
    text: string
    image: string | null
    explanation: string | null
    category_name: string | null
    answers: Array<{ id: number; text: string; is_correct: boolean }>
  }
  created_at: string
}
