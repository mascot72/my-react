// import { Navigate } from 'react-router'
import UserProfile from '../features/user/components/UserProfile/UserProfile'

export default function MyPage() {
  // const isLogin = true
  // if (!isLogin) {
  //   return <Navigate to='/login' />
  // }

  return (
    <div>
      <UserProfile />
      MyPage
    </div>
  )
}
