import React from 'react'

type ModalProps = {
  open: boolean
  onClose?: () => void
  children: React.ReactNode
  title?: string
}

const modalStyle: React.CSSProperties = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  background: '#fff',
  borderRadius: 8,
  boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
  zIndex: 1001,
  minWidth: 400,
  minHeight: 200,
  padding: 24,
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.25)',
  zIndex: 1000,
}

const Modal: React.FC<ModalProps> = ({ open, onClose, children, title }) => {
  if (!open) return null
  return (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={modalStyle}>
        {title && <h3 style={{ marginTop: 0 }}>{title}</h3>}
        <div>{children}</div>
      </div>
    </>
  )
}

export default Modal
