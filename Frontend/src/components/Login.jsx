import { useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validCredentials = {
    'hod@lnmiit.ac.in': { password: '123456', role: 'hod', name: 'HOD' },
    'aracademic@lnmiit.ac.in': { password: '123456', role: 'academics', name: 'Academic Officer' }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user starts typing
  };

  const validateEmail = (email) => {
    return email.endsWith('@lnmiit.ac.in');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { email, password } = formData;

      // Validate email domain
      if (!validateEmail(email)) {
        setError('Only emails ending with @lnmiit.ac.in are allowed.');
        return;
      }

      // Check credentials
      const validUser = validCredentials[email];
      if (!validUser || validUser.password !== password) {
        setError('Invalid email or password.');
        return;
      }

      // Successful login
      onLogin({
        email,
        role: validUser.role,
        name: validUser.name
      });

    } catch (err) {
      setError('An error occurred. Please try again.');
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
              placeholder="Enter your email (@lnmiit.ac.in)"
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

        <div className="login-footer">
          <div className="demo-credentials">
            <h4>Demo Credentials:</h4>
            <div className="credentials-list">
              <div className="credential-item">
                <strong>HOD:</strong> hod@lnmiit.ac.in / 123456
              </div>
              <div className="credential-item">
                <strong>Academic:</strong> aracademic@lnmiit.ac.in / 123456
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;