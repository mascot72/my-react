import React from 'react'

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    padding: '1rem',
    // backgroundColor: 'lightgray',
    listStyle: 'none',
  },
}

const Navbar: React.FC = () => {
  return (
    <nav>
      <ul style={styles.nav}>
        <li>
          <a href='/'>Home</a>
        </li>
        <li>
          <a href='/login'>Login</a>
        </li>
        <li>
          <a href='/about'>About</a>
        </li>
        <li>
          <a href='/contact'>Contact</a>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar
