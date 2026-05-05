import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { HiUser, HiMail, HiShieldCheck, HiCalendar } from 'react-icons/hi';

const ROLE_COLORS = {
  ADMIN: 'bg-purple-100 text-purple-700',
  DEVELOPER: 'bg-blue-100 text-blue-700',
  TESTER: 'bg-green-100 text-green-700',
  CUSTOMER: 'bg-gray-100 text-gray-700',
};

const ProfilePage = () => {
  const { user } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—';

  const roleColor = ROLE_COLORS[user?.role] || ROLE_COLORS.CUSTOMER;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Your account information</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        {/* Avatar + name */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {getInitials(user?.name)}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{user?.name || '—'}</h2>
            <span
              className={`inline-block mt-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full ${roleColor}`}
            >
              {user?.role || 'CUSTOMER'}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4 border-t border-gray-100 pt-5">
          <div className="flex items-start gap-3">
            <HiUser className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Full name</p>
              <p className="text-sm text-gray-900 mt-0.5">{user?.name || '—'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <HiMail className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Email address</p>
              <p className="text-sm text-gray-900 mt-0.5">{user?.email || '—'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <HiShieldCheck className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Role</p>
              <p className="text-sm text-gray-900 mt-0.5">{user?.role || '—'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <HiCalendar className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Member since</p>
              <p className="text-sm text-gray-900 mt-0.5">{joinedDate}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="w-5 h-5 flex items-center justify-center mt-0.5 flex-shrink-0">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  user?.isActive ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
            </span>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Account status</p>
              <p className="text-sm text-gray-900 mt-0.5">
                {user?.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        To update your name, email, or password, contact your administrator.
      </p>
    </div>
  );
};

export default ProfilePage;
