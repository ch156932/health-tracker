import { useState, useEffect, useCallback } from 'react';
import type { User, FoodEntry, ExerciseEntry, BodyMetric } from '../types';
import { generateSampleData } from './sampleData';

interface AppState {
  users: User[];
  currentUserId: string;
  foodEntries: FoodEntry[];
  exerciseEntries: ExerciseEntry[];
  bodyMetrics: BodyMetric[];
}

const STORAGE_KEY = 'health_tracker_data';

function loadState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return generateSampleData();
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

let globalState: AppState = loadState();
let listeners: (() => void)[] = [];

function notify() {
  listeners.forEach(fn => fn());
}

export function useStore() {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const handler = () => forceUpdate(n => n + 1);
    listeners.push(handler);
    return () => { listeners = listeners.filter(fn => fn !== handler); };
  }, []);

  const setState = useCallback((updater: (prev: AppState) => AppState) => {
    globalState = updater(globalState);
    saveState(globalState);
    notify();
  }, []);

  const currentUser = globalState.users.find(u => u.id === globalState.currentUserId) ?? globalState.users[0];

  // ===== 用户操作 =====
  const addUser = (user: Omit<User, 'id'>) => {
    const newUser: User = { ...user, id: Date.now().toString() };
    setState(s => ({ ...s, users: [...s.users, newUser] }));
  };

  const updateUser = (user: User) => {
    setState(s => ({ ...s, users: s.users.map(u => u.id === user.id ? user : u) }));
  };

  const deleteUser = (id: string) => {
    setState(s => ({
      ...s,
      users: s.users.filter(u => u.id !== id),
      currentUserId: s.currentUserId === id ? (s.users.find(u => u.id !== id)?.id ?? '') : s.currentUserId,
      foodEntries: s.foodEntries.filter(e => e.userId !== id),
      exerciseEntries: s.exerciseEntries.filter(e => e.userId !== id),
      bodyMetrics: s.bodyMetrics.filter(m => m.userId !== id),
    }));
  };

  const switchUser = (id: string) => {
    setState(s => ({ ...s, currentUserId: id }));
  };

  // ===== 饮食操作 =====
  const addFoodEntry = (entry: Omit<FoodEntry, 'id'>) => {
    const newEntry: FoodEntry = { ...entry, id: Date.now().toString() };
    setState(s => ({ ...s, foodEntries: [...s.foodEntries, newEntry] }));
  };

  const deleteFoodEntry = (id: string) => {
    setState(s => ({ ...s, foodEntries: s.foodEntries.filter(e => e.id !== id) }));
  };

  const getFoodEntriesByDate = (userId: string, date: string) => {
    return globalState.foodEntries.filter(e => e.userId === userId && e.date === date);
  };

  // ===== 运动操作 =====
  const addExerciseEntry = (entry: Omit<ExerciseEntry, 'id'>) => {
    const newEntry: ExerciseEntry = { ...entry, id: Date.now().toString() };
    setState(s => ({ ...s, exerciseEntries: [...s.exerciseEntries, newEntry] }));
  };

  const deleteExerciseEntry = (id: string) => {
    setState(s => ({ ...s, exerciseEntries: s.exerciseEntries.filter(e => e.id !== id) }));
  };

  const getExerciseEntriesByDate = (userId: string, date: string) => {
    return globalState.exerciseEntries.filter(e => e.userId === userId && e.date === date);
  };

  // ===== 身体指标操作 =====
  const addBodyMetric = (metric: Omit<BodyMetric, 'id'>) => {
    const newMetric: BodyMetric = { ...metric, id: Date.now().toString() };
    setState(s => ({
      ...s,
      bodyMetrics: [
        ...s.bodyMetrics.filter(m => !(m.userId === metric.userId && m.date === metric.date)),
        newMetric,
      ],
    }));
  };

  const importBodyMetrics = (metrics: Omit<BodyMetric, 'id'>[]) => {
    setState(s => {
      const newMetrics = metrics.map(m => ({ ...m, id: `${m.userId}_${m.date}_${Date.now()}` }));
      const existingDates = new Set(newMetrics.map(m => `${m.userId}_${m.date}`));
      return {
        ...s,
        bodyMetrics: [
          ...s.bodyMetrics.filter(m => !existingDates.has(`${m.userId}_${m.date}`)),
          ...newMetrics,
        ],
      };
    });
  };

  const getBodyMetricsByUser = (userId: string) => {
    return globalState.bodyMetrics
      .filter(m => m.userId === userId)
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const getLatestMetric = (userId: string): BodyMetric | undefined => {
    const metrics = getBodyMetricsByUser(userId);
    return metrics[metrics.length - 1];
  };

  const resetData = () => {
    globalState = generateSampleData();
    saveState(globalState);
    notify();
  };

  return {
    ...globalState,
    currentUser,
    addUser, updateUser, deleteUser, switchUser,
    addFoodEntry, deleteFoodEntry, getFoodEntriesByDate,
    addExerciseEntry, deleteExerciseEntry, getExerciseEntriesByDate,
    addBodyMetric, importBodyMetrics, getBodyMetricsByUser, getLatestMetric,
    resetData,
  };
}
