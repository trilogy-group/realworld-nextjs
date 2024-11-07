'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Article } from '../../lib/types'
import { format } from 'date-fns'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import CommentList from '../../components/CommentList'
import CommentForm from '../../components/CommentForm'
import FollowButton from '../../components/FollowButton'
import FavoriteButton from '../../components/FavoriteButton'

export default function ArticlePage() {
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/articles/${slug}`)
        const data = await response.json()
        setArticle(data.article)
      } catch (error) {
        console.error('Failed to fetch article:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [slug])

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/articles/${slug}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        router.push('/')
      }
    } catch (error) {
      console.error('Failed to delete article:', error)
    }
  }

  if (loading) return <div>Loading article...</div>
  if (!article) return <div>Article not found</div>

  const isAuthor = user?.username === article.author.username

  return (
    <div className="article-page">
      <div className="banner">
        <div className="container">
          <h1>{article.title}</h1>
          <div className="article-meta">
            <Link href={`/profile/${article.author.username}`}>
              <img src={article.author.image || 'https://api.realworld.io/images/smiley-cyrus.jpeg'} alt={article.author.username} />
            </Link>
            <div className="info">
              <Link href={`/profile/${article.author.username}`} className="author">
                {article.author.username}
              </Link>
              <span className="date">
                {format(new Date(article.createdAt), 'MMMM d, yyyy')}
              </span>
            </div>
            
            {isAuthor ? (
              <>
                <Link href={`/editor/${article.slug}`} className="btn btn-sm btn-outline-secondary">
                  <i className="ion-edit"></i> Edit Article
                </Link>
                <button className="btn btn-sm btn-outline-danger" onClick={handleDelete}>
                  <i className="ion-trash-a"></i> Delete Article
                </button>
              </>
            ) : (
              <>
                <FollowButton 
                  username={article.author.username}
                  following={article.author.following}
                />
                <FavoriteButton
                  favorited={article.favorited}
                  favoritesCount={article.favoritesCount}
                  slug={article.slug}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <div className="container page">
        <div className="row article-content">
          <div className="col-md-12">
            <ReactMarkdown>{article.body}</ReactMarkdown>
            <ul className="tag-list">
              {article.tagList.map(tag => (
                <li key={tag} className="tag-default tag-pill tag-outline">
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <hr />

        <div className="article-actions">
          <div className="article-meta">
            <Link href={`/profile/${article.author.username}`}>
              <img src={article.author.image || 'https://api.realworld.io/images/smiley-cyrus.jpeg'} alt={article.author.username} />
            </Link>
            <div className="info">
              <Link href={`/profile/${article.author.username}`} className="author">
                {article.author.username}
              </Link>
              <span className="date">
                {format(new Date(article.createdAt), 'MMMM d, yyyy')}
              </span>
            </div>

            {isAuthor ? (
              <>
                <Link href={`/editor/${article.slug}`} className="btn btn-sm btn-outline-secondary">
                  <i className="ion-edit"></i> Edit Article
                </Link>
                <button className="btn btn-sm btn-outline-danger" onClick={handleDelete}>
                  <i className="ion-trash-a"></i> Delete Article
                </button>
              </>
            ) : (
              <>
                <FollowButton 
                  username={article.author.username}
                  following={article.author.following}
                />
                <FavoriteButton
                  favorited={article.favorited}
                  favoritesCount={article.favoritesCount}
                  slug={article.slug}
                />
              </>
            )}
          </div>
        </div>

        <div className="row">
          <div className="col-xs-12 col-md-8 offset-md-2">
            {user ? (
              <CommentForm articleSlug={slug} />
            ) : (
              <p>
                <Link href="/login">Sign in</Link> or <Link href="/register">sign up</Link> to add comments on this article.
              </p>
            )}
            <CommentList articleSlug={slug} />
          </div>
        </div>
      </div>
    </div>
  )
} 