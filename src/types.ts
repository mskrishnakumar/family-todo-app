export type Task = {
    id: string;
    title: string;
    date: string; // ISO string YYYY-MM-DD
    isCompleted: boolean;
    assignee: 'Dad' | 'Mom' | 'Kid' | 'Everyone';
    startTime?: string; // HH:mm format
    durationMinutes?: number;
    category?: 'Chore' | 'Event' | 'School';
};

export type DayColumn = {
    date: Date;
    tasks: Task[];
};
