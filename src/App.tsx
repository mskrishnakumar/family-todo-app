import { useState, useEffect } from 'react';
import { WeeklyView } from './components/WeeklyView';
import { AddTaskModal } from './components/AddTaskModal';
import type { Task } from './types';
import { format } from 'date-fns';

function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('family-tasks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse tasks", e);
      }
    }
    return [
      { id: '1', title: 'Buy Groceries', date: format(new Date(), 'yyyy-MM-dd'), isCompleted: false, assignee: 'Mom', category: 'Chore', startTime: '10:00', durationMinutes: 60 },
      { id: '2', title: 'Soccer Practice', date: format(new Date(), 'yyyy-MM-dd'), isCompleted: false, assignee: 'Kid', category: 'Event', startTime: '16:00', durationMinutes: 90 },
      { id: '3', title: 'Family Game Night', date: format(new Date(), 'yyyy-MM-dd'), isCompleted: false, assignee: 'Everyone', category: 'Event', startTime: '19:00', durationMinutes: 120 },
    ];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewDate, setViewDate] = useState<Date>(new Date());

  useEffect(() => {
    localStorage.setItem('family-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
    ));
  };

  const handleAddTaskClick = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleAddTaskSubmit = (newTaskData: Omit<Task, 'id' | 'isCompleted'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: crypto.randomUUID(),
      isCompleted: false,
    };
    setTasks(prev => [...prev, newTask]);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen text-foreground p-8 font-sans selection:bg-primary/20">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              KDM Family Hub
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">Organize your week together.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold shadow-sm text-lg">
              F
            </div>
          </div>
        </header>

        <main className="space-y-8">
          <WeeklyView
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTaskClick}
            currentDate={viewDate}
            onDateChange={setViewDate}
          />
        </main>

        {isModalOpen && (
          <AddTaskModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onAdd={handleAddTaskSubmit}
            initialDate={selectedDate}
          />
        )}
      </div>
    </div>
  );
}

export default App;
