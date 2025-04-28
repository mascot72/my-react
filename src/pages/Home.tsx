import React, { useState } from 'react'
import { Link } from 'react-router'

const Home: React.FC = () => {
  const [count, setCount] = useState(0)
  return (
    <>
      <h1>Home</h1>
      <div className='card'>
        <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <Link to='/'>Home</Link> | <Link to='/login'>Login</Link>
      <p className='read-the-docs'>Click on the Vite and React logos to learn more</p>
    </>
  )
}

export default Home
