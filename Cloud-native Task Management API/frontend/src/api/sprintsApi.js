import client from './client';

export const sprintsApi = {
  getAllSprints: async () => {
    const response = await client.get('/sprints');
    // The backend wraps paginated responses in an object with 'items'
    return response.data.items || response.data;
  },
  getSprintById: async (id) => {
    const response = await client.get(`/sprints/${id}`);
    return response.data;
  },
  createSprint: async (sprintData) => {
    const response = await client.post('/sprints', sprintData);
    return response.data;
  },
  updateSprint: async (id, sprintData) => {
    const response = await client.put(`/sprints/${id}`, sprintData);
    return response.data;
  },
  deleteSprint: async (id) => {
    await client.delete(`/sprints/${id}`);
  }
};
