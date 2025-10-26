export enum TaskStatus {
  Assigned = 'Assigned',
  Done = 'Done',
  Pending = 'Pending',
  Missed = 'Missed',
  ReminderSent = 'Reminder Sent',
}

export interface Client {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface ClientGroup {
  id: string;
  name: string;
  clientIds: string[];
}

export interface Task {
  id: string;
  title: string;
  details: string; // Make sure this matches your database field
  dueDate: string; // Make sure this matches your database field
  status: TaskStatus;
  assignee: {
    id: string;
    type: 'client' | 'group';
  };
  createdAt: string;
}

// Add this new interface for the combined data structure
export interface TaskAssignment {
  id: string;
  status: string; // or TaskStatus if you prefer
  due_date: string | null;
  client: {
    id: string;
    name: string;
    avatar: string;
  };
  task: {
    id: string;
    title: string;
    description: string;
  };
}

// Supabase Database Types
export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          client_name: string;
          client_email: string;
          client_avatar: string | null;
          creator_user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          client_name: string;
          client_email: string;
          client_avatar?: string | null;
          creator_user_id: string;
        };
        Update: {
          client_name?: string;
          client_email?: string;
          client_avatar?: string | null;
        };
      };
      client_groups: {
        Row: {
          id: string;
          group_name: string;
          creator_user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          group_name: string;
          creator_user_id: string;
        };
        Update: {
          group_name?: string;
        };
      };
      group_members: {
        Row: {
          id: string;
          group_id: string;
          client_id: string;
          created_at: string;
        };
        Insert: {
          group_id: string;
          client_id: string;
        };
        Update: {
          group_id?: string;
          client_id?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          creator_user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          title: string;
          description?: string | null;
          creator_user_id: string;
        };
        Update: {
          title?: string;
          description?: string | null;
        };
      };
      client_tasks: {
        Row: {
          id: string;
          client_id: string;
          task_id: string;
          status: string;
          due_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          client_id: string;
          task_id: string;
          status?: string;
          due_date?: string | null;
        };
        Update: {
          status?: string;
          due_date?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
