import React, { useState, useEffect } from 'react';
import { Client, ClientGroup, Task } from '../../types/tasks';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: (taskData: any) => void;
  clients: Client[];
  clientGroups: ClientGroup[];
  editingTask?: Task | null; // ADD THIS PROP
}

const TaskModal: React.FC<TaskModalProps> = ({ 
  isOpen, 
  onClose, 
  onTaskCreated, 
  clients = [], 
  clientGroups = [],
  editingTask // ADD THIS
}) => {
  // State for the form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [assigneeType, setAssigneeType] = useState<'client' | 'group'>('client');
  const [selectedGroup, setSelectedGroup] = useState('');

  // Pre-populate form when editing
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.details);
      setDueDate(editingTask.dueDate.split('T')[0]); // Format for date input
      setAssigneeType(editingTask.assignee.type);
      
      if (editingTask.assignee.type === 'client') {
        setSelectedClient(editingTask.assignee.id);
        setSelectedGroup('');
      } else {
        setSelectedGroup(editingTask.assignee.id);
        setSelectedClient('');
      }
    } else {
      // Reset form for new task
      setTitle('');
      setDescription('');
      setDueDate('');
      setSelectedClient('');
      setSelectedGroup('');
      setAssigneeType('client');
    }
  }, [editingTask]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData = {
      title,
      description,
      due_date: dueDate,
      assignee_type: assigneeType,
      client_id: assigneeType === 'client' ? selectedClient : null,
      group_id: assigneeType === 'group' ? selectedGroup : null,
    };

    await onTaskCreated(taskData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {editingTask ? 'Edit Task' : 'Create New Task'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="w-full p-2 border rounded mb-4"
            required
          />
          
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Task description"
            className="w-full p-2 border rounded mb-4"
            rows={3}
          />
          
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            required
          />

          {/* Assignee Type Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign to:
            </label>
            <div className="flex gap-4 mb-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="client"
                  checked={assigneeType === 'client'}
                  onChange={(e) => setAssigneeType(e.target.value as 'client' | 'group')}
                  className="mr-2"
                />
                Individual Client
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="group"
                  checked={assigneeType === 'group'}
                  onChange={(e) => setAssigneeType(e.target.value as 'client' | 'group')}
                  className="mr-2"
                />
                Client Group
              </label>
            </div>
          </div>

          {/* Client Selection */}
          {assigneeType === 'client' && (
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              required
            >
              <option value="">Select client...</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          )}

          {/* Group Selection */}
          {assigneeType === 'group' && (
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              required
            >
              <option value="">Select group...</option>
              {clientGroups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name} ({group.clientIds.length} members)
                </option>
              ))}
            </select>
          )}
          
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              {editingTask ? 'Update Task' : 'Create Task'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
