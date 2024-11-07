'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function TagList() {
  const [tags, setTags] = useState<string[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/tags')
        const data = await response.json()
        setTags(data.tags)
      } catch (error) {
        console.error('Failed to fetch tags:', error)
      }
    }

    fetchTags()
  }, [])

  const handleTagClick = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tag', tag)
    params.delete('page')
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="tag-list">
      {tags.map(tag => (
        <a
          key={tag}
          href="#"
          className="tag-pill tag-default"
          onClick={(e) => {
            e.preventDefault()
            handleTagClick(tag)
          }}
        >
          {tag}
        </a>
      ))}
    </div>
  )
} 