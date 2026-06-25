import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ companyName: '', adminName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await register(formData.companyName, formData.adminName, formData.email, formData.password);
      
      // Show success message and trigger redirect
      setSuccess('Account successfully created! Redirecting to secure login...');
      setTimeout(() => {
        navigate('/login');
      }, 3000); // 3-second delay so they can read the message

    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center p-4 font-sans text-[#1a1a1a]">
      <div className="w-full max-w-md border-2 border-[#1a1a1a] bg-white p-8 shadow-[8px_8px_0px_0px_#1a1a1a]">
        
        <h2 className="text-2xl font-bold uppercase tracking-tight mb-2">Create Workspace</h2>
        <p className="text-sm text-gray-600 mb-6">Register your organization to access the AI support platform.</p>
        
        {error && (
          <div className="bg-red-50 text-red-800 border-l-4 border-red-800 p-3 text-sm font-medium mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-800 border-l-4 border-green-800 p-3 text-sm font-medium mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" 
            placeholder="Organization Name" 
            required
            disabled={isLoading || success}
            className="w-full border-2 border-[#1a1a1a] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:text-gray-400"
            onChange={e => setFormData({...formData, companyName: e.target.value})} 
          />
          <input 
            type="text" 
            placeholder="Administrator Full Name" 
            required
            disabled={isLoading || success}
            className="w-full border-2 border-[#1a1a1a] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:text-gray-400"
            onChange={e => setFormData({...formData, adminName: e.target.value})} 
          />
          <input 
            type="email" 
            placeholder="Work Email Address" 
            required
            disabled={isLoading || success}
            className="w-full border-2 border-[#1a1a1a] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:text-gray-400"
            onChange={e => setFormData({...formData, email: e.target.value})} 
          />
          <input 
            type="password" 
            placeholder="Create Secure Password" 
            required
            disabled={isLoading || success}
            minLength={6}
            className="w-full border-2 border-[#1a1a1a] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:text-gray-400"
            onChange={e => setFormData({...formData, password: e.target.value})} 
          />
          
          <button 
            type="submit" 
            disabled={isLoading || success}
            className="w-full bg-[#1a1a1a] text-white font-bold text-sm uppercase tracking-widest py-4 mt-2 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading && !success ? 'Processing...' : 'Register Organization'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t-2 border-gray-100 text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-[#1a1a1a] font-bold hover:underline">
            Sign in here.
          </Link>
        </div>

      </div>
    </div>
  );
}