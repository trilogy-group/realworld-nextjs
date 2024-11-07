'use client'

import { useEffect, useState } from 'react'
import { Comment } from '../lib/types'
import { useAuth } from '../hooks/useAuth'
import { format } from 'date-fns'
import Link from 'next/link'

export default function CommentList({ articleSlug }: { articleSlug: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const { user } = useAuth()

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/articles/${articleSlug}/comments`)
        const data = await response.json()
        setComments(data.comments)
      } catch (error) {
        console.error('Failed to fetch comments:', error)
      }
    }

    fetchComments()
  }, [articleSlug])

  const handleDelete = async (commentId: number) => {
    try {
      const response = await fetch(
        `/api/articles/${articleSlug}/comments/${commentId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`
          }
        }
      )

      if (response.ok) {
        setComments(comments.filter(comment => comment.id !== commentId))
      }
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
  }

  return (
    <div>
      {comments.map(comment => (
        <div className="card" key={comment.id}>
          <div className="card-block">
            <p className="card-text">{comment.body}</p>
          </div>
          <div className="card-footer">
            <Link href={`/profile/${comment.author.username}`} className="comment-author">
              <img 
                src={comment.author.image || 'https://api.realworld.io/images/smiley-cyrus.jpeg'} 
                className="comment-author-img" 
                alt={comment.author.username}
              />
            </Link>
            &nbsp;
            <Link href={`/profile/${comment.author.username}`} className="comment-author">
              {comment.author.username}
            </Link>
            <span className="date-posted">
              {format(new Date(comment.createdAt), 'MMMM d, yyyy')}
            </span>
            {user?.username === comment.author.username && (
              <span className="mod-options">
                <i 
                  className="ion-trash-a"
                  onClick={() => handleDelete(comment.id)}
                ></i>
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
} 