
'use client';

import { 
  doc, 
  updateDoc, 
  arrayUnion, 
  Firestore, 
  getDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { ACHIEVEMENTS } from '@/lib/achievements';
import { UserProfile } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

/**
 * Checks and unlocks achievements for a user based on their current stats.
 */
export async function checkAchievements(db: Firestore, uid: string) {
  const profileRef = doc(db, 'users', uid);
  const profileSnap = await getDoc(profileRef);
  
  if (!profileSnap.exists()) return;
  const profile = profileSnap.data() as UserProfile;
  const existingAchievements = profile.achievements || [];

  // Get reading count
  const progressQuery = query(collection(db, 'users', uid, 'progress'));
  const progressSnap = await getDocs(progressQuery);
  const readingCount = progressSnap.size;

  // Get max views on a single story
  const novelsQuery = query(collection(db, 'novels'), where('authorId', '==', uid), where('isDraft', '==', false));
  const novelsSnap = await getDocs(novelsQuery);
  const maxViews = novelsSnap.docs.reduce((max, d) => Math.max(max, d.data().views || 0), 0);

  const stats = {
    publishedCount: profile.publishedCount || 0,
    totalViews: profile.totalViews || 0,
    totalLikes: profile.totalLikes || 0,
    readingCount,
    maxViews
  };

  const newUnlocks: string[] = [];

  for (const def of ACHIEVEMENTS) {
    if (existingAchievements.includes(def.id)) continue;

    if (stats[def.metric] >= def.threshold) {
      newUnlocks.push(def.id);
      toast({
        title: "Achievement Unlocked! 🏆",
        description: `You've earned: ${def.name}`,
      });
    }
  }

  if (newUnlocks.length > 0) {
    await updateDoc(profileRef, {
      achievements: arrayUnion(...newUnlocks)
    });
  }
}
