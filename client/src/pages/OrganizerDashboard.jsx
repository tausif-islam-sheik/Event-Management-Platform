import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import useAuth from '../hooks/useAuth';
import { uploadImage } from '../utils/uploadImage';
import toast from 'react-hot-toast';

const CATEGORIES = ['tech', 'music', 'sports', 'education', 'other'];

const emptyForm = {
  title: '',
  description: '',
  date: '',
  location: '',
  capacity: '',
  category: 'tech',
  bannerImage: '',
};

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [bannerFile, setBannerFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState('');

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/events/my-events');
      setEvents(res.data.data.events || []);
    } catch {
      toast.error('Failed to load your events.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditEvent(null);
    setForm(emptyForm);
    setBannerFile(null);
    setShowForm(true);
  };

  const handleOpenEdit = (event) => {
    setEditEvent(event);
    setForm({
      title: event.title,
      description: event.description,
      date: new Date(event.date).toISOString().slice(0, 16),
      location: event.location,
      capacity: event.capacity,
      category: event.category,
      bannerImage: event.bannerImage || '',
    });
    setBannerFile(null);
    setShowForm(true);
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    setDeletingId(eventId);
    try {
      await axiosInstance.delete(`/events/${eventId}`);
      setEvents((prev) => prev.filter((e) => e._id !== eventId));
      toast.success('Event deleted.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete event.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.date || !form.location || !form.capacity) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      let bannerUrl = form.bannerImage;

      if (bannerFile) {
        setUploadProgress('Uploading image...');
        bannerUrl = await uploadImage(bannerFile, 'events/banners');
        setUploadProgress('');
      }

      const payload = { ...form, bannerImage: bannerUrl, capacity: Number(form.capacity) };

      if (editEvent) {
        const res = await axiosInstance.put(`/events/${editEvent._id}`, payload);
        setEvents((prev) => prev.map((e) => (e._id === editEvent._id ? res.data.data.event : e)));
        toast.success('Event updated!');
      } else {
        const res = await axiosInstance.post('/events', payload);
        setEvents((prev) => [res.data.data.event, ...prev]);
        toast.success('Event created!');
      }

      setShowForm(false);
      setForm(emptyForm);
      setBannerFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save event.');
    } finally {
      setSubmitting(false);
      setUploadProgress('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Organizer Dashboard</h1>
            <p className="text-slate-400">Manage your events, <span className="text-emerald-400 font-medium">{user?.name}</span></p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Event
          </button>
        </div>

        {/* Create/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4 py-8 overflow-y-auto">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-700/50 rounded-2xl p-6 shadow-2xl my-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">{editEvent ? 'Edit Event' : 'Create New Event'}</h2>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Event Title *</label>
                  <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. React Summit 2026" className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Description *</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Describe your event..." className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Date & Time *</label>
                    <input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-white focus:outline-none focus:border-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Capacity *</label>
                    <input type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="100" className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Location *</label>
                  <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, Venue" className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-white focus:outline-none focus:border-blue-500 text-sm capitalize">
                    {CATEGORIES.map((c) => <option key={c} value={c} className="bg-slate-800 capitalize">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Banner Image</label>
                  <input type="file" accept="image/*" onChange={(e) => setBannerFile(e.target.files[0])} className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-400 focus:outline-none focus:border-blue-500 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:text-xs file:cursor-pointer" />
                  {uploadProgress && <p className="text-blue-400 text-xs mt-1">{uploadProgress}</p>}
                  {form.bannerImage && !bannerFile && (
                    <p className="text-slate-500 text-xs mt-1">Current: <span className="text-slate-400">{form.bannerImage.substring(0, 50)}...</span></p>
                  )}
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-medium transition-all text-sm">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold transition-all text-sm">
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {uploadProgress || 'Saving...'}
                      </span>
                    ) : editEvent ? 'Save Changes' : 'Create Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Events List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-slate-800/40 rounded-2xl animate-pulse" />)}
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-slate-900/40 border border-slate-700/30 rounded-2xl">
            <div className="w-14 h-14 mb-4 rounded-full bg-slate-800 flex items-center justify-center">
              <svg className="w-7 h-7 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-white text-xl font-semibold mb-2">No events yet</h3>
            <p className="text-slate-400 mb-6">Create your first event to get started.</p>
            <button onClick={handleOpenCreate} className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors">
              + Create Event
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              const spotsLeft = event.capacity - (event.registeredUsers?.length || 0);
              return (
                <div key={event._id} className="flex items-center gap-4 p-5 bg-slate-900/60 border border-slate-700/50 rounded-2xl hover:border-slate-600/50 transition-all">
                  {/* Banner Thumbnail */}
                  <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-slate-700/50 flex items-center justify-center">
                    {event.bannerImage ? (
                      <img src={event.bannerImage} alt={event.title} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-7 h-7 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold truncate">{event.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
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
                      <span className={`flex items-center gap-1 ${spotsLeft <= 0 ? 'text-red-400' : spotsLeft <= 10 ? 'text-orange-400' : 'text-slate-500'}`}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {spotsLeft <= 0 ? 'Full' : `${spotsLeft} spots left`}
                      </span>
                      <span className="capitalize px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-400">{event.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => handleOpenEdit(event)} className="px-3 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-600 text-slate-300 text-xs font-medium transition-all border border-slate-600/50">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(event._id)} disabled={deletingId === event._id} className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-medium transition-all disabled:opacity-50">
                      {deletingId === event._id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerDashboard;
