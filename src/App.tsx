import { useEffect, useMemo, useRef, useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { CompletedScreen } from './components/CompletedScreen';
import { Header } from './components/Header';
import { ListsScreen } from './components/ListsScreen';
import {
  CollectionDrawer,
  InsightsModal,
  ProfileModal,
  SearchModal,
} from './components/Modals';
import { MyDayScreen } from './components/MyDayScreen';
import { UpcomingScreen } from './components/UpcomingScreen';
import { INITIAL_PROJECTS, INITIAL_TAGS, INITIAL_TASKS } from './data/initialData';
import { ContextTag, Priority, ProjectList, ScheduleBucket, TabId, Task } from './types';

const STORAGE_KEY = 'serene-focus-workspace-v1';

interface StoredState {
  tasks: Task[];
  projects: ProjectList[];
  tags: ContextTag[];
}

function loadInitialState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredState;
      if (Array.isArray(parsed.tasks) && Array.isArray(parsed.projects)) {
        return {
          tasks: parsed.tasks,
          projects: parsed.projects,
          tags: Array.isArray(parsed.tags) ? parsed.tags : INITIAL_TAGS,
        };
      }
    }
  } catch {
    // Ignore storage read errors
  }
  return {
    tasks: INITIAL_TASKS,
    projects: INITIAL_PROJECTS,
    tags: INITIAL_TAGS,
  };
}

