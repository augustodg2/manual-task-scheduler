import React from "react";
import { motion } from "framer-motion";
import { useSchedulerStore } from "../store/schedulerStore";

const ControlPanel: React.FC = () => {
  const { runningTask, feedback, isPaused, quantum, setIsExecuting } =
    useSchedulerStore();

  const handlePause = () => {
    setIsExecuting(false);
  };

  return (
    <motion.div
      className={`
          p-4 mt-4 rounded-lg text-center font-bold text-lg
          ${
            isPaused
              ? "bg-yellow-100 text-yellow-800 border-2 border-yellow-300"
              : "bg-green-100 text-green-800 border-2 border-green-300"
          }
        `}
      animate={
        isPaused
          ? {
              backgroundColor: ["#fef3c7", "#fde68a", "#fef3c7"],
              transition: { duration: 2, repeat: Infinity },
            }
          : {}
      }
    >
      <div className="flex items-center justify-center gap-4">
        <div className="flex-1 text-center">
          {isPaused && <span className="mr-2">⏸️</span>}
          {!isPaused && <span className="mr-2">▶️</span>}

          {runningTask ? (
            <span>TIME ELAPSED: {runningTask.quantumUsed}</span>
          ) : (
            feedback
          )}
        </div>

        {runningTask && !isPaused && (
          <motion.button
            onClick={handlePause}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold shadow-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ⏸️ Pause
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default ControlPanel;
