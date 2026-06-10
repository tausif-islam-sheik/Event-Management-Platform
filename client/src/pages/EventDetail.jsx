import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';

const categoryIcons = { tech: '💻', music: '🎵', sports: '🏆', education: '📚', other: '🎪' };

const EventDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axiosInstance.get(`/events/${id}`);
        setEvent(res.data.data.event);
      } catch {
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, navigate]);

  const isRegistered = user && event?.registeredUsers?.some(
    (u) => (u._id || u) === user._id || (u._id || u).toString() === user._id
  );
  const isFull = event && event.registeredUsers?.length >= event.capacity;

  const handleRegister = async () => {
    if (!user) { navigate('/login'); return; }
    setRegistering(true);
    try {
      const res = await axiosInstance.post(`/events/${id}/register`);
      setEvent(res.data.data.event);
      toast.success('You\'re registered! See you there 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setRegistering(false);
    }
  };

  const handleCancel = async () => {
    setRegistering(true);
    try {
      await axiosInstance.delete(`/events/${id}/register`);
      setEvent((prev) => ({
        ...prev,
        registeredUsers: prev.registeredUsers.filter(
          (u) => (u._id || u).toString() !== user._id
        ),
      }));
      toast.success('Registration cancelled.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel.');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) return null;

  const spotsLeft = event.capacity - (event.registeredUsers?.length || 0);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Banner */}
      <div className="relative h-72 md:h-96 overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
        {event.bannerImage ? (
          <img src={event.bannerImage} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-9xl opacity-20">{categoryIcons[event.category]}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-20 pb-16 relative">
        {/* Main Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 md:p-8 shadow-2xl">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-semibold capitalize mb-3">
                {categoryIcons[event.category]} {event.category}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">{event.title}</h1>
              <p className="text-slate-400 text-sm mt-1">
                Organized by <span className="text-slate-300">{event.organizerId?.name}</span>
              </p>
            </div>
            {/* Register Button */}
            {user?.role === 'user' && (
              <div className="flex-shrink-0">
                {isRegistered ? (
                  <button
                    onClick={handleCancel}
                    disabled={registering}
                    className="px-6 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-semibold text-sm transition-all disabled:opacity-60"
                  >
                    {registering ? 'Processing...' : 'Cancel Registration'}
                  </button>
                ) : (
                  <button
                    onClick={handleRegister}
                    disabled={registering || isFull}
                    className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all shadow-lg shadow-blue-500/20"
                  >
                    {registering ? 'Processing...' : isFull ? 'Event Full' : 'Register Now'}
                  </button>
                )}
              </div>
            )}
            {!user && (
              <button onClick={() => navigate('/login')} className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-500/20">
                Login to Register
              </button>
            )}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { icon: '📅', label: 'Date', value: new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) },
              { icon: '🕐', label: 'Time', value: new Date(event.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) },
              { icon: '📍', label: 'Location', value: event.location },
              { icon: '👥', label: 'Availability', value: isFull ? 'Fully booked' : `${spotsLeft} of ${event.capacity} spots left` },
            ].map((item) => (
              <div key={item.label} className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/30">
                <div className="text-xl mb-2">{item.icon}</div>
                <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                <div className="text-white text-sm font-medium">{item.value}</div>
              </div>
            ))}
          </div>

          {/* Capacity Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Registration progress</span>
              <span className="text-slate-400 text-sm">{event.registeredUsers?.length || 0} / {event.capacity}</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isFull ? 'bg-red-500' : spotsLeft <= 10 ? 'bg-orange-400' : 'bg-blue-500'}`}
                style={{ width: `${Math.min(((event.registeredUsers?.length || 0) / event.capacity) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-white font-semibold text-lg mb-3">About this event</h2>
            <p className="text-slate-400 leading-relaxed whitespace-pre-line">{event.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
