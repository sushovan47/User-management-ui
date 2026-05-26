import React, { useState } from 'react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (value) => {
    return /^\S+@\S+\.\S+$/.test(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    // Simulate API call
    try {
      await new Promise((res) => setTimeout(res, 1000));
      setMessage('If an account with that email exists, a password reset link has been sent.');
      setEmail('');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form} noValidate>
        <h2 style={styles.title}>Forgot Password</h2>

        {message && <div style={styles.success}>{message}</div>}
        {error && <div style={styles.error}>{error}</div>}

        <label style={styles.label} htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={styles.input}
        />

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: '#f5f7fb',
    padding: 20,
  },
  form: {
    width: '100%',
    maxWidth: 420,
    background: '#fff',
    padding: 24,
    borderRadius: 8,
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
    boxSizing: 'border-box',
  },
  title: {
    margin: '0 0 16px 0',
    fontSize: 20,
    textAlign: 'center',
  },
  label: {
    display: 'block',
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: 14,
    marginBottom: 16,
    borderRadius: 4,
    border: '1px solid #dcdfe6',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '10px 12px',
    fontSize: 15,
    background: '#0078d4',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
  },
  error: {
    background: '#ffecec',
    color: '#cc0000',
    padding: '8px 10px',
    borderRadius: 4,
    marginBottom: 12,
    fontSize: 13,
  },
  success: {
    background: '#e6ffed',
    color: '#006600',
    padding: '8px 10px',
    borderRadius: 4,
    marginBottom: 12,
    fontSize: 13,
  },
};

export default ForgotPassword;
