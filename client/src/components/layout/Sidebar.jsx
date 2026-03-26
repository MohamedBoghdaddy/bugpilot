import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HiHome,
  HiOutlineTicket,
  HiViewBoards,
  HiClipboardList,
  HiPlus,
  HiUsers,
  HiShieldCheck,
  HiChartBar,
  HiBookOpen,
  HiChevronLeft,
  HiChevronRight,
  HiX,
} from 'react-icons/hi';

const Sidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const { user } = useAuth();
  const role = user?.role || 'customer';

  const navItems = [
    { to: '/dashboard', icon: HiHome, label: 'Dashboard', roles: ['admin', 'developer', 'tester', 'customer'] },
    { to: '/bugs', icon: HiOutlineTicket, label: 'Bugs', roles: ['admin', 'developer', 'tester', 'customer'] },
    { to: '/bugs/new', icon: HiPlus, label: 'Report Bug', roles: ['customer', 'tester', 'admin'] },
    { to: '/kanban', icon: HiViewBoards, label: 'Kanban', roles: ['admin', 'developer', 'tester', 'customer'] },
    { to: '/tasks', icon: HiClipboardList, label: 'My Tasks', roles: ['admin', 'developer', 'tester', 'customer'] },
    { to: '/stories', icon: HiBookOpen, label: 'Stories', roles: ['admin', 'developer'] },
    { to: '/users', icon: HiUsers, label: 'Users', roles: ['admin'] },
    { to: '/roles', icon: HiShieldCheck, label: 'Roles', roles: ['admin'] },
    { to: '/reports', icon: HiChartBar, label: 'Reports', roles: ['admin'] },
  ];

  const filteredItems = navItems.filter((item) => item.roles.includes(role));

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
      isActive
        ? 'bg-primary-50 text-primary-700 shadow-sm'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 flex flex-col transition-all duration-200 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${collapsed ? 'w-16' : 'w-64'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <HiOutlineTicket className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">BugTrackr</span>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mx-auto">
              <HiOutlineTicket className="w-5 h-5 text-white" />
            </div>
          )}
          {/* Close button on mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {filteredItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={linkClass}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${collapsed ? 'mx-auto' : ''}`} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle - desktop only */}
        <div className="hidden lg:block border-t border-gray-200 p-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            {collapsed ? (
              <HiChevronRight className="w-5 h-5" />
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <HiChevronLeft className="w-5 h-5" />
                <span>Collapse</span>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
