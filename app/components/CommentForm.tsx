'use client'

import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function CommentForm({ articleSlug }: { articleSlug: string }) {
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/articles/${articleSlug}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ comment: { body } })
      })

      if (response.ok) {
        setBody('')
        // Trigger a refresh of the comment list
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to post comment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="card comment-form" onSubmit={handleSubmit}>
      <div className="card-block">
        <textarea
          className="form-control"
          placeholder="Write a comment..."
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={submitting}
        ></textarea>
      </div>
      <div className="card-footer">
        <img
          src={user?.image || 'https://api.realworld.io/images/smiley-cyrus.jpeg'}
          className="comment-author-img"
          alt={user?.username}
        />
        <button
          className="btn btn-sm btn-primary"
          type="submit"
          disabled={submitting}
        >
          Post Comment
        </button>
      </div>
    </form>
  )
} 