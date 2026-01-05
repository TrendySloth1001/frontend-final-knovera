/**
 * Top Navigation Component
 * Responsive navbar with auth state
 */

'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, LogOut, User } from 'lucide-react';
import { useState } from 'react';

export default function TopNav() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-black text-white border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold hover:text-gray-300 transition-colors">
            Knovera
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {!isLoading && (
              <>
                {isAuthenticated && user?.user ? (
                  <>
                    <div className="flex items-center gap-2 text-gray-400">
                      <User size={18} />
                      <span>{user.user.displayName}</span>
                      <span className="text-xs px-2 py-1 bg-gray-800 rounded">
                        {user.user.role}
                      </span>
                    </div>
                    <button
                      onClick={() => logout()}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors"
                  >
                    Sign In
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded hover:bg-gray-900 transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-gray-800">
            {!isLoading && (
              <>
                {isAuthenticated && user?.user ? (
                  <>
                    <div className="px-4 py-2 text-gray-400">
                      <div className="font-semibold text-white">{user.user.displayName}</div>
                      <div className="text-sm">{user.user.email}</div>
                      <div className="text-xs mt-1">Role: {user.user.role}</div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="block px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
