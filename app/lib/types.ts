export interface User {
  email: string
  token: string
  username: string
  bio: string | null
  image: string | null
}

export interface Article {
  slug: string
  title: string
  description: string
  body: string
  tagList: string[]
  createdAt: string
  updatedAt: string
  favorited: boolean
  favoritesCount: number
  author: Profile
}

export interface Profile {
  username: string
  bio: string | null
  image: string | null
  following: boolean
}

export interface Comment {
  id: number
  createdAt: string
  updatedAt: string
  body: string
  author: Profile
}

export interface ApiError {
  errors: {
    body: string[]
  }
} 