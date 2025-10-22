import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { Task } from "../types";
import { useSchedulerStore } from "../store/schedulerStore";

interface TaskCardProps {
  task: Task;
  isDraggable?: boolean;
  isExecuting?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isDraggable = false,
  isExecuting = false,
}) => {
  const interruptRunningTask = useSchedulerStore(
    (state) => state.interruptRunningTask
  );

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      disabled: !isDraggable,
    });

  const getPriorityColor = (prioridade: number) => {
    switch (prioridade) {
      case 3:
        return "bg-red-500 border-red-600 text-white"; // High
      case 2:
        return "bg-yellow-500 border-yellow-600 text-white"; // Medium
      case 1:
        return "bg-green-500 border-green-600 text-white"; // Low
      default:
        return "bg-gray-500 border-gray-600 text-white";
    }
  };

  const getPriorityLabel = (prioridade: number) => {
    switch (prioridade) {
      case 3:
        return "HIGH";
      case 2:
        return "MEDIUM";
      case 1:
        return "LOW";
      default:
        return "LOW";
    }
  };

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const handleInterrupt = (e: React.MouseEvent) => {
    e.stopPropagation();
    interruptRunningTask();
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        relative p-4 rounded-lg border-2 cursor-move transition-all duration-200
        ${getPriorityColor(task.prioridade)}
        ${isDragging ? "opacity-50 scale-105 shadow-2xl" : "hover:shadow-lg"}
        ${
          isExecuting
            ? "animate-pulse ring-4 ring-blue-400 ring-opacity-50"
            : ""
        }
        ${!isDraggable ? "cursor-not-allowed opacity-75" : ""}
      `}
      whileHover={isDraggable ? { scale: 1.02 } : {}}
      whileTap={isDraggable ? { scale: 0.98 } : {}}
      layout
    >
      {/* Task ID */}
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold mb-2 opacity-75">PID: {task.id}</div>
        <div className="text-xs px-2 py-1 bg-white/20 rounded">
          {getPriorityLabel(task.prioridade)}
        </div>
      </div>

      {/* Time Remaining - Most Prominent */}
      <div className="text-3xl font-bold mb-3 text-center">
        {task.tempoRestante}
      </div>
      <div className="flex border-t border-white/30 items-start justify-between pt-3">
        {/* I/O Event Counter */}
        <div>
          <div className="text-xs opacity-75">I/O Event</div>
          <div className="text-lg font-semibold text-center">
            {task.eventoBloqueio}
          </div>
        </div>

        {task.state === "terminated" && (
          <div>
            <div className="text-xs opacity-75">🔁 Tempo de execução</div>
          </div>
        )}

        {task.state === "ready" && (
          <div>
            <div className="text-xs opacity-75">⏰ Tempo de espera</div>
            <div className="text-lg font-semibold text-center">
              {task.tempoEspera}
            </div>
          </div>
        )}

        {/* I/O Timer for blocked tasks */}
        {task.ioTimer !== undefined && (
          <div>
            <div className="text-xs opacity-75">Timer E/S</div>
            <div className="text-lg font-semibold text-center">
              {task.ioTimer}
            </div>
          </div>
        )}
      </div>

      {/* Interrupt Button - Full width at bottom */}
      {isExecuting && (
        <motion.button
          onClick={handleInterrupt}
          className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold shadow-lg z-10 cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ⏸ INTERRUPT
        </motion.button>
      )}

      {/* Execution Progress */}
      {isExecuting && (
        <div className="absolute -bottom-1 left-0 right-0 h-1 bg-blue-400 rounded-b-lg">
          <motion.div
            className="h-full bg-blue-600 rounded-bl-lg"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      )}
    </motion.div>
  );
};

export default TaskCard;
