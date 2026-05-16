
'use client';

import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/firestore/use-memo-firebase';
import { Novel, EndingVote } from '@/lib/types';
import { castEndingVote } from '@/firebase/firestore/vote-actions';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Users, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface EndingPollProps {
  novel: Novel;
}

export function EndingPoll({ novel }: EndingPollProps) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isVotingIdx, setIsVotingIdx] = useState<number | null>(null);

  const votesQuery = useMemoFirebase(() => {
    if (!db || !novel.id) return null;
    return collection(db, "novels", novel.id, "votes");
  }, [db, novel.id]);

  const { data: votes } = useCollection<EndingVote>(votesQuery);

  const userVoteRef = useMemoFirebase(() => {
    if (!db || !novel.id || !user) return null;
    return doc(db, "novels", novel.id, "votes", user.uid);
  }, [db, novel.id, user]);
  
  const { data: userVote } = useDoc<EndingVote>(userVoteRef);

  if (!novel.poll || !novel.poll.active) return null;

  const totalVotes = votes?.length || 0;
  const voteCounts = novel.poll.options.map((_, idx) => 
    votes?.filter(v => v.choiceIndex === idx).length || 0
  );

  const handleVote = (idx: number) => {
    if (!user) {
      toast({ title: "Identify Yourself", description: "You must join the sanctuary to vote on the fate of this story.", variant: "destructive" });
      return;
    }
    if (!db) return;
    setIsVotingIdx(idx);
    castEndingVote(db, novel.id, user.uid, idx);
    // Note: castEndingVote is non-blocking, but we can clear the voting state
    // in the next frame to show instant feedback or trust Firestore's real-time update
    setTimeout(() => setIsVotingIdx(null), 100);
    toast({ title: "Fate Cast", description: "Your choice has been woven into the story's destiny." });
  };

  return (
    <div className="glass-morphism rounded-[3rem] p-10 border-primary/20 space-y-8 shadow-xl animate-fade-in relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
      
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/20">
          <Sparkles className="w-3 h-3" />
          Community Oracle
        </div>
        <h3 className="font-headline text-3xl font-bold">{novel.poll.question}</h3>
        <p className="text-muted-foreground italic text-sm">Help the scribe manifest the destiny of this chronicle.</p>
      </div>

      <div className="space-y-4">
        {novel.poll.options.map((option, idx) => {
          const percentage = totalVotes > 0 ? (voteCounts[idx] / totalVotes) * 100 : 0;
          const isSelected = userVote?.choiceIndex === idx;
          const isVotingThis = isVotingIdx === idx;

          return (
            <div key={idx} className="space-y-2">
              <button
                disabled={!!userVote || isVotingIdx !== null}
                onClick={() => handleVote(idx)}
                className={cn(
                  "w-full text-left p-5 rounded-2xl border transition-all flex items-center justify-between group/btn",
                  isSelected 
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                    : userVote 
                      ? "bg-primary/5 border-primary/5 opacity-60 cursor-default" 
                      : "bg-white border-primary/10 hover:border-primary/30 hover:bg-primary/5"
                )}
              >
                <div className="flex items-center gap-4">
                  {isVotingThis ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isSelected ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5 opacity-30" />
                  )}
                  <span className="font-bold text-sm">{option}</span>
                </div>
                {userVote && (
                  <span className="font-mono text-[10px] font-bold opacity-70">
                    {Math.round(percentage)}%
                  </span>
                )}
              </button>
              {userVote && (
                <div className="px-2">
                  <Progress value={percentage} className="h-1 bg-primary/5" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">
        <Users className="w-3 h-3" />
        {totalVotes} travelers have cast their fate
      </div>
    </div>
  );
}
