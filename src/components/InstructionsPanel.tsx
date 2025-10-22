import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const InstructionsPanel: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const instructions = [
    {
      title: "Seu Papel como Scheduler",
      icon: "🧠",
      content: [
        "Você decide qual tarefa usa a CPU. O sistema pausa e a zona RUNNING brilha quando uma decisão é necessária.",
        "Ação: Arraste qualquer tarefa de READY para RUNNING.",
        "Custo: Cada arrasto aplica um Context Switch Cost (t_tc) ao Tempo Global.",
      ],
    },
    {
      title: "Ciclo de Vida da Tarefa",
      icon: "🔄",
      content: [
        "Quantum Expirado: A tarefa retorna a READY e aguarda o próximo escalonamento.",
        "Evento I/O: A tarefa vai para BLOCKED e retorna automaticamente a READY ao fim do I/O.",
      ],
    },
    {
      title: "Priorização",
      icon: "⭐",
      content: [
        "Urgência: Tarefas Vermelhas (Alta Prioridade) devem ser favorecidas.",
        "Métrica: Observe o Tempo de Espera individual e o Tempo Total de Espera por Prioridade para garantir que tarefas urgentes não fiquem paradas.",
      ],
    },
    {
      title: "Métricas de Performance",
      icon: "📈",
      content: [
        "Acompanhe o Global Time, o Context Switch Time e a Eficiência (ℰ) para avaliar a qualidade de sua política de escalonamento.",
      ],
    },
  ];

  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold text-left flex items-center justify-between hover:from-purple-600 hover:to-blue-600 transition-colors"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <span className="flex items-center gap-2">
          <span className="text-2xl">⚙️</span>
          Kernel Scheduler Interface: Regras e Mecânica
        </span>
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          ▼
        </motion.span>
      </motion.button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 space-y-6">
              {instructions.map((section, index) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-l-4 border-blue-500 pl-4"
                >
                  <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <span className="text-2xl">{section.icon}</span>
                    {section.title}
                  </h4>
                  <ul className="space-y-1 text-gray-700">
                    {section.content.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default InstructionsPanel;
