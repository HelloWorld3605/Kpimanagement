import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { TaskCatalog } from '../types/catalog';
import { taskCatalogs } from '../data/taskCatalog';
import { useSyncedCollection } from '../hooks/useSyncedCollection';

type TaskCatalogContextValue = {
  tasks: TaskCatalog[];
  addTask: (task: TaskCatalog) => void;
  updateTask: (code: string, updater: (t: TaskCatalog) => TaskCatalog) => void;
};

const TaskCatalogContext = createContext<TaskCatalogContextValue | null>(null);

export function TaskCatalogProvider({ children }: {children: React.ReactNode;}) {
  const [tasks, setTasks] = useSyncedCollection<TaskCatalog>('taskCatalog', (t) => t.code, taskCatalogs);

  const addTask = useCallback((task: TaskCatalog) => setTasks((prev) => [...prev, task]), []);
  const updateTask = useCallback(
    (code: string, updater: (t: TaskCatalog) => TaskCatalog) =>
    setTasks((prev) => prev.map((t) => t.code === code ? updater(t) : t)),
    []
  );

  const value = useMemo(() => ({ tasks, addTask, updateTask }), [tasks, addTask, updateTask]);
  return <TaskCatalogContext.Provider value={value}>{children}</TaskCatalogContext.Provider>;
}

export function useTaskCatalog() {
  const ctx = useContext(TaskCatalogContext);
  if (!ctx) throw new Error('useTaskCatalog must be used inside TaskCatalogProvider');
  return ctx;
}