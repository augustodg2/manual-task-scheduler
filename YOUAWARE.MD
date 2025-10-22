# Manual Task Scheduler - CPU Scheduling Simulation

This is an interactive web application that simulates CPU scheduling with drag-and-drop functionality, allowing users to act as the kernel scheduler.

## Project Overview

A comprehensive task scheduling simulator where users manage CPU execution by dragging tasks between different states (READY, RUNNING, BLOCKED, TERMINATED). The application features real-time metrics, animations, and educational content about operating system scheduling concepts.

## Core Features

### Interactive Scheduling
- **Drag & Drop Interface**: Users drag tasks from READY to RUNNING zone to make scheduling decisions
- **Real-time Execution**: Tasks execute automatically with visual progress indicators
- **State Transitions**: Automatic handling of quantum expiry, I/O blocking, and task completion
- **Context Switching**: Visual and temporal representation of context switch overhead

### Visual Components
- **Task Cards**: Color-coded by priority (Red=High, Yellow=Medium, Green=Low)
- **Status Areas**: Four distinct zones for different task states
- **Animations**: Smooth transitions using Framer Motion
- **Progress Indicators**: Visual feedback during task execution

### Performance Metrics
- **Global Kernel Time**: Total elapsed time including overhead
- **Context Switch Time**: Cumulative time spent on task switching
- **Efficiency (ℰ)**: CPU utilization percentage
- **Priority Waiting Times**: Individual and aggregated waiting time by priority level
- **Automatic Time Advancement**: Global time continues when no tasks are available

## Technical Architecture

### State Management
- **Zustand Store**: Centralized state management in `src/store/schedulerStore.ts`
- **Task Definition**: TypeScript interfaces in `src/types/index.ts`
- **Real-time Updates**: Automatic state synchronization with execution loop

### Component Structure
- **App.tsx**: Main application with DnD context and execution logic
- **TaskCard**: Draggable task components with priority-based styling and waiting time display
- **StatusArea**: Drop zones for different task states
- **ControlPanel**: User controls and feedback display
- **MetricsPanel**: Real-time global performance metrics
- **PriorityMetricsPanel**: Priority-specific waiting time metrics with visual indicators
- **InstructionsPanel**: Collapsible educational content in Portuguese

### Drag & Drop Implementation
- **@dnd-kit**: Modern drag-and-drop library with accessibility support
- **Drop Validation**: Only allows valid state transitions
- **Visual Feedback**: Hover states and drop zone indicators

## Development Commands

- **Install dependencies**: `npm install`
- **Build project**: `npm run build`
- **Development server**: `npm run dev`

## Key Implementation Details

### Task Lifecycle
1. **Creation**: Tasks generated with random properties (time, priority, I/O events, zero waiting time)
2. **Ready State**: Tasks wait in queue, accumulating waiting time, draggable to RUNNING zone
3. **Execution**: Automatic decrement of counters with visual feedback
4. **Transitions**: 
   - Quantum expiry → Return to READY with waiting time reset
   - I/O event → Move to BLOCKED with timer
   - Completion → Move to TERMINATED
5. **I/O Completion**: Blocked tasks automatically return to READY with waiting time reset
6. **Waiting Time Tracking**: Individual task waiting time displayed on cards; aggregated by priority

### Simulation Logic
- **Decision Points**: Simulation pauses when RUNNING zone is empty
- **Context Switch Cost**: Applied when user selects next task
- **Quantum Management**: Configurable time slice for preemptive scheduling
- **Efficiency Calculation**: Real-time CPU utilization tracking
- **Waiting Time Management**: Incremental counter for tasks in READY queue
- **Automatic Time Advancement**: Global time continues when no active tasks exist
- **Priority Metrics**: Real-time aggregation of waiting times by priority level

### Educational Features
- **Instructions Panel**: Comprehensive guide to scheduling concepts
- **Visual Learning**: Color-coded priorities and state transitions
- **Performance Analysis**: Metrics to understand scheduling efficiency

## Browser Compatibility

The application uses modern web APIs and requires:
- ES6+ JavaScript support
- CSS Grid and Flexbox
- Modern drag-and-drop API support
- Animation frame support for smooth transitions

## Performance Considerations

- **Optimized Rendering**: React.memo and useMemo for component optimization
- **Animation Performance**: GPU-accelerated animations using CSS transforms
- **State Updates**: Batched state changes to prevent excessive re-renders
- **Memory Management**: Proper cleanup of intervals and event listeners