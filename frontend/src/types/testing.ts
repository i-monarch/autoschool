export interface TestCategory {
  id: number
  name: string
  slug: string
  order: number
  question_count: number
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
