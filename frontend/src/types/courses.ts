export interface VideoLesson {
  id: number
  title: string
  slug: string
  description: string
  order: number
  duration_seconds: number
  thumbnail: string
  video_url?: string
  is_free: boolean
  watched_seconds?: number
  completed?: boolean
}

export interface VideoCourse {
  id: number
  title: string
  slug: string
  description: string
  icon: string
  thumbnail: string
  order: number
  lessons_count: number
  lessons?: VideoLesson[]
}
