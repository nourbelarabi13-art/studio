
'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ShieldAlert, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { submitReport } from '@/firebase/firestore/report-actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ReportModalProps {
  targetId: string;
  targetType: 'story' | 'comment' | 'chat';
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_TYPES = [
  'Inappropriate Content',
  'Spam',
  'Harassment / Bullying',
  'Copyright Violation',
  'Other'
] as const;

export function ReportModal({ targetId, targetType, isOpen, onClose }: ReportModalProps) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [reportType, setReportType] = useState<string>('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!user || !db || !reportType) return;
    
    setIsSubmitting(true);
    try {
      await submitReport(db, {
        reporterId: user.uid,
        targetId,
        targetType,
        type: reportType as any,
        details
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        setReportType('');
        setDetails('');
      }, 2500);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ritual Interrupted',
        description: 'The report could not be sent to the Guardians.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-[2.5rem] border-primary/10 bg-white/95 backdrop-blur-xl shadow-2xl p-8 overflow-hidden">
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner">
               <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="font-headline text-2xl font-bold text-foreground">Whisper Received</h3>
              <p className="text-muted-foreground italic text-sm">
                Report submitted. Thank you for keeping the sanctuary safe.
              </p>
            </div>
            <div className="w-24 h-px bg-primary/10" />
          </div>
        ) : (
          <>
            <DialogHeader className="space-y-4 text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive border border-destructive/20 shadow-inner">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <DialogTitle className="font-headline text-2xl font-bold">Summon Guardian</DialogTitle>
                <DialogDescription className="text-muted-foreground italic text-xs">
                  Alert the Archivists to a disturbance in the sanctuary peace.
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="py-6 space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Sparkles className="w-3 h-3" /> Disturbance Type
                </Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="rounded-2xl border-primary/10 h-12 bg-white/50 focus:bg-white transition-all">
                    <SelectValue placeholder="Select report type..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-2xl border-primary/10 shadow-xl">
                    {REPORT_TYPES.map(type => (
                      <SelectItem key={type} value={type} className="rounded-xl cursor-pointer">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Manifest Details (Optional)
                </Label>
                <Textarea 
                  placeholder="Tell the Guardians more about this disturbance..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="rounded-2xl border-primary/10 min-h-[120px] bg-white/50 focus:bg-white transition-all text-sm leading-relaxed"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-3 sm:gap-0 sm:flex-col pt-2">
              <Button 
                onClick={handleSubmit} 
                disabled={!reportType || isSubmitting}
                className="w-full h-14 rounded-full bg-destructive text-white hover:bg-destructive/90 shadow-xl shadow-destructive/20 font-bold transition-all"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldAlert className="w-4 h-4 mr-2" />}
                Submit Report
              </Button>
              <Button 
                variant="ghost" 
                onClick={onClose}
                className="w-full h-10 text-muted-foreground hover:text-foreground hover:bg-primary/5 rounded-full text-[10px] font-bold uppercase tracking-widest"
              >
                Cancel Ritual
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
