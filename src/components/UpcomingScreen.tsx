import React, { useMemo, useState } from 'react';
import { CALENDAR_DAYS } from '../data/initialData';
import { Priority, ScheduleBucket, Task } from '../types';

interface UpcomingScreenProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onAddTask: (payload: {
    title: string;
    dueLabel: string;
    timeLabel?: string;
    scheduleBucket: ScheduleBucket;
    priority: Priority;
    tag: string;
    dayNumber?: number;
  }) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, patch: Partial<Task>) => void;
}

type UpcomingFilter = 'all' | 'next7' | 'work' | 'personal';

const QUICK_DATE_CHOICES: Array<{
  label: string;
  bucket: ScheduleBucket;
  dayNumber?: number;
}> = [
  { label: 'Thu, Oct 25', bucket: 'tomorrow', dayNumber: 25 },
  { label: 'Fri, Oct 26', bucket: 'friday', dayNumber: 26 },
  { label: 'Mon, Oct 29', bucket: 'next-week' },
];

export const UpcomingScreen: React.FC<UpcomingScreenProps> = ({
  tasks,
  onToggleComplete,
  onAddTask,
  onDeleteTask,
  onUpdateTask,
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(24);
  const [dayFilterActive, setDayFilterActive] = useState<boolean>(false);
  const [chipFilter, setChipFilter] = useState<UpcomingFilter>('all');
  const [quickInput, setQuickInput] = useState('');
  const [dateChoiceIdx, setDateChoiceIdx] = useState(0);
  const [tagChoice, setTagChoice] = useState<'#Work' | '#Personal'>('#Work');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const upcomingTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          t.scheduleBucket === 'tomorrow' ||
          t.scheduleBucket === 'friday' ||
          t.scheduleBucket === 'next-week'
      ),
    [tasks]
  );

  const remainingCommitmentsCount = upcomingTasks.filter((t) => !t.completed).length;

  const filteredTasks = useMemo(() => {
    return upcomingTasks.filter((t) => {
      if (dayFilterActive) {
        if (selectedDay === 25 && t.scheduleBucket !== 'tomorrow') return false;
        if (selectedDay === 26 && t.scheduleBucket !== 'friday') return false;
        if (selectedDay !== 24 && selectedDay !== 25 && selectedDay !== 26) {
          return t.dayNumber === selectedDay;
        }
      }
      if (chipFilter === 'next7') {
        return t.scheduleBucket === 'tomorrow' || t.scheduleBucket === 'friday';
      }
      if (chipFilter === 'work') {
        return t.tag.toLowerCase() === '#work';
      }
      if (chipFilter === 'personal') {
        return t.tag.toLowerCase() === '#personal';
      }
      return true;
    });
  }, [upcomingTasks, dayFilterActive, selectedDay, chipFilter]);

  const tomorrowTasks = filteredTasks.filter((t) => t.scheduleBucket === 'tomorrow');
  const fridayTasks = filteredTasks.filter((t) => t.scheduleBucket === 'friday');
  const nextWeekTasks = filteredTasks.filter((t) => t.scheduleBucket === 'next-week');

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = quickInput.trim();
    if (!raw) return;

    // Optional lightweight inline parsing for #Work / #Personal
    let parsedTag: string = tagChoice;
    if (/#personal/i.test(raw)) parsedTag = '#Personal';
    else if (/#work/i.test(raw)) parsedTag = '#Work';

    const cleanTitle = raw.replace(/#(work|personal)/gi, '').trim() || raw;
    const chosenDate = QUICK_DATE_CHOICES[dateChoiceIdx];

    onAddTask({
      title: cleanTitle,
      dueLabel: chosenDate.label,
      timeLabel: chosenDate.bucket === 'next-week' ? 'Mon, Oct 29' : '11:00 AM',
      scheduleBucket: chosenDate.bucket,
      priority: 'Medium',
      tag: parsedTag,
      dayNumber: chosenDate.dayNumber,
    });
    setQuickInput('');
  };

  const handleDaySelect = (dateNum: number) => {
    if (selectedDay === dateNum && dayFilterActive) {
      setDayFilterActive(false);
      setSelectedDay(24);
    } else {
      setSelectedDay(dateNum);
      setDayFilterActive(dateNum !== 24);
    }
  };

  const renderTaskCard = (task: Task, showDateIcon: string) => {
    const isMenuOpen = openMenuId === task.id;
    const isWork = task.tag.toLowerCase() === '#work';

    return (
      <div
        key={task.id}
        className={`task-card group relative flex items-start justify-between p-3.5 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all duration-200 ${
          task.completed ? 'opacity-60' : ''
        }`}
      >
        <div className="flex items-start space-x-3 min-w-0">
          <button
            type="button"
            onClick={() => onToggleComplete(task.id)}
            aria-label={`Toggle "${task.title}"`}
            className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors focus:outline-none cursor-pointer ${
              task.completed
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-transparent hover:text-primary-container hover:bg-primary-fixed'
            }`}
          >
            <span className="material-symbols-outlined text-[14px] transition-transform">
              check
            </span>
          </button>

          <div className="flex flex-col min-w-0">
            <span
              className={`text-label-lg font-semibold truncate transition-colors ${
                task.completed ? 'line-through text-outline' : 'text-on-surface'
              }`}
            >
              {task.title}
            </span>

            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span
                className={`inline-flex items-center text-label-sm ${
                  task.priority === 'High' || task.scheduleBucket === 'friday' && isWork
                    ? 'text-primary'
                    : 'text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-[15px] mr-1">
                  {task.icon || showDateIcon}
                </span>
                {task.timeLabel || task.dueLabel}
              </span>

              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container text-label-sm ${
                  isWork ? 'text-tertiary' : 'text-secondary'
                }`}
              >
                {task.tag}
              </span>

              {task.priority === 'High' ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-label-sm font-semibold">
                  <span className="material-symbols-outlined text-[12px] mr-0.5">
                    priority_high
                  </span>
                  High Priority
                </span>
              ) : task.priority === 'Medium' && task.scheduleBucket !== 'next-week' ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-high text-on-secondary-container text-label-sm">
                  Medium
                </span>
              ) : task.priority === 'Low' ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant text-label-sm">
                  Low
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => setOpenMenuId(isMenuOpen ? null : task.id)}
            aria-label="Task options"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-outline-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">more_vert</span>
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-9 z-30 w-44 rounded-xl bg-surface-container-lowest shadow-lg border border-outline-variant/20 py-1.5 text-body-sm">
              <button
                type="button"
                onClick={() => {
                  onUpdateTask(task.id, {
                    scheduleBucket: 'today',
                    dueLabel: 'Today',
                    dayNumber: 24,
                  });
                  setOpenMenuId(null);
                }}
                className="w-full px-3 py-2 text-left text-on-surface hover:bg-surface-container-low flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">wb_sunny</span>
                Move to My Day
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
                <span className="material-symbols-outlined text-[16px]">flag</span>
                Cycle priority
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteTask(task.id);
                  setOpenMenuId(null);
                }}
                className="w-full px-3 py-2 text-left text-error hover:bg-error-container/30 flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full pb-10 space-y-5">
      {/* Subtitle & Focus Summary */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex flex-col">
          <span className="text-headline-lg-mobile text-on-surface tracking-tight">
            Schedule &amp; Agenda
          </span>
          <span className="text-body-sm text-on-surface-variant tabular-nums">
            {remainingCommitmentsCount} commitments remaining this week
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low shadow-sm">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-label-sm text-primary">In Flow</span>
        </div>
      </div>

      {/* Horizontal Mini-Calendar Strip */}
      <div className="w-full -mx-4 px-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center space-x-2.5 py-1 min-w-max">
          {CALENDAR_DAYS.map((day) => {
            const isSelected = selectedDay === day.dateNum;
            return (
              <button
                key={day.dateNum}
                type="button"
                onClick={() => handleDaySelect(day.dateNum)}
                className={`group flex flex-col items-center justify-center w-12 h-16 rounded-xl transition-all duration-200 focus:outline-none cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-on-primary shadow-md transform -translate-y-0.5 ring-2 ring-primary-fixed ring-offset-2 ring-offset-surface'
                    : 'bg-surface-container-lowest shadow-sm hover:bg-surface-container-high'
                }`}
              >
                <span
                  className={`text-label-sm ${
                    isSelected
                      ? 'text-primary-fixed uppercase tracking-wider'
                      : 'text-on-surface-variant group-hover:text-on-surface'
                  }`}
                >
                  {day.dayShort}
                </span>
                <span
                  className={`text-headline-md mt-0.5 tabular-nums ${
                    isSelected ? 'text-on-primary font-bold' : 'text-on-surface'
                  }`}
                >
                  {day.dateNum}
                </span>
                <span className="flex space-x-0.5 mt-1 min-h-[6px] items-center">
                  {day.dots.map((dot, idx) => (
                    <span
                      key={idx}
                      className={`rounded-full ${
                        isSelected
                          ? 'w-1.5 h-1.5 bg-secondary-fixed'
                          : dot === 'primary'
                          ? 'w-1.5 h-1.5 bg-primary'
                          : 'w-1 h-1 bg-outline-variant'
                      }`}
                    />
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Chips Strip */}
      <div className="w-full -mx-4 px-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center space-x-2 py-0.5 min-w-max">
          <button
            type="button"
            onClick={() => {
              setChipFilter('all');
              setDayFilterActive(false);
              setSelectedDay(24);
            }}
            className={`px-3.5 py-1.5 rounded-full text-label-md shadow-sm transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              chipFilter === 'all' && !dayFilterActive
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              calendar_view_week
            </span>
            <span>All Upcoming</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setChipFilter('next7');
              setDayFilterActive(false);
            }}
            className={`px-3.5 py-1.5 rounded-full text-label-md shadow-sm transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              chipFilter === 'next7'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">today</span>
            <span>Next 7 Days</span>
          </button>

          <button
            type="button"
            onClick={() => setChipFilter('work')}
            className={`px-3.5 py-1.5 rounded-full text-label-md shadow-sm transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              chipFilter === 'work'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                chipFilter === 'work' ? 'bg-secondary-fixed' : 'bg-tertiary'
              }`}
            />
            <span>Work Only</span>
          </button>

          <button
            type="button"
            onClick={() => setChipFilter('personal')}
            className={`px-3.5 py-1.5 rounded-full text-label-md shadow-sm transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              chipFilter === 'personal'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                chipFilter === 'personal' ? 'bg-secondary-fixed' : 'bg-secondary'
              }`}
            />
            <span>Personal Only</span>
          </button>
        </div>
      </div>

      {/* Quick Add Interactive Input */}
      <form
        onSubmit={handleQuickAdd}
        className="w-full rounded-2xl bg-surface-container-lowest shadow-sm p-2.5 transition-all duration-200 focus-within:shadow-md focus-within:ring-1 focus-within:ring-primary"
      >
        <div className="flex items-center gap-2 px-1">
          <span className="material-symbols-outlined text-primary text-[20px]">
            add_circle
          </span>
          <input
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            placeholder="Schedule a task (e.g. Design review @Thu 2pm #Work)..."
            className="w-full bg-transparent text-body-md text-on-surface placeholder:text-outline focus:outline-none"
          />
        </div>
        <div className="flex items-center justify-between pt-2.5 mt-2 bg-surface-container-low/40 rounded-xl px-2 py-1.5">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() =>
                setDateChoiceIdx((i) => (i + 1) % QUICK_DATE_CHOICES.length)
              }
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high text-label-sm transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">
                calendar_month
              </span>
              <span>{QUICK_DATE_CHOICES[dateChoiceIdx].label}</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setTagChoice((prev) => (prev === '#Work' ? '#Personal' : '#Work'))
              }
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high text-label-sm transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-tertiary">
                label
              </span>
              <span>{tagChoice}</span>
            </button>
          </div>
          <button
            type="submit"
            aria-label="Schedule task"
            className="w-7 h-7 rounded-lg bg-primary text-on-primary flex items-center justify-center shadow hover:bg-primary-container transition-transform active:scale-90 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
          </button>
        </div>
      </form>

      {/* Grouped Agenda Timeline */}
      <div className="flex flex-col space-y-6 pt-1">
        {tomorrowTasks.length > 0 && (
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="material-symbols-outlined text-[18px] text-primary">
                  wb_twilight
                </span>
                <h2 className="text-headline-md text-on-surface">
                  Tomorrow{' '}
                  <span className="text-body-sm text-on-surface-variant font-normal">
                    — Thursday, Oct 25
                  </span>
                </h2>
              </div>
              <span className="text-label-sm px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-medium tabular-nums">
                {tomorrowTasks.length} {tomorrowTasks.length === 1 ? 'task' : 'tasks'}
              </span>
            </div>
            <div className="flex flex-col space-y-2.5">
              {tomorrowTasks.map((t) => renderTaskCard(t, 'schedule'))}
            </div>
          </div>
        )}

        {fridayTasks.length > 0 && (
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="material-symbols-outlined text-[18px] text-tertiary">
                  upcoming
                </span>
                <h2 className="text-headline-md text-on-surface">
                  Later this week{' '}
                  <span className="text-body-sm text-on-surface-variant font-normal">
                    — Friday, Oct 26
                  </span>
                </h2>
              </div>
              <span className="text-label-sm px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-medium tabular-nums">
                {fridayTasks.length} {fridayTasks.length === 1 ? 'task' : 'tasks'}
              </span>
            </div>
            <div className="flex flex-col space-y-2.5">
              {fridayTasks.map((t) => renderTaskCard(t, 'event_available'))}
            </div>
          </div>
        )}

        {nextWeekTasks.length > 0 && (
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="material-symbols-outlined text-[18px] text-outline">
                  date_range
                </span>
                <h2 className="text-headline-md text-on-surface">Next Week</h2>
              </div>
              <span className="text-label-sm px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-medium tabular-nums">
                {nextWeekTasks.length} {nextWeekTasks.length === 1 ? 'task' : 'tasks'}
              </span>
            </div>
            <div className="flex flex-col space-y-2.5">
              {nextWeekTasks.map((t) => renderTaskCard(t, 'event'))}
            </div>
          </div>
        )}

        {filteredTasks.length === 0 && (
          <div className="p-6 rounded-2xl bg-surface-container-lowest text-center shadow-sm">
            <span className="material-symbols-outlined text-[28px] text-primary">
              event_available
            </span>
            <p className="text-body-md font-medium text-on-surface mt-2">
              Open space on your calendar
            </p>
            <p className="text-body-sm text-on-surface-variant mt-0.5">
              No scheduled tasks match this filter yet.
            </p>
          </div>
        )}
      </div>

      {/* Ambient Productivity Reflection Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-container-low via-surface-container to-surface-variant/40 p-4 shadow-sm flex items-center space-x-4">
        <div className="w-12 h-12 rounded-2xl bg-primary-container/20 flex items-center justify-center flex-shrink-0 text-primary">
          <span className="material-symbols-outlined text-[26px]">spa</span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-label-lg text-on-surface font-semibold">
            Cognitive Space
          </span>
          <p className="text-body-sm text-on-surface-variant mt-0.5">
            Your schedule is 35% lighter than last week. Great time for deep creative
            work.
          </p>
        </div>
      </div>
    </div>
  );
};
