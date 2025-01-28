// src/pages/Login.tsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../features/auth/slice';

const Login: React.FC = () => {
  const [token, setToken] = useState('');
  const dispatch = useDispatch();

  const handleLogin = () => {
    if (token) {
      dispatch(login(token));
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <input
        type="text"
        placeholder="Enter token"
        value={token}
        onChange={(e) => setToken(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
