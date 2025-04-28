import { Navigate } from 'react-router'
import useAuth from './UseAuth'

type ProtectedRouteProps = {
  children: React.ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { token } = useAuth()

  console.log('ProtectedRoute: Current token:', token)

  return token ? <>{children}</> : <Navigate to='/login' replace />
}

export default ProtectedRoute
