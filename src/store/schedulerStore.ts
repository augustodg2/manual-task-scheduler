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
  tempoExecucao: 0, // Initialize execution time to 0
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
  cpuExecutionTime: 0,
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
        tempoRestante: 8,
        prioridade: 3 as const,
        eventoBloqueio: 2, // Blocks very early - showcases priority + I/O
        tempoEspera: 0,
        tempoExecucao: 0,
        state: "ready" as const,
      },
      {
        id: "2",
        tempoRestante: 6,
        prioridade: 2 as const,
        eventoBloqueio: 4, // Blocks mid-execution
        tempoEspera: 0,
        tempoExecucao: 0,
        state: "ready" as const,
      },
      {
        id: "3",
        tempoRestante: 4,
        prioridade: 2 as const,
        eventoBloqueio: 2, // Short task, blocks early
        tempoEspera: 0,
        tempoExecucao: 0,
        state: "ready" as const,
      },
      {
        id: "4",
        tempoRestante: 10,
        prioridade: 1 as const,
        eventoBloqueio: 7, // Long task, blocks very late - tests starvation
        tempoEspera: 0,
        tempoExecucao: 0,
        state: "ready" as const,
      },
      {
        id: "5",
        tempoRestante: 5,
        prioridade: 3 as const,
        eventoBloqueio: 3, // High priority, blocks after several ticks
        tempoEspera: 0,
        tempoExecucao: 0,
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

    // Increment tempoExecucao for all tasks during context switch
    const updatedReadyQueue = state.readyQueue
      .filter((t) => t.id !== taskId)
      .map((t) => ({
        ...t,
        tempoExecucao: (t.tempoExecucao || 0) + state.contextSwitchCost,
        tempoEspera: t.tempoEspera + state.contextSwitchCost,
      }));

    const updatedBlockedTasks = state.blockedTasks.map((t) => ({
      ...t,
      tempoExecucao: (t.tempoExecucao || 0) + state.contextSwitchCost,
    }));

    set((prev) => ({
      readyQueue: updatedReadyQueue,
      blockedTasks: updatedBlockedTasks,
      runningTask: {
        ...task,
        quantumUsed: 0,
        state: "running",
        tempoExecucao: (task.tempoExecucao || 0) + state.contextSwitchCost,
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
    const newTempoExecucao = (task.tempoExecucao || 0) + 1;

    // Increment tempoExecucao for all active tasks (ready, running, blocked)
    // Also increment tempoEspera for tasks in ready queue (waiting to execute)
    const incrementReadyTaskTime = (task: Task) => ({
      ...task,
      tempoExecucao: (task.tempoExecucao || 0) + 1,
      tempoEspera: task.tempoEspera + 1,
    });

    // Decrement I/O timers when kernel time advances and increment tempoExecucao
    const updatedBlockedTasks = state.blockedTasks.map((blockedTask) => ({
      ...blockedTask,
      tempoExecucao: (blockedTask.tempoExecucao || 0) + 1,
      ioTimer:
        blockedTask.ioTimer && blockedTask.ioTimer > 0
          ? blockedTask.ioTimer - 1
          : blockedTask.ioTimer,
    }));

    // Increment tempoExecucao and tempoEspera for ready queue tasks
    const updatedReadyQueue = state.readyQueue.map(incrementReadyTaskTime);

    // Check for I/O completion during this tick
    const stillBlockedTasks = updatedBlockedTasks.filter(
      (task) => task.ioTimer && task.ioTimer > 0
    );
    const ioCompletedTasks = updatedBlockedTasks
      .filter((task) => task.ioTimer === 0)
      .map((task) => ({
        ...task,
        eventoBloqueio: Math.floor(Math.random() * 8) + 3,
        ioTimer: undefined,
        state: "ready" as const,
      }));

    // Check for completion
    if (newTempoRestante <= 0) {
      const newTerminatedTasks = [
        ...state.terminatedTasks,
        {
          ...task,
          tempoRestante: 0,
          tempoExecucao: newTempoExecucao,
          state: "terminated" as const,
        },
      ];

      // Determine feedback and pause state based on available tasks
      let feedback = "DECISION REQUIRED";
      let shouldPause = true;

      const newReadyQueue = [...updatedReadyQueue, ...ioCompletedTasks];

      if (newReadyQueue.length === 0) {
        if (stillBlockedTasks.length === 0) {
          // No tasks available at all
          feedback = "CPU IDLE";
        } else {
          // Tasks are blocked, CPU is idle
          feedback = "CPU IDLE - WAITING FOR I/O COMPLETION";
          shouldPause = false; // Don't pause, let time advance
        }
      }

      set((prev) => ({
        runningTask: null,
        terminatedTasks: newTerminatedTasks,
        blockedTasks: stillBlockedTasks,
        readyQueue: newReadyQueue,
        globalTime: prev.globalTime + 1,
        cpuExecutionTime: prev.cpuExecutionTime + 1,
        feedback,
        isPaused: shouldPause,
        isExecuting: false,
      }));
      return;
    }

    // Check for I/O block
    if (newEventoBloqueio <= 0) {
      const newBlockedTasks = [
        ...stillBlockedTasks,
        {
          ...task,
          eventoBloqueio: 0,
          ioTimer: 10,
          tempoRestante: newTempoRestante,
          tempoExecucao: newTempoExecucao,
          state: "blocked" as const,
        },
      ];

      // Determine feedback and pause state
      let feedback = "DECISION REQUIRED";
      let shouldPause = true;

      const newReadyQueue = [...updatedReadyQueue, ...ioCompletedTasks];

      if (newReadyQueue.length === 0) {
        // No tasks ready, CPU is idle
        feedback = "CPU IDLE - WAITING FOR I/O COMPLETION";
        shouldPause = false; // Don't pause, let time advance
      }

      set((prev) => ({
        runningTask: null,
        blockedTasks: newBlockedTasks,
        readyQueue: newReadyQueue,
        globalTime: prev.globalTime + 1,
        cpuExecutionTime: prev.cpuExecutionTime + 1,
        feedback,
        isPaused: shouldPause,
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
        tempoExecucao: newTempoExecucao,
      },
      blockedTasks: stillBlockedTasks,
      readyQueue: [...updatedReadyQueue, ...ioCompletedTasks],
      globalTime: prev.globalTime + 1,
      cpuExecutionTime: prev.cpuExecutionTime + 1,
    }));
  },
  updateBlockedTasks: () => {
    const state = get();

    // Only advance time and process I/O when ready queue is empty (CPU is idle)
    if (state.readyQueue.length > 0) return;

    // Decrement I/O timers as kernel time advances and increment tempoExecucao
    const processedTasks = state.blockedTasks.map((task) => ({
      ...task,
      tempoExecucao: (task.tempoExecucao || 0) + 1,
      ioTimer:
        task.ioTimer && task.ioTimer > 0 ? task.ioTimer - 1 : task.ioTimer,
    }));

    // Separate tasks: those still blocked (ioTimer > 0) vs completed (ioTimer === 0)
    const stillBlockedTasks = processedTasks.filter(
      (task) => task.ioTimer && task.ioTimer > 0
    );
    const completedTasks = processedTasks
      .filter((task) => task.ioTimer === 0)
      .map((task) => ({
        ...task,
        eventoBloqueio: Math.floor(Math.random() * 8) + 3,
        ioTimer: undefined,
        state: "ready" as const,
      }));

    // If tasks completed I/O, pause for user decision
    const shouldPause = completedTasks.length > 0;
    const feedback = shouldPause
      ? "DECISION REQUIRED"
      : "CPU IDLE - WAITING FOR I/O COMPLETION";

    set((prev) => ({
      blockedTasks: stillBlockedTasks,
      readyQueue: [...prev.readyQueue, ...completedTasks],
      globalTime: prev.globalTime + 1, // Advance kernel time when CPU is idle
      isPaused: shouldPause || prev.isPaused,
      feedback,
    }));
  },

  calculateMetrics: () => {
    const state = get();
    const cpuIdleTime =
      state.globalTime - state.cpuExecutionTime - state.contextSwitchTime;
    const efficiency =
      state.globalTime > 0
        ? (state.cpuExecutionTime / state.globalTime) * 100
        : 0;

    // Calculate average waiting time by priority (across all task states including terminated)
    const allTasks = [
      ...state.readyQueue,
      ...state.blockedTasks,
      ...state.terminatedTasks,
      ...(state.runningTask ? [state.runningTask] : []),
    ];

    const highPriorityTasks = allTasks.filter((task) => task.prioridade === 3);
    const mediumPriorityTasks = allTasks.filter(
      (task) => task.prioridade === 2
    );
    const lowPriorityTasks = allTasks.filter((task) => task.prioridade === 1);

    const avgHighWait =
      highPriorityTasks.length > 0
        ? highPriorityTasks.reduce((sum, task) => sum + task.tempoEspera, 0) /
          highPriorityTasks.length
        : 0;

    const avgMediumWait =
      mediumPriorityTasks.length > 0
        ? mediumPriorityTasks.reduce((sum, task) => sum + task.tempoEspera, 0) /
          mediumPriorityTasks.length
        : 0;

    const avgLowWait =
      lowPriorityTasks.length > 0
        ? lowPriorityTasks.reduce((sum, task) => sum + task.tempoEspera, 0) /
          lowPriorityTasks.length
        : 0;

    // Calculate average executing time by priority (across all task states including terminated)
    const avgHighExec =
      highPriorityTasks.length > 0
        ? highPriorityTasks.reduce(
            (sum, task) => sum + (task.tempoExecucao || 0),
            0
          ) / highPriorityTasks.length
        : 0;

    const avgMediumExec =
      mediumPriorityTasks.length > 0
        ? mediumPriorityTasks.reduce(
            (sum, task) => sum + (task.tempoExecucao || 0),
            0
          ) / mediumPriorityTasks.length
        : 0;

    const avgLowExec =
      lowPriorityTasks.length > 0
        ? lowPriorityTasks.reduce(
            (sum, task) => sum + (task.tempoExecucao || 0),
            0
          ) / lowPriorityTasks.length
        : 0;

    return {
      globalTime: state.globalTime,
      contextSwitchTime: state.contextSwitchTime,
      cpuRunningTime: state.cpuExecutionTime,
      cpuIdleTime: Math.max(0, cpuIdleTime), // Ensure non-negative
      efficiency: Math.round(efficiency * 100) / 100,
      avgWaitingTimeByPriority: {
        high: Math.round(avgHighWait * 100) / 100,
        medium: Math.round(avgMediumWait * 100) / 100,
        low: Math.round(avgLowWait * 100) / 100,
      },
      avgExecutingTimeByPriority: {
        high: Math.round(avgHighExec * 100) / 100,
        medium: Math.round(avgMediumExec * 100) / 100,
        low: Math.round(avgLowExec * 100) / 100,
      },
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
        feedback: "CPU IDLE",
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
