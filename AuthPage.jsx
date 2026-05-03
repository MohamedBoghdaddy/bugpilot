import React, { useState } from 'react';
import './AuthPage.css'; 

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Customer', // Default role based on SRS [cite: 53]
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      console.log('Logging in with:', formData.email, formData.password);
    } else {
      console.log('Registering new user:', formData);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">
          {/* Conditional title based on the current view */}
          {isLogin ? 'Welcome back to Bug Tracker' : 'Welcome to Bug Tracker'} 
          <span className="red-bug">🐞</span>
        </h2>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          
          {/* Registration Fields: Name is required for Sign Up [cite: 50] */}
          {!isLogin && (
            <div className="input-group">
              <label>Full Name</label>
              <input 
                type="text" 
                name="name" 
                placeholder="e.g. Youssef Nasr"
                value={formData.name} 
                onChange={handleChange} 
                required 
              />
            </div>
          )}

          {/* Email and Password required for both Login and Registration [cite: 51, 52, 55] */}
          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              name="email" 
              placeholder="you@example.com"
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              name="password" 
              placeholder="Enter your password"
              value={formData.password} 
              onChange={handleChange} 
              required 
            />
          </div>

          {/* Role Selection required for new accounts [cite: 53] */}
          {!isLogin && (
            <div className="input-group">
              <label>System Role</label>
              <select 
                name="role" 
                value={formData.role} 
                onChange={handleChange} 
              >
                <option value="Customer">Customer</option>
                <option value="Tester">Tester</option>
                <option value="Developer">Developer</option>
              </select>
            </div>
          )}

          <button type="submit" className="submit-btn">
            {isLogin ? 'Login to Dashboard' : 'Create Account'}
          </button>
        </form>

        <p className="toggle-text">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button className="toggle-btn" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign up here' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;