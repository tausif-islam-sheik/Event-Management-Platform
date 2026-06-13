import { Link } from 'react-router-dom';

const Unauthorized = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
    <div className="text-center max-w-md">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      </div>
      <h1 className="text-4xl font-bold text-white mb-3">Access Denied</h1>
      <p className="text-slate-400 mb-8">You don't have permission to view this page. Please check your account role.</p>
      <div className="flex items-center justify-center gap-4">
        <Link to="/" className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-lg shadow-blue-500/20">
          Go Home
        </Link>
        <Link to="/login" className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-all border border-slate-700">
          Login
        </Link>
      </div>
    </div>
  </div>
);

export default Unauthorized;
