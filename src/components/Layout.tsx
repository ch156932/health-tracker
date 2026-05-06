import { NavLink } from 'react-router-dom';
import { Home, UtensilsCrossed, Dumbbell, Activity, BarChart2, Users } from 'lucide-react';
import UserSwitcher from './UserSwitcher';

const navItems = [
  { to: '/', icon: Home, label: '首页' },
  { to: '/food', icon: UtensilsCrossed, label: '饮食' },
  { to: '/exercise', icon: Dumbbell, label: '运动' },
  { to: '/metrics', icon: Activity, label: '指标' },
  { to: '/analysis', icon: BarChart2, label: '分析' },
  { to: '/users', icon: Users, label: '用户' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 max-w-md mx-auto relative">
      <UserSwitcher />
      <main className="flex-1 overflow-y-auto pb-20 pt-14">
        {children}
      </main>
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 flex z-40">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2 text-xs transition-colors ${
                isActive ? 'text-green-600' : 'text-gray-500'
              }`
            }
          >
            <Icon size={20} strokeWidth={1.8} />
            <span className="mt-0.5">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
