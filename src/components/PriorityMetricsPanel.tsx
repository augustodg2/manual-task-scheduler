import React from "react";
import { motion } from "framer-motion";
import { useSchedulerStore } from "../store/schedulerStore";

const PriorityMetricsPanel: React.FC = () => {
  const { calculatePriorityMetrics } = useSchedulerStore();
  const priorityMetrics = calculatePriorityMetrics();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "from-red-500 to-red-600";
      case "medium":
        return "from-yellow-500 to-yellow-600";
      case "low":
        return "from-green-500 to-green-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "Prioridade Alta";
      case "medium":
        return "Prioridade Média";
      case "low":
        return "Prioridade Baixa";
      default:
        return "Desconhecida";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return "🔴";
      case "medium":
        return "🟡";
      case "low":
        return "🟢";
      default:
        return "⚪";
    }
  };

  const metrics = [
    { key: "high", label: "Alta", value: priorityMetrics.high },
    { key: "medium", label: "Média", value: priorityMetrics.medium },
    { key: "low", label: "Baixa", value: priorityMetrics.low },
  ];

  return (
    <>
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.key}
          className={`relative overflow-hidden rounded-lg p-4 bg-gradient-to-br ${getPriorityColor(
            metric.key
          )} text-white`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 20px)`,
              }}
            />
          </div>

          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{getPriorityIcon(metric.key)}</span>
              <span className="text-sm font-medium opacity-90">
                {getPriorityLabel(metric.key)}
              </span>
            </div>

            <div className="text-3xl font-bold mb-1">{metric.value}</div>

            <div className="text-sm opacity-75">Tempo Médio de Espera (u)</div>

            {/* Progress Bar */}
            <div className="mt-3 h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white bg-opacity-60 rounded-full"
                initial={{ width: "0%" }}
                animate={{
                  width: `${Math.min(
                    (metric.value /
                      Math.max(
                        priorityMetrics.high,
                        priorityMetrics.medium,
                        priorityMetrics.low,
                        1
                      )) *
                      100,
                    100
                  )}%`,
                }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </>
  );
};

export default PriorityMetricsPanel;
