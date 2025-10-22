import React from "react";
import { motion } from "framer-motion";
import { useSchedulerStore } from "../store/schedulerStore";
import PriorityMetricsPanel from "./PriorityMetricsPanel";

const MetricsPanel: React.FC = () => {
  const { calculateMetrics } = useSchedulerStore();
  const metrics = calculateMetrics();

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 80) return "text-green-600";
    if (efficiency >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getEfficiencyIcon = (efficiency: number) => {
    if (efficiency >= 80) return "🟢";
    if (efficiency >= 60) return "🟡";
    return "🔴";
  };

  return (
    <motion.div
      className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl shadow-lg p-6 mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <h3 className="text-xl font-bold mb-4 text-center">
        📊 Performance Metrics
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Global Kernel Time */}
        <motion.div
          className="bg-white/10 rounded-lg p-4 backdrop-blur"
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-sm opacity-75 mb-1">Global Kernel Time</div>
          <div className="text-3xl font-bold">
            {metrics.globalTime}
            <span className="text-lg ml-1 opacity-75">u</span>
          </div>
          <div className="text-xs opacity-50 mt-1">Total time elapsed</div>
        </motion.div>

        {/* Context Switch Time */}
        <motion.div
          className="bg-white/10 rounded-lg p-4 backdrop-blur"
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-sm opacity-75 mb-1">Context Switch Time</div>
          <div className="text-3xl font-bold">
            {metrics.contextSwitchTime}
            <span className="text-lg ml-1 opacity-75">u</span>
          </div>
          <div className="text-xs opacity-50 mt-1">
            Cumulative t<sub>tc</sub>
          </div>
        </motion.div>

        {/* Efficiency */}
        <motion.div
          className="bg-white/10 rounded-lg p-4 backdrop-blur"
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-sm opacity-75 mb-1 flex items-center gap-2">
            Efficiency (ℰ)
            <span className="text-lg">
              {getEfficiencyIcon(metrics.efficiency)}
            </span>
          </div>
          <div
            className={`text-3xl font-bold ${getEfficiencyColor(
              metrics.efficiency
            )}`}
          >
            {metrics.efficiency.toFixed(1)}%
          </div>
          <div className="text-xs opacity-50 mt-1">CPU utilization</div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MetricsPanel;
