// export { default as Routes } from './Routes'

import { type RouteConfig, index, layout, route } from '@react-router/dev/routes'

const routes = [
  layout('../components/organisms/Layout.tsx', [
    index('../pages/Home.tsx'), // 홈 페이지
    route('/login', '../pages/Login.tsx'), // 로그인 페이지
    route('/register', '../pages/Register.tsx'), // 회원가입 페이지
    route('/todo', '../pages/TodoList.tsx'), // To-Do List 페이지
    route('/protected', '../pages/Protected.tsx'), // 보호된 페이지
    route('/protected2', '../pages/Protected2.tsx'), // 또 다른 보호된 페이지
    route('/contact', '../pages/Contact.tsx'),
    route('/about', '../pages/About.tsx'),
    route('*', '../pages/NotFound'), // 404 페이지
  ]),
  layout('../components/templates/MainTemplate.tsx', [
    route('/articles', '../pages/Articles.tsx', [
      route(':id', '../pages/Article.tsx'), // 게시글 상세 페이지
    ]),
    route('/profiles/:username', '../pages/Profile.tsx'), // 프로필 페이지
    route('/mypage', '../app/ProtectionRoute.tsx', [
      // 보호된 마이 페이지
      index('../pages/MyPage.tsx'), // 마이 페이지
    ]),
    route('/register', '../pages/Register.tsx'), // 회원가입 페이지
    route('/wafer', '../pages/WaferMapPage.tsx'), // 웨이퍼 맵 페이지
    route('/svg', '../pages/SvgPage.tsx'), // SVG 페이지
    route('/canvas', '../pages/CanvasPage.tsx'), // 캔버스 페이지
  ]),
] satisfies RouteConfig
export default routes
