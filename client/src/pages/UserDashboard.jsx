import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import useAuth from '../hooks/useAuth';
import OrganizerRequestForm from '../components/OrganizerRequestForm';
import toast from 'react-hot-toast';

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  approved: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  rejected: 'bg-red-500/20 text-red-400 border border-red-500/30',
};

const statusIcons = { pending: '⏳', approved: '✅', rejected: '❌' };

const UserDashboard = () => {
  const { user } = useAuth();
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [orgRequest, setOrgRequest] = useState(null);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingRequest, setLoadingRequest] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, requestRes] = await Promise.all([
          axiosInstance.get('/users/my-events'),
          axiosInstance.get('/users/my-request'),
        ]);
        setRegisteredEvents(eventsRes.data.data.events || []);
        setOrgRequest(requestRes.data.data.request);
      } catch {
        // silently handle
      } finally {
        setLoadingEvents(false);
        setLoadingRequest(false);
      }
    };
    fetchData();
  }, []);

  const handleCancelRegistration = async (eventId) => {
    setCancellingId(eventId);
    try {
      await axiosInstance.delete(`/events/${eventId}/register`);
      setRegisteredEvents((prev) => prev.filter((e) => e._id !== eventId));
      toast.success('Registration cancelled.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel registration.');
    } finally {
      setCancellingId(null);
    }
  };

  const handleRequestSubmit = (request) => {
    setOrgRequest(request);
    setShowRequestForm(false);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-1">My Dashboard</h1>
          <p className="text-slate-400">Welcome back, <span className="text-blue-400 font-medium">{user?.name}</span></p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Registered Events */}
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="text-blue-400">🎟️</span> My Registered Events
                </h2>
                <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
                  {registeredEvents.length} events
                </span>
              </div>

              {loadingEvents ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-20 bg-slate-800/50 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : registeredEvents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">🎪</div>
                  <p className="text-slate-400 text-sm">You haven't registered for any events yet.</p>
                  <a href="/" className="mt-4 inline-block text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                    Browse events →
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  {registeredEvents.map((event) => (
                    <div key={event._id} className="flex items-start justify-between gap-4 p-4 bg-slate-800/50 border border-slate-700/30 rounded-xl hover:border-slate-600/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium text-sm truncate">{event.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                          <span>📍 {event.location}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCancelRegistration(event._id)}
                        disabled={cancellingId === event._id}
                        className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-medium transition-all disabled:opacity-50"
                      >
                        {cancellingId === event._id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Organizer Status */}
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-400">🚀</span> Organizer Status
              </h2>

              {loadingRequest ? (
                <div className="h-20 bg-slate-800/50 rounded-xl animate-pulse" />
              ) : orgRequest ? (
                <div className="space-y-3">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium capitalize ${statusColors[orgRequest.status]}`}>
                    {statusIcons[orgRequest.status]} {orgRequest.status}
                  </div>
                  <p className="text-slate-400 text-sm">
                    {orgRequest.status === 'pending' && 'Your request is under review. We\'ll notify you soon.'}
                    {orgRequest.status === 'approved' && 'Congratulations! You are now an organizer. Please log out and log back in to access organizer features.'}
                    {orgRequest.status === 'rejected' && 'Your request was not approved this time. You may submit a new request.'}
                  </p>
                  {orgRequest.reason && (
                    <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/30">
                      <p className="text-xs text-slate-500 mb-1">Your reason</p>
                      <p className="text-slate-300 text-sm">{orgRequest.reason}</p>
                    </div>
                  )}
                  {orgRequest.status === 'rejected' && (
                    <button
                      onClick={() => { setOrgRequest(null); setShowRequestForm(true); }}
                      className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all"
                    >
                      Submit New Request
                    </button>
                  )}
                </div>
              ) : showRequestForm ? (
                <div>
                  <OrganizerRequestForm onSubmitSuccess={handleRequestSubmit} />
                  <button
                    onClick={() => setShowRequestForm(false)}
                    className="w-full mt-2 py-2 rounded-xl bg-slate-700/50 hover:bg-slate-700 text-slate-400 text-sm transition-all"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-slate-400 text-sm mb-4">Want to host your own events? Apply to become an organizer.</p>
                  <button
                    onClick={() => setShowRequestForm(true)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-500/20"
                  >
                    Become an Organizer
                  </button>
                </div>
              )}
            </div>

            {/* Account Info */}
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Account Info</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-sm">Name</span>
                  <span className="text-slate-300 text-sm font-medium">{user?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-sm">Email</span>
                  <span className="text-slate-300 text-sm font-medium truncate max-w-[160px]">{user?.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-sm">Role</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-medium capitalize">{user?.role}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
