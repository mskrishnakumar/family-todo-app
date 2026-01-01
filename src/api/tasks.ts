import type { Task } from '../types';

const API_BASE = '/api';

export async function fetchTasks(familyCode: string): Promise<Task[]> {
    const response = await fetch(`${API_BASE}/tasks?familyCode=${encodeURIComponent(familyCode)}`);
    if (!response.ok) {
        throw new Error('Failed to fetch tasks');
    }
    return response.json();
}

export async function createTask(familyCode: string, task: Omit<Task, 'id' | 'isCompleted'>): Promise<Task> {
    const response = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            familyCode,
            task: {
                ...task,
                id: crypto.randomUUID(),
                isCompleted: false
            }
        })
    });
    if (!response.ok) {
        throw new Error('Failed to create task');
    }
    return response.json();
}

export async function updateTask(familyCode: string, task: Task): Promise<Task> {
    const response = await fetch(`${API_BASE}/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ familyCode, task })
    });
    if (!response.ok) {
        throw new Error('Failed to update task');
    }
    return response.json();
}

export async function deleteTask(familyCode: string, taskId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/tasks/${taskId}?familyCode=${encodeURIComponent(familyCode)}`, {
        method: 'DELETE'
    });
    if (!response.ok) {
        throw new Error('Failed to delete task');
    }
}
