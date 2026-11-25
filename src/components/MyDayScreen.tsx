import React, { useMemo, useState } from 'react';
import { Priority, ScheduleBucket, Task } from '../types';

interface MyDayScreenProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onToggleStar: (taskId: string) => void;
  onAddTask: (payload: {
    title: string;
    dueLabel: string;
    scheduleBucket: ScheduleBucket;
    priority: Priority;
    tag: string;
  }) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, patch: Partial<Task>) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
}

const DUE_OPTIONS: Array<{ label: string; bucket: ScheduleBucket }> = [
  { label: 'Today', bucket: 'today' },
  { label: 'Tomorrow', bucket: 'tomorrow' },
  { label: 'This Friday', bucket: 'friday' },
];

const PRIORITY_OPTIONS: Priority[] = ['High', 'Medium', 'Low'];
const TAG_OPTIONS = ['#Work', '#Personal', '#Focus', '#Ideas'];

export const MyDayScreen: React.FC<MyDayScreenProps> = ({
  tasks,
  onToggleComplete,
  onToggleStar,
  onAddTask,
  onDeleteTask,
  onUpdateTask,
  onToggleSubtask,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'time' | 'title'>('priority');
  const [quickTitle, setQuickTitle] = useState('');
  const [dueIdx, setDueIdx] = useState(0);
  const [priorityIdx, setPriorityIdx] = useState(0);
  const [tagIdx, setTagIdx] = useState(0);
  const [completedExpanded, setCompletedExpanded] = useState(true);
  const [expandedSubtasksId, setExpandedSubtasksId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const myDayTasks = useMemo(
    () => tasks.filter((t) => t.scheduleBucket === 'today' && t.completedDayGroup !== 'Yesterday'),
    [tasks]
  );

  const activeTasks = useMemo(() => {
    const list = myDayTasks.filter((t) => !t.completed);
    const weight: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };
    return [...list].sort((a, b) => {
      if (sortBy === 'priority') {
        return weight[a.priority] - weight[b.priority];
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return (a.timeLabel || a.dueLabel).localeCompare(b.timeLabel || b.dueLabel);
    });
  }, [myDayTasks, sortBy]);

  const completedTasks = useMemo(
    () => myDayTasks.filter((t) => t.completed),
    [myDayTasks]
  );

  const totalCount = myDayTasks.length;
  const doneCount = completedTasks.length;
  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
  const maxDash = 113.1;
  const dashOffset = maxDash - (maxDash * pct) / 100;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = quickTitle.trim();
    if (!trimmed) return;
    const due = DUE_OPTIONS[dueIdx];
    onAddTask({
      title: trimmed,
      dueLabel: due.label,
      scheduleBucket: due.bucket,
      priority: PRIORITY_OPTIONS[priorityIdx],
      tag: TAG_OPTIONS[tagIdx],
    });
    setQuickTitle('');
  };

  const cycleSort = () => {
    setSortBy((prev) =>
      prev === 'priority' ? 'time' : prev === 'time' ? 'title' : 'priority'
    );
  };

  const sortLabel =
    sortBy === 'priority' ? 'Priority' : sortBy === 'time' ? 'Time' : 'Title';

  const currentPriority = PRIORITY_OPTIONS[priorityIdx];
  const priorityChipClass =
    currentPriority === 'High'
      ? 'bg-error-container/60 hover:bg-error-container text-on-error-container'
      : currentPriority === 'Medium'
      ? 'bg-surface-container-high hover:bg-surface-container-highest text-on-secondary-fixed-variant'
      : 'bg-secondary-fixed/40 hover:bg-secondary-fixed/70 text-on-secondary-fixed-variant';

  return (
    <div className="flex flex-col w-full pb-8 space-y-4">
      {/* Day Overview & Mindful Progress Card */}
      <section className="relative overflow-hidden rounded-xl bg-surface-container-low p-4 sm:p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-label-sm uppercase tracking-widest text-primary font-semibold">
              Wednesday, Oct 24
            </span>
            <h2 className="text-headline-lg-mobile text-on-surface font-bold mt-0.5">
              My Day
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 text-label-md text-primary font-medium bg-secondary-fixed/30 px-2.5 py-0.5 rounded-full">
                <span className="material-symbols-outlined text-[14px]">
                  local_fire_department
                </span>
                <span>4-day streak</span>
              </span>
              <span className="text-body-sm text-on-surface-variant tabular-nums">
                {doneCount} of {totalCount} completed
              </span>
            </div>
          </div>

          {/* Radial Progress Ring Visual */}
          <div className="relative flex items-center justify-center w-14 h-14 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
              <circle
                cx="22"
                cy="22"
                fill="none"
                r="18"
                stroke="#dce9ff"
                strokeWidth="4"
              />
              <circle
                className="transition-all duration-700 ease-out"
                cx="22"
                cy="22"
                fill="none"
                r="18"
                stroke="#005c55"
                strokeDasharray={maxDash}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                strokeWidth="4"
              />
            </svg>
            <span className="absolute text-label-md font-semibold text-primary tabular-nums">
              {pct}%
            </span>
          </div>
        </div>

        {/* Micro-progress visual indicator bar */}
        <div className="w-full h-1.5 bg-surface-container-high rounded-full mt-4 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </section>

      {/* Filter & Sort Strip */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto py-1 no-scrollbar">
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-full text-label-md transition-colors cursor-pointer whitespace-nowrap ${
              filter === 'all'
                ? 'bg-primary text-on-primary font-semibold shadow-xs'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high font-medium'
            }`}
          >
            All <span className="opacity-80 text-label-sm">({totalCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-full text-label-md transition-colors cursor-pointer whitespace-nowrap ${
              filter === 'active'
                ? 'bg-primary text-on-primary font-semibold shadow-xs'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high font-medium'
            }`}
          >
            Active <span className="opacity-70 text-label-sm">({activeTasks.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-full text-label-md transition-colors cursor-pointer whitespace-nowrap ${
              filter === 'completed'
                ? 'bg-primary text-on-primary font-semibold shadow-xs'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high font-medium'
            }`}
          >
            Done <span className="opacity-70 text-label-sm">({doneCount})</span>
          </button>
        </div>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={cycleSort}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-label-md transition-colors cursor-pointer whitespace-nowrap"
            title="Cycle sort order"
          >
            <span className="material-symbols-outlined text-[16px]">swap_vert</span>
            <span>{sortLabel}</span>
          </button>
        </div>
      </div>

      {/* Quick-Add Task Box */}
      <form
        onSubmit={handleSubmit}
        className="bg-surface-container-lowest rounded-xl p-3.5 shadow-sm space-y-3 focus-within:ring-1 focus-within:ring-primary/40 transition-shadow"
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px] shrink-0">
            radio_button_unchecked
          </span>
          <input
            type="text"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            placeholder="Add a task to My Day... press Enter"
            className="w-full bg-transparent text-body-md text-on-surface placeholder:text-outline focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Add Task"
            className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center shrink-0 hover:bg-primary-container active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
          </button>
        </div>

        {/* Quick Attributes Chips */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setDueIdx((i) => (i + 1) % DUE_OPTIONS.length)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface text-label-sm transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px] text-primary">
                calendar_today
              </span>
              <span>{DUE_OPTIONS[dueIdx].label}</span>
            </button>

            <button
              type="button"
              onClick={() => setPriorityIdx((i) => (i + 1) % PRIORITY_OPTIONS.length)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-label-sm transition-colors cursor-pointer ${priorityChipClass}`}
            >
              <span className="material-symbols-outlined text-[14px]">flag</span>
              <span>{currentPriority}</span>
            </button>

            <button
              type="button"
              onClick={() => setTagIdx((i) => (i + 1) % TAG_OPTIONS.length)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-label-sm transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">sell</span>
              <span>{TAG_OPTIONS[tagIdx]}</span>
            </button>
          </div>
          <span className="text-label-sm text-outline hidden sm:inline">
            Tip: press Enter to add
          </span>
        </div>
      </form>

      {/* Active Tasks Section */}
      {filter !== 'completed' && (
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-label-md uppercase tracking-wider text-outline font-semibold">
              Focus Priorities
            </h3>
            <span className="text-label-sm text-outline tabular-nums">
              {activeTasks.length} {activeTasks.length === 1 ? 'task' : 'tasks'} remaining
            </span>
          </div>

          {activeTasks.length === 0 ? (
            <div className="p-6 rounded-xl bg-surface-container-lowest text-center shadow-xs">
              <span className="material-symbols-outlined text-[28px] text-primary">
                task_alt
              </span>
              <p className="text-body-md font-medium text-on-surface mt-2">
                All priorities for today are clear
              </p>
              <p className="text-body-sm text-on-surface-variant mt-0.5">
                Add a new focus item above or enjoy a quiet pause.
              </p>
            </div>
          ) : (
            activeTasks.map((task) => {
              const subtasksDone = task.subtasks?.filter((s) => s.done).length ?? 0;
              const subtasksTotal = task.subtasks?.length ?? 0;
              const isSubtasksOpen = expandedSubtasksId === task.id;
              const isMenuOpen = openMenuId === task.id;
              const isEditing = editingTaskId === task.id;

              const priorityBadgeStyle =
                task.priority === 'High'
                  ? 'bg-error-container text-on-error-container font-semibold'
                  : task.priority === 'Medium'
                  ? 'bg-surface-container-high text-on-secondary-fixed-variant font-medium'
                  : 'bg-secondary-fixed/40 text-on-secondary-fixed-variant font-medium';

              return (
                <div
                  key={task.id}
                  className="task-card group relative flex flex-col p-3.5 bg-surface-container-lowest rounded-xl shadow-xs transition-all hover:bg-surface-bright"
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => onToggleComplete(task.id)}
                      aria-label={`Mark "${task.title}" done`}
                      className="mt-0.5 w-5 h-5 rounded-full bg-surface-container-high flex items-center justify-center text-transparent hover:text-primary hover:bg-primary-fixed transition-colors shrink-0 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px] leading-none">
                        check
                      </span>
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        {isEditing ? (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (editingText.trim()) {
                                onUpdateTask(task.id, { title: editingText.trim() });
                              }
                              setEditingTaskId(null);
                            }}
                            className="flex-1 flex items-center gap-2"
                          >
                            <input
                              autoFocus
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              onBlur={() => {
                                if (editingText.trim()) {
                                  onUpdateTask(task.id, { title: editingText.trim() });
                                }
                                setEditingTaskId(null);
                              }}
                              className="w-full bg-surface-container-low rounded-lg px-2.5 py-1 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                          </form>
                        ) : (
                          <p className="text-body-md text-on-surface font-medium truncate">
                            {task.title}
                          </p>
                        )}

                        <button
                          type="button"
                          onClick={() => onToggleStar(task.id)}
                          aria-label={task.starred ? 'Unstar task' : 'Favorite task'}
                          className={`transition-opacity shrink-0 cursor-pointer ${
                            task.starred
                              ? 'opacity-100 text-primary'
                              : 'opacity-40 sm:opacity-0 group-hover:opacity-100 text-outline hover:text-on-surface'
                          }`}
                        >
                          <span
                            className={`material-symbols-outlined text-[18px] ${
                              task.starred ? 'material-symbols-filled' : ''
                            }`}
                          >
                            star
                          </span>
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span
                          className={`inline-flex items-center gap-1 text-label-sm font-medium ${
                            (task.timeLabel || task.dueLabel) === 'Today'
                              ? 'text-primary'
                              : 'text-on-surface-variant'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[13px]">
                            {(task.timeLabel || task.dueLabel) === 'Today'
                              ? 'schedule'
                              : 'alarm'}
                          </span>
                          {task.timeLabel || task.dueLabel}
                        </span>

                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-label-sm ${priorityBadgeStyle}`}
                        >
                          {task.priority} Priority
                        </span>

                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-label-sm bg-surface-container text-on-surface-variant font-medium">
                          {task.tag}
                        </span>

                        {subtasksTotal > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedSubtasksId(isSubtasksOpen ? null : task.id)
                            }
                            className="inline-flex items-center gap-1 text-label-sm text-primary font-medium bg-primary-fixed/30 hover:bg-primary-fixed/50 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[13px]">
                              checklist
                            </span>
                            {subtasksDone}/{subtasksTotal} subtasks
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() => setOpenMenuId(isMenuOpen ? null : task.id)}
                        aria-label="Task options"
                        className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          more_vert
                        </span>
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-0 top-9 z-30 w-44 rounded-xl bg-surface-container-lowest shadow-lg border border-outline-variant/20 py-1.5 text-body-sm">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingTaskId(task.id);
                              setEditingText(task.title);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-3 py-2 text-left text-on-surface hover:bg-surface-container-low flex items-center gap-2 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              edit
                            </span>
                            Rename task
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const nextP: Priority =
                                task.priority === 'High'
                                  ? 'Medium'
                                  : task.priority === 'Medium'
                                  ? 'Low'
                                  : 'High';
                              onUpdateTask(task.id, { priority: nextP });
                              setOpenMenuId(null);
                            }}
                            className="w-full px-3 py-2 text-left text-on-surface hover:bg-surface-container-low flex items-center gap-2 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              flag
                            </span>
                            Cycle priority
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateTask(task.id, {
                                scheduleBucket: 'tomorrow',
                                dueLabel: 'Thu, Oct 25',
                                dayNumber: 25,
                              });
                              setOpenMenuId(null);
                            }}
                            className="w-full px-3 py-2 text-left text-on-surface hover:bg-surface-container-low flex items-center gap-2 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              event
                            </span>
                            Move to Tomorrow
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteTask(task.id);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-3 py-2 text-left text-error hover:bg-error-container/30 flex items-center gap-2 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              delete
                            </span>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expandable Subtasks */}
                  {isSubtasksOpen && task.subtasks && (
                    <div className="mt-3 pl-8 pt-2.5 border-t border-surface-container space-y-1.5">
                      {task.subtasks.map((sub) => (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => onToggleSubtask(task.id, sub.id)}
                          className="w-full flex items-center gap-2.5 py-1 text-left group/sub cursor-pointer"
                        >
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                              sub.done
                                ? 'bg-primary text-on-primary'
                                : 'bg-surface-container-high text-transparent group-hover/sub:text-primary'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[12px]">
                              check
                            </span>
                          </span>
                          <span
                            className={`text-body-sm ${
                              sub.done
                                ? 'text-outline line-through'
                                : 'text-on-surface'
                            }`}
                          >
                            {sub.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </section>
      )}

      {/* Completed Tasks Accordion */}
      {filter !== 'active' && (
        <section className="space-y-2 pt-2">
          <button
            type="button"
            onClick={() => setCompletedExpanded((v) => !v)}
            className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-container-low transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span
                className="material-symbols-outlined text-[18px] text-outline transition-transform duration-200"
                style={{
                  transform: completedExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                }}
              >
                expand_more
              </span>
              <span className="text-label-md font-semibold text-on-surface-variant">
                Completed
              </span>
              <span className="text-label-sm px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant tabular-nums">
                {completedTasks.length}
              </span>
            </div>
            <span className="text-label-sm text-outline">Keep up the rhythm</span>
          </button>

          {completedExpanded && (
            <div className="space-y-2">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 bg-surface-container-low/70 rounded-xl transition-all"
                >
                  <button
                    type="button"
                    onClick={() => onToggleComplete(task.id)}
                    aria-label={`Restore "${task.title}"`}
                    className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-xs cursor-pointer active:scale-90 transition-transform"
                  >
                    <span className="material-symbols-outlined text-[14px]">done</span>
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-md text-outline line-through truncate">
                      {task.title}
                    </p>
                  </div>
                  <span className="text-label-sm text-outline shrink-0 tabular-nums">
                    {task.completedAt || 'Just now'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Mindful Moment / Daily Motivation Card */}
      <div className="rounded-xl p-4 bg-surface-container text-on-surface-variant flex items-center gap-3 shadow-xs">
        <div className="w-10 h-10 rounded-full bg-surface-container-lowest text-primary flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[20px]">spa</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-body-sm italic">
            "Focus on being productive instead of busy."
          </p>
          <span className="text-label-sm text-outline">
            Serene Focus Daily Affirmation
          </span>
        </div>
      </div>
    </div>
  );
};
