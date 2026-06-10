import { useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';

const OrganizerRequestForm = ({ onSubmitSuccess }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Please provide a reason.');
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post('/users/request-organizer', { reason });
      toast.success(res.data.message || 'Request submitted!');
      setReason('');
      if (onSubmitSuccess) onSubmitSuccess(res.data.data.request);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Why do you want to become an organizer?
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          placeholder="Tell us about your experience, events you plan to host, and why you'd be a great organizer..."
          className="w-full px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none transition-colors text-sm"
          disabled={loading}
        />
      </div>
      <button
        type="submit"
        disabled={loading || !reason.trim()}
        className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Submitting...
          </span>
        ) : (
          'Submit Request'
        )}
      </button>
    </form>
  );
};

export default OrganizerRequestForm;
