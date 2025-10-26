import React, { useMemo, useState, useEffect } from 'react';
import { Task, Client, TaskStatus, ClientGroup, TaskAssignment } from '../types';
import { EditIcon, TrashIcon, UsersIcon } from './Icons';
import StatusBadge from './StatusBadge';
import { User } from '@supabase/supabase-js';
import { sendTaskEmail } from '../lib/emailService';
import { supabase } from '../lib/supabaseClient';

interface TaskListProps {
  tasks: Task[];
  clients: Client[];
  clientGroups: ClientGroup[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onNotifyClient: (taskId: string) => void; // ADD THIS NEW PROP
  user: User | null;
  assignments: TaskAssignment[];
  onDataChange: () => void;
}

const TaskList: React.FC<TaskListProps> = ({ 
  tasks, 
  clients, 
  clientGroups, 
  onEditTask, 
  onDeleteTask, 
  onStatusChange, 
  onNotifyClient, // ADD THIS
  user, 
  assignments = [], 
  onDataChange 
}) => {
  const clientMap = useMemo(() => {
    return new Map(clients.map(client => [client.id, client]));
  }, [clients]);

  const groupMap = useMemo(() => {
    return new Map(clientGroups.map(group => [group.id, group]));
  }, [clientGroups]);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [tasks]);

  // Function to assign a task to clients
  const handleAssignTask = async (taskId: string, clientIds: string[]) => {
    if (clientIds.length === 0) return;

    const assignments = clientIds.map(clientId => ({
      task_id: taskId,
      client_id: clientId,
    }));

    // @ts-ignore - Supabase type inference issue
    const { error } = await supabase.from('client_tasks').insert(assignments);

    if (error) {
      alert('Error assigning task: ' + error.message);
    } else {
      alert('Task assigned successfully!');
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      console.log('Updating task status:', { taskId, newStatus });

      // Update task status in database - REMOVE updated_at since it doesn't exist
      const { error } = await supabase
        .from('client_tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      // REMOVED: Email sending code - now just call onStatusChange
      onStatusChange(taskId, newStatus as any);
      onDataChange();

    } catch (error) {
      console.error('Error updating task:', error);
      alert('Error updating task status: ' + error.message);
    }
  };

  const getStatusChip = (status: string) => {
    switch (status?.toLowerCase()) { // Added safety check for status
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'missed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-10 px-4 bg-white rounded-lg shadow">
        <p className="text-gray-500">No follow-up tasks found. Click "Create Task" to add one.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm ring-1 ring-purple-200 rounded-xl">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-purple-200">
          <thead className="bg-purple-100">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-purple-600 uppercase tracking-wider">Client / Group</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-purple-600 uppercase tracking-wider">Task</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-purple-600 uppercase tracking-wider">Due</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-purple-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-purple-200">
            {sortedTasks.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-10 text-purple-500">
                  {/* UPDATED: Changed colSpan from 5 to 4 */}
                  No follow-up tasks found. Click "Create Follow-Up" to add one.
                </td>
              </tr>
            ) : (
              sortedTasks.map((task, index) => {
                const { assignee } = task;
                const isGroup = assignee.type === 'group';
                const assigneeInfo = isGroup ? groupMap.get(assignee.id) : clientMap.get(assignee.id);

                return (
                  <tr key={`${task.id}-${index}`} className="hover:bg-purple-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {isGroup ? (
                            <div className="h-10 w-10 rounded-full bg-purple-200 flex items-center justify-center">
                              <span className="text-purple-500 font-semibold">G</span>
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-purple-200 flex items-center justify-center">
                              <span className="text-purple-500 font-semibold">
                                {assigneeInfo?.name?.charAt(0) || 'C'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-purple-900">{assigneeInfo?.name || 'Unknown'}</div>
                          {isGroup && <div className="text-xs text-purple-500">Group</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-purple-900 font-semibold">{task.title}</div>
                      <div className="text-sm text-purple-600 max-w-xs truncate">{task.details}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600">
                      {new Date(task.dueDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric', 
                        timeZone: 'UTC' 
                      })}
                    </td>
                    {/* REMOVED: Status column with select dropdown */}
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center gap-4">
                        <button 
                          onClick={() => onNotifyClient(task.id)}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-150"
                          title="Send notification email to client"
                        >
                          Notify
                        </button>
                        
                        <button 
                          onClick={() => onEditTask(task)} 
                          className="text-purple-600 hover:text-purple-900 transition-colors duration-150"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => onDeleteTask(task.id)} 
                          className="text-red-600 hover:text-red-900 transition-colors duration-150"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskList;
