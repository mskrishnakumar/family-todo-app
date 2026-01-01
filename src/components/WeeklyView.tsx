import React from 'react';
import { startOfWeek, addDays, format, isSameDay, addWeeks, subWeeks, setHours, setMinutes } from 'date-fns';
import { cn } from '../lib/utils';
import type { Task } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getAssigneeColor } from '../utils/colors';

interface WeeklyViewProps {
    tasks: Task[];
    onToggleTask: (taskId: string) => void;
    onAddTask: (date: Date) => void;
    currentDate: Date;
    onDateChange: (date: Date) => void;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 9); // 9 AM to 9 PM
const PIXELS_PER_HOUR = 60; // Height of one hour slot

export const WeeklyView: React.FC<WeeklyViewProps> = ({ tasks, onToggleTask, onAddTask, currentDate, onDateChange }) => {
    const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startOfCurrentWeek, i));

    const getTaskStyle = (task: Task) => {
        if (!task.startTime) return {};
        const [hours, minutes] = task.startTime.split(':').map(Number);

        // Calculate relative position from 9 AM
        const startHour = 9;
        const minutesFromStart = (hours - startHour) * 60 + minutes;

        // Clamp to the 9AM start if earlier (though optimally we should handle this better)
        const effectiveMinutes = Math.max(0, minutesFromStart);

        return {
            top: `${(effectiveMinutes / 60) * PIXELS_PER_HOUR}px`,
            height: `${(task.durationMinutes || 60) / 60 * PIXELS_PER_HOUR}px`,
        };
    };

    return (
        <div className="flex flex-col space-y-4">
            {/* Week Navigation */}
            <div className="flex items-center justify-between bg-card p-3 rounded-lg border border-border shadow-sm">
                <button
                    onClick={() => onDateChange(subWeeks(currentDate, 1))}
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>
                <h2 className="text-xl font-bold">
                    {format(startOfCurrentWeek, 'MMMM yyyy')}
                </h2>
                <button
                    onClick={() => onDateChange(addWeeks(currentDate, 1))}
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            <div className="w-full overflow-x-auto border border-border rounded-xl bg-card/80 backdrop-blur-sm shadow-sm">
                <div className="min-w-[800px] flex">
                    {/* Time Column */}
                    <div className="w-16 flex-shrink-0 border-r border-border bg-muted/20">
                        {/* Header spacer */}
                        <div className="h-20 border-b border-border"></div>
                        {/* Earlier label */}
                        <div className="h-10 flex items-center justify-end pr-2 text-[10px] font-bold text-slate-400 uppercase border-b border-border/50 bg-slate-50">
                            Earlier
                        </div>
                        {/* Time labels */}
                        <div className="relative" style={{ height: (HOURS.length - 1) * PIXELS_PER_HOUR }}>
                            {HOURS.slice(0, -1).map((hour, i) => (
                                <div
                                    key={hour}
                                    className="absolute w-full text-right pr-2 text-xs text-muted-foreground font-medium"
                                    style={{ top: i * PIXELS_PER_HOUR }}
                                >
                                    {format(setHours(setMinutes(new Date(), 0), hour), 'h a')}
                                </div>
                            ))}
                        </div>
                        {/* Later label */}
                        <div className="h-10 flex items-center justify-end pr-2 text-[10px] font-bold text-slate-400 uppercase border-t border-border/50 bg-slate-50">
                            Later
                        </div>
                    </div>

                    {/* Days Columns */}
                    <div className="flex-1 grid grid-cols-7 divide-x divide-border">
                        {weekDays.map((day) => {
                            const isToday = isSameDay(day, new Date());
                            const dateKey = format(day, 'yyyy-MM-dd');
                            const dayTasks = tasks.filter(t => t.date === dateKey);

                            // Categorize tasks
                            const getStartHour = (t: Task) => t.startTime ? parseInt(t.startTime.split(':')[0]) : null;
                            const timedTasks = dayTasks.filter(t => {
                                const hour = getStartHour(t);
                                return hour !== null && hour >= 9 && hour < 21;
                            });
                            const earlierTasks = dayTasks.filter(t => {
                                const hour = getStartHour(t);
                                return hour !== null && hour < 9;
                            });
                            const laterTasks = dayTasks.filter(t => {
                                const hour = getStartHour(t);
                                return hour !== null && hour >= 21;
                            });
                            const untimedTasks = dayTasks.filter(t => !t.startTime);

                            return (
                                <div key={day.toString()} className={cn("relative flex flex-col min-w-0 bg-background/50", isToday && "bg-accent/10")}>
                                    {/* Date Header */}
                                    <div className={cn(
                                        "h-20 p-2 border-b border-border text-center flex flex-col justify-center items-center transition-colors hover:bg-muted/50 cursor-pointer",
                                        isToday && "bg-primary/5 border-b-primary/20"
                                    )} onClick={() => onAddTask(day)}>
                                        <p className="text-xs font-medium uppercase text-muted-foreground">{format(day, 'EEE')}</p>
                                        <div className={cn(
                                            "h-8 w-8 mt-1 flex items-center justify-center rounded-full text-sm font-bold",
                                            isToday ? "bg-primary text-primary-foreground" : "text-foreground"
                                        )}>
                                            {format(day, 'd')}
                                        </div>
                                    </div>

                                    {/* Earlier Row - Fixed height to align with sidebar */}
                                    <div className="h-10 p-0.5 border-b border-border/50 bg-slate-50/50 overflow-x-auto flex items-center gap-0.5">
                                        {earlierTasks.map(task => {
                                            const colors = getAssigneeColor(task.assignee);
                                            return (
                                                <div key={task.id} onClick={() => onToggleTask(task.id)} className={cn("text-[8px] px-1 py-0.5 rounded border whitespace-nowrap cursor-pointer flex-shrink-0", colors.bg, colors.border, colors.text, task.isCompleted && "opacity-50 line-through")}>
                                                    {task.startTime} {task.title}
                                                </div>
                                            );
                                        })}
                                        {earlierTasks.length === 0 && untimedTasks.length > 0 && (
                                            <div className="flex items-center gap-0.5 overflow-hidden">
                                                {untimedTasks.slice(0, 2).map(task => {
                                                    const colors = getAssigneeColor(task.assignee);
                                                    return (
                                                        <div key={task.id} onClick={() => onToggleTask(task.id)} className={cn("text-[8px] px-1 py-0.5 rounded border whitespace-nowrap cursor-pointer flex-shrink-0", colors.bg, colors.border, colors.text, task.isCompleted && "opacity-50 line-through")}>
                                                            {task.title}
                                                        </div>
                                                    );
                                                })}
                                                {untimedTasks.length > 2 && <span className="text-[8px] text-muted-foreground">+{untimedTasks.length - 2}</span>}
                                            </div>
                                        )}
                                    </div>

                                    {/* Timeline Grid */}
                                    <div className="relative flex-1" style={{ height: (HOURS.length - 1) * PIXELS_PER_HOUR }}>
                                        {/* Grid Lines */}
                                        {HOURS.slice(0, -1).map((_, i) => (
                                            <div
                                                key={i}
                                                className="absolute w-full border-b border-slate-300"
                                                style={{ top: i * PIXELS_PER_HOUR }}
                                            />
                                        ))}

                                        {/* Timed Tasks */}
                                        {timedTasks.map(task => {
                                            const colors = getAssigneeColor(task.assignee);
                                            return (
                                                <div
                                                    key={task.id}
                                                    className={cn(
                                                        "absolute inset-x-1 rounded-md border text-[10px] p-1 overflow-hidden shadow-sm hover:z-10 transition-all cursor-pointer",
                                                        colors.bg, colors.border,
                                                        task.isCompleted && "opacity-50 grayscale"
                                                    )}
                                                    style={getTaskStyle(task)}
                                                    onClick={() => onToggleTask(task.id)}
                                                >
                                                    <div className={cn("font-bold truncate", colors.text)}>
                                                        {task.title}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Later Row - Fixed height to align with sidebar */}
                                    <div className="h-10 p-0.5 border-t border-border/50 bg-slate-50/50 overflow-x-auto flex items-center gap-0.5">
                                        {laterTasks.map(task => {
                                            const colors = getAssigneeColor(task.assignee);
                                            return (
                                                <div key={task.id} onClick={() => onToggleTask(task.id)} className={cn("text-[8px] px-1 py-0.5 rounded border whitespace-nowrap cursor-pointer flex-shrink-0", colors.bg, colors.border, colors.text, task.isCompleted && "opacity-50 line-through")}>
                                                    {task.startTime} {task.title}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
