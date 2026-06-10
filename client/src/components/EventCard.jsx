import { Link } from 'react-router-dom';

const categoryColors = {
  tech: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  music: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  sports: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  education: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  other: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

const categoryIcons = {
  tech: '💻',
  music: '🎵',
  sports: '🏆',
  education: '📚',
  other: '🎪',
};

const EventCard = ({ event }) => {
  const spotsLeft = event.capacity - (event.registeredUsers?.length || 0);
  const isFull = spotsLeft <= 0;
  const isAlmostFull = spotsLeft > 0 && spotsLeft <= 10;

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = new Date(event.date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="group relative bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 flex flex-col">
      {/* Banner */}
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800 flex-shrink-0">
        {event.bannerImage ? (
          <img
            src={event.bannerImage}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl opacity-40">{categoryIcons[event.category] || '🎪'}</span>
          </div>
        )}
        {/* Category Badge */}
        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm capitalize ${categoryColors[event.category] || categoryColors.other}`}>
          {categoryIcons[event.category]} {event.category}
        </div>
        {/* Status Badge */}
        {isFull && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/80 text-white backdrop-blur-sm">
            Full
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-white font-semibold text-lg leading-tight mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
          {event.title}
        </h3>
        <p className="text-slate-400 text-sm line-clamp-2 mb-4 flex-1">
          {event.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formattedDate} · {formattedTime}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className={isFull ? 'text-red-400 font-medium' : isAlmostFull ? 'text-orange-400 font-medium' : 'text-slate-400'}>
              {isFull ? 'No spots left' : `${spotsLeft} spots left`}
            </span>
            <div className="flex-1 h-1.5 rounded-full bg-slate-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isFull ? 'bg-red-500' : isAlmostFull ? 'bg-orange-400' : 'bg-blue-500'}`}
                style={{ width: `${Math.min(((event.registeredUsers?.length || 0) / event.capacity) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <Link
          to={`/events/${event._id}`}
          className="mt-auto block text-center px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 active:scale-95"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
