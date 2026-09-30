import React from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import { tasksApi } from '../api/tasksApi';
import toast from 'react-hot-toast';

const COLUMNS = [
  { id: 'todo', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'done', title: 'Done' }
];

export default function KanbanBoard({ tasks, setTasks, users, onTaskClick }) {
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a valid droppable area
    if (!destination) return;

    // Dropped in the same spot
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const taskId = parseInt(draggableId, 10);
    const newStatus = destination.droppableId;
    const oldStatus = source.droppableId;
    
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;
    
    const task = tasks[taskIndex];
    
    if (newStatus === oldStatus) {
      // Reordering within the same column isn't supported by the backend yet,
      // but you would handle the optimistic array re-sort here.
      return;
    }

    // Optimistic UI Update
    const originalTasks = [...tasks];
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = { ...task, status: newStatus };
    setTasks(updatedTasks);

    // Call API
    try {
      // Send the updated status to the backend. We pass the whole task to satisfy required fields.
      await tasksApi.updateTask(taskId, {
        title: task.title,
        description: task.description,
        status: newStatus,
        priority: task.priority,
        sprint_id: task.sprint_id,
        assignee_id: task.assignee_id
      });
      // Silent success (or we could show a toast here)
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task status. Reverting changes.');
      // Rollback to original state
      setTasks(originalTasks);
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex flex-col md:flex-row gap-6 w-full h-full min-h-[500px]">
        {COLUMNS.map(column => (
          <div key={column.id} className="flex flex-col flex-1 bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="p-4 bg-gray-100/80 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 backdrop-blur-sm">
              <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center justify-between">
                {column.title}
                <span className="bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 shadow-sm text-xs px-2.5 py-1 rounded-full font-semibold">
                  {getTasksByStatus(column.id).length}
                </span>
              </h3>
            </div>
            
            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 p-4 transition-colors duration-200 ${
                    snapshot.isDraggingOver ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                  }`}
                >
                  {getTasksByStatus(column.id).map((task, index) => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      index={index} 
                      users={users}
                      onClick={onTaskClick}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
