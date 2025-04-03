import React from 'react'

export interface ButtonProps {
  children: string
  onClick: () => void
}

const Button: React.FC<ButtonProps> = ({ children, onClick }) => {
  return <button onClick={onClick}>{children}</button>
}

export default Button
