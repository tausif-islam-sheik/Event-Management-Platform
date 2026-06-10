import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
    <div className="text-center max-w-md">
      <div className="text-8xl font-black text-slate-800 mb-4 select-none">404</div>
      <div className="text-6xl mb-6">🌌</div>
      <h1 className="text-3xl font-bold text-white mb-3">Page Not Found</h1>
      <p className="text-slate-400 mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-lg shadow-blue-500/20">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Home
      </Link>
    </div>
  </div>
);

export default NotFound;
