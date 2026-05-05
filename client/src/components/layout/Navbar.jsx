import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HiMenuAlt2,
  HiSearch,
  HiBell,
  HiChevronDown,
  HiLogout,
  HiUser,
  HiCog,
} from 'react-icons/hi';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const goToProfile = () => {
    setDropdownOpen(false);
    navigate('/profile');
  };

  const goToSettings = () => {
    setDropdownOpen(false);
    navigate('/settings');
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-700';
      case 'DEVELOPER':
        return 'bg-blue-100 text-blue-700';
      case 'TESTER':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Left: hamburger + search */}
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <HiMenuAlt2 className="w-5 h-5" />
          </button>

          <div className={`relative max-w-md flex-1 transition-all duration-200 ${searchFocused ? 'max-w-lg' : ''}`}>
            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search bugs, tasks, stories..."
              className={`w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border rounded-lg transition-all duration-200 ${
                searchFocused
                  ? 'border-primary-300 ring-2 ring-primary-100 bg-white'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 hidden sm:inline-flex items-center px-1.5 py-0.5 text-xs text-gray-400 bg-gray-100 border border-gray-200 rounded">
              /
            </kbd>
          </div>
        </div>

        {/* Right: notifications + profile */}
        <div className="flex items-center gap-2 ml-4">
          {/* Notification bell */}
          <button className="relative p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <HiBell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full"></span>
          </button>

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium">
                {getInitials(user?.name)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-700 leading-tight">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 leading-tight capitalize">{user?.role || 'member'}</p>
              </div>
              <HiChevronDown className={`w-4 h-4 text-gray-400 hidden sm:block transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                  <span className={`inline-block mt-1.5 px-2 py-0.5 text-xs font-medium rounded-full capitalize ${getRoleBadgeColor(user?.role)}`}>
                    {user?.role}
                  </span>
                </div>
                <div className="py-1">
                  <button
                    type="button"
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={goToProfile}
                  >
                    <HiUser className="w-4 h-4 text-gray-400" />
                    Profile
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={goToSettings}
                  >
                    <HiCog className="w-4 h-4 text-gray-400" />
                    Settings
                  </button>
                </div>
                <div className="border-t border-gray-100 py-1">
                  <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-danger-600 hover:bg-danger-50 transition-colors"
                  >
                    <HiLogout className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
