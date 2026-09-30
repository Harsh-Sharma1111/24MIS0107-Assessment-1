import client from './client';

export const usersApi = {
  getAllUsers: async () => {
    const response = await client.get('/users');
    // The backend wraps paginated responses in an object with 'items'
    return response.data.items || response.data;
  },
  getUserById: async (id) => {
    const response = await client.get(`/users/${id}`);
    return response.data;
  },
  createUser: async (userData) => {
    const response = await client.post('/users', userData);
    return response.data;
  },
  updateUser: async (id, userData) => {
    const response = await client.put(`/users/${id}`, userData);
    return response.data;
  },
  deleteUser: async (id) => {
    await client.delete(`/users/${id}`);
  }
};
