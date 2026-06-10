import { Link } from 'react-router-dom';

const Unauthorized = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
    <div className="text-center max-w-md">
      <div className="text-8xl mb-6">🚫</div>
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
