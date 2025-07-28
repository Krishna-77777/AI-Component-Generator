import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import styles from './AuthForm.module.css';

export default function AuthForm() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();

  const switchAuthModeHandler = () => {
    setIsLoginMode((prevState) => !prevState);
    setError(null);
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (isLoginMode) {
        await login(email, password);
      } else {
        await register(email, password);
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Authentication failed.');
    }
    setIsLoading(false);
  };

  return (
    <div className={styles.authContainer}>
      <form className={styles.form} onSubmit={submitHandler}>
        <h1>{isLoginMode ? 'Login' : 'Sign Up'}</h1>
        <div className={styles.control}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className={styles.control}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            required
            minLength="6"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.actions}>
          <button disabled={isLoading}>
            {isLoading ? 'Sending...' : (isLoginMode ? 'Login' : 'Create Account')}
          </button>
          <button
            type="button"
            className={styles.toggle}
            onClick={switchAuthModeHandler}
          >
            {isLoginMode ? 'Create new account' : 'Login with existing account'}
          </button>
        </div>
      </form>
    </div>
  );
}