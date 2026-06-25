import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Login() {
  const { login } = useContext(AuthContext);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      // Note: We don't need a success message here because AuthContext 
      // instantly redirects the user to the /dashboard upon successful login.
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center p-4 font-sans text-[#1a1a1a]">
      <div className="w-full max-w-md border-2 border-[#1a1a1a] bg-white p-8 shadow-[8px_8px_0px_0px_#1a1a1a]">
        
        <h2 className="text-2xl font-bold uppercase tracking-tight mb-2">Secure Sign In</h2>
        <p className="text-sm text-gray-600 mb-6">Authenticate to access your organization's workspace.</p>
        
        {error && (
          <div className="bg-red-50 text-red-800 border-l-4 border-red-800 p-3 text-sm font-medium mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" 
            placeholder="Work Email Address" 
            required
            disabled={isLoading}
            className="w-full border-2 border-[#1a1a1a] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:text-gray-400"
            onChange={e => setEmail(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            required
            disabled={isLoading}
            className="w-full border-2 border-[#1a1a1a] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:text-gray-400"
            onChange={e => setPassword(e.target.value)} 
          />
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#1a1a1a] text-white font-bold text-sm uppercase tracking-widest py-4 mt-2 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t-2 border-gray-100 text-sm text-center text-gray-600">
          Is your organization new to the platform?{' '}
          <Link to="/register" className="text-[#1a1a1a] font-bold hover:underline">
            Register here.
          </Link>
        </div>

      </div>
    </div>
  );
}