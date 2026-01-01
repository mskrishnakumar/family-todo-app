import { useState, useEffect, useCallback } from 'react';
import { WeeklyView } from './components/WeeklyView';
import { AddTaskModal } from './components/AddTaskModal';
import { FamilyCodeModal } from './components/FamilyCodeModal';
import type { Task } from './types';
import { fetchTasks, createTask, updateTask } from './api/tasks';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [familyCode, setFamilyCode] = useState<string>(() => {
    return localStorage.getItem('family-code') || '';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFamilyCodeModal, setShowFamilyCodeModal] = useState(!familyCode);

  // Load tasks from API
  const loadTasks = useCallback(async () => {
    if (!familyCode) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchTasks(familyCode);
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setError('Failed to load tasks. Please try again.');
      // Fall back to localStorage for offline support
      const saved = localStorage.getItem('family-tasks');
      if (saved) {
        try {
          setTasks(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse local tasks:', e);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [familyCode]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Save to localStorage as backup
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('family-tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  const handleFamilyCodeSubmit = (code: string) => {
    localStorage.setItem('family-code', code);
    setFamilyCode(code);
    setShowFamilyCodeModal(false);
  };

  const handleToggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task || !familyCode) return;

    const updatedTask = { ...task, isCompleted: !task.isCompleted };

    // Optimistic update
    setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));

    try {
      await updateTask(familyCode, updatedTask);
    } catch (err) {
      console.error('Failed to update task:', err);
      // Revert on error
      setTasks(prev => prev.map(t => t.id === id ? task : t));
    }
  };

  const handleAddTaskClick = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleAddTaskSubmit = async (newTaskData: Omit<Task, 'id' | 'isCompleted'>) => {
    if (!familyCode) return;

    const tempId = crypto.randomUUID();
    const optimisticTask: Task = {
      ...newTaskData,
      id: tempId,
      isCompleted: false,
    };

    // Optimistic update
    setTasks(prev => [...prev, optimisticTask]);
    setIsModalOpen(false);

    try {
      const createdTask = await createTask(familyCode, newTaskData);
      // Replace temp task with real one
      setTasks(prev => prev.map(t => t.id === tempId ? createdTask : t));
    } catch (err) {
      console.error('Failed to create task:', err);
      // Remove optimistic task on error
      setTasks(prev => prev.filter(t => t.id !== tempId));
      setError('Failed to create task. Please try again.');
    }
  };

  if (showFamilyCodeModal) {
    return <FamilyCodeModal onSubmit={handleFamilyCodeSubmit} />;
  }

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
            <button
              onClick={() => setShowFamilyCodeModal(true)}
              className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              Family: <span className="font-mono font-bold">{familyCode}</span>
            </button>
            <button
              onClick={loadTasks}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {isLoading ? '⟳' : '↻'} Sync
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
            <button onClick={() => setError(null)} className="ml-2 font-bold">×</button>
          </div>
        )}

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
