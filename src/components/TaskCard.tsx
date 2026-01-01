import React from 'react';
import { Check, User } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Task } from '../types';

import { getAssigneeColor } from '../utils/colors';

interface TaskCardProps {
    task: Task;
    onToggle: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle }) => {
    const colors = getAssigneeColor(task.assignee);

    return (
        <div
            className={cn(
                "group flex items-start gap-2 p-2.5 rounded-lg border shadow-sm transition-all duration-200",
                task.isCompleted
                    ? "bg-muted/50 border-transparent opacity-75"
                    : cn("bg-card border-border hover:shadow-md", colors.bg, colors.border)
            )}
        >
            <button
                onClick={() => onToggle(task.id)}
                className={cn(
                    "mt-0.5 h-4 w-4 shrink-0 rounded border flex items-center justify-center transition-colors",
                    task.isCompleted
                        ? "bg-primary border-primary text-primary-foreground"
                        : cn("border-muted-foreground/40", colors.text, `group-hover:${colors.border}`)
                )}
            >
                {task.isCompleted && <Check size={10} strokeWidth={4} />}
            </button>

            <div className="min-w-0 flex-1">
                <div className="flex justify-between items-start gap-2">
                    <p className={cn(
                        "text-sm font-medium leading-tight",
                        task.isCompleted && "line-through text-muted-foreground",
                        !task.isCompleted && colors.text
                    )}>
                        {task.title}
                    </p>
                    {task.startTime && (
                        <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap bg-background/50 px-1 rounded">
                            {task.startTime}
                        </span>
                    )}
                </div>

                <div className="mt-1.5 flex items-center justify-between">
                    {task.assignee && (
                        <div className={cn(
                            "flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold",
                            colors.text
                        )}>
                            <User size={10} />
                            <span>{task.assignee}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
