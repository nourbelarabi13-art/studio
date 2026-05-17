
'use client';

import { useState } from 'react';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/firestore/use-memo-firebase';
import { Comment, Novel, UserProfile } from '@/lib/types';
import { addComment, deleteComment } from '@/firebase/firestore/comment-actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Send, Trash2, Reply, Loader2, User, Flag, Sparkles } from 'lucide-react';
import { ReportModal } from '@/components/report-modal';

interface StoryCommentsProps {
  novel: Novel;
}

export function StoryComments({ novel }: StoryCommentsProps) {
  const { user } = useUser();
  const db = useFirestore();
  const [newComment, setNewComment] = useState("");
  const [guestName, setGuestName] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, "users", user.uid);
  }, [db, user]);
  const { data: profile } = useDoc<UserProfile>(profileRef);

  const commentsQuery = useMemoFirebase(() => {
    if (!db || !novel.id) return null;
    return query(
      collection(db, "novels", novel.id, "comments"),
      orderBy("createdAt", "desc")
    );
  }, [db, novel.id]);

  const { data: comments, loading } = useCollection<Comment>(commentsQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !newComment.trim()) return;
    
    const finalUserName = user ? (profile?.username || user.displayName || 'Dreamer') : (guestName.trim() || 'Anonymous Traveler');
    const finalUserId = user ? user.uid : 'guest';

    setIsSubmitting(true);
    addComment(db, novel.id, novel.title, novel.authorId, finalUserId, finalUserName, newComment);
    setNewComment("");
    setIsSubmitting(false);
  };

  const handleReply = (parentId: string) => {
    if (!db || !replyText.trim()) return;
    
    const finalUserName = user ? (profile?.username || user.displayName || 'Dreamer') : (guestName.trim() || 'Anonymous Traveler');
    const finalUserId = user ? user.uid : 'guest';

    addComment(db, novel.id, novel.title, novel.authorId, finalUserId, finalUserName, replyText, parentId);
    setReplyText("");
    setReplyTo(null);
  };

  const rootComments = comments?.filter(c => !c.parentId) || [];
  const replies = comments?.filter(c => !!c.parentId) || [];

  return (
    <section className="space-y-12">
      <div className="flex items-center gap-3 border-b border-primary/5 pb-6">
        <MessageSquare className="w-6 h-6 text-primary" />
        <h2 className="font-headline text-3xl font-bold">Chronicle Whispers</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white/40 p-6 sm:p-10 rounded-[2.5rem] border border-primary/10 shadow-xl backdrop-blur-sm">
        <div className="space-y-4">
          {!user && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-primary" /> Your Guest Persona
              </label>
              <Input 
                placeholder="How shall the Archive name you?"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="bg-white/80 border-primary/10 rounded-2xl h-12 focus:border-primary transition-all text-sm"
              />
            </div>
          )}
          
          <div className="flex gap-4 items-start">
             <Avatar className="w-12 h-12 border border-primary/10 shadow-inner">
               {user && profile?.avatar ? (
                 <AvatarImage src={profile.avatar} className="object-cover" />
               ) : (
                 <AvatarFallback className="bg-primary/5"><User className="w-5 h-5 text-primary/40" /></AvatarFallback>
               )}
             </Avatar>
             <Textarea 
               placeholder="Whisper your thoughts into the mists..."
               value={newComment}
               onChange={(e) => setNewComment(e.target.value)}
               className="bg-white/80 border-primary/10 rounded-[1.5rem] min-h-[120px] focus:border-primary transition-all shadow-inner p-4 text-base leading-relaxed"
               disabled={isSubmitting}
             />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button disabled={!newComment.trim() || isSubmitting} className="rounded-full bg-primary hover:bg-primary/90 gap-2 shadow-lg shadow-primary/20 h-14 px-10 font-headline text-lg group transition-transform active:scale-95">
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 transition-transform group-hover:translate-x-1" />}
            Manifest Whisper
          </Button>
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary opacity-40" /></div>
      ) : (
        <div className="space-y-12">
          {rootComments.length === 0 ? (
            <div className="text-center py-20 opacity-30 italic">
               <MessageSquare className="w-12 h-12 mx-auto mb-4" />
               <p>The mists are currently silent. Be the first to whisper.</p>
            </div>
          ) : (
            rootComments.map(comment => (
              <div key={comment.id} className="space-y-6 animate-fade-in">
                <div className="flex gap-4 items-start group">
                  <Avatar className="w-12 h-12 border border-primary/5 shadow-sm">
                    {comment.userAvatar ? (
                      <AvatarImage src={comment.userAvatar} className="object-cover" />
                    ) : (
                      <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">{comment.userName[0]}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sm text-foreground">{comment.userName}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono opacity-50">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {user && (
                           <button 
                             onClick={() => setReportingCommentId(comment.id!)}
                             className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1"
                             title="Report Whisper"
                           >
                             <Flag className="w-3.5 h-3.5" />
                           </button>
                        )}
                        {user?.uid === comment.userId && (
                          <button onClick={() => deleteComment(db!, novel.id, comment.id!)} className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm sm:text-base leading-relaxed text-muted-foreground italic">
                      "{comment.text}"
                    </p>
                    
                    <button 
                      onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id!)}
                      className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary hover:underline flex items-center gap-1.5 opacity-60 hover:opacity-100"
                    >
                      <Reply className="w-3 h-3" /> Reply to Echo
                    </button>

                    {replyTo === comment.id && (
                      <div className="pt-4 space-y-4 animate-fade-in">
                        {!user && (
                          <Input 
                            placeholder="Your Guest Name..."
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            className="bg-white/50 border-primary/5 rounded-xl h-10 text-xs"
                          />
                        )}
                        <Textarea 
                          placeholder="Type your reply..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="bg-white/50 border-primary/5 rounded-2xl min-h-[80px] text-sm italic"
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setReplyTo(null)} className="text-[10px] uppercase font-bold rounded-full">Cancel</Button>
                          <Button size="sm" onClick={() => handleReply(comment.id!)} className="bg-primary text-white rounded-full text-[10px] uppercase font-bold px-6">Send Reply</Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Replies */}
                <div className="ml-14 sm:ml-16 space-y-8 border-l-2 border-primary/5 pl-6 sm:pl-10">
                  {replies.filter(r => r.parentId === comment.id).map(reply => (
                    <div key={reply.id} className="flex gap-4 items-start group animate-fade-in">
                      <Avatar className="w-10 h-10 shadow-sm">
                         {reply.userAvatar ? (
                           <AvatarImage src={reply.userAvatar} className="object-cover" />
                         ) : (
                           <AvatarFallback className="bg-accent/5 text-accent text-[10px] font-bold">{reply.userName[0]}</AvatarFallback>
                         )}
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-foreground/80">{reply.userName}</span>
                          <div className="flex items-center gap-2">
                             {user && (
                                <button 
                                  onClick={() => setReportingCommentId(reply.id!)}
                                  className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                                  title="Report Reply"
                                >
                                  <Flag className="w-3 h-3" />
                                </button>
                             )}
                             {user?.uid === reply.userId && (
                               <button onClick={() => deleteComment(db!, novel.id, reply.id!)} className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                                 <Trash2 className="w-3 h-3" />
                               </button>
                             )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground italic leading-relaxed">
                          "{reply.text}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <ReportModal 
        targetId={reportingCommentId || ''} 
        targetType="comment" 
        isOpen={!!reportingCommentId} 
        onClose={() => setReportingCommentId(null)} 
      />
    </section>
  );
}
