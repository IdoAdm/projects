
import React, { useState, useRef, useEffect } from 'react';
import { TaskStatus } from '../types';
import { CheckCircleIcon, ClockIcon, ExclamationIcon, RefreshIcon, ChevronDownIcon, UsersIcon } from './Icons';

interface StatusBadgeProps {
  status: TaskStatus;
  taskId: string;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

const statusConfig = {
  [TaskStatus.Assigned]: {
    icon: UsersIcon,
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    label: 'Assigned',
  },
  [TaskStatus.Done]: {
    icon: CheckCircleIcon,
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    label: 'Done',
  },
  [TaskStatus.Pending]: {
    icon: ClockIcon,
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    label: 'Pending',
  },
  [TaskStatus.Missed]: {
    icon: ExclamationIcon,
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    label: 'Missed',
  },
  [TaskStatus.ReminderSent]: {
    icon: RefreshIcon,
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    label: 'Reminder Sent',
  },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, taskId, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const config = statusConfig[status];

  // Handle case where status doesn't match any config
  if (!config) {
    console.warn(`Unknown status: ${status}`);
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        {status || 'Unknown'}
      </span>
    );
  }

  const Icon = config.icon;

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

  const handleSelect = (newStatus: TaskStatus) => {
    onStatusChange(taskId, newStatus);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`inline-flex items-center justify-center gap-x-1.5 rounded-full px-3 py-1 text-xs font-medium ${config.bgColor} ${config.textColor} hover:opacity-80 transition-opacity`}
        >
          <Icon className="w-4 h-4" />
          {config.label}
          <ChevronDownIcon className="-mr-1 h-4 w-4" />
        </button>
      </div>

      {isOpen && (
        <div
          className="absolute z-10 mt-2 w-40 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1" role="none">
            {Object.values(TaskStatus).map((s, index) => (
              <button
                key={`${s}-${index}`}
                onClick={() => handleSelect(s)}
                className="w-full text-left text-purple-700 block px-4 py-2 text-sm hover:bg-purple-100"
                role="menuitem"
              >
                {statusConfig[s].label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusBadge;
