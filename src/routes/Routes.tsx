import { Route, Routes } from 'react-router'
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
import Register from '../pages/Register' // 등록 페이지 컴포넌트 임포트
import SvgPage from '../pages/SvgPage'
import CanvasPage from '../pages/CanvasPage'
import TodoList from '../pages/TodoList.tsx' // To-Do List 페이지 추가
import ProtectedRoute from '../app/ProtectionRoute'
// import { AuthProvider } from '../app/AuthProvider'
// import ColorPalette from '../pages/ColorPalette.tsx' // 색상 팔레트 페이지 추가
import ColorPalette from '../components/molecules/ColorTheme/PaletteManager.tsx' // 색상 팔레트 페이지 추가
import WaferHeatMap from '../components/molecules/WaferMap/WaferHeatMap.tsx'

function AppRouter() {
  return (
    // <BrowserRouter>
    // <AuthProvider>
    <Routes>
      <Route element={<Layout />}>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route
          path='/protected'
          element={
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
        {/* 다른 경로들을 여기에 추가 */}
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
      </Route>
      <Route element={<MainTemplate />}>
        {/* <Route path='/articles' element={<Articles />} />
          <Route path='/articles/:id' element={<Article />} /> */}
        <Route path='/articles' element={<Articles />}>
          <Route path=':id' element={<Article />} />
        </Route>
        <Route path='/profiles/:username' element={<Profile />} />
        <Route
          path='/mypage'
          element={
            <ProtectedRoute>
              <MyPage />
            </ProtectedRoute>
          }
        />
        <Route path='/register' element={<Register />} /> {/* 등록 경로 추가 */}
        <Route path='/svg' element={<SvgPage />} /> {/* 등록 경로 추가 */}
        <Route path='/wafer' element={<WaferMapPage />} />
        <Route path='/canvas' element={<CanvasPage />} /> {/* 등록 경로 추가 */}
        <Route path='/todo' element={<TodoList />} /> {/* To-Do List 경로 추가 */}
        <Route path='/color-palette' element={<ColorPalette />} /> {/* 색상 팔레트 경로 추가 */}
        <Route path='/wafer-heatmap' element={<WaferHeatMap />} /> {/* Wafer 맵 페이지 추가 */}
      </Route>
      {/* 404 페이지 */}
      <Route path='*' element={<NotFound />} />
    </Routes>
    // </AuthProvider>
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
