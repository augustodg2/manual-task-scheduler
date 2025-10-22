import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { Task } from "../types";
import TaskCard from "./TaskCard";

interface StatusAreaProps {
  title: string;
  tasks: Task[];
  statusType: "ready" | "running" | "blocked" | "terminated";
  isDropTarget?: boolean;
  children?: React.ReactNode;
}

const StatusArea: React.FC<StatusAreaProps> = ({
  title,
  tasks,
  statusType,
  isDropTarget = false,
  children,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: statusType,
    disabled: !isDropTarget,
  });

  const getStatusColor = (type: string) => {
    switch (type) {
      case "ready":
        return "from-blue-50 to-blue-100 border-blue-300";
      case "running":
        return "from-green-50 to-green-100 border-green-300";
      case "blocked":
        return "from-orange-50 to-orange-100 border-orange-300";
      case "terminated":
        return "from-gray-50 to-gray-100 border-gray-300";
      default:
        return "from-white to-gray-50 border-gray-300";
    }
  };

  const getStatusIcon = (type: string) => {
    switch (type) {
      case "ready":
        return "⏳";
      case "running":
        return "🏃";
      case "blocked":
        return "🚫";
      case "terminated":
        return "✅";
      default:
        return "📋";
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      className={`
        flex-1 min-h-[400px] p-4 rounded-xl border-2 bg-gradient-to-br
        ${getStatusColor(statusType)}
        ${
          isOver && isDropTarget
            ? "ring-4 ring-blue-400 ring-opacity-50 scale-105"
            : ""
        }
        ${isDropTarget && tasks.length === 0 ? "animate-pulse shadow-lg" : ""}
        transition-all duration-300
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-current border-opacity-20">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span className="text-2xl">{getStatusIcon(statusType)}</span>
          {title}
        </h3>
        <span className="text-sm font-semibold text-gray-600 bg-white px-2 py-1 rounded">
          {tasks.length}
        </span>
      </div>

      {/* Drop Zone Indicator */}
      {isDropTarget && tasks.length === 0 && (
        <motion.div
          className="h-32 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-center">
            <div className="text-4xl mb-2">🎯</div>
            <div className="text-sm font-medium">Drop task here</div>
          </div>
        </motion.div>
      )}

      {/* Tasks Container */}
      <div className="space-y-3 min-h-[200px]">
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: statusType === "running" ? 100 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.3,
              delay: index * 0.1,
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            <TaskCard
              task={task}
              isDraggable={statusType === "ready"}
              isExecuting={statusType === "running"}
            />
          </motion.div>
        ))}
      </div>

      {/* Additional Content */}
      {children}
    </motion.div>
  );
};

export default StatusArea;
