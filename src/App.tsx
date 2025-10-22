import React, { useEffect, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import { motion } from "framer-motion";
import { useSchedulerStore } from "./store/schedulerStore";
import ControlPanel from "./components/ControlPanel";
import StatusArea from "./components/StatusArea";
import MetricsPanel from "./components/MetricsPanel";
import PriorityMetricsPanel from "./components/PriorityMetricsPanel";
import InstructionsPanel from "./components/InstructionsPanel";

const App: React.FC = () => {
  const {
    readyQueue,
    runningTask,
    blockedTasks,
    terminatedTasks,
    isPaused,
    isExecuting,
    moveTaskToRunning,
    executeTick,
    updateBlockedTasks,
    advanceGlobalTimeWhenEmpty,
    restartSimulation,
  } = useSchedulerStore();

  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  // Initialize simulation with 5 tasks
  useEffect(() => {
    restartSimulation();
  }, []);

  // Handle execution loop
  useEffect(() => {
    if (!isPaused && isExecuting) {
      const interval = setInterval(() => {
        executeTick();
      }, 1000); // Execute every 1 second for visual clarity

      return () => clearInterval(interval);
    }
  }, [isPaused, isExecuting, executeTick]);

  // Handle blocked tasks I/O completion - only when ready queue is empty (CPU idle)
  useEffect(() => {
    // Advance kernel time and process I/O only when:
    // 1. Ready queue is empty (CPU would be idle)
    // 2. There are blocked tasks
    // 3. No task is currently executing
    // 4. System is not paused
    if (
      !isPaused &&
      readyQueue.length === 0 &&
      blockedTasks.length > 0 &&
      !isExecuting
    ) {
      const interval = setInterval(() => {
        updateBlockedTasks();
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [
    isPaused,
    readyQueue.length,
    blockedTasks.length,
    isExecuting,
    updateBlockedTasks,
  ]);

  // Handle automatic global time advancement when no tasks are available
  useEffect(() => {
    if (
      isPaused &&
      readyQueue.length === 0 &&
      !runningTask &&
      blockedTasks.length === 0
    ) {
      const interval = setInterval(() => {
        advanceGlobalTimeWhenEmpty();
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [
    isPaused,
    readyQueue.length,
    runningTask,
    blockedTasks.length,
    advanceGlobalTimeWhenEmpty,
  ]);

  const handleDragStart = (event: DragStartEvent) => {
    setDraggedTask(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedTask(null);

    if (!over) return;

    // Only allow dropping from ready to running
    if (active.id && over.id === "running") {
      moveTaskToRunning(active.id as string);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    // Provide visual feedback for valid drop zones
    if (over && over.id === "running" && draggedTask) {
      // Valid drop zone
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🖥️ Manual Task Scheduler
          </h1>
          <p className="text-lg text-gray-600">
            Drag & Drop CPU Scheduling Simulation
          </p>
        </motion.div>

        {/* Global Metrics Panel */}
        <MetricsPanel />

        {/* Control Panel */}
        <ControlPanel />

        {/* Main Simulation Area */}
        <DndContext
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
        >
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6 mt-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* READY Queue */}
            <StatusArea
              title="Pronta"
              tasks={readyQueue}
              statusType="ready"
              isDropTarget={false}
            />

            {/* RUNNING Zone */}
            <StatusArea
              title="Executando"
              tasks={runningTask ? [runningTask] : []}
              statusType="running"
              isDropTarget={isPaused && readyQueue.length > 0 && !runningTask}
            />

            {/* BLOCKED Zone */}
            <StatusArea
              title="Suspensa"
              tasks={blockedTasks}
              statusType="blocked"
              isDropTarget={false}
            />

            {/* TERMINATED Zone */}
            <StatusArea
              title="Terminada"
              tasks={terminatedTasks}
              statusType="terminated"
              isDropTarget={false}
            />
          </motion.div>
        </DndContext>
      </div>
    </div>
  );
};

export default App;
