import type { Task } from '../types';

export const ASSIGNEE_COLORS: Record<Task['assignee'], { bg: string; text: string; border: string }> = {
    Dad: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        border: 'border-blue-200'
    },
    Mom: {
        bg: 'bg-rose-100',
        text: 'text-rose-700',
        border: 'border-rose-200'
    },
    Kid: {
        bg: 'bg-amber-100',
        text: 'text-amber-700',
        border: 'border-amber-200'
    },
    Everyone: {
        bg: 'bg-purple-100',
        text: 'text-purple-700',
        border: 'border-purple-200'
    }
};

export const getAssigneeColor = (assignee: Task['assignee']) => {
    return ASSIGNEE_COLORS[assignee] || ASSIGNEE_COLORS['Everyone'];
};
