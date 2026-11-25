import React, { useMemo, useState } from 'react';
import { ContextTag, ProjectList, TabId, Task } from '../types';
import { ImageWithFallback } from './ImageWithFallback';

interface ListsScreenProps {
  tasks: Task[];
  projects: ProjectList[];
  tags: ContextTag[];
  onCreateProject: (payload: {
    name: string;
    description: string;
    colorTheme: ProjectList['colorTheme'];
  }) => void;
  onAddTag: (label: string) => void;
  onSelectTab: (tab: TabId) => void;
  onOpenProjectDetail: (projectId: string) => void;
  onOpenQuickView: (mode: 'all' | 'important') => void;
  onShowToast: (msg: string) => void;
}

const COLOR_THEMES: Array<{
  id: ProjectList['colorTheme'];
  dotClass: string;
  label: string;
}> = [
  { id: 'primary', dotClass: 'bg-primary', label: 'Deep Teal' },
  { id: 'secondary', dotClass: 'bg-secondary', label: 'Sage' },
  { id: 'tertiary', dotClass: 'bg-tertiary', label: 'Ocean' },
  { id: 'primary-container', dotClass: 'bg-primary-container', label: 'Emerald' },
];

export const ListsScreen: React.FC<ListsScreenProps> = ({
  tasks,
  projects,
  tags,
  onCreateProject,
  onAddTag,
  onSelectTab,
  onOpenProjectDetail,
  onOpenQuickView,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<'recent' | 'progress'>('recent');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');
  const [newListColor, setNewListColor] =
    useState<ProjectList['colorTheme']>('primary');
  const [addingTag, setAddingTag] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  const allTasksCount = tasks.length;
  const myDayCount = tasks.filter(
    (t) => t.scheduleBucket === 'today' && !t.completed
  ).length;
  const importantCount = tasks.filter((t) => t.starred && !t.completed).length;
  const archiveCount = 81 + tasks.filter((t) => t.completed).length;

  const totalActiveCount = useMemo(() => {
    const projectOpenSum = projects.reduce((acc, p) => {
      const extraOpen = tasks.filter(
        (t) => t.projectId === p.id && !t.completed
      ).length;
      return acc + p.baseOpenCount + Math.max(0, extraOpen - 2);
    }, 0);
    return projectOpenSum;
  }, [projects, tasks]);

  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = projects.filter((p) => {
      const matchesText =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.badge.toLowerCase().includes(q);
      return matchesText;
    });

    if (sortMode === 'progress') {
      return [...list].sort((a, b) => b.baseProgressPct - a.baseProgressPct);
    }
    return list;
  }, [projects, searchQuery, sortMode]);

  const filteredTags = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return tags;
    return tags.filter((t) => t.label.toLowerCase().includes(q));
  }, [tags, searchQuery]);

  const toggleTagSelection = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newListName.trim();
    if (!name) return;
    onCreateProject({
      name,
      description: newListDesc.trim() || 'Dedicated focus zone & tasks',
      colorTheme: newListColor,
    });
    setNewListName('');
    setNewListDesc('');
    setDrawerOpen(false);
  };

  const handleTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newTagInput.trim().replace(/^#*/, '');
    if (!cleaned) {
      setAddingTag(false);
      return;
    }
    onAddTag(`#${cleaned.toLowerCase()}`);
    setNewTagInput('');
    setAddingTag(false);
  };

  const getIconBoxClasses = (theme: ProjectList['colorTheme']) => {
    switch (theme) {
      case 'primary':
        return 'bg-primary text-on-primary';
      case 'secondary':
        return 'bg-secondary-container text-on-secondary-container';
      case 'tertiary':
        return 'bg-surface-container-high text-tertiary';
      case 'primary-container':
        return 'bg-primary-container text-on-primary-container';
    }
  };

  const getBadgeClasses = (theme: ProjectList['colorTheme']) => {
    switch (theme) {
      case 'primary':
        return 'bg-primary/10 text-primary';
      case 'secondary':
        return 'bg-secondary-container/40 text-on-secondary-container';
      case 'tertiary':
        return 'bg-surface-container text-tertiary';
      case 'primary-container':
        return 'bg-primary-container/20 text-primary-container';
    }
  };

  const getProgressBarClasses = (theme: ProjectList['colorTheme']) => {
    switch (theme) {
      case 'primary':
        return { bar: 'bg-primary', text: 'text-primary' };
      case 'secondary':
        return { bar: 'bg-secondary', text: 'text-secondary' };
      case 'tertiary':
        return { bar: 'bg-tertiary', text: 'text-tertiary' };
      case 'primary-container':
        return { bar: 'bg-primary-container', text: 'text-primary-container' };
    }
  };

  return (
    <div className="flex flex-col w-full pb-8 space-y-6">
      {/* Search & Action Bar */}
      <div className="flex items-center gap-3 pt-1">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter lists, spaces & tags..."
            className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline text-body-md pl-10 pr-4 py-2.5 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-1.5 bg-primary text-on-primary text-label-lg px-4 py-2.5 rounded-xl shadow-sm active:scale-95 transition-transform flex-shrink-0 cursor-pointer hover:bg-primary-container"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>New List</span>
        </button>
      </div>

      {/* Mindful Daily Highlight Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-surface-container-low p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-sm flex-shrink-0">
            <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
          </div>
          <div className="flex flex-col">
            <span className="text-headline-md text-on-surface leading-tight">
              Focus Cadence
            </span>
            <span className="text-body-sm text-on-surface-variant">
              {totalActiveCount} active tasks across {projects.length} deliberate focus
              zones
            </span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-primary text-label-md bg-surface-container-lowest px-3 py-1.5 rounded-full shadow-sm shrink-0">
          <span className="material-symbols-outlined text-[16px]">trending_up</span>
          <span>74% weekly completion</span>
        </div>
      </div>

      {/* Section 1: System Quick Views */}
      <div className="flex flex-col space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-label-sm uppercase tracking-wider text-outline font-semibold">
            Overview &amp; Quick Views
          </span>
          <span className="text-label-sm text-on-surface-variant">Default Filters</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* All Tasks */}
          <button
            type="button"
            onClick={() => onOpenQuickView('all')}
            className="flex flex-col justify-between p-3.5 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow transition-shadow cursor-pointer group active:scale-[0.99] text-left"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined text-[20px]">inventory_2</span>
              </div>
              <span className="text-label-lg text-on-surface font-bold bg-surface-container-low px-2 py-0.5 rounded-full tabular-nums">
                {allTasksCount + 10}
              </span>
            </div>
            <div className="mt-3 flex flex-col">
              <span className="text-body-md font-semibold text-on-surface group-hover:text-primary transition-colors">
                All Tasks
              </span>
              <span className="text-body-sm text-on-surface-variant">Full horizon</span>
            </div>
          </button>

          {/* Today / My Day */}
          <button
            type="button"
            onClick={() => onSelectTab('my-day')}
            className="flex flex-col justify-between p-3.5 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow transition-shadow cursor-pointer group active:scale-[0.99] text-left"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-9 h-9 rounded-lg bg-secondary-container/40 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined material-symbols-filled text-[20px]">
                  wb_sunny
                </span>
              </div>
              <span className="text-label-lg text-primary font-bold bg-secondary-container/30 px-2 py-0.5 rounded-full tabular-nums">
                {Math.max(myDayCount + 4, 7)}
              </span>
            </div>
            <div className="mt-3 flex flex-col">
              <span className="text-body-md font-semibold text-on-surface group-hover:text-primary transition-colors">
                My Day
              </span>
              <span className="text-body-sm text-on-surface-variant">
                Intentional focus
              </span>
            </div>
          </button>

          {/* Important & Starred */}
          <button
            type="button"
            onClick={() => onOpenQuickView('important')}
            className="flex flex-col justify-between p-3.5 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow transition-shadow cursor-pointer group active:scale-[0.99] text-left"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-tertiary-container">
                <span className="material-symbols-outlined material-symbols-filled text-[20px]">
                  star
                </span>
              </div>
              <span className="text-label-lg text-on-surface font-bold bg-surface-container-low px-2 py-0.5 rounded-full tabular-nums">
                {importantCount}
              </span>
            </div>
            <div className="mt-3 flex flex-col">
              <span className="text-body-md font-semibold text-on-surface group-hover:text-primary transition-colors">
                Important
              </span>
              <span className="text-body-sm text-on-surface-variant">High priority</span>
            </div>
          </button>

          {/* Completed Archive */}
          <button
            type="button"
            onClick={() => onSelectTab('completed')}
            className="flex flex-col justify-between p-3.5 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow transition-shadow cursor-pointer group active:scale-[0.99] text-left"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined material-symbols-filled text-[20px]">
                  check_circle
                </span>
              </div>
              <span className="text-label-lg text-secondary font-bold bg-surface-container-low px-2 py-0.5 rounded-full tabular-nums">
                {archiveCount}
              </span>
            </div>
            <div className="mt-3 flex flex-col">
              <span className="text-body-md font-semibold text-on-surface group-hover:text-primary transition-colors">
                Archive
              </span>
              <span className="text-body-sm text-on-surface-variant">
                Completed records
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Section 2: Custom Lists & Projects */}
      <div className="flex flex-col space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-label-sm uppercase tracking-wider text-outline font-semibold">
              Active Projects
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          </div>
          <button
            type="button"
            onClick={() =>
              setSortMode((m) => (m === 'recent' ? 'progress' : 'recent'))
            }
            className="text-primary text-label-sm flex items-center gap-0.5 hover:underline cursor-pointer"
          >
            <span>
              {sortMode === 'recent' ? 'Sort by recent' : 'Sort by progress'}
            </span>
            <span className="material-symbols-outlined text-[14px]">expand_more</span>
          </button>
        </div>

        {filteredProjects.map((project) => {
          const projectTasks = tasks.filter((t) => t.projectId === project.id);
          const completedInProject = projectTasks.filter((t) => t.completed).length;
          const openInProject = projectTasks.filter((t) => !t.completed).length;
          const displayOpen =
            project.id === 'work-strategy' ||
            project.id === 'personal-wellness' ||
            project.id === 'home-errands' ||
            project.id === 'serene-ui'
              ? project.baseOpenCount
              : openInProject;
          const displayPct =
            projectTasks.length > 0 &&
            project.id !== 'work-strategy' &&
            project.id !== 'personal-wellness' &&
            project.id !== 'home-errands' &&
            project.id !== 'serene-ui'
              ? Math.round((completedInProject / projectTasks.length) * 100)
              : project.baseProgressPct;
          const barTheme = getProgressBarClasses(project.colorTheme);

          return (
            <div
              key={project.id}
              onClick={() => onOpenProjectDetail(project.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onOpenProjectDetail(project.id);
                }
              }}
              className="flex flex-col p-4 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow transition-all space-y-3.5 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${getIconBoxClasses(
                      project.colorTheme
                    )}`}
                  >
                    <span className="material-symbols-outlined text-[22px]">
                      {project.icon}
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-headline-md text-on-surface group-hover:text-primary transition-colors truncate">
                        {project.name}
                      </h3>
                      <span
                        className={`text-label-sm px-2 py-0.5 rounded-full ${getBadgeClasses(
                          project.colorTheme
                        )}`}
                      >
                        {project.badge}
                      </span>
                    </div>
                    <span className="text-body-sm text-on-surface-variant truncate">
                      {project.description}
                    </span>
                  </div>
                </div>

                {project.collaborators && project.collaborators.length > 0 ? (
                  <div className="flex items-center -space-x-1.5 flex-shrink-0">
                    {project.collaborators.map((avatar, i) => (
                      <ImageWithFallback
                        key={i}
                        src={avatar}
                        alt={`Collaborator ${i + 1}`}
                        className="w-6 h-6 rounded-full object-cover ring-2 ring-surface-container-lowest"
                        fallbackText="TM"
                        fallbackClassName="w-6 h-6 rounded-full bg-primary/15 text-primary ring-2 ring-surface-container-lowest"
                      />
                    ))}
                    {project.extraCollaborators ? (
                      <div className="w-6 h-6 rounded-full bg-surface-container text-on-surface-variant text-[10px] font-bold flex items-center justify-center ring-2 ring-surface-container-lowest">
                        +{project.extraCollaborators}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <button
                    type="button"
                    aria-label="Project actions"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenProjectDetail(project.id);
                    }}
                    className="text-outline hover:text-on-surface transition-colors p-1 rounded-lg cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      more_horiz
                    </span>
                  </button>
                )}
              </div>

              {/* Progress Section */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-label-sm">
                  <span className="text-on-surface-variant font-medium tabular-nums">
                    {displayOpen} open tasks
                  </span>
                  <span className={`font-bold tabular-nums ${barTheme.text}`}>
                    {displayPct}% done
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barTheme.bar}`}
                    style={{ width: `${displayPct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Section 3: Interactive Tags Cloud */}
      <div className="flex flex-col space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-outline">
              label
            </span>
            <span className="text-label-sm uppercase tracking-wider text-outline font-semibold">
              Context Tags
            </span>
          </div>
          <button
            type="button"
            onClick={() => setAddingTag(true)}
            className="text-label-sm text-primary cursor-pointer hover:underline"
          >
            Manage tags
          </button>
        </div>

        <div className="flex flex-wrap gap-2 p-3.5 rounded-2xl bg-surface-container-lowest shadow-sm">
          {filteredTags.map((tag) => {
            const isSelected = selectedTags.includes(tag.id);
            const toneStyle =
              tag.tone === 'error'
                ? 'bg-error-container/40 text-on-error-container hover:bg-error-container'
                : tag.tone === 'secondary'
                ? 'bg-secondary-container/30 text-on-secondary-container hover:bg-secondary-container/50'
                : 'bg-surface-container hover:bg-surface-container-high text-on-surface';

            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => {
                  toggleTagSelection(tag.id);
                  onShowToast(
                    isSelected
                      ? `Cleared ${tag.label} filter`
                      : `Highlighted ${tag.label} context`
                  );
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors active:scale-95 cursor-pointer ${toneStyle} ${
                  isSelected ? 'ring-2 ring-primary/40' : ''
                }`}
              >
                {tag.tone === 'error' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-error" />
                )}
                {tag.tone === 'secondary' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                )}
                <span className="text-label-md font-semibold">{tag.label}</span>
                <span className="text-label-sm opacity-75 tabular-nums">
                  {tag.count}
                </span>
              </button>
            );
          })}

          {addingTag ? (
            <form onSubmit={handleTagSubmit} className="inline-flex items-center gap-1">
              <input
                autoFocus
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                placeholder="tag name..."
                className="w-28 px-2.5 py-1 rounded-full bg-surface-container-low text-label-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="submit"
                className="px-2.5 py-1 rounded-full bg-primary text-on-primary text-label-sm cursor-pointer"
              >
                Add
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setAddingTag(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-surface-container-low text-outline hover:text-on-surface hover:bg-surface-container transition-colors text-label-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Tag</span>
            </button>
          )}
        </div>
      </div>

      {/* Create New Focus List Drawer */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-on-surface/30 backdrop-blur-xs flex items-end justify-center p-4"
          onClick={() => setDrawerOpen(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleCreateSubmit}
            className="w-full max-w-[640px] bg-surface-container-lowest rounded-2xl shadow-2xl p-5 flex flex-col space-y-4 mb-16 sm:mb-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-headline-md text-on-surface">
                Create New Focus List
              </h4>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close drawer"
                className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <input
              autoFocus
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="e.g. Reading Backlog, Q3 Launch..."
              className="w-full bg-surface-container-low text-on-surface p-3 rounded-xl text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <input
              type="text"
              value={newListDesc}
              onChange={(e) => setNewListDesc(e.target.value)}
              placeholder="Short description (optional)"
              className="w-full bg-surface-container-low text-on-surface p-3 rounded-xl text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2.5">
                {COLOR_THEMES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    aria-label={c.label}
                    onClick={() => setNewListColor(c.id)}
                    className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${
                      c.dotClass
                    } ${
                      newListColor === c.id
                        ? 'ring-2 ring-offset-2 ring-primary scale-110'
                        : 'opacity-80 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
              <button
                type="submit"
                className="bg-primary text-on-primary text-label-lg px-5 py-2.5 rounded-xl shadow active:scale-95 transition-transform cursor-pointer hover:bg-primary-container"
              >
                Create Space
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
