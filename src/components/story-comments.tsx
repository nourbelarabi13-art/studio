
'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, query, orderBy, where, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/firestore/use-memo-firebase';
import { Comment, Novel, UserProfile } from '@/lib/types';
import { addComment, deleteComment } from '@/firebase/firestore/comment-actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Send, Trash2, Reply, Loader2, User, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { ReportModal } from '@/components/report-modal';

interface StoryCommentsProps {
  novel: Novel;
}

export function StoryComments({ novel }: StoryCommentsProps) {
  const { user } = useUser();
  const db = useFirestore();
  const [newComment, setNewComment] = useState("");
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
    if (!user || !db || !newComment.trim()) return;
    setIsSubmitting(true);
    addComment(db, novel.id, novel.title, novel.authorId, user.uid, profile?.username || user.displayName || 'Dreamer', newComment);
    setNewComment("");
    setIsSubmitting(false);
  };

  const handleReply = (parentId: string) => {
    if (!user || !db || !replyText.trim()) return;
    addComment(db, novel.id, novel.title, novel.authorId, user.uid, profile?.username || user.displayName || 'Dreamer', replyText, parentId);
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

      {user ? (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white/40 p-6 rounded-[2rem] border border-primary/5">
          <div className="flex gap-4 items-start">
             <Avatar className="w-10 h-10 border border-primary/10">
               {profile?.avatar ? <AvatarImage src={profile.avatar} className="object-cover" /> : <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>}
             </Avatar>
             <Textarea 
               placeholder="Whisper your thoughts into the mists..."
               value={newComment}
               onChange={(e) => setNewComment(e.target.value)}
               className="bg-white border-primary/10 rounded-2xl min-h-[100px] focus:border-primary transition-all"
               disabled={isSubmitting}
             />
          </div>
          <div className="flex justify-end">
            <Button disabled={!newComment.trim() || isSubmitting} className="rounded-full bg-primary gap-2 shadow-lg shadow-primary/10 h-12 px-8">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Manifest Whisper
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-center italic text-muted-foreground bg-primary/5 p-8 rounded-3xl">
          Identify yourself to join the discussion.
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-8">
          {rootComments.map(comment => (
            <div key={comment.id} className="space-y-4">
              <div className="flex gap-4 items-start group">
                <Avatar className="w-10 h-10 border border-primary/10">
                  {comment.userAvatar ? (
                    <AvatarImage src={comment.userAvatar} className="object-cover" />
                  ) : (
                    <AvatarFallback className="bg-primary/5 text-primary text-xs">{comment.userName[0]}</AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm">{comment.userName}</span>
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
                  <p className="text-sm leading-relaxed text-muted-foreground">{comment.text}</p>
                  
                  {user && (
                    <button 
                      onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id!)}
                      className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline flex items-center gap-1.5"
                    >
                      <Reply className="w-3 h-3" /> Reply
                    </button>
                  )}

                  {replyTo === comment.id && (
                    <div className="pt-4 space-y-3">
                      <Textarea 
                        placeholder="Type your reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="bg-white/50 border-primary/5 rounded-xl min-h-[80px] text-sm"
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setReplyTo(null)} className="text-[10px] uppercase font-bold">Cancel</Button>
                        <Button size="sm" onClick={() => handleReply(comment.id!)} className="bg-primary text-white rounded-full text-[10px] uppercase font-bold">Reply</Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Replies */}
              <div className="ml-14 space-y-6 border-l border-primary/5 pl-6">
                {replies.filter(r => r.parentId === comment.id).map(reply => (
                  <div key={reply.id} className="flex gap-4 items-start group">
                    <Avatar className="w-8 h-8">
                       {reply.userAvatar ? (
                         <AvatarImage src={reply.userAvatar} className="object-cover" />
                       ) : (
                         <AvatarFallback className="bg-accent/10 text-accent text-[10px]">{reply.userName[0]}</AvatarFallback>
                       )}
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">{reply.userName}</span>
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
                      <p className="text-sm text-muted-foreground">{reply.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
