'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <nav className="navbar navbar-light">
      <div className="container">
        <Link href="/" className="navbar-brand">conduit</Link>
        <ul className="nav navbar-nav pull-xs-right">
          <li className="nav-item">
            <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
              Home
            </Link>
          </li>
          
          {user ? (
            <>
              <li className="nav-item">
                <Link href="/editor" className={`nav-link ${pathname === '/editor' ? 'active' : ''}`}>
                  <i className="ion-compose"></i>&nbsp;New Article
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/settings" className={`nav-link ${pathname === '/settings' ? 'active' : ''}`}>
                  <i className="ion-gear-a"></i>&nbsp;Settings
                </Link>
              </li>
              <li className="nav-item">
                <Link href={`/profile/${user.username}`} className={`nav-link ${pathname === `/profile/${user.username}` ? 'active' : ''}`}>
                  <img src={user.image || '/default-avatar.png'} 
                       onError={(e) => {
                         const target = e.target as HTMLImageElement;
                         target.src = 'https://static.productionready.io/images/smiley-cyrus.jpg';
                         target.onerror = null;
                       }}
                       className="user-pic" 
                       alt={user.username} />
                  {user.username}
                </Link>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link href="/login" className={`nav-link ${pathname === '/login' ? 'active' : ''}`}>
                  Sign in
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/register" className={`nav-link ${pathname === '/register' ? 'active' : ''}`}>
                  Sign up
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  )
} 