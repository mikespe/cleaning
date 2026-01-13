"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileUp, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitLead } from "@/actions/submit-lead";
import { type LeadFormData } from "@/lib/validations";

const quickBidSchema = z.object({
  project_name: z.string().min(2, "Project name required"),
  sq_footage: z
    .number()
    .min(100, "Min 100 sq ft")
    .optional()
    .nullable(),
  phase: z.enum(["rough", "final", "punch", "turnover"]),
  gc_email: z.string().email("Valid email required"),
});

type QuickBidData = z.infer<typeof quickBidSchema>;

interface BidModalProps {
  variant?: "default" | "outline";
}

export function BidModal({ variant = "default" }: BidModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<QuickBidData>({
    resolver: zodResolver(quickBidSchema),
    defaultValues: {
      project_name: "",
      sq_footage: null,
      phase: "rough",
      gc_email: "",
    },
  });

  const onSubmit = async (data: QuickBidData) => {
    setIsSubmitting(true);

    const leadData: LeadFormData = {
      project_name: data.project_name,
      sq_footage: data.sq_footage,
      phase: data.phase,
      gc_email: data.gc_email,
      estimated_start: undefined,
      gc_name: "",
      gc_phone: "",
      message: "Quick bid request from modal",
    };

    const result = await submitLead(leadData);

    setIsSubmitting(false);

    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setIsSuccess(false);
        reset();
      }, 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {variant === "outline" ? (
          <Button variant="outline" size="xl" className="group">
            <FileUp className="mr-2 h-5 w-5" />
            Get a Bid
          </Button>
        ) : (
          <Button variant="secondary" size="sm">
            Get a Bid
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-slate-100">
              Request Sent!
            </h3>
            <p className="text-slate-400">We'll get back to you within 24 hours.</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">
                Quick Bid Request
              </DialogTitle>
              <DialogDescription>
                Fill out the basics and we'll send you a preliminary quote.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="modal-project_name">Project Name</Label>
                <Input
                  id="modal-project_name"
                  placeholder="e.g., Newark Tower"
                  error={!!errors.project_name}
                  {...register("project_name")}
                />
                {errors.project_name && (
                  <p className="text-xs text-red-400">
                    {errors.project_name.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="modal-sq_footage">Sq. Footage</Label>
                  <Input
                    id="modal-sq_footage"
                    type="number"
                    placeholder="45000"
                    error={!!errors.sq_footage}
                    {...register("sq_footage", {
                      setValueAs: (v) => (v === "" ? null : parseInt(v, 10)),
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modal-phase">Phase</Label>
                  <Select
                    defaultValue="rough"
                    onValueChange={(value) =>
                      setValue("phase", value as QuickBidData["phase"])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rough">Rough</SelectItem>
                      <SelectItem value="final">Final</SelectItem>
                      <SelectItem value="punch">Punch</SelectItem>
                      <SelectItem value="turnover">Turnover</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="modal-gc_email">Your Email</Label>
                <Input
                  id="modal-gc_email"
                  type="email"
                  placeholder="gc@company.com"
                  error={!!errors.gc_email}
                  {...register("gc_email")}
                />
                {errors.gc_email && (
                  <p className="text-xs text-red-400">{errors.gc_email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Request Bid"
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
