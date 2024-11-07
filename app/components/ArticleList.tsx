'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Article } from '../lib/types'
import ArticlePreview from './ArticlePreview'
import Pagination from './Pagination'

export default function ArticleList() {
  const [articles, setArticles] = useState<Article[]>([])
  const [articlesCount, setArticlesCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const tag = searchParams.get('tag')
  const author = searchParams.get('author')
  const favorited = searchParams.get('favorited')
  const page = parseInt(searchParams.get('page') || '1')

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          limit: '10',
          offset: ((page - 1) * 10).toString(),
          ...(tag && { tag }),
          ...(author && { author }),
          ...(favorited && { favorited })
        })

        const response = await fetch(`/api/articles?${params}`)
        const data = await response.json()
        setArticles(data.articles)
        setArticlesCount(data.articlesCount)
      } catch (error) {
        console.error('Failed to fetch articles:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [tag, author, favorited, page])

  if (loading) {
    return <div>Loading articles...</div>
  }

  if (articles.length === 0) {
    return <div>No articles are here... yet.</div>
  }

  return (
    <div>
      {articles.map((article) => (
        <ArticlePreview key={article.slug} article={article} />
      ))}
      <Pagination 
        currentPage={page} 
        totalPages={Math.ceil(articlesCount / 10)} 
      />
    </div>
  )
} 