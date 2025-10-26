import { supabase } from './supabaseClient';

export async function sendTaskEmail(
  taskId: string,
  clientEmail: string,
  clientName: string,
  taskTitle: string,
  status: string,
  taskDescription?: string,
  dueDate?: string,
  professionalName?: string
) {
  try {
    console.log('Sending email with data:', {
      taskId,
      clientEmail,
      clientName,
      taskTitle,
      status,
      taskDescription,
      dueDate,
      professionalName
    });

    const { data, error } = await supabase.functions.invoke('send-task-email', {
      body: {
        taskId,
        clientEmail,
        clientName,
        taskTitle,
        taskDescription,
        dueDate,
        status,
        professionalName
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      return null;
    }

    console.log('Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error sending task email:', error);
    return null;
  }
}

export async function scheduleTaskEmail(
  taskId: string,
  clientEmail: string,
  clientName: string,
  taskTitle: string,
  status: string,
  scheduledFor: Date,
  taskDescription?: string,
  dueDate?: string,
  professionalName?: string
) {
  try {
    console.log('Scheduling email for:', scheduledFor);

    // Prepare the data object
    const emailData: any = {
      task_id: taskId,
      client_email: clientEmail,
      client_name: clientName,
      task_title: taskTitle,
      task_description: taskDescription,
      due_date: dueDate,
      status: status,
      scheduled_for: scheduledFor.toISOString(),
      sent: false
    };

    // Only add professional_name if it's provided
    if (professionalName) {
      emailData.professional_name = professionalName;
    }

    const { data, error } = await supabase
      .from('scheduled_emails')
      .insert(emailData);

    if (error) {
      console.error('Error scheduling email:', error);
      throw error;
    }

    console.log('Email scheduled successfully:', data);
    return data;
  } catch (error) {
    console.error('Error scheduling email:', error);
    throw error;
  }
}

export async function scheduleReminderEmail(
  taskId: string,
  clientEmail: string,
  clientName: string,
  taskTitle: string,
  dueDate: string,
  reminderDaysBefore: number = 1,
  professionalName?: string
) {
  const dueDateTime = new Date(dueDate);
  const reminderDate = new Date(dueDateTime.getTime() - (reminderDaysBefore * 24 * 60 * 60 * 1000));
  
  return scheduleTaskEmail(
    taskId,
    clientEmail,
    clientName,
    taskTitle,
    'Reminder Sent',
    reminderDate,
    `Reminder: This task is due on ${dueDateTime.toLocaleDateString()}`,
    dueDate,
    professionalName
  );
}