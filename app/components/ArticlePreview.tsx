'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { Article } from '../lib/types'
import FavoriteButton from './FavoriteButton'

export default function ArticlePreview({ article }: { article: Article }) {
  return (
    <div className="article-preview">
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
        <FavoriteButton 
          favorited={article.favorited}
          favoritesCount={article.favoritesCount}
          slug={article.slug}
        />
      </div>
      <Link href={`/article/${article.slug}`} className="preview-link">
        <h1>{article.title}</h1>
        <p>{article.description}</p>
        <span>Read more...</span>
        <ul className="tag-list">
          {article.tagList.map(tag => (
            <li key={tag} className="tag-default tag-pill tag-outline">
              {tag}
            </li>
          ))}
        </ul>
      </Link>
    </div>
  )
} 