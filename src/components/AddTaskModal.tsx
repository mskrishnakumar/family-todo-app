import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, User, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import type { Task } from '../types';
import { ASSIGNEE_COLORS } from '../utils/colors';

interface AddTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (task: Omit<Task, 'id' | 'isCompleted'>) => void;
    initialDate?: Date;
}

const FAMILY_MEMBERS = ['Mom', 'Dad', 'Kid', 'Everyone'] as const;

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAdd, initialDate }) => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(() => initialDate ? format(initialDate, 'yyyy-MM-dd') : '');
    const [startTime, setStartTime] = useState('');
    const [assignee, setAssignee] = useState<typeof FAMILY_MEMBERS[number]>('Everyone');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !date) return;

        onAdd({
            title,
            date,
            assignee,
            startTime: startTime || undefined,
        });

        // Reset and close
        setTitle('');
        setStartTime('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-background border border-border rounded-xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-lg font-semibold">New Task</h2>
                    <button onClick={onClose} className="p-1 hover:bg-muted rounded-md transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">What needs to be done?</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Buy groceries"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">When?</label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="flex h-10 w-full pl-9 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Time (Optional)</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="flex h-10 w-full pl-9 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Who is this for?</label>
                        <div className="flex flex-wrap gap-2">
                            {FAMILY_MEMBERS.map(member => {
                                const colors = ASSIGNEE_COLORS[member];
                                const isSelected = assignee === member;
                                return (
                                    <button
                                        key={member}
                                        type="button"
                                        onClick={() => setAssignee(member)}
                                        className={cn(
                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all",
                                            isSelected
                                                ? cn(colors.bg, colors.text, colors.border, "ring-2 ring-offset-1", colors.border)
                                                : "bg-background border-border hover:bg-muted text-muted-foreground"
                                        )}
                                    >
                                        <User size={12} />
                                        {member}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md shadow hover:bg-primary/90 transition-colors">
                            Add Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
