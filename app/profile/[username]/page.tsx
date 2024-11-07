'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../../hooks/useAuth'
import { Article, Profile } from '../../lib/types'
import ArticleList from '../../components/ArticleList'
import FollowButton from '../../components/FollowButton'

export default function ProfilePage({ params }: { params: { username: string } }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { username } = params
  const tab = searchParams.get('tab') || 'articles'

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/profiles/${username}`)
        const data = await response.json()
        setProfile(data.profile)
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [username])

  if (loading) return <div>Loading profile...</div>
  if (!profile) return <div>Profile not found</div>

  return (
    <div className="profile-page">
      <div className="user-info">
        <div className="container">
          <div className="row">
            <div className="col-xs-12 col-md-10 offset-md-1">
              <img 
                src={profile.image || 'https://api.realworld.io/images/smiley-cyrus.jpeg'} 
                className="user-img" 
                alt={profile.username}
              />
              <h4>{profile.username}</h4>
              <p>{profile.bio}</p>
              {user?.username === profile.username ? (
                <button 
                  className="btn btn-sm btn-outline-secondary action-btn"
                  onClick={() => router.push('/settings')}
                >
                  <i className="ion-gear-a"></i> Edit Profile Settings
                </button>
              ) : (
                <FollowButton 
                  username={profile.username}
                  following={profile.following}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="row">
          <div className="col-xs-12 col-md-10 offset-md-1">
            <div className="articles-toggle">
              <ul className="nav nav-pills outline-active">
                <li className="nav-item">
                  <a
                    className={`nav-link ${tab === 'articles' ? 'active' : ''}`}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      router.push(`/profile/${username}?tab=articles`)
                    }}
                  >
                    My Articles
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link ${tab === 'favorites' ? 'active' : ''}`}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      router.push(`/profile/${username}?tab=favorites`)
                    }}
                  >
                    Favorited Articles
                  </a>
                </li>
              </ul>
            </div>

            <ArticleList 
              username={username}
              favorited={tab === 'favorites' ? username : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 