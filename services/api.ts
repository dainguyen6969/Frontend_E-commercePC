import axios from "axios";

export const apiService = {
  get: async (url: string) => {
    try {
      const response = await axios.get(url);
      return response;
    } catch (error) {
      console.error("GET error:", error);
      return null;
    }
  },
};
