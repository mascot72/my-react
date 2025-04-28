import React from 'react'
import { Link } from 'react-router'
import useAuth from '../../app/UseAuth'

const Navigation: React.FC = () => {
  const { token, logout } = useAuth()

  return (
    <>
      <Link to='/'>
        <h1>Home</h1>
      </Link>
      {token && (
        <button type='button' onClick={logout}>
          Sign Out
        </button>
      )}
    </>
  )
}

export default Navigation
