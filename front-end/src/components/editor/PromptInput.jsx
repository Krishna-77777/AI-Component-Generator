import React, { useState } from 'react';
import useStore from '../../store/useStore';
import { useAuth } from '../../hooks/useAuth';
import styles from './PromptInput.module.css';

export default function PromptInput() {
  const [prompt, setPrompt] = useState('');
  const { generateComponent, isLoading } = useStore();
  const { token } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    generateComponent(prompt, token);
    setPrompt('');
  };

  return (
    <div className={styles.promptContainer}>
      <form onSubmit={handleSubmit} className={styles.promptForm}>
        <input
          type="text"
          className={styles.promptInput}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'Create a dark-themed login form with a blue button'"
          disabled={isLoading}
        />
        <button type="submit" className={styles.promptButton} disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Send'}
        </button>
      </form>
    </div>
  );
}