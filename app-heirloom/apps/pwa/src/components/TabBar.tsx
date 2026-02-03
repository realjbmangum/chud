import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Mic, Users, User } from 'lucide-react';

export default function TabBar() {
  const location = useLocation();

  // Hide on certain routes
  const hiddenRoutes = ['/record', '/login', '/signup', '/forgot-password', '/reset-password'];
  if (hiddenRoutes.some((r) => location.pathname.startsWith(r)) ||
      location.pathname.startsWith('/story/') ||
      location.pathname.startsWith('/family/') ||
      location.pathname.startsWith('/tree')) {
    return null;
  }

  const tabs = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/record', icon: Mic, label: 'Record', special: true },
    { path: '/family', icon: Users, label: 'Family' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-heritage-green/10 safe-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;

          if (tab.special) {
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className="flex flex-col items-center -mt-6"
              >
                <div className="w-14 h-14 rounded-full bg-heirloom-gold shadow-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className="flex flex-col items-center py-2 px-2"
            >
              <div
                className={`p-1.5 rounded-xl transition-colors ${
                  isActive ? 'bg-heritage-green/10' : ''
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? 'text-heritage-green' : 'text-charcoal-ink/40'
                  }`}
                />
              </div>
              <span
                className={`text-xs mt-1 ${
                  isActive
                    ? 'text-heritage-green font-medium'
                    : 'text-charcoal-ink/40'
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
