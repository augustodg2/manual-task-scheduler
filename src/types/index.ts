export interface Task {
  id: string;
  tempoRestante: number;
  prioridade: 1 | 2 | 3; // Low, Medium, High
  eventoBloqueio: number;
  tempoEspera: number; // NEW: Individual waiting time counter
  tempoExecucao?: number; // Total execution time (CPU time)
  ioTimer?: number;
  quantumUsed?: number;
  state: TaskState;
}

export type TaskState = "ready" | "running" | "blocked" | "terminated";

export interface SimulationState {
  tasks: Task[];
  readyQueue: Task[];
  runningTask: Task | null;
  blockedTasks: Task[];
  terminatedTasks: Task[];
  globalTime: number;
  contextSwitchTime: number;
  cpuExecutionTime: number; // Time spent executing tasks (not idle)
  quantum: number;
  contextSwitchCost: number;
  isPaused: boolean;
  feedback: string;
  isExecuting: boolean;
}

export interface Metrics {
  globalTime: number;
  contextSwitchTime: number;
  cpuRunningTime: number;
  cpuIdleTime: number;
  efficiency: number;
  avgWaitingTimeByPriority: {
    high: number;
    medium: number;
    low: number;
  };
  avgExecutingTimeByPriority: {
    high: number;
    medium: number;
    low: number;
  };
}
