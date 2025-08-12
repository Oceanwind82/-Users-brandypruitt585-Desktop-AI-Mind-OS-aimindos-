'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CompactXPBar } from '@/components/XPProgressBar';
import { Home, BookOpen, Users, Trophy, Settings, Palette, CreditCard, ArrowLeft } from 'lucide-react';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showXP?: boolean;
}

export default function AppHeader({ 
  title = "AI Mind OS", 
  subtitle,
  showXP = true 
}: AppHeaderProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/lessons', icon: BookOpen, label: 'Lessons' },
    { href: '/whiteboard', icon: Palette, label: 'Whiteboard' },
    { href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { href: '/community', icon: Users, label: 'Community' },
    { href: '/billing', icon: CreditCard, label: 'Billing' },
    { href: '/settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <header className="border-b border-white/10 bg-black/20 backdrop-blur-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Back to Home Button */}
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>

          {/* Title Section */}
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-bold text-white mb-1">
              {title}
            </h1>
            {subtitle && (
              <p className="text-purple-200 text-sm">
                {subtitle}
              </p>
            )}
          </div>
          
          {/* XP Progress Bar */}
          {showXP && (
            <div className="flex-1 max-w-xs">
              <CompactXPBar />
            </div>
          )}

          {/* Navigation */}
          <nav className="flex items-center space-x-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all duration-200 ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  <span className="hidden md:block">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden mt-4">
          <div className="flex justify-center space-x-1 bg-white/5 rounded-lg p-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex-1 px-2 py-2 rounded-md text-xs flex flex-col items-center gap-1 transition-all duration-200 ${
                    isActive
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