export default function App() {
  const initial = useMemo(() => loadInitialState(), []);
  const [activeTab, setActiveTab] = useState<TabId>('my-day');
  const [tasks, setTasks] = useState<Task[]>(initial.tasks);
  const [projects, setProjects] = useState<ProjectList[]>(initial.projects);
  const [tags, setTags] = useState<ContextTag[]>(initial.tags);

  const [searchOpen, setSearchOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [quickViewMode, setQuickViewMode] = useState<'all' | 'important' | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, projects, tags }));
    } catch {
      // Ignore storage write errors
    }
  }, [tasks, projects, tags]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2600);
  };

  const handleToggleComplete = (taskId: string) => {
    const nowTime = new Date().toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const nextCompleted = !t.completed;
        showToast(
          nextCompleted ? 'Task completed' : 'Task moved back to active list'
        );
        return {
          ...t,
          completed: nextCompleted,
          completedAt: nextCompleted ? nowTime : undefined,
          completedDayGroup: nextCompleted ? 'Today' : undefined,
        };
      })
    );
  };

  const handleToggleStar = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, starred: !t.starred } : t))
    );
  };

  const handleAddTask = (payload: {
    title: string;
    dueLabel: string;
    timeLabel?: string;
    scheduleBucket: ScheduleBucket;
    priority: Priority;
    tag: string;
    projectId?: string;
    dayNumber?: number;
  }) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: payload.title,
      completed: false,
      dueLabel: payload.dueLabel,
      timeLabel: payload.timeLabel || payload.dueLabel,
      priority: payload.priority,
      tag: payload.tag,
      projectId:
        payload.projectId ||
        (payload.tag.toLowerCase() === '#personal'
          ? 'personal-wellness'
          : 'work-strategy'),
      starred: false,
      scheduleBucket: payload.scheduleBucket,
      dayNumber: payload.dayNumber,
    };
    setTasks((prev) => [newTask, ...prev]);
    showToast(`Added "${payload.title}"`);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    showToast('Task removed');
  };

  const handleUpdateTask = (taskId: string, patch: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...patch } : t))
    );
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId || !t.subtasks) return t;
        return {
          ...t,
          subtasks: t.subtasks.map((s) =>
            s.id === subtaskId ? { ...s, done: !s.done } : s
          ),
        };
      })
    );
  };

  const handleCreateProject = (payload: {
    name: string;
    description: string;
    colorTheme: ProjectList['colorTheme'];
  }) => {
    const newProject: ProjectList = {
      id: `proj-${Date.now()}`,
      name: payload.name,
      badge: 'Custom',
      description: payload.description,
      icon: 'folder_special',
      colorTheme: payload.colorTheme,
      baseOpenCount: 0,
      baseProgressPct: 0,
      defaultTag: '#Work',
    };
    setProjects((prev) => [newProject, ...prev]);
    showToast(`Created "${payload.name}"`);
  };

  const handleAddTag = (label: string) => {
    if (tags.some((t) => t.label.toLowerCase() === label.toLowerCase())) {
      showToast(`${label} already exists`);
      return;
    }
    setTags((prev) => [
      ...prev,
      { id: `tag-${Date.now()}`, label, count: 1, tone: 'neutral' },
    ]);
    showToast(`Added tag ${label}`);
  };

  const handleClearOlder = () => {
    setTasks((prev) =>
      prev.filter((t) => !(t.completed && t.completedDayGroup === 'Yesterday'))
    );
    showToast('Cleaned archived tasks');
  };

  const handleResetDemo = () => {
    setTasks(INITIAL_TASKS);
    setProjects(INITIAL_PROJECTS);
    setTags(INITIAL_TAGS);
    localStorage.removeItem(STORAGE_KEY);
    showToast('Workspace reset to default');
  };

  const activeProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId),
    [projects, selectedProjectId]
  );

  const drawerTasks = useMemo(() => {
    if (activeProject) {
      return tasks.filter((t) => t.projectId === activeProject.id);
    }
    if (quickViewMode === 'all') return tasks;
    if (quickViewMode === 'important') {
      return tasks.filter((t) => t.starred && !t.completed);
    }
    return [];
  }, [activeProject, quickViewMode, tasks]);

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <Header
        activeTab={activeTab}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenInsights={() => setInsightsOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
      />

      <main className="flex flex-col relative w-full pt-18 pb-24 bg-surface max-w-[680px] mx-auto min-h-screen px-4">
        {activeTab === 'my-day' && (
          <MyDayScreen
            tasks={tasks}
            onToggleComplete={handleToggleComplete}
            onToggleStar={handleToggleStar}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            onUpdateTask={handleUpdateTask}
            onToggleSubtask={handleToggleSubtask}
          />
        )}

        {activeTab === 'upcoming' && (
          <UpcomingScreen
            tasks={tasks}
            onToggleComplete={handleToggleComplete}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            onUpdateTask={handleUpdateTask}
          />
        )}

        {activeTab === 'lists-and-projects' && (
          <ListsScreen
            tasks={tasks}
            projects={projects}
            tags={tags}
            onCreateProject={handleCreateProject}
            onAddTag={handleAddTag}
            onSelectTab={setActiveTab}
            onOpenProjectDetail={(id) => setSelectedProjectId(id)}
            onOpenQuickView={(mode) => setQuickViewMode(mode)}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'completed' && (
          <CompletedScreen
            tasks={tasks}
            onRestoreTask={handleToggleComplete}
            onDeleteTask={handleDeleteTask}
            onClearOlder={handleClearOlder}
            onShowToast={showToast}
          />
        )}
      </main>

      <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Global Toast Notification */}
      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-on-surface text-inverse-on-surface text-label-md shadow-xl transition-all duration-300 z-50 flex items-center gap-2 pointer-events-none ${
          toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        <span className="material-symbols-outlined text-[18px] text-primary-fixed">
          info
        </span>
        <span className="whitespace-nowrap">{toastMessage}</span>
      </div>

      {/* Interactive Modals */}
      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        tasks={tasks}
        onToggleComplete={handleToggleComplete}
      />

      <InsightsModal
        open={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        tasks={tasks}
      />

      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        onResetDemo={handleResetDemo}
      />

      <CollectionDrawer
        open={Boolean(activeProject || quickViewMode)}
        onClose={() => {
          setSelectedProjectId(null);
          setQuickViewMode(null);
        }}
        title={
          activeProject
            ? activeProject.name
            : quickViewMode === 'important'
            ? 'Important & Starred'
            : 'All Tasks'
        }
        subtitle={
          activeProject
            ? activeProject.description
            : quickViewMode === 'important'
            ? 'Starred high-focus commitments'
            : 'Complete task horizon across your workspace'
        }
        tasks={drawerTasks}
        project={activeProject}
        onToggleComplete={handleToggleComplete}
        onAddTaskToProject={handleAddTask}
      />
    </div>
  );
}
