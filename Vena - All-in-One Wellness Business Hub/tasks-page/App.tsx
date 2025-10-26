import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import { sendTaskEmail, scheduleReminderEmail } from './lib/emailService';
import { User } from '@supabase/supabase-js';
import AuthForm from './components/AuthForm';
import Header from './components/Header';
import TaskList from './components/TaskList';
import { Client, ClientGroup, TaskAssignment, Task, TaskStatus } from './types';

function App() {
  const [session, setSession] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [taskAssignments, setTaskAssignments] = useState<TaskAssignment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientGroups, setClientGroups] = useState<ClientGroup[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null); // ADD THIS STATE

  useEffect(() => {
    // First, check if there's an existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session.user);
        fetchData(session.user).then(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Then set up the listener for future auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session.user);
        fetchData(session.user);
      } else {
        setSession(null);
        setTaskAssignments([]);
        setClients([]);
        setClientGroups([]);
        setTasks([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Helper function to map database status to TaskStatus enum
  const mapStatusToEnum = (status: string): TaskStatus => {
    console.log('Mapping database status to enum:', status);
    switch (status?.toLowerCase()) {
      case 'assigned':
        return TaskStatus.Assigned;
      case 'done':
      case 'completed':
        return TaskStatus.Done;
      case 'pending':
        return TaskStatus.Pending;
      case 'missed':
        return TaskStatus.Missed;
      case 'reminder sent':
      case 'reminder_sent':
        return TaskStatus.ReminderSent;
      default:
        console.warn(`Unknown status from database: ${status}`);
        return TaskStatus.Pending;
    }
  };

  // Helper function to map TaskStatus enum to database string
  const mapEnumToDatabaseStatus = (status: TaskStatus): string => {
    console.log('Mapping enum to database status:', status);
    switch (status) {
      case TaskStatus.Assigned:
        return 'Assigned';
      case TaskStatus.Done:
        return 'completed'; // Make sure this matches what your dropdown sends
      case TaskStatus.Pending:
        return 'pending';
      case TaskStatus.Missed:
        return 'Missed';
      case TaskStatus.ReminderSent:
        return 'Reminder Sent';
      default:
        return 'pending';
    }
  };

  const fetchData = async (user: User) => {
    const [assignmentRes, clientsRes, groupsRes] = await Promise.all([
      // Fetch both individual client tasks AND group tasks
      supabase
        .from('client_tasks')
        .select(`
          id, 
          status, 
          due_date, 
          client_id,
          group_id,
          client:clients(id, name:client_name, email:client_email, avatar:client_avatar), 
          task:tasks(id, title, description),
          group:client_groups(id, name:group_name)
        `)
        .eq('task.creator_user_id', user.id),
      supabase.from('clients').select('*').eq('creator_user_id', user.id),
      supabase.from('client_groups').select(`*, group_members(client_id)`).eq('creator_user_id', user.id)
    ]);

    setTaskAssignments(assignmentRes.data || []);
    setClients(clientsRes.data?.map(c => ({ id: c.id, name: c.client_name, email: c.client_email, avatar: c.client_avatar || '' })) || []);
    setClientGroups(groupsRes.data?.map(g => ({ id: g.id, name: g.group_name, clientIds: g.group_members.map((m: any) => m.client_id) })) || []);
    
    // Map tasks to include both individual and group assignments
    setTasks(assignmentRes.data?.map(a => ({
      id: a.id,
      title: a.task.title,
      details: a.task.description,
      assignee: a.group_id 
        ? { type: 'group' as const, id: a.group_id }
        : { type: 'client' as const, id: a.client_id },
      dueDate: a.due_date || '',
      status: mapStatusToEnum(a.status),
      reminder: false,
      deliveryMethod: 'email',
      taskId: a.task.id
    })) || []);
  };

  const fetchClients = async () => {
    if (!session) return;
    
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('creator_user_id', session.id);

    if (error) {
      console.error('Error fetching clients:', error);
      return;
    }

    setClients(data?.map(c => ({ 
      id: c.id, 
      name: c.client_name, 
      email: c.client_email, 
      avatar: c.client_avatar || '' 
    })) || []);
  };

  const handleDataChange = async () => {
    if (session) {
      await fetchData(session);
    }
  };

  const handleEditTask = (task: Task) => {
    console.log('Editing task:', task);
    setEditingTask(task); // Set the task to be edited
  };

  const handleUpdateTask = async (taskData: {
    id: string;
    title: string;
    description: string;
    due_date: string;
    client_id: string;
  }) => {
    try {
      console.log('Updating task:', taskData);

      // Update the task in the tasks table
      const { error: taskError } = await supabase
        .from('tasks')
        .update({
          title: taskData.title,
          description: taskData.description
        })
        .eq('id', taskData.id);

      if (taskError) throw taskError;

      // Update the assignment in client_tasks table
      const { error: assignmentError } = await supabase
        .from('client_tasks')
        .update({
          due_date: taskData.due_date,
          client_id: taskData.client_id
        })
        .eq('id', editingTask?.id); // Use the assignment ID

      if (assignmentError) throw assignmentError;

      console.log('Task updated successfully');
      setEditingTask(null); // Close the edit modal
      await handleDataChange(); // Refresh data

    } catch (error) {
      console.error('Error updating task:', error);
      alert('Error updating task: ' + (error as Error).message);
    }
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
  };

  const handleDeleteTask = async (taskId: string) => {
    const { error } = await supabase.from('client_tasks').delete().eq('id', taskId);
    if (error) {
      alert('Error deleting task: ' + error.message);
    } else {
      handleDataChange();
    }
  };

  // KEEP ONLY THIS handleStatusChange FUNCTION - REMOVE EMAIL SENDING
  const handleStatusChange = async (assignmentId: string, status: TaskStatus) => {
    try {
      console.log('=== STATUS UPDATE DEBUG ===');
      console.log('Assignment ID:', assignmentId);
      console.log('New Status:', status);
      console.log('Status as string:', mapEnumToDatabaseStatus(status));
      
      // Check if this task exists in our local state
      const taskExists = tasks.find(t => t.id === assignmentId);
      console.log('Task exists in local state:', !!taskExists);
      console.log('Current task status:', taskExists?.status);

      // Update in database
      const { data, error } = await supabase
        .from('client_tasks')
        .update({ status: mapEnumToDatabaseStatus(status) })
        .eq('id', assignmentId)
        .select();

      if (error) {
        console.error('Database update error:', error);
        throw error;
      }

      console.log('Database updated successfully:', data);
      console.log('Updated rows count:', data?.length);

      // Update local state immediately
      console.log('Updating local state...');
      setTasks(prevTasks => {
        const updated = prevTasks.map(task => 
          task.id === assignmentId 
            ? { ...task, status: status }
            : task
        );
        console.log('Local state updated. New tasks:', updated.map(t => ({ id: t.id, status: t.status })));
        return updated;
      });

      // REMOVED: Email sending code

      // Refresh data from database
      console.log('Refreshing data from database...');
      await handleDataChange();
      console.log('Data refresh completed');

    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Error updating status: ' + (error as Error).message);
    }
  };

  // Updated notify function to handle both individuals and groups
  const handleNotifyClient = async (assignmentId: string) => {
    try {
      console.log('Sending notification for assignment:', assignmentId);

      // Find the task and assignment info
      const taskAssignment = taskAssignments.find(ta => ta.id === assignmentId);
      const task = tasks.find(t => t.id === assignmentId);
      
      if (!taskAssignment || !task) {
        alert('Task information not found');
        return;
      }

      // Get professional name from session user
      const professionalName = session?.user_metadata?.full_name || 
                              session?.email?.split('@')[0] || 
                              'Your Wellness Professional';

      if (task.assignee.type === 'group') {
        // Handle group notification - send to all group members
        const group = clientGroups.find(g => g.id === task.assignee.id);
        if (!group) {
          alert('Group not found');
          return;
        }

        // Get all clients in the group
        const groupClients = clients.filter(c => group.clientIds.includes(c.id));
        
        if (groupClients.length === 0) {
          alert('No clients found in this group');
          return;
        }

        // Send email to each group member
        const emailPromises = groupClients.map(client => 
          sendTaskEmail(
            assignmentId,
            client.email,
            client.name,
            taskAssignment.task.title,
            mapEnumToDatabaseStatus(task.status),
            taskAssignment.task.description,
            taskAssignment.due_date || undefined,
            professionalName
          )
        );

        await Promise.all(emailPromises);
        console.log(`Notifications sent to ${groupClients.length} group members`);
        alert(`Notification sent to ${groupClients.length} members of ${group.name}`);

      } else {
        // Handle individual client notification
        const client = clients.find(c => c.id === task.assignee.id);
        if (!client || !client.email) {
          alert('Client email not found');
          return;
        }

        await sendTaskEmail(
          assignmentId,
          client.email,
          client.name,
          taskAssignment.task.title,
          mapEnumToDatabaseStatus(task.status),
          taskAssignment.task.description,
          taskAssignment.due_date || undefined,
          professionalName
        );

        console.log('Notification sent successfully');
        alert('Notification sent to ' + client.name);
      }

    } catch (error) {
      console.error('Failed to send notification:', error);
      alert('Failed to send notification: ' + (error as Error).message);
    }
  };

  // ADD THIS FUNCTION
  const createTask = async (taskData: {
    title: string;
    description: string;
    due_date: string;
    assignee_type: 'client' | 'group';
    client_id?: string;
    group_id?: string;
  }) => {
    try {
      console.log('Creating task with data:', taskData);

      if (!session) {
        throw new Error('User not authenticated');
      }

      // 1. First create the task in the tasks table
      const { data: newTask, error: taskError } = await supabase
        .from('tasks')
        .insert({
          title: taskData.title,
          description: taskData.description,
          creator_user_id: session.id
        })
        .select()
        .single();

      if (taskError) {
        console.error('Error creating task:', taskError);
        throw taskError;
      }

      console.log('Task created:', newTask);

      // 2. Create the assignment in client_tasks table
      const assignmentData: any = {
        task_id: newTask.id,
        due_date: taskData.due_date,
        status: 'pending'
      };

      // Add either client_id or group_id based on assignee_type
      if (taskData.assignee_type === 'client' && taskData.client_id) {
        assignmentData.client_id = taskData.client_id;
      } else if (taskData.assignee_type === 'group' && taskData.group_id) {
        assignmentData.group_id = taskData.group_id;
      } else {
        throw new Error('Invalid assignee data');
      }

      const { data: assignment, error: assignmentError } = await supabase
        .from('client_tasks')
        .insert(assignmentData)
        .select(`
          id,
          due_date,
          status,
          client_id,
          group_id,
          client:clients(id, client_name, client_email),
          task:tasks(id, title, description),
          group:client_groups(id, group_name)
        `)
        .single();

      if (assignmentError) {
        console.error('Error creating assignment:', assignmentError);
        throw assignmentError;
      }

      console.log('Assignment created:', assignment);

      // 3. Schedule reminder email if needed
      if (assignment.due_date) {
        const professionalName = session?.user_metadata?.full_name || 
                                session?.email?.split('@')[0] || 
                                'Your Wellness Professional';

        if (taskData.assignee_type === 'group' && taskData.group_id) {
          // Schedule reminders for all group members
          const group = clientGroups.find(g => g.id === taskData.group_id);
          if (group) {
            const groupClients = clients.filter(c => group.clientIds.includes(c.id));
            
            const reminderPromises = groupClients.map(client => 
              scheduleReminderEmail(
                assignment.id,
                client.email,
                client.name,
                newTask.title,
                assignment.due_date,
                1,
                professionalName
              )
            );

            await Promise.all(reminderPromises);
            console.log(`Reminders scheduled for ${groupClients.length} group members`);
          }
        } else if (taskData.assignee_type === 'client' && assignment.client) {
          // Schedule reminder for individual client
          await scheduleReminderEmail(
            assignment.id,
            assignment.client.client_email,
            assignment.client.client_name,
            newTask.title,
            assignment.due_date,
            1,
            professionalName
          );
          console.log('Reminder scheduled for individual client');
        }
      }

      // 4. Refresh the data
      await handleDataChange();

      return assignment;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-purple-50/50 flex items-center justify-center">
        <p className="text-purple-700">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <AuthForm />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-50/50">
      <Header 
        user={session} 
        clients={clients} 
        clientGroups={clientGroups}
        onDataChange={handleDataChange}
        onCreateTask={createTask}
        editingTask={editingTask} // ADD THIS PROP
        onUpdateTask={handleUpdateTask} // ADD THIS PROP
        onCancelEdit={handleCancelEdit} // ADD THIS PROP
      />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <TaskList
          tasks={tasks}
          clients={clients}
          clientGroups={clientGroups}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onStatusChange={handleStatusChange}
          onNotifyClient={handleNotifyClient}
          user={session}
          assignments={taskAssignments}
          onDataChange={handleDataChange}
        />
      </main>
    </div>
  );
}

export default App;
