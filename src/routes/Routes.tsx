import { BrowserRouter, Route, Routes } from 'react-router-dom'
// import { type RouteConfig, route } from '@react-router/dev/routes'

import Login from '../pages/Login'
import Home from '../pages/Home'
import About from '../pages/About'
import Contact from '../pages/Contact'
import NotFound from '../pages/NotFound'
import Layout from '../components/organisms/Layout'
import MainTemplate from '../components/templates/MainTemplate.tsx'
import Profile from '../pages/Profile'
import Articles from '../pages/Articles'
import Article from '../pages/Article'
import MyPage from '../pages/MyPage'
import WaferMapPage from '../pages/WaferMapPage'

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          {/* 다른 경로들을 여기에 추가 */}
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/wafer-map' element={<WaferMapPage />} />
        </Route>
        <Route element={<MainTemplate />}>
          {/* <Route path='/articles' element={<Articles />} />
          <Route path='/articles/:id' element={<Article />} /> */}
          <Route path='/articles' element={<Articles />}>
            <Route path=':id' element={<Article />} />
          </Route>
          <Route path='/profiles/:username' element={<Profile />} />
          <Route path='/mypage' element={<MyPage />} />
        </Route>
        <Route path='*' element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
export default AppRouter

// export default [
//   route('/', '../pages/Home'),
//   route('/login', '../pages/Login'),
//   route('/about', '../pages/About'),
//   route('/contact', '../pages/Contact'),
//   route('/articles', '../pages/Articles', [route('/:id', '../pages/Article')]),
//   route('/profiles/:username', '../pages/Profile'),
//   route('/mypage', '../pages/MyPage'),
//   route('*', '../pages/NotFound'), // 404 페이지
// ] satisfies RouteConfig
