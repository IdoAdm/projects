import React, { useState } from 'react';
import { PlusIcon, TrashIcon, EditIcon } from './Icons';

type AvailabilityWindow = {
  id: string;
  weekday: number;
  start_minute: number;
  end_minute: number;
  slot_minutes: number;
};

type AvailabilityEditorProps = {
  windows: AvailabilityWindow[];
  onAdd: (weekday: number) => void;
  onRemove: (windowId: string) => void;
  onUpdate: (windowId: string, updates: Partial<AvailabilityWindow>) => void;
};

export default function AvailabilityEditor({ windows, onAdd, onRemove, onUpdate }: AvailabilityEditorProps) {
  const [editingWindow, setEditingWindow] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    start_hour: 9,
    start_minute: 0,
    end_hour: 17,
    end_minute: 0,
    slot_minutes: 60
  });

  const weekdays = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push({ value: hour * 60 + minute, label: timeString });
    }
  }

  const slotOptions = [
    { value: 15, label: '15 minutes' },
    { value: 20, label: '20 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' }
  ];

  const startEditing = (window: AvailabilityWindow) => {
    setEditingWindow(window.id);
    setEditForm({
      start_hour: Math.floor(window.start_minute / 60),
      start_minute: window.start_minute % 60,
      end_hour: Math.floor(window.end_minute / 60),
      end_minute: window.end_minute % 60,
      slot_minutes: window.slot_minutes
    });
  };

  const saveEdit = () => {
    if (!editingWindow) return;

    const startMinute = editForm.start_hour * 60 + editForm.start_minute;
    const endMinute = editForm.end_hour * 60 + editForm.end_minute;

    if (endMinute <= startMinute) {
      alert('End time must be after start time');
      return;
    }

    onUpdate(editingWindow, {
      start_minute: startMinute,
      end_minute: endMinute,
      slot_minutes: editForm.slot_minutes
    });

    setEditingWindow(null);
  };

  const cancelEdit = () => {
    setEditingWindow(null);
  };

  const formatTime = (minutes: number) => {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  // Group windows by weekday
  const windowsByDay = windows.reduce((acc, window) => {
    if (!acc[window.weekday]) {
      acc[window.weekday] = [];
    }
    acc[window.weekday].push(window);
    return acc;
  }, {} as Record<number, AvailabilityWindow[]>);

  return (
    <div className="space-y-6">
      {weekdays.map((day, index) => {
        const dayWindows = windowsByDay[index + 1] || [];
        const weekday = index + 1;

        return (
          <div key={day} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">{day}</h3>
              <button
                onClick={() => onAdd(weekday)}
                className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg hover:bg-purple-200 text-sm"
              >
                + Add Slot
              </button>
            </div>

            {dayWindows.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No availability set for {day}</p>
            ) : (
              <div className="space-y-2">
                {dayWindows.map((window, windowIndex) => (
                  <div key={window.id}>
                    {editingWindow === window.id ? (
                      <div className="space-y-4 p-3 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Start Time
                            </label>
                            <select
                              value={editForm.start_hour * 60 + editForm.start_minute}
                              onChange={(e) => {
                                const minutes = parseInt(e.target.value);
                                setEditForm({
                                  ...editForm,
                                  start_hour: Math.floor(minutes / 60),
                                  start_minute: minutes % 60
                                });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              {timeOptions.map((time) => (
                                <option key={time.value} value={time.value}>
                                  {time.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              End Time
                            </label>
                            <select
                              value={editForm.end_hour * 60 + editForm.end_minute}
                              onChange={(e) => {
                                const minutes = parseInt(e.target.value);
                                setEditForm({
                                  ...editForm,
                                  end_hour: Math.floor(minutes / 60),
                                  end_minute: minutes % 60
                                });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              {timeOptions.map((time) => (
                                <option key={time.value} value={time.value}>
                                  {time.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Slot Duration
                          </label>
                          <select
                            value={editForm.slot_minutes}
                            onChange={(e) => setEditForm({ ...editForm, slot_minutes: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            {slotOptions.map((slot) => (
                              <option key={slot.value} value={slot.value}>
                                {slot.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex justify-end gap-2">
                          <button
                            onClick={cancelEdit}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={saveEdit}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <span className="text-gray-600">
                            Slot {windowIndex + 1}: {formatTime(window.start_minute)} - {formatTime(window.end_minute)}
                          </span>
                          <span className="text-gray-500 ml-2 text-sm">
                            ({slotOptions.find(s => s.value === window.slot_minutes)?.label || `${window.slot_minutes}min`})
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditing(window)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <EditIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onRemove(window.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
