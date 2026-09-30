import client from './client';

export const tasksApi = {
  getTasks: async (filters = {}) => {
    // filters can include status, sprint_id, assignee_id
    const response = await client.get('/tasks', { params: filters });
    return response.data.items || response.data;
  },
  getTaskById: async (id) => {
    const response = await client.get(`/tasks/${id}`);
    return response.data;
  },
  createTask: async (taskData) => {
    const response = await client.post('/tasks', taskData);
    return response.data;
  },
  updateTask: async (id, taskData) => {
    const response = await client.put(`/tasks/${id}`, taskData);
    return response.data;
  },
  deleteTask: async (id) => {
    await client.delete(`/tasks/${id}`);
  }
};
