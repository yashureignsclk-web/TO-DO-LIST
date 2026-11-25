import React, { useMemo, useState } from 'react';
import { ASSETS } from '../data/initialData';
import { Priority, ProjectList, ScheduleBucket, Task } from '../types';
import { ImageWithFallback } from './ImageWithFallback';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  open,
  onClose,
  tasks,
  onToggleComplete,
}) => {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tasks.slice(0, 8);
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.tag.toLowerCase().includes(q) ||
        t.dueLabel.toLowerCase().includes(q)
    );
  }, [tasks, query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-on-surface/30 backdrop-blur-xs flex items-start justify-center pt-20 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[600px] bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center gap-2.5 p-3.5 border-b border-surface-container">
          <span className="material-symbols-outlined text-primary text-[22px]">
            search
          </span>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, tags (#Work), or dates..."
            className="w-full bg-transparent text-body-md text-on-surface placeholder:text-outline focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:bg-surface-container cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-1.5">
          {results.length === 0 ? (
            <p className="text-center text-body-sm text-on-surface-variant py-8">
              No tasks match "{query}"
            </p>
          ) : (
            results.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-surface-container-low transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => onToggleComplete(t.id)}
                    aria-label={`Toggle "${t.title}"`}
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 cursor-pointer ${
                      t.completed
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container-high text-transparent hover:text-primary'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  </button>
                  <div className="min-w-0">
                    <p
                      className={`text-body-md truncate ${
                        t.completed
                          ? 'line-through text-outline'
                          : 'text-on-surface font-medium'
                      }`}
                    >
                      {t.title}
                    </p>
                    <p className="text-label-sm text-on-surface-variant">
                      {t.dueLabel} · {t.tag} · {t.priority}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

interface InsightsModalProps {
  open: boolean;
  onClose: () => void;
  tasks: Task[];
}

export const InsightsModal: React.FC<InsightsModalProps> = ({
  open,
  onClose,
  tasks,
}) => {
  if (!open) return null;

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const workCount = tasks.filter((t) => t.tag.toLowerCase() === '#work').length;
  const personalCount = tasks.filter(
    (t) => t.tag.toLowerCase() === '#personal'
  ).length;

  return (
    <div
      className="fixed inset-0 z-50 bg-on-surface/30 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[520px] bg-surface-container-lowest rounded-2xl shadow-2xl p-5 space-y-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-label-sm uppercase tracking-wider text-primary">
              Calm Analytics
            </span>
            <h3 className="text-headline-md text-on-surface">Focus Insights</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close insights"
            className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:bg-surface-container cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 rounded-xl bg-surface-container-low">
            <span className="text-label-sm text-on-surface-variant">Completion</span>
            <p className="text-headline-lg-mobile font-bold text-primary mt-1 tabular-nums">
              {pct}%
            </p>
          </div>
          <div className="p-3 rounded-xl bg-surface-container-low">
            <span className="text-label-sm text-on-surface-variant">Done</span>
            <p className="text-headline-lg-mobile font-bold text-on-surface mt-1 tabular-nums">
              {completed}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-surface-container-low">
            <span className="text-label-sm text-on-surface-variant">Remaining</span>
            <p className="text-headline-lg-mobile font-bold text-tertiary mt-1 tabular-nums">
              {total - completed}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <span className="text-label-sm uppercase tracking-wider text-outline">
            Balance by Context
          </span>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-label-md mb-1">
                <span className="text-on-surface font-medium">#Work</span>
                <span className="text-on-surface-variant tabular-nums">
                  {workCount} tasks
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{
                    width: `${total ? Math.round((workCount / total) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-label-md mb-1">
                <span className="text-on-surface font-medium">#Personal</span>
                <span className="text-on-surface-variant tabular-nums">
                  {personalCount} tasks
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                <div
                  className="h-full bg-secondary rounded-full"
                  style={{
                    width: `${
                      total ? Math.round((personalCount / total) * 100) : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  onResetDemo: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  open,
  onClose,
  onResetDemo,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-on-surface/30 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] bg-surface-container-lowest rounded-2xl shadow-2xl p-5 space-y-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ImageWithFallback
              src={ASSETS.profileAvatar}
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-fixed"
              fallbackText="SF"
            />
            <div>
              <h3 className="text-headline-md text-on-surface">Elena Vance</h3>
              <p className="text-body-sm text-on-surface-variant">
                Serene Focus Workspace
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile"
            className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:bg-surface-container cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-container-low space-y-1">
          <span className="text-label-sm uppercase tracking-wider text-primary">
            Daily Intention
          </span>
          <p className="text-body-sm text-on-surface-variant">
            Keep active commitments mindful and unhurried. Changes save automatically
            to this browser.
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              onResetDemo();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-label-md transition-colors cursor-pointer"
          >
            Reset sample data
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-primary text-on-primary text-label-md hover:bg-primary-container transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

interface CollectionDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  tasks: Task[];
  project?: ProjectList;
  onToggleComplete: (taskId: string) => void;
  onAddTaskToProject?: (payload: {
    title: string;
    dueLabel: string;
    scheduleBucket: ScheduleBucket;
    priority: Priority;
    tag: string;
    projectId: string;
  }) => void;
}

export const CollectionDrawer: React.FC<CollectionDrawerProps> = ({
  open,
  onClose,
  title,
  subtitle,
  tasks,
  project,
  onToggleComplete,
  onAddTaskToProject,
}) => {
  const [newTitle, setNewTitle] = useState('');

  if (!open) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !project || !onAddTaskToProject) return;
    onAddTaskToProject({
      title: newTitle.trim(),
      dueLabel: 'Today',
      scheduleBucket: 'today',
      priority: 'Medium',
      tag: project.defaultTag,
      projectId: project.id,
    });
    setNewTitle('');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-on-surface/30 backdrop-blur-xs flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[580px] bg-surface-container-lowest rounded-2xl shadow-2xl p-5 space-y-4 max-h-[80vh] flex flex-col"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-headline-md text-on-surface">{title}</h3>
            <p className="text-body-sm text-on-surface-variant">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:bg-surface-container cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {project && onAddTaskToProject && (
          <form onSubmit={handleAdd} className="flex items-center gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder={`Add task to ${project.name}...`}
              className="flex-1 bg-surface-container-low rounded-xl px-3.5 py-2.5 text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-primary text-on-primary text-label-md hover:bg-primary-container cursor-pointer"
            >
              Add
            </button>
          </form>
        )}

        <div className="overflow-y-auto space-y-2 pr-1">
          {tasks.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant text-center py-6">
              No tasks in this view yet.
            </p>
          ) : (
            tasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-container-low/60"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => onToggleComplete(t.id)}
                    aria-label={`Toggle "${t.title}"`}
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 cursor-pointer ${
                      t.completed
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container-high text-transparent hover:text-primary'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  </button>
                  <div className="min-w-0">
                    <p
                      className={`text-body-md truncate ${
                        t.completed
                          ? 'line-through text-outline'
                          : 'text-on-surface font-medium'
                      }`}
                    >
                      {t.title}
                    </p>
                    <p className="text-label-sm text-on-surface-variant">
                      {t.dueLabel} · {t.tag}
                    </p>
                  </div>
                </div>
                <span className="text-label-sm text-outline shrink-0">
                  {t.priority}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
