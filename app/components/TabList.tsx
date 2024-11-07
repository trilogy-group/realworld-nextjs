'use client'

import { useAuth } from '../hooks/useAuth'
import { useSearchParams, useRouter } from 'next/navigation'

export default function TabList() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const tag = searchParams.get('tag')

  const handleTabClick = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('tag')
    params.delete('page')
    router.push(`/?${params.toString()}${tab === 'feed' ? '&feed=true' : ''}`)
  }

  return (
    <div className="feed-toggle">
      <ul className="nav nav-pills outline-active">
        {user && (
          <li className="nav-item">
            <a
              className={`nav-link ${searchParams.get('feed') ? 'active' : ''}`}
              href="#"
              onClick={(e) => {
                e.preventDefault()
                handleTabClick('feed')
              }}
            >
              Your Feed
            </a>
          </li>
        )}
        <li className="nav-item">
          <a
            className={`nav-link ${!searchParams.get('feed') && !tag ? 'active' : ''}`}
            href="#"
            onClick={(e) => {
              e.preventDefault()
              handleTabClick('global')
            }}
          >
            Global Feed
          </a>
        </li>
        {tag && (
          <li className="nav-item">
            <a className="nav-link active">
              <i className="ion-pound"></i> {tag}
            </a>
          </li>
        )}
      </ul>
    </div>
  )
} 