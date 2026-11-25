export type TabId = 'my-day' | 'upcoming' | 'lists-and-projects' | 'completed';

export type Priority = 'High' | 'Medium' | 'Low';

export type ScheduleBucket = 'today' | 'tomorrow' | 'friday' | 'next-week';

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string; // e.g., "8:15 AM"
  completedDayGroup?: 'Today' | 'Yesterday' | 'Earlier';
  dueLabel: string; // e.g., "Today", "10:00 AM", "Mon, Oct 29"
  timeLabel?: string; // e.g., "2:00 PM"
  priority: Priority;
  tag: string; // e.g., "#Work", "#Personal"
  projectId: string;
  starred?: boolean;
  scheduleBucket: ScheduleBucket;
  dayNumber?: number; // 22..28 for mini-calendar matching
  icon?: string; // optional Material symbol name like "restaurant"
  subtasks?: Subtask[];
}

export interface ProjectList {
  id: string;
  name: string;
  badge: string;
  description: string;
  icon: string;
  colorTheme: 'primary' | 'secondary' | 'tertiary' | 'primary-container';
  baseOpenCount: number;
  baseProgressPct: number;
  collaborators?: string[];
  extraCollaborators?: number;
  defaultTag: string;
}

export interface ContextTag {
  id: string;
  label: string;
  count: number;
  tone: 'error' | 'secondary' | 'neutral';
}

export interface CalendarDay {
  dayShort: string;
  dateNum: number;
  fullLabel: string;
  bucket?: ScheduleBucket;
  dots: Array<'primary' | 'muted'>;
}
