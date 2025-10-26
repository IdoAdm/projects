import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TaskEmailRequest {
  taskId: string;
  clientEmail: string;
  clientName: string;
  taskTitle: string;
  taskDescription?: string;
  dueDate?: string;
  status: string;
  professionalName?: string; // ADD THIS NEW FIELD
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Function called with method:', req.method)
    
    // Parse request body
    const requestBody = await req.json()
    console.log('Request body:', requestBody)
    
    const { 
      taskId, 
      clientEmail, 
      clientName, 
      taskTitle, 
      taskDescription, 
      dueDate, 
      status,
      professionalName // ADD THIS
    }: TaskEmailRequest = requestBody

    // Validate required fields
    if (!taskId || !clientEmail || !clientName || !taskTitle) {
      console.error('Missing required fields:', { taskId, clientEmail, clientName, taskTitle })
      return new Response(
        JSON.stringify({ error: 'Missing required fields: taskId, clientEmail, clientName, taskTitle' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check for Resend API key first
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    console.log('Resend API key configured:', !!resendApiKey)
    
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY not configured in Supabase secrets' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Email configuration
    const emailFrom = Deno.env.get('SMTP_FROM_EMAIL') || 'onboarding@resend.dev'
    const emailSubject = `Follow-Up Task: ${taskTitle}`

    // Create email content with the new sentence
    let emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #8B5CF6;">Vena Task Management</h2>
        <p>Hi ${clientName},</p>
        <p>You got a Follow-Up Task from ${professionalName || 'your wellness professional'}:</p>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3 style="margin: 0 0 10px 0; color: #333;">${taskTitle}</h3>
    `

    if (taskDescription) {
      emailContent += `<p style="margin: 0 0 10px 0; color: #666;">${taskDescription}</p>`
    }

    if (dueDate) {
      emailContent += `<p style="margin: 0 0 10px 0; color: #666;"><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>`
    }

    // Add status-specific messaging (you can customize this based on your needs)
    switch (status.toLowerCase()) {
      case 'done':
      case 'completed':
        emailContent += `<p style="margin: 10px 0; color: #10B981;"><strong>Status:</strong> ✅ Completed</p>`
        emailContent += `<p>Great job! This task has been marked as completed.</p>`
        break
      case 'pending':
        emailContent += `<p style="margin: 10px 0; color: #F59E0B;"><strong>Status:</strong> ⏳ Pending</p>`
        emailContent += `<p>Please complete this task when you have a chance.</p>`
        break
      case 'missed':
        emailContent += `<p style="margin: 10px 0; color: #EF4444;"><strong>Status:</strong> ❌ Missed</p>`
        emailContent += `<p>This task deadline has passed. Please complete it as soon as possible.</p>`
        break
      case 'reminder sent':
        emailContent += `<p style="margin: 10px 0; color: #3B82F6;"><strong>Status:</strong> 📧 Reminder</p>`
        emailContent += `<p>This is a friendly reminder about your pending task.</p>`
        break
      default:
        emailContent += `<p style="margin: 10px 0; color: #6B7280;"><strong>Status:</strong> New Task</p>`
        emailContent += `<p>Please review this new task and complete it by the due date.</p>`
    }

    emailContent += `
        </div>
        <p>If you have any questions, please don't hesitate to reach out to ${professionalName || 'your wellness professional'}.</p>
        <p>Best regards,<br>Your Vena Team</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">
          This email was sent from Vena Task Management System
        </p>
      </div>
    `

    console.log('Attempting to send email via Resend...')
    console.log('Email details:', { from: emailFrom, to: clientEmail, subject: emailSubject })

    // Send email via Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailFrom,
        to: [clientEmail],
        subject: emailSubject,
        html: emailContent,
      }),
    })

    console.log('Resend API response status:', emailResponse.status)

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error('Resend API error:', errorText)

      return new Response(
        JSON.stringify({ 
          error: 'Failed to send email via Resend', 
          details: errorText,
          status: emailResponse.status 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const emailResult = await emailResponse.json()
    console.log('Email sent successfully:', emailResult)

    return new Response(
      JSON.stringify({
        message: 'Task email sent successfully',
        emailId: emailResult.id,
        taskId: taskId
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message,
        stack: error.stack 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
