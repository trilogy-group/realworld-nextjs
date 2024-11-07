'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../hooks/useAuth'

interface FollowButtonProps {
  username: string
  following: boolean
}

export default function FollowButton({ username, following: initialFollowing }: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing)
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
      const response = await fetch(`/api/profiles/${username}/follow`, {
        method: following ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        setFollowing(!following)
      }
    } catch (error) {
      console.error('Failed to follow/unfollow:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      className={`btn btn-sm ${following ? 'btn-secondary' : 'btn-outline-secondary'}`}
      onClick={handleClick}
      disabled={loading}
    >
      <i className="ion-plus-round"></i>
      &nbsp;
      {following ? 'Unfollow' : 'Follow'} {username}
    </button>
  )
} 