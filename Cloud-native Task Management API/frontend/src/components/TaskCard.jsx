import React from 'react';
import { Draggable } from '@hello-pangea/dnd';

export default function TaskCard({ task, index, users, onClick }) {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (assigneeId) => {
    if (!assigneeId || !users) return '?';
    const user = users.find(u => u.id === assigneeId);
    if (!user || !user.name) return 'U';
    
    // Get first letter of first name and last name
    const parts = user.name.split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return 'U';
  };

  return (
    <Draggable draggableId={String(task.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          className={`p-4 mb-3 bg-white rounded-xl border border-gray-200 cursor-pointer 
            dark:bg-gray-800 dark:border-gray-700 
            ${snapshot.isDragging ? 'ring-2 ring-blue-500 shadow-xl opacity-90' : 'shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500'}
            transition-all duration-200 ease-in-out`}
        >
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 leading-tight">
              {task.title}
            </h4>
            
            <div className="flex items-center justify-between mt-1">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${getPriorityColor(task.priority)}`}>
                {(task.priority || 'medium').toUpperCase()}
              </span>
              
              {task.assignee_id && (
                <div 
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800" 
                  title={`Assignee`}
                >
                  {getInitials(task.assignee_id)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
