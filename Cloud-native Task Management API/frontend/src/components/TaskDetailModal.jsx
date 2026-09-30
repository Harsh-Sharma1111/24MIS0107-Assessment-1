import React, { useState, useEffect } from 'react';
import { tasksApi } from '../api/tasksApi';
import { usersApi } from '../api/usersApi';
import { sprintsApi } from '../api/sprintsApi';
import toast from 'react-hot-toast';

export default function TaskDetailModal({ task, onClose, onSaved }) {
  const isEditMode = Boolean(task && task.id);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignee_id: '',
    sprint_id: ''
  });
  
  const [users, setUsers] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    // Populate form if editing
    if (isEditMode) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        assignee_id: task.assignee_id || '',
        sprint_id: task.sprint_id || ''
      });
    }
  }, [task, isEditMode]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setIsFetching(true);
        const [usersData, sprintsData] = await Promise.all([
          usersApi.getAllUsers(),
          sprintsApi.getAllSprints()
        ]);
        setUsers(usersData);
        setSprints(sprintsData);
      } catch (error) {
        toast.error('Failed to load users and sprints');
      } finally {
        setIsFetching(false);
      }
    };
    fetchOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Parse ints for IDs
    const payload = {
      ...formData,
      assignee_id: formData.assignee_id ? parseInt(formData.assignee_id, 10) : null,
      sprint_id: formData.sprint_id ? parseInt(formData.sprint_id, 10) : null
    };

    try {
      if (isEditMode) {
        await tasksApi.updateTask(task.id, payload);
        toast.success('Task updated successfully');
      } else {
        await tasksApi.createTask(payload);
        toast.success('Task created successfully');
      }
      onSaved();
    } catch (error) {
      toast.error(isEditMode ? 'Failed to update task' : 'Failed to create task');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        setIsSubmitting(true);
        await tasksApi.deleteTask(task.id);
        toast.success('Task deleted successfully');
        onSaved();
      } catch (error) {
        toast.error('Failed to delete task');
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditMode ? 'Edit Task' : 'Create Task'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Task title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Task details..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Assignee</label>
              <select
                name="assignee_id"
                value={formData.assignee_id}
                onChange={handleChange}
                disabled={isFetching}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Unassigned</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>

            {/* Sprint */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Sprint</label>
              <select
                name="sprint_id"
                value={formData.sprint_id}
                onChange={handleChange}
                disabled={isFetching}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Backlog (No Sprint)</option>
                {sprints.map(sprint => (
                  <option key={sprint.id} value={sprint.id}>{sprint.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
            {isEditMode ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-bold text-red-600 bg-red-100 rounded-lg hover:bg-red-200 focus:ring-4 focus:ring-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
              >
                Delete Task
              </button>
            ) : <div />}
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Saving...' : 'Save Task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
