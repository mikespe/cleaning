'use server'

import { Resend } from 'resend'
import { createServiceClient } from '@/lib/supabase/server'
import { leadFormSchema, type LeadFormSchema } from '@/lib/validations'
import type { ActionResponse } from '@/types'

const resend = new Resend(process.env.RESEND_API_KEY)
const DAVE_EMAIL = 'gardenstatecleaningdave@gmail.com'

/**
 * Submit a new lead from the landing page
 * - Validates input with Zod
 * - Stores in Supabase leads table
 * - Sends notification email to Dave
 */
export async function submitLead(formData: LeadFormSchema): Promise<ActionResponse<{ id: string }>> {
  try {
    // Validate the form data
    const validatedData = leadFormSchema.parse(formData)

    // Create Supabase service client (bypasses RLS for public form submissions)
    const supabase = await createServiceClient()

    // Insert lead into database
    const { data: lead, error: dbError } = await supabase
      .from('leads')
      .insert({
        project_name: validatedData.project_name,
        sq_footage: validatedData.sq_footage ?? null,
        phase: validatedData.phase,
        estimated_start_date: validatedData.estimated_start?.toISOString().split('T')[0] ?? null,
        gc_email: validatedData.gc_email,
        gc_name: validatedData.gc_name ?? null,
        gc_phone: validatedData.gc_phone ?? null,
        message: validatedData.message ?? null,
        source: 'website',
        status: 'new',
      })
      .select('id')
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return {
        success: false,
        error: 'Failed to save your request. Please try again.',
      }
    }

    // Send notification email to Dave
    const emailResult = await sendLeadNotification(validatedData)

    if (!emailResult.success) {
      console.error('Email error:', emailResult.error)
      // Don't fail the whole request if email fails - lead is saved
    }

    return {
      success: true,
      data: { id: lead?.id ?? '' },
    }
  } catch (error) {
    console.error('Submit lead error:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return {
        success: false,
        error: 'Please check your form inputs and try again.',
      }
    }

    return {
      success: false,
      error: 'Something went wrong. Please try again.',
    }
  }
}

/**
 * Send email notification to Dave about new lead
 */
async function sendLeadNotification(
  lead: LeadFormSchema
): Promise<{ success: boolean; error?: string }> {
  const phaseLabels: Record<string, string> = {
    rough: 'Rough Clean',
    final: 'Final Clean',
    punch: 'Punch List',
    turnover: 'Turnover',
  }

  const formatDate = (date: Date | null | undefined): string => {
    if (!date) return 'Not specified'
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  try {
    const { error } = await resend.emails.send({
      from: 'Garden State Cleaning <leads@gardenstatecleaning.com>',
      to: DAVE_EMAIL,
      subject: `🏗️ New Lead: ${lead.project_name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #334155;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                🏗️ New Lead Received
              </h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                ${lead.project_name}
              </p>
            </div>
            
            <!-- Content -->
            <div style="padding: 32px;">
              
              <!-- Contact Info -->
              <div style="background-color: #0f172a; border-radius: 8px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #ea580c;">
                <h2 style="margin: 0 0 16px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8;">
                  Contact Information
                </h2>
                <p style="margin: 0 0 8px 0; font-size: 16px;">
                  <strong style="color: #ea580c;">Email:</strong> 
                  <a href="mailto:${lead.gc_email}" style="color: #f8fafc; text-decoration: none;">${lead.gc_email}</a>
                </p>
                ${
                  lead.gc_name
                    ? `<p style="margin: 0 0 8px 0; font-size: 16px;"><strong style="color: #ea580c;">Name:</strong> ${lead.gc_name}</p>`
                    : ''
                }
                ${
                  lead.gc_phone
                    ? `<p style="margin: 0; font-size: 16px;"><strong style="color: #ea580c;">Phone:</strong> <a href="tel:${lead.gc_phone}" style="color: #f8fafc; text-decoration: none;">${lead.gc_phone}</a></p>`
                    : ''
                }
              </div>
              
              <!-- Project Details -->
              <div style="background-color: #0f172a; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <h2 style="margin: 0 0 16px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8;">
                  Project Details
                </h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #94a3b8; width: 40%;">Phase</td>
                    <td style="padding: 8px 0; color: #f8fafc; font-weight: 600;">
                      <span style="background-color: #ea580c; color: #ffffff; padding: 4px 12px; border-radius: 4px; font-size: 14px;">
                        ${phaseLabels[lead.phase] || lead.phase}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #94a3b8;">Square Footage</td>
                    <td style="padding: 8px 0; color: #f8fafc; font-weight: 600;">
                      ${lead.sq_footage ? lead.sq_footage.toLocaleString() + ' sq ft' : 'Not specified'}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #94a3b8;">Est. Start Date</td>
                    <td style="padding: 8px 0; color: #f8fafc; font-weight: 600;">
                      ${formatDate(lead.estimated_start)}
                    </td>
                  </tr>
                </table>
              </div>
              
              ${
                lead.message
                  ? `
              <!-- Message -->
              <div style="background-color: #0f172a; border-radius: 8px; padding: 20px;">
                <h2 style="margin: 0 0 16px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8;">
                  Message
                </h2>
                <p style="margin: 0; color: #f8fafc; line-height: 1.6; white-space: pre-wrap;">${lead.message}</p>
              </div>
              `
                  : ''
              }
              
            </div>
            
            <!-- Footer -->
            <div style="background-color: #0f172a; padding: 20px 32px; text-align: center; border-top: 1px solid #334155;">
              <p style="margin: 0; color: #64748b; font-size: 14px;">
                Reply directly to this email to contact the lead, or log in to your dashboard.
              </p>
            </div>
            
          </div>
        </body>
        </html>
      `,
      reply_to: lead.gc_email,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Resend error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    }
  }
}
