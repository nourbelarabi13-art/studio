
import { 
  PenTool, 
  BookOpen, 
  Zap, 
  Heart, 
  Sparkles, 
  Award,
  LucideIcon 
} from "lucide-react";

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  threshold: number;
  metric: 'publishedCount' | 'totalViews' | 'totalLikes' | 'readingCount' | 'maxViews';
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first-fragment',
    name: 'First Fragment',
    description: 'Manifested your first story in the sanctuary.',
    icon: PenTool,
    threshold: 1,
    metric: 'publishedCount'
  },
  {
    id: 'active-scribe',
    name: 'Active Scribe',
    description: 'Published 5 chronicles to the Archive.',
    icon: Award,
    threshold: 5,
    metric: 'publishedCount'
  },
  {
    id: 'ethereal-echo',
    name: 'Ethereal Echo',
    description: 'A single fragment reached 1,000 views.',
    icon: Zap,
    threshold: 1000,
    metric: 'maxViews'
  },
  {
    id: 'beloved-voice',
    name: 'Beloved Voice',
    description: 'Gathered 500 sparks of appreciation (likes).',
    icon: Heart,
    threshold: 500,
    metric: 'totalLikes'
  },
  {
    id: 'pathfinder',
    name: 'Pathfinder',
    description: 'Explored and read 10 different chronicles.',
    icon: BookOpen,
    threshold: 10,
    metric: 'readingCount'
  },
  {
    id: 'rising-star',
    name: 'Rising Star',
    description: 'Reached 5,000 total views across your archive.',
    icon: Sparkles,
    threshold: 5000,
    metric: 'totalViews'
  }
];
