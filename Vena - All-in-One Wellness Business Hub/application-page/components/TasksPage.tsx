import React, { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import Header from './tasks/Header';
import TaskList from './tasks/TaskList';
import { Task, Client, ClientGroup, TaskAssignment, TaskStatus } from '../types/tasks';
import { sendTaskEmail } from '../lib/emailService';

const TasksPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientGroups, setClientGroups] = useState<ClientGroup[]>([]);
  const [taskAssignments, setTaskAssignments] = useState<TaskAssignment[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      setCurrentUser(user);
      if (user) {
        void fetchData(user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setCurrentUser(user);
      if (user) {
        void fetchData(user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const mapStatusToEnum = (status: string | null | undefined): TaskStatus => {
    switch ((status ?? '').toLowerCase()) {
      case 'completed':
        return TaskStatus.Completed;
      case 'in_progress':
      case 'in-progress':
        return TaskStatus.InProgress;
      case 'missed':
        return TaskStatus.Missed;
      case 'reminder_sent':
      case 'reminder sent':
        return TaskStatus.ReminderSent;
      case 'assigned':
        return TaskStatus.Assigned;
      default:
        return TaskStatus.Pending;
    }
  };

  const fetchData = async (user: User) => {
    try {
      const [assignmentRes, clientsRes, groupsRes] = await Promise.all([
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
        supabase.from('client_groups').select(`*, group_members(client_id)`).eq('creator_user_id', user.id),
      ]);

      const rawAssignments = (assignmentRes.data ?? []) as Array<{
        id: string;
        status: string;
        due_date: string | null;
        client_id: string | null;
        group_id: string | null;
        client: Array<{ id: string; name: string; email: string | null; avatar: string | null }> | null;
        task: Array<{ id: string; title: string; description: string | null }> | null;
        group: Array<{ id: string; name: string }> | null;
      }>;

      const normalizedAssignments: TaskAssignment[] = rawAssignments.map((record) => {
        const clientRecord = Array.isArray(record.client) ? record.client[0] : record.client;
        const taskRecord = Array.isArray(record.task) ? record.task[0] : record.task;
        const groupRecord = Array.isArray(record.group) ? record.group[0] : record.group;

        return {
          id: record.id,
          status: mapStatusToEnum(record.status),
          dueDate: record.due_date,
          clientId: record.client_id,
          groupId: record.group_id,
          taskId: taskRecord?.id ?? '',
          taskTitle: taskRecord?.title ?? 'Untitled Task',
          taskDescription: taskRecord?.description ?? null,
          client: clientRecord
            ? {
                id: clientRecord.id,
                name: clientRecord.name,
                email: clientRecord.email ?? undefined,
                avatar: clientRecord.avatar ?? undefined,
              }
            : undefined,
          group: groupRecord
            ? {
                id: groupRecord.id,
                name: groupRecord.name,
              }
            : undefined,
        };
      });

      setTaskAssignments(normalizedAssignments);

      setClients(
        (clientsRes.data ?? []).map((client: any) => ({
          id: client.id,
          name: client.client_name,
          email: client.client_email,
          avatar: client.client_avatar ?? '',
        })),
      );

      setClientGroups(
        (groupsRes.data ?? []).map((group: any) => ({
          id: group.id,
          name: group.group_name,
          clientIds: (group.group_members ?? []).map((member: { client_id: string }) => member.client_id),
        })),
      );

      const normalizedTasks: Task[] = normalizedAssignments.map((assignment) => ({
        id: assignment.id,
        title: assignment.taskTitle,
        details: assignment.taskDescription ?? '',
        assignee: assignment.groupId
          ? { type: 'group', id: assignment.groupId }
          : { type: 'client', id: assignment.clientId ?? '' },
        dueDate: assignment.dueDate ?? '',
        status: assignment.status,
        reminder: false,
        deliveryMethod: 'email',
        taskId: assignment.taskId,
      }));

      setTasks(normalizedTasks);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleDataChange = () => {
    if (currentUser) {
      void fetchData(currentUser);
    }
  };

  const createTask = async (taskData: any) => {
    try {
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const { data: newTask, error: taskError } = await supabase
        .from('tasks')
        .insert({
          title: taskData.title,
          description: taskData.description,
          creator_user_id: currentUser.id,
        })
        .select()
        .single();

      if (taskError) throw taskError;

      // Create assignment
      const assignmentData: any = {
        task_id: newTask.id,
        due_date: taskData.due_date,
        status: TaskStatus.Pending
      };

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
        .select()
        .single();

      if (assignmentError) throw assignmentError;

      handleDataChange();
      return assignment;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };

  const updateTask = async (taskData: any) => {
    try {
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const taskId: string | undefined = taskData.id;
      if (!taskId) {
        throw new Error('Task identifier missing');
      }

      const { error: taskError } = await supabase
        .from('tasks')
        .update({
          title: taskData.title,
          description: taskData.description,
        })
        .eq('id', taskId);

      if (taskError) {
        throw taskError;
      }

      if (taskData.assignmentId) {
        const assignmentUpdates: Record<string, unknown> = {
          due_date: taskData.due_date,
        };

        if (taskData.assignee_type === 'client') {
          assignmentUpdates.client_id = taskData.client_id ?? null;
          assignmentUpdates.group_id = null;
        } else if (taskData.assignee_type === 'group') {
          assignmentUpdates.group_id = taskData.group_id ?? null;
          assignmentUpdates.client_id = null;
        }

        const { error: assignmentError } = await supabase
          .from('client_tasks')
          .update(assignmentUpdates)
          .eq('id', taskData.assignmentId);

        if (assignmentError) {
          throw assignmentError;
        }
      }

      handleDataChange();
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const deleteTask = async (assignmentId: string) => {
    try {
      const { data, error } = await supabase
        .from('client_tasks')
        .delete()
        .eq('id', assignmentId)
        .select('task_id')
        .single();

      if (error) {
        throw error;
      }

      const taskId = data?.task_id as string | undefined;
      if (taskId) {
        await supabase.from('tasks').delete().eq('id', taskId);
      }

      handleDataChange();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete the task. Please try again.');
    }
  };

  const handleNotifyClient = async (assignmentId: string) => {
    try {
      const taskAssignment = taskAssignments.find((entry) => entry.id === assignmentId);
      const task = tasks.find((entry) => entry.id === assignmentId);

      if (!taskAssignment || !task) {
        alert('Task information not found');
        return;
      }

      const metadata = currentUser?.user_metadata as Record<string, unknown> | undefined;
      const metadataName =
        metadata && typeof metadata.full_name === 'string' ? (metadata.full_name as string) : undefined;
      const professionalName =
        metadataName ?? currentUser?.email?.split('@')[0] ?? 'Your Wellness Professional';

      const taskTitle = taskAssignment.taskTitle;
      const taskDescription = taskAssignment.taskDescription ?? undefined;
      const dueDate = taskAssignment.dueDate ?? undefined;

      if (task.assignee.type === 'group') {
        const group = clientGroups.find((g) => g.id === task.assignee.id);
        if (!group) {
          alert('Group not found');
          return;
        }

        const groupClients = clients.filter((client) => group.clientIds.includes(client.id));
        if (groupClients.length === 0) {
          alert('No clients found in this group');
          return;
        }

        await Promise.all(
          groupClients.map((client) =>
            sendTaskEmail(
              assignmentId,
              client.email,
              client.name,
              taskTitle,
              TaskStatus.Pending,
              taskDescription,
              dueDate || undefined,
              professionalName,
            ),
          ),
        );

        alert(`Notification sent to ${groupClients.length} members of ${group.name}`);
      } else {
        const client = clients.find((entry) => entry.id === task.assignee.id);
        if (!client || !client.email) {
          alert('Client email not found');
          return;
        }

        await sendTaskEmail(
          assignmentId,
          client.email,
          client.name,
          taskTitle,
          TaskStatus.Pending,
          taskDescription,
          dueDate,
          professionalName,
        );

        alert(`Notification sent to ${client.name}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to send notification:', error);
      alert(`Failed to send notification: ${message}`);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to access tasks</h2>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        user={currentUser} 
        clients={clients}
        clientGroups={clientGroups}
        onDataChange={handleDataChange}
        onCreateTask={createTask}
        editingTask={editingTask}
        onUpdateTask={updateTask}
        onCancelEdit={() => setEditingTask(null)}
      />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-purple-900 mb-8">Follow-Up Tasks</h1>
          
          <TaskList
            tasks={tasks}
            clients={clients}
            clientGroups={clientGroups}
            onEditTask={setEditingTask}
            onDeleteTask={deleteTask}
            onNotifyClient={handleNotifyClient}
          />
        </div>
      </main>
    </div>
  );
};

export default TasksPage;
