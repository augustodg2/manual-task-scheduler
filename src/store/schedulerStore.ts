import { create } from "zustand";
import { Task, SimulationState, TaskState, Metrics } from "../types";

interface SchedulerStore extends SimulationState {
  // Actions
  createTask: () => void;
  restartSimulation: () => void;
  setQuantum: (quantum: number) => void;
  setContextSwitchCost: (cost: number) => void;
  moveTaskToRunning: (taskId: string) => void;
  executeTick: () => void;
  updateBlockedTasks: () => void;
  updateWaitingTimes: () => void;
  advanceGlobalTimeWhenEmpty: () => void;
  calculateMetrics: () => Metrics;
  calculatePriorityMetrics: () => { high: number; medium: number; low: number };
  setFeedback: (message: string) => void;
  setIsExecuting: (executing: boolean) => void;
  interruptRunningTask: () => void;
}

const generateRandomTask = (id: string): Task => ({
  id,
  tempoRestante: Math.floor(Math.random() * 15) + 10, // 10-25
  prioridade: (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3,
  eventoBloqueio: Math.floor(Math.random() * 8) + 3, // 3-11
  tempoEspera: 0, // Initialize waiting time to 0
  state: "ready",
});

const initialState: SimulationState = {
  tasks: [],
  readyQueue: [],
  runningTask: null,
  blockedTasks: [],
  terminatedTasks: [],
  globalTime: 0,
  contextSwitchTime: 0,
  quantum: 5,
  contextSwitchCost: 1,
  isPaused: true,
  feedback: "DECISION REQUIRED",
  isExecuting: false,
};

export const useSchedulerStore = create<SchedulerStore>((set, get) => ({
  ...initialState,

  createTask: () => {
    const state = get();
    const newId = `T${state.tasks.length + 1}`;
    const newTask = generateRandomTask(newId);

    set((prev) => ({
      tasks: [...prev.tasks, newTask],
      readyQueue: [...prev.readyQueue, newTask],
    }));
  },

  restartSimulation: () => {
    const tasks = [
      {
        id: "1",
        tempoRestante: 15,
        prioridade: 3 as const,
        eventoBloqueio: 5,
        tempoEspera: 0,
        state: "ready" as const,
      },
      {
        id: "2",
        tempoRestante: 13,
        prioridade: 2 as const,
        eventoBloqueio: 7,
        tempoEspera: 0,
        state: "ready" as const,
      },
      {
        id: "3",
        tempoRestante: 4,
        prioridade: 2 as const,
        eventoBloqueio: 3,
        tempoEspera: 0,
        state: "ready" as const,
      },
      {
        id: "4",
        tempoRestante: 20,
        prioridade: 1 as const,
        eventoBloqueio: 10,
        tempoEspera: 0,
        state: "ready" as const,
      },
      {
        id: "5",
        tempoRestante: 7,
        prioridade: 3 as const,
        eventoBloqueio: 3,
        tempoEspera: 0,
        state: "ready" as const,
      },
    ];

    set({
      ...initialState,
      tasks,
      readyQueue: tasks,
    });
  },

  setQuantum: (quantum: number) => set({ quantum }),
  setContextSwitchCost: (cost: number) => set({ contextSwitchCost: cost }),

  moveTaskToRunning: (taskId: string) => {
    const state = get();
    const task = state.readyQueue.find((t) => t.id === taskId);

    if (!task || state.runningTask) return;

    // Apply context switch cost
    const newGlobalTime = state.globalTime + state.contextSwitchCost;
    const newContextSwitchTime =
      state.contextSwitchTime + state.contextSwitchCost;

    set((prev) => ({
      readyQueue: prev.readyQueue.filter((t) => t.id !== taskId),
      runningTask: {
        ...task,
        quantumUsed: 0,
        state: "running",
      }, // Reset waiting time
      globalTime: newGlobalTime,
      contextSwitchTime: newContextSwitchTime,
      feedback: `EXECUTING ${taskId}`,
      isPaused: false,
      isExecuting: true,
    }));
  },

  executeTick: () => {
    const state = get();
    if (!state.runningTask || !state.isExecuting) return;

    const task = state.runningTask;
    const newTempoRestante = task.tempoRestante - 1;
    const newEventoBloqueio = task.eventoBloqueio - 1;
    const newQuantumUsed = (task.quantumUsed || 0) + 1;

    // Check for completion
    if (newTempoRestante <= 0) {
      set((prev) => ({
        runningTask: null,
        terminatedTasks: [
          ...prev.terminatedTasks,
          { ...task, tempoRestante: 0, state: "terminated" },
        ],
        globalTime: prev.globalTime + 1,
        feedback: "DECISION REQUIRED",
        isPaused: true,
        isExecuting: false,
      }));
      return;
    }

    // Check for I/O block
    if (newEventoBloqueio <= 0) {
      set((prev) => ({
        runningTask: null,
        blockedTasks: [
          ...prev.blockedTasks,
          {
            ...task,
            eventoBloqueio: 0,
            ioTimer: 10,
            tempoRestante: newTempoRestante,
            state: "blocked",
          },
        ],
        globalTime: prev.globalTime + 1,
        feedback: "DECISION REQUIRED",
        isPaused: true,
        isExecuting: false,
      }));
      return;
    }

    // Continue execution
    set((prev) => ({
      runningTask: {
        ...task,
        tempoRestante: newTempoRestante,
        eventoBloqueio: newEventoBloqueio,
        quantumUsed: newQuantumUsed,
      },
      globalTime: prev.globalTime + 1,
    }));
  },

  updateBlockedTasks: () => {
    const state = get();
    const updatedBlockedTasks = state.blockedTasks
      .map((task) => {
        if (task.ioTimer && task.ioTimer > 0) {
          return { ...task, ioTimer: task.ioTimer - 1 };
        }
        return task;
      })
      .filter((task) => task.ioTimer && task.ioTimer > 0);

    const completedTasks = state.blockedTasks
      .filter((task) => task.ioTimer === 0 || task.ioTimer === 1)
      .map((task) => ({
        ...task,
        eventoBloqueio: Math.floor(Math.random() * 8) + 3,
        ioTimer: undefined,
      }));

    set((prev) => ({
      blockedTasks: updatedBlockedTasks,
      readyQueue: [...prev.readyQueue, ...completedTasks],
    }));
  },

  calculateMetrics: () => {
    const state = get();
    const efficiency =
      state.globalTime > 0
        ? ((state.globalTime - state.contextSwitchTime) / state.globalTime) *
          100
        : 0;

    return {
      globalTime: state.globalTime,
      contextSwitchTime: state.contextSwitchTime,
      efficiency: Math.round(efficiency * 100) / 100,
    };
  },

  updateWaitingTimes: () => {
    set((prev) => ({
      readyQueue: prev.readyQueue.map((task) => ({
        ...task,
        tempoEspera: task.tempoEspera + 1,
      })),
    }));
  },

  advanceGlobalTimeWhenEmpty: () => {
    const state = get();

    // Only advance if no tasks are in ready, running, or blocked (only terminated tasks remain)
    if (
      state.readyQueue.length === 0 &&
      !state.runningTask &&
      state.blockedTasks.length === 0
    ) {
      set((prev) => ({
        globalTime: prev.globalTime + 1,
        feedback: "NO TASKS AVAILABLE - ADVANCING TIME",
      }));
    }
  },

  calculatePriorityMetrics: () => {
    const state = get();

    const highPriorityTasks = state.readyQueue.filter(
      (task) => task.prioridade === 3
    );
    const highPriorityWait =
      highPriorityTasks.length > 0
        ? highPriorityTasks.reduce((sum, task) => sum + task.tempoEspera, 0) /
          highPriorityTasks.length
        : 0;

    const mediumPriorityTasks = state.readyQueue.filter(
      (task) => task.prioridade === 2
    );
    const mediumPriorityWait =
      mediumPriorityTasks.length > 0
        ? mediumPriorityTasks.reduce((sum, task) => sum + task.tempoEspera, 0) /
          mediumPriorityTasks.length
        : 0;

    const lowPriorityTasks = state.readyQueue.filter(
      (task) => task.prioridade === 1
    );
    const lowPriorityWait =
      lowPriorityTasks.length > 0
        ? lowPriorityTasks.reduce((sum, task) => sum + task.tempoEspera, 0) /
          lowPriorityTasks.length
        : 0;

    return {
      high: highPriorityWait,
      medium: mediumPriorityWait,
      low: lowPriorityWait,
    };
  },

  setFeedback: (message: string) => set({ feedback: message }),
  setIsExecuting: (executing: boolean) => set({ isExecuting: executing }),

  interruptRunningTask: () => {
    const state = get();
    if (!state.runningTask) return;

    const task = state.runningTask;

    set((prev) => ({
      runningTask: null,
      readyQueue: [
        ...prev.readyQueue,
        {
          ...task,
          quantumUsed: 0,
          state: "ready",
        },
      ],
      feedback: "TASK INTERRUPTED - DECISION REQUIRED",
      isPaused: true,
      isExecuting: false,
    }));
  },
}));
