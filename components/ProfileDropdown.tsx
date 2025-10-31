import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { UserCircleIcon } from './icons/UserCircleIcon';

interface ProfileDropdownProps {
  user: User;
  onLogout: () => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-700 transition-colors"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <UserCircleIcon className="w-8 h-8 text-gray-300" />
        <div className="text-left hidden md:block">
            <p className="text-sm font-semibold text-white">{user.fullName}</p>
            <p className="text-xs text-gray-400">{user.role}</p>
        </div>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 border border-gray-700 z-50"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="px-4 py-2 border-b border-gray-700">
             <p className="text-sm font-semibold text-white truncate">{user.fullName}</p>
             <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
          <button
            onClick={onLogout}
            className="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"
            role="menuitem"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};
