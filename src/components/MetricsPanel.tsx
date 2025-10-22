import React from "react";
import { motion } from "framer-motion";
import { useSchedulerStore } from "../store/schedulerStore";

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

  // Calculate percentages for donut chart
  const total = metrics.globalTime || 1;
  const runningPercent = (metrics.cpuRunningTime / total) * 100;
  const idlePercent = (metrics.cpuIdleTime / total) * 100;
  const contextPercent = (metrics.contextSwitchTime / total) * 100;

  // SVG donut chart configuration
  const size = 160;
  const strokeWidth = 30;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate stroke dash offsets for each segment
  const runningDash = (runningPercent / 100) * circumference;
  const idleDash = (idlePercent / 100) * circumference;
  const contextDash = (contextPercent / 100) * circumference;

  return (
    <motion.div
      className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white rounded-xl shadow-2xl p-4 mt-4 border border-gray-700/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <div className="flex items-center justify-center mb-3">
        <div className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          📊 Performance Metrics
        </div>
      </div>

      {/* Top Row: Efficiency and Time Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
        {/* Efficiency Card */}
        <motion.div
          className="bg-gradient-to-br from-white/10 to-white/5 rounded-lg p-3 backdrop-blur-sm border border-white/10 shadow-xl flex flex-col justify-center"
          whileHover={{ scale: 1.01, borderColor: "rgba(255,255,255,0.2)" }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold opacity-75">Eficiência</div>
          </div>
          <div
            className={`text-5xl font-black mb-1 ${getEfficiencyColor(
              metrics.efficiency
            )}`}
          >
            {metrics.efficiency.toFixed(1)}%
          </div>
        </motion.div>

        {/* Time Breakdown - Donut Chart */}
        <motion.div
          className="bg-gradient-to-br from-white/10 to-white/5 rounded-lg p-3 backdrop-blur-sm border border-white/10 shadow-xl"
          whileHover={{ scale: 1.01, borderColor: "rgba(255,255,255,0.2)" }}
          transition={{ duration: 0.2 }}
        >
          <div className="text-xs font-semibold opacity-75 mb-2 text-center">
            Time Distribution
          </div>
          <div className="flex items-center justify-between gap-3">
            <div
              className="relative flex-shrink-0"
              style={{ width: 100, height: 100 }}
            >
              <svg width={100} height={100} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx={50}
                  cy={50}
                  r={35}
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth={20}
                />

                {/* Running segment (green) */}
                <circle
                  cx={50}
                  cy={50}
                  r={35}
                  fill="none"
                  stroke="#4ade80"
                  strokeWidth={20}
                  strokeDasharray={`${(runningPercent / 100) * 220} 220`}
                  strokeDashoffset={0}
                  strokeLinecap="round"
                />

                {/* Idle segment (yellow) */}
                <circle
                  cx={50}
                  cy={50}
                  r={35}
                  fill="none"
                  stroke="#facc15"
                  strokeWidth={20}
                  strokeDasharray={`${(idlePercent / 100) * 220} 220`}
                  strokeDashoffset={-((runningPercent / 100) * 220)}
                  strokeLinecap="round"
                />

                {/* Context switch segment (red) */}
                <circle
                  cx={50}
                  cy={50}
                  r={35}
                  fill="none"
                  stroke="#f87171"
                  strokeWidth={20}
                  strokeDasharray={`${(contextPercent / 100) * 220} 220`}
                  strokeDashoffset={
                    -(((runningPercent + idlePercent) / 100) * 220)
                  }
                  strokeLinecap="round"
                />
              </svg>

              {/* Center text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xl font-bold">{metrics.globalTime}</div>
                  <div className="text-[9px] opacity-50">units</div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-1 text-[10px]">
              <div className="flex justify-between items-center py-0.5 px-1.5 rounded bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="font-medium">Processamento</span>
                </div>
                <span className="font-bold">{metrics.cpuRunningTime}u</span>
              </div>
              <div className="flex justify-between items-center py-0.5 px-1.5 rounded bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                  <span className="font-medium">Idle</span>
                </div>
                <span className="font-bold">{metrics.cpuIdleTime}u</span>
              </div>
              <div className="flex justify-between items-center py-0.5 px-1.5 rounded bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                  <span className="font-medium">Troca de contexto</span>
                </div>
                <span className="font-bold">{metrics.contextSwitchTime}u</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Average Waiting and Executing Time - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Average Executing Time */}
        <motion.div
          className="bg-gradient-to-br from-white/10 to-white/5 rounded-lg p-3 backdrop-blur-sm border border-white/10 shadow-xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ borderColor: "rgba(255,255,255,0.2)" }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-sm">⚡</span>
            <h4 className="text-xs font-bold opacity-90">Tempo de Execução</h4>
          </div>

          {/* Overall Average - Main Focus */}
          <div className="text-center bg-blue-500/20 rounded-lg border border-blue-500/30 p-3 mb-3">
            <div className="text-[10px] opacity-75 mb-1">Média</div>
            <div className="text-4xl font-black text-blue-400">
              {(
                (metrics.avgExecutingTimeByPriority.high +
                  metrics.avgExecutingTimeByPriority.medium +
                  metrics.avgExecutingTimeByPriority.low) /
                3
              ).toFixed(1)}
            </div>
            <div className="text-[10px] opacity-50 mt-1">time units</div>
          </div>

          {/* Priority Breakdown - Secondary */}
          <div className="grid grid-cols-3 gap-1.5">
            <div className="text-center bg-red-500/10 border border-red-500/20 rounded p-1.5">
              <div className="text-[9px] opacity-60 mb-0.5">High</div>
              <div className="text-sm font-bold text-red-400">
                {metrics.avgExecutingTimeByPriority.high.toFixed(1)}
              </div>
            </div>
            <div className="text-center bg-yellow-500/10 border border-yellow-500/20 rounded p-1.5">
              <div className="text-[9px] opacity-60 mb-0.5">Med</div>
              <div className="text-sm font-bold text-yellow-400">
                {metrics.avgExecutingTimeByPriority.medium.toFixed(1)}
              </div>
            </div>
            <div className="text-center bg-green-500/10 border border-green-500/20 rounded p-1.5">
              <div className="text-[9px] opacity-60 mb-0.5">Low</div>
              <div className="text-sm font-bold text-green-400">
                {metrics.avgExecutingTimeByPriority.low.toFixed(1)}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Average Waiting Time */}
        <motion.div
          className="bg-gradient-to-br from-white/10 to-white/5 rounded-lg p-3 backdrop-blur-sm border border-white/10 shadow-xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ borderColor: "rgba(255,255,255,0.2)" }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-sm">⏱️</span>
            <h4 className="text-xs font-bold opacity-90">Tempo de Espera</h4>
          </div>

          {/* Overall Average - Main Focus */}
          <div className="text-center bg-blue-500/20 rounded-lg border border-blue-500/30 p-3 mb-3">
            <div className="text-[10px] opacity-75 mb-1">Média</div>
            <div className="text-4xl font-black text-blue-400">
              {(
                (metrics.avgWaitingTimeByPriority.high +
                  metrics.avgWaitingTimeByPriority.medium +
                  metrics.avgWaitingTimeByPriority.low) /
                3
              ).toFixed(1)}
            </div>
            <div className="text-[10px] opacity-50 mt-1">time units</div>
          </div>

          {/* Priority Breakdown - Secondary */}
          <div className="grid grid-cols-3 gap-1.5">
            <div className="text-center bg-red-500/10 border border-red-500/20 rounded p-1.5">
              <div className="text-[9px] opacity-60 mb-0.5">High</div>
              <div className="text-sm font-bold text-red-400">
                {metrics.avgWaitingTimeByPriority.high.toFixed(1)}
              </div>
            </div>
            <div className="text-center bg-yellow-500/10 border border-yellow-500/20 rounded p-1.5">
              <div className="text-[9px] opacity-60 mb-0.5">Med</div>
              <div className="text-sm font-bold text-yellow-400">
                {metrics.avgWaitingTimeByPriority.medium.toFixed(1)}
              </div>
            </div>
            <div className="text-center bg-green-500/10 border border-green-500/20 rounded p-1.5">
              <div className="text-[9px] opacity-60 mb-0.5">Low</div>
              <div className="text-sm font-bold text-green-400">
                {metrics.avgWaitingTimeByPriority.low.toFixed(1)}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MetricsPanel;
