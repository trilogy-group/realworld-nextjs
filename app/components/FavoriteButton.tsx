'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../hooks/useAuth'

interface FavoriteButtonProps {
  favorited: boolean
  favoritesCount: number
  slug: string
}

export default function FavoriteButton({ favorited: initialFavorited, favoritesCount: initialCount, slug }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited)
  const [favoritesCount, setFavoritesCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/login')
      return
    }

    if (loading) return

    setLoading(true)
    try {
      const response = await fetch(`/api/articles/${slug}/favorite`, {
        method: favorited ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        setFavorited(!favorited)
        setFavoritesCount(favorited ? favoritesCount - 1 : favoritesCount + 1)
      }
    } catch (error) {
      console.error('Failed to favorite article:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      className={`btn btn-sm ${favorited ? 'btn-primary' : 'btn-outline-primary'}`}
      onClick={handleClick}
      disabled={loading}
    >
      <i className="ion-heart"></i>
      &nbsp;
      {favorited ? 'Unfavorite' : 'Favorite'} Article <span className="counter">({favoritesCount})</span>
    </button>
  )
} 