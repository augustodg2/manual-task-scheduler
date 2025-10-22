export interface Task {
  id: string;
  tempoRestante: number;
  prioridade: 1 | 2 | 3; // Low, Medium, High
  eventoBloqueio: number;
  tempoEspera: number; // NEW: Individual waiting time counter
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
  quantum: number;
  contextSwitchCost: number;
  isPaused: boolean;
  feedback: string;
  isExecuting: boolean;
}

export interface Metrics {
  globalTime: number;
  contextSwitchTime: number;
  efficiency: number;
}
