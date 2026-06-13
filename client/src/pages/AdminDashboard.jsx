import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';

const TABS = ['stats', 'requests', 'users', 'events'];

const tabLabels = {
  stats: 'Stats',
  requests: 'Requests',
  users: 'Users',
  events: 'Events',
};

const roleBadge = {
  admin: 'bg-red-500/20 text-red-400 border-red-500/30',
  organizer: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  user: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const requestStatusBadge = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    loadTab(activeTab);
  }, [activeTab]);

  const loadTab = async (tab) => {
    setLoading(true);
    try {
      if (tab === 'stats') {
        const res = await axiosInstance.get('/admin/stats');
        setStats(res.data.data);
      } else if (tab === 'requests') {
        const res = await axiosInstance.get('/admin/requests');
        setRequests(res.data.data.requests || []);
      } else if (tab === 'users') {
        const res = await axiosInstance.get('/admin/users');
        setUsers(res.data.data.users || []);
      } else if (tab === 'events') {
        const res = await axiosInstance.get('/events');
        setEvents(res.data.data.events || []);
      }
    } catch {
      toast.error('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionId(id);
    try {
      await axiosInstance.patch(`/admin/requests/${id}/approve`);
      setRequests((prev) => prev.map((r) => r._id === id ? { ...r, status: 'approved' } : r));
      toast.success('Request approved! User is now an organizer.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve.');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id) => {
    setActionId(id);
    try {
      await axiosInstance.patch(`/admin/requests/${id}/reject`);
      setRequests((prev) => prev.map((r) => r._id === id ? { ...r, status: 'rejected' } : r));
      toast.success('Request rejected.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject.');
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Delete this event? This cannot be undone.')) return;
    setActionId(id);
    try {
      await axiosInstance.delete(`/admin/events/${id}`);
      setEvents((prev) => prev.filter((e) => e._id !== id));
      toast.success('Event deleted.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete event.');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-slate-900/80 border-r border-slate-700/50 pt-8 pb-6 px-4 hidden md:flex flex-col">
        <div className="mb-8 px-2">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">Admin Panel</p>
        </div>
        <nav className="space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-500 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 py-8 px-4 sm:px-6 lg:px-8">
        {/* Mobile Tab Bar */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 md:hidden">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab ? 'bg-blue-600 text-white' : 'bg-slate-800/60 text-slate-400 border border-slate-700/50'
              }`}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* ===== STATS TAB ===== */}
        {!loading && activeTab === 'stats' && stats && (
          <div>
            <h1 className="text-2xl font-bold text-white mb-8">Platform Statistics</h1>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                {
                  label: 'Total Users',
                  value: stats.totalUsers,
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  ),
                  color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
                },
                {
                  label: 'Organizers',
                  value: stats.totalOrganizers,
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ),
                  color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
                },
                {
                  label: 'Total Events',
                  value: stats.totalEvents,
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  ),
                  color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
                },
                {
                  label: 'Pending Requests',
                  value: stats.pendingRequests,
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  color: 'from-orange-500/20 to-orange-600/10 border-orange-500/30 text-orange-400',
                },
              ].map((stat) => (
                <div key={stat.label} className={`bg-gradient-to-br ${stat.color} border rounded-2xl p-6`}>
                  <div className={`mb-3 ${stat.color.split(' ').find(c => c.startsWith('text-'))}`}>{stat.icon}</div>
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== REQUESTS TAB ===== */}
        {!loading && activeTab === 'requests' && (
          <div>
            <h1 className="text-2xl font-bold text-white mb-8">Organizer Requests</h1>
            {requests.length === 0 ? (
              <div className="text-center py-16 text-slate-500">No organizer requests found.</div>
            ) : (
              <div className="space-y-3">
                {requests.map((req) => (
                  <div key={req._id} className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <span className="text-white font-semibold">{req.userId?.name || 'Unknown'}</span>
                          <span className="text-slate-500 text-sm">{req.userId?.email}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${requestStatusBadge[req.status]}`}>
                            {req.status}
                          </span>
                        </div>
                        <div className="bg-slate-800/60 rounded-xl p-3 mt-2 border border-slate-700/30">
                          <p className="text-xs text-slate-500 mb-1">Reason</p>
                          <p className="text-slate-300 text-sm">{req.reason}</p>
                        </div>
                        <p className="text-slate-600 text-xs mt-2">
                          {new Date(req.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                      {req.status === 'pending' && (
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleApprove(req._id)}
                            disabled={actionId === req._id}
                            className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-sm font-medium transition-all disabled:opacity-50"
                          >
                            {actionId === req._id ? '...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleReject(req._id)}
                            disabled={actionId === req._id}
                            className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-sm font-medium transition-all disabled:opacity-50"
                          >
                            {actionId === req._id ? '...' : 'Reject'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== USERS TAB ===== */}
        {!loading && activeTab === 'users' && (
          <div>
            <h1 className="text-2xl font-bold text-white mb-8">All Users <span className="text-slate-500 text-lg font-normal">({users.length})</span></h1>
            <div className="overflow-x-auto rounded-2xl border border-slate-700/50">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-800/60 text-left">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 text-white text-sm font-medium">{u.name}</td>
                      <td className="px-6 py-4 text-slate-400 text-sm">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${roleBadge[u.role]}`}>{u.role}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== EVENTS TAB ===== */}
        {!loading && activeTab === 'events' && (
          <div>
            <h1 className="text-2xl font-bold text-white mb-8">All Events <span className="text-slate-500 text-lg font-normal">({events.length})</span></h1>
            <div className="space-y-3">
              {events.length === 0 ? (
                <div className="text-center py-16 text-slate-500">No events found.</div>
              ) : (
                events.map((event) => (
                  <div key={event._id} className="flex items-center gap-4 p-5 bg-slate-900/60 border border-slate-700/50 rounded-2xl hover:border-slate-600/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold truncate">{event.title}</h3>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {event.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {event.organizerId?.name || 'Unknown organizer'}
                        </span>
                        <span className="capitalize px-2 py-0.5 rounded-full bg-slate-700/60">{event.category}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteEvent(event._id)}
                      disabled={actionId === event._id}
                      className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-medium transition-all disabled:opacity-50"
                    >
                      {actionId === event._id ? '...' : 'Delete'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
