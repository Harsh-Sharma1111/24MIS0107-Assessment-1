import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { tasksApi } from '../api/tasksApi';

export default function SprintProgress({ sprintId }) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!sprintId) return;
    
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const data = await tasksApi.getTasks({ sprint_id: parseInt(sprintId, 10) });
        setTasks(data);
      } catch (error) {
        console.error("Failed to load tasks for progress:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTasks();
  }, [sprintId]);

  if (!sprintId) {
    return null;
  }

  // Calculate stats
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;

  const percentComplete = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Recharts data mapped to specific colors for visual clarity
  const data = [
    { name: 'To Do', count: todoTasks, fill: '#9CA3AF' },       // Tailwind gray-400
    { name: 'In Progress', count: inProgressTasks, fill: '#60A5FA' }, // Tailwind blue-400
    { name: 'Done', count: doneTasks, fill: '#34D399' }         // Tailwind emerald-400
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 w-full mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Sprint Progress</h3>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
            {totalTasks} total tasks
          </p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">
            {percentComplete}%
          </div>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">
            Complete
          </p>
        </div>
      </div>

      <div className="w-full h-36 relative mt-4">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : totalTasks > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" opacity={0.15} />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6B7280', fontSize: 13, fontWeight: 600 }} 
                width={85}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(156, 163, 175, 0.1)' }}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  fontWeight: '600'
                }}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={24} animationDuration={1000}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400 dark:text-gray-500 font-medium">
            No tasks assigned to this sprint yet.
          </div>
        )}
      </div>
    </div>
  );
}
