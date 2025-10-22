import React from "react";
import { motion } from "framer-motion";
import { useSchedulerStore } from "../store/schedulerStore";

const ControlPanel: React.FC = () => {
  const { runningTask, feedback, isPaused, quantum } = useSchedulerStore();

  return (
    <motion.div
      className={`
          p-4 rounded-lg text-center font-bold text-lg
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
      {isPaused && <span className="mr-2">⏸️</span>}
      {!isPaused && <span className="mr-2">▶️</span>}
      {feedback}
      {runningTask && (
        <span>
          TIME ELAPSED: {runningTask.quantumUsed}/{quantum}
        </span>
      )}
    </motion.div>
  );
};

export default ControlPanel;
