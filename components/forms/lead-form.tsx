'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Loader2, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { leadFormSchema, type LeadFormSchema } from '@/lib/validations'
import { submitLead } from '@/actions/submit-lead'
import { cn } from '@/lib/utils'

interface LeadFormProps {
  className?: string
  onSuccess?: () => void
}

export function LeadForm({ className, onSuccess }: LeadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<LeadFormSchema>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      project_name: '',
      sq_footage: null,
      phase: undefined,
      estimated_start: null,
      gc_email: '',
      gc_name: '',
      gc_phone: '',
      message: '',
    },
  })

  const selectedPhase = watch('phase')

  const onSubmit = async (data: LeadFormSchema) => {
    setIsSubmitting(true)

    try {
      const result = await submitLead(data)

      if (result.success) {
        setIsSuccess(true)
        toast({
          title: 'Request received!',
          description: "We'll be in touch within 24 hours.",
          variant: 'default',
        })
        reset()
        onSuccess?.()

        // Reset success state after animation
        setTimeout(() => setIsSuccess(false), 3000)
      } else {
        toast({
          title: 'Something went wrong',
          description: result.error || 'Please try again.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence mode="wait">
      {isSuccess ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={cn(
            'flex flex-col items-center justify-center py-12 text-center',
            className
          )}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
          </motion.div>
          <h3 className="text-xl font-heading font-semibold text-slate-100 mb-2">
            Request Received!
          </h3>
          <p className="text-slate-400">
            Dave will be in touch within 24 hours.
          </p>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onSubmit={handleSubmit(onSubmit)}
          className={cn('space-y-5', className)}
        >
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="project_name">Project Name *</Label>
            <Input
              id="project_name"
              placeholder="e.g., Parkside Towers Phase 2"
              {...register('project_name')}
              className={cn(errors.project_name && 'border-red-500')}
            />
            {errors.project_name && (
              <p className="text-xs text-red-400">{errors.project_name.message}</p>
            )}
          </div>

          {/* Two columns: Sq Footage & Phase */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sq_footage">Square Footage</Label>
              <Input
                id="sq_footage"
                type="number"
                placeholder="e.g., 50000"
                {...register('sq_footage', { valueAsNumber: true })}
                className={cn(errors.sq_footage && 'border-red-500')}
              />
              {errors.sq_footage && (
                <p className="text-xs text-red-400">{errors.sq_footage.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Cleaning Phase *</Label>
              <Select
                value={selectedPhase}
                onValueChange={(value) =>
                  setValue('phase', value as LeadFormSchema['phase'], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger
                  className={cn(errors.phase && 'border-red-500')}
                >
                  <SelectValue placeholder="Select phase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rough">Rough Clean</SelectItem>
                  <SelectItem value="final">Final Clean</SelectItem>
                  <SelectItem value="punch">Punch List</SelectItem>
                  <SelectItem value="turnover">Turnover</SelectItem>
                </SelectContent>
              </Select>
              {errors.phase && (
                <p className="text-xs text-red-400">{errors.phase.message}</p>
              )}
            </div>
          </div>

          {/* Est Start Date */}
          <div className="space-y-2">
            <Label htmlFor="estimated_start">Estimated Start Date</Label>
            <Input
              id="estimated_start"
              type="date"
              {...register('estimated_start', {
                setValueAs: (v) => (v ? new Date(v) : null),
              })}
              className="block w-full"
            />
          </div>

          {/* GC Email */}
          <div className="space-y-2">
            <Label htmlFor="gc_email">Your Email *</Label>
            <Input
              id="gc_email"
              type="email"
              placeholder="you@company.com"
              {...register('gc_email')}
              className={cn(errors.gc_email && 'border-red-500')}
            />
            {errors.gc_email && (
              <p className="text-xs text-red-400">{errors.gc_email.message}</p>
            )}
          </div>

          {/* Two columns: Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gc_name">Your Name</Label>
              <Input
                id="gc_name"
                placeholder="John Smith"
                {...register('gc_name')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gc_phone">Phone</Label>
              <Input
                id="gc_phone"
                type="tel"
                placeholder="(555) 123-4567"
                {...register('gc_phone')}
              />
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Additional Notes</Label>
            <textarea
              id="message"
              placeholder="Any specific requirements or questions..."
              {...register('message')}
              rows={3}
              className="flex w-full rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:border-safety focus-visible:ring-2 focus-visible:ring-safety/20 transition-all duration-200 resize-none"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="industrial"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Request a Site Walk'
            )}
          </Button>

          <p className="text-xs text-slate-500 text-center">
            We'll respond within 24 hours. No spam, ever.
          </p>
        </motion.form>
      )}
    </AnimatePresence>
  )
}
