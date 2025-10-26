import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabaseClient';
import TaskModal from './TaskModal';
import ClientManagementModal from './ClientManagementModal';
import { Client, ClientGroup, Task } from '../../types/tasks';
import VenaLogo from '../icons/VenaLogo.png';

interface HeaderProps {
  user: User | null;
  clients: Client[];
  clientGroups: ClientGroup[];
  onDataChange: () => void;
  onCreateTask: (taskData: any) => Promise<any>;
  editingTask?: Task | null; // ADD THIS PROP
  onUpdateTask?: (taskData: any) => Promise<void>; // ADD THIS PROP
  onCancelEdit?: () => void; // ADD THIS PROP
}

const Header: React.FC<HeaderProps> = ({ 
  user, 
  clients, 
  clientGroups, 
  onDataChange, 
  onCreateTask,
  editingTask,
  onUpdateTask,
  onCancelEdit
}) => {
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [isClientModalOpen, setClientModalOpen] = useState(false);

  // Open modal when editingTask is set
  useEffect(() => {
    if (editingTask) {
      setTaskModalOpen(true);
    }
  }, [editingTask]);

  // Function to handle signing out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // The onAuthStateChange listener in App.tsx will handle redirecting to the login page.
  };

  const handleTaskSubmit = async (taskData: any) => {
    try {
      console.log('Task submit with data:', taskData);
      
      if (editingTask && onUpdateTask) {
        await onUpdateTask({
          ...taskData,
          id: editingTask.taskId || editingTask.id,
          assignmentId: editingTask.id
        });
      } else {
        // Create new task
        await onCreateTask(taskData);
      }
      
      setTaskModalOpen(false); // Close modal after successful creation
      console.log('Task operation completed successfully');
    } catch (error) {
      console.error('Error with task operation:', error);
      alert('Error with task operation: ' + (error as Error).message);
    }
  };

  const handleModalClose = () => {
    setTaskModalOpen(false);
    if (editingTask && onCancelEdit) {
      onCancelEdit(); // Clear the editing state
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-purple-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            {/* LEFT SIDE - LOGO */}
            <div className="flex items-center">
              <img 
                src={VenaLogo} 
                alt="Vena" 
                className="h-12 w-auto"
              />
            </div>

            {/* CENTER - NAVIGATION/ACTIONS */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setTaskModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Follow-Up
              </button>

              <button
                onClick={() => setClientModalOpen(true)}
                className="bg-white hover:bg-purple-50 text-purple-600 px-4 py-2 rounded-lg font-medium border border-purple-200 transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Manage Clients
              </button>
            </div>

            {/* RIGHT SIDE - USER INFO & LOGOUT */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-purple-600">
                Welcome, {user?.email}
              </div>
              <button
                onClick={handleSignOut}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={handleModalClose} // Use the updated close handler
        onTaskCreated={handleTaskSubmit}
        clients={clients}
        clientGroups={clientGroups}
        editingTask={editingTask} // Pass the editing task to modal
      />
      <ClientManagementModal
        isOpen={isClientModalOpen}
        onClose={() => setClientModalOpen(false)}
        user={user}
        onDataChange={onDataChange}
        clients={clients}
        clientGroups={clientGroups}
      />
    </>
  );
};

export default Header;
