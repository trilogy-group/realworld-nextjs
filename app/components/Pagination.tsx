'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface PaginationProps {
  currentPage: number
  totalPages: number
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/?${params.toString()}`)
  }

  if (totalPages <= 1) return null

  return (
    <nav>
      <ul className="pagination">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <li 
            key={page} 
            className={`page-item ${page === currentPage ? 'active' : ''}`}
          >
            <a
              className="page-link"
              href="#"
              onClick={(e) => {
                e.preventDefault()
                handlePageChange(page)
              }}
            >
              {page}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
} 