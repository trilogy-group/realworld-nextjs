import { Suspense } from 'react'
import ArticleList from './components/ArticleList'
import TagList from './components/TagList'
import TabList from './components/TabList'

export default function HomePage() {
  return (
    <div className="home-page">
      <div className="banner">
        <div className="container">
          <h1 className="logo-font">conduit</h1>
          <p>A place to share your knowledge.</p>
        </div>
      </div>

      <div className="container page">
        <div className="row">
          <div className="col-md-9">
            <Suspense fallback={<div>Loading feed...</div>}>
              <TabList />
              <ArticleList />
            </Suspense>
          </div>

          <div className="col-md-3">
            <div className="sidebar">
              <p>Popular Tags</p>
              <Suspense fallback={<div>Loading tags...</div>}>
                <TagList />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
