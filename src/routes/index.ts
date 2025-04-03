// export { default as Routes } from './Routes'

import { type RouteConfig, route } from '@react-router/dev/routes'

const routes = [
  route('/contact', '../pages/Contact.tsx'),
  route('/about', '../pages/About.tsx'),
  route('*', '../pages/NotFound'), // 404 페이지
] satisfies RouteConfig
export default routes
