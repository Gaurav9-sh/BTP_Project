import { useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user starts typing
  };

  /**
   * This is the NEW handleSubmit function.
   * It calls your real backend API.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { email, password } = formData;

      // 1. Call your real backend API (the one we tested with curl)
      // Make sure this port (8080) matches your backend server
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // 2. Handle failure from the server
      if (!response.ok) {
        // Get the error message from the backend (e.g., "Invalid credentials")
        const errorData = await response.json(); 
        throw new Error(errorData.message || 'Invalid email or password.');
      }

      // 3. Handle success
      const data = await response.json(); // This is your { token, user } object

      // 4. --- THIS IS THE MOST IMPORTANT STEP ---
      // Save the token and user data to the browser's storage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // 5. Tell the parent component (App.js) that we are logged in
      // and pass it the user data
      onLogin(data.user);

    } catch (err) {
      // This will catch both network errors and the error we threw
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card fade-in">
        <div className="login-header">
          <h1>Course Schedule Management System</h1>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="alert alert-error slide-up">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your password"
              required
            />
          </div>

          <button 
            type="submit" 
            className={`btn btn-primary login-btn ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* This footer is now just a simple message */}
        <div className="login-footer">
          <p>Please use your assigned university credentials.</p>
        </div>

      </div>
    </div>
  );
};

export default Login;