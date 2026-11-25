import React, { useMemo, useState } from 'react';
import { ASSETS } from '../data/initialData';
import { Task } from '../types';
import { ImageWithFallback } from './ImageWithFallback';

interface CompletedScreenProps {
  tasks: Task[];
  onRestoreTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onClearOlder: () => void;
  onShowToast: (msg: string) => void;
}

export const CompletedScreen: React.FC<CompletedScreenProps> = ({
  tasks,
  onRestoreTask,
  onDeleteTask,
  onClearOlder,
  onShowToast,
}) => {
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('week');
  const [catFilter, setCatFilter] = useState<'all' | 'work' | 'personal'>('all');
  const [celebrating, setCelebrating] = useState(false);

  const completedTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (!t.completed) return false;
      if (catFilter === 'work' && t.tag.toLowerCase() !== '#work') return false;
      if (catFilter === 'personal' && t.tag.toLowerCase() !== '#personal') return false;
      return true;
    });
  }, [tasks, catFilter]);

  const todayCompleted = completedTasks.filter(
    (t) => t.completedDayGroup !== 'Yesterday'
  );
  const yesterdayCompleted = completedTasks.filter(
    (t) => t.completedDayGroup === 'Yesterday'
  );

  const weeklyTotal = 12 + completedTasks.length;
  const monthlyTotal = 36 + completedTasks.length;

  const handleCelebrate = () => {
    setCelebrating(true);
    setTimeout(() => setCelebrating(false), 500);
    onShowToast('Great job staying intentional today!');
  };

  const handleExportCsv = () => {
    const headers = ['Title', 'Tag', 'Priority', 'Completed At', 'Group'];
    const rows = completedTasks.map((t) => [
      `"${t.title.replace(/"/g, '""')}"`,
      t.tag,
      t.priority,
      t.completedAt || 'Today',
      t.completedDayGroup || 'Today',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'serene-focus-completed.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast('Exported summary report to downloads');
  };

  const renderCompletedRow = (task: Task) => {
    const isWork = task.tag.toLowerCase() === '#work';
    return (
      <div
        key={task.id}
        className="group relative bg-surface-container-lowest hover:bg-surface-container-low/40 rounded-xl p-3 shadow-sm transition-all duration-200 flex items-center justify-between gap-2"
      >
        <div className="flex items-start gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => onRestoreTask(task.id)}
            title="Click to uncheck"
            aria-label={`Restore "${task.title}"`}
            className="mt-0.5 w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center flex-shrink-0 transition-transform active:scale-90 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px] font-bold">
              check
            </span>
          </button>

          <div className="flex flex-col min-w-0">
            <span className="text-body-md text-on-surface-variant line-through select-none truncate">
              {task.title}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1 text-label-sm text-on-surface-variant/80 tabular-nums">
                <span className="material-symbols-outlined text-[13px]">
                  schedule
                </span>{' '}
                {task.completedAt || 'Just now'}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-label-sm bg-surface-container-low ${
                  isWork ? 'text-primary' : 'text-tertiary'
                }`}
              >
                {task.tag}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            type="button"
            onClick={() => onRestoreTask(task.id)}
            aria-label="Restore task"
            title="Restore to active"
            className="w-8 h-8 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">undo</span>
          </button>
          <button
            type="button"
            onClick={() => onDeleteTask(task.id)}
            aria-label="Delete permanently"
            title="Delete permanently"
            className="w-8 h-8 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/30 flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full pb-8">
      {/* Celebratory Status Hero Card */}
      <section className="w-full bg-gradient-to-br from-primary-container via-primary to-primary text-on-primary rounded-xl p-4 shadow-sm relative overflow-hidden mb-4">
        <div className="absolute -right-6 -bottom-8 w-32 h-32 rounded-full bg-secondary-container/10 pointer-events-none blur-2xl" />
        <div className="flex items-center justify-between gap-2 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-on-primary/15 flex items-center justify-center flex-shrink-0 text-on-primary-container shadow-inner">
              <span className="material-symbols-outlined material-symbols-filled text-[28px]">
                task_alt
              </span>
            </div>
            <div>
              <span className="inline-flex items-center gap-1 text-on-primary-container text-label-sm uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed" />{' '}
                Momentum High
              </span>
              <h2 className="text-headline-lg-mobile font-semibold leading-tight text-on-primary">
                Well done!
              </h2>
              <p className="text-body-sm text-on-primary/80 mt-0.5">
                You've accomplished{' '}
                <span className="font-semibold text-on-primary tabular-nums">
                  {weeklyTotal} tasks
                </span>{' '}
                this week with calm precision.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCelebrate}
            aria-label="Celebrate progress"
            className={`w-10 h-10 rounded-full bg-on-primary/10 hover:bg-on-primary/20 active:scale-95 text-on-primary flex items-center justify-center transition-all flex-shrink-0 cursor-pointer ${
              celebrating ? 'rotate-12 scale-110 bg-on-primary/25' : ''
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              celebration
            </span>
          </button>
        </div>
      </section>

      {/* Velocity & Insights Row */}
      <section className="grid grid-cols-3 gap-2 mb-6">
        <div className="bg-surface-container-lowest rounded-xl p-2.5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-label-sm text-on-surface-variant">Completed</span>
            <span className="material-symbols-outlined text-[16px] text-primary">
              done_all
            </span>
          </div>
          <div className="mt-2">
            <div className="text-headline-lg-mobile font-bold text-on-surface tabular-nums">
              {monthlyTotal}
            </div>
            <p className="text-label-sm text-on-surface-variant truncate">
              This month
            </p>
          </div>
          <div className="w-full bg-surface-container h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: '78%' }} />
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-2.5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-label-sm text-on-surface-variant">On-Time</span>
            <span className="material-symbols-outlined text-[16px] text-tertiary">
              schedule
            </span>
          </div>
          <div className="mt-2">
            <div className="text-headline-lg-mobile font-bold text-on-surface tabular-nums">
              94%
            </div>
            <p className="text-label-sm text-secondary truncate">
              +4% vs last week
            </p>
          </div>
          <div className="w-full bg-surface-container h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-secondary h-full rounded-full" style={{ width: '94%' }} />
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-2.5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-label-sm text-on-surface-variant">Streak</span>
            <span className="material-symbols-outlined material-symbols-filled text-[16px] text-secondary">
              local_fire_department
            </span>
          </div>
          <div className="mt-2">
            <div className="text-headline-lg-mobile font-bold text-on-surface tabular-nums">
              5 Days
            </div>
            <p className="text-label-sm text-on-surface-variant truncate">
              Personal best: 14
            </p>
          </div>
          <svg className="w-full h-4 mt-1 text-primary" fill="none" viewBox="0 0 60 16">
            <path
              d="M2 14 L14 11 L26 13 L38 6 L50 7 L58 2"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
            <circle cx="58" cy="2" fill="currentColor" r="2" />
          </svg>
        </div>
      </section>

      {/* Filter & Segmentation Pills */}
      <section className="flex flex-col gap-1 mb-4">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                setPeriod('week');
                onShowToast('Viewing This Week');
              }}
              className={`px-3 py-1 rounded-full text-label-md transition-colors cursor-pointer whitespace-nowrap ${
                period === 'week'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              This Week
            </button>
            <button
              type="button"
              onClick={() => {
                setPeriod('month');
                onShowToast('Viewing This Month');
              }}
              className={`px-3 py-1 rounded-full text-label-md transition-colors cursor-pointer whitespace-nowrap ${
                period === 'month'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => {
                setPeriod('all');
                onShowToast('Viewing All Time');
              }}
              className={`px-3 py-1 rounded-full text-label-md transition-colors cursor-pointer whitespace-nowrap ${
                period === 'all'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              All Time
            </button>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0 pl-2">
            <button
              type="button"
              onClick={() => setCatFilter('all')}
              className={`px-2.5 py-1 rounded-full text-label-sm flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
                catFilter === 'all'
                  ? 'bg-surface-container-high text-on-surface font-semibold'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span>All Lists</span>
            </button>
            <button
              type="button"
              onClick={() => setCatFilter('work')}
              className={`px-2.5 py-1 rounded-full text-label-sm flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
                catFilter === 'work'
                  ? 'bg-primary/15 text-primary ring-1 ring-primary/30'
                  : 'bg-surface-container-low text-primary hover:bg-surface-container'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>#Work</span>
            </button>
            <button
              type="button"
              onClick={() => setCatFilter('personal')}
              className={`px-2.5 py-1 rounded-full text-label-sm flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
                catFilter === 'personal'
                  ? 'bg-tertiary/15 text-tertiary ring-1 ring-tertiary/30'
                  : 'bg-surface-container-low text-tertiary hover:bg-surface-container'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
              <span>#Personal</span>
            </button>
          </div>
        </div>
      </section>

      {/* Completed Tasks Stream */}
      <section className="flex flex-col gap-6">
        {todayCompleted.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-label-lg text-on-surface font-semibold">
                  Today
                </span>
                <span className="text-label-sm px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant tabular-nums">
                  {todayCompleted.length} completed
                </span>
              </div>
              <span className="text-label-sm text-on-surface-variant">Oct 24</span>
            </div>
            {todayCompleted.map(renderCompletedRow)}
          </div>
        )}

        {yesterdayCompleted.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-label-lg text-on-surface font-semibold">
                  Yesterday
                </span>
                <span className="text-label-sm px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant tabular-nums">
                  {yesterdayCompleted.length} completed
                </span>
              </div>
              <span className="text-label-sm text-on-surface-variant">Oct 23</span>
            </div>
            {yesterdayCompleted.map(renderCompletedRow)}
          </div>
        )}

        {completedTasks.length === 0 && (
          <div className="p-6 rounded-xl bg-surface-container-lowest text-center shadow-sm">
            <span className="material-symbols-outlined text-[28px] text-primary">
              spa
            </span>
            <p className="text-body-md font-medium text-on-surface mt-2">
              Archive is clean
            </p>
            <p className="text-body-sm text-on-surface-variant mt-0.5">
              Completed tasks will appear here as you move through your day.
            </p>
          </div>
        )}
      </section>

      {/* Mindful Reflection Card */}
      <section className="mt-6 w-full bg-surface-container-low rounded-xl p-4 shadow-sm flex items-center gap-4">
        <ImageWithFallback
          src={ASSETS.deskReflection}
          alt="A serene Scandinavian wooden desk with warm morning light, tea, and a houseplant"
          className="w-16 h-16 rounded-xl object-cover flex-shrink-0 shadow-sm"
          fallbackIcon="local_cafe"
        />
        <div className="flex flex-col min-w-0">
          <span className="text-label-sm uppercase tracking-wider text-primary">
            Mindful Reflection
          </span>
          <h3 className="text-label-lg font-semibold text-on-surface truncate">
            Clearing cognitive clutter
          </h3>
          <p className="text-body-sm text-on-surface-variant mt-0.5 line-clamp-2">
            Archiving finished tasks releases working memory, allowing you to reset
            for what truly matters next.
          </p>
        </div>
      </section>

      {/* Batch Actions Footer Tray */}
      <section className="mt-6 pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-on-surface-variant">
        <button
          type="button"
          onClick={onClearOlder}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-label-md flex items-center justify-center gap-2 transition-colors active:scale-[0.98] cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">auto_delete</span>
          <span>Clear older than 30 days</span>
        </button>

        <button
          type="button"
          onClick={handleExportCsv}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-label-md flex items-center justify-center gap-2 transition-colors active:scale-[0.98] cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">ios_share</span>
          <span>Export summary (CSV)</span>
        </button>
      </section>
    </div>
  );
};
