import { useState, useEffect } from "react";
import axios from "axios";

export function useGetUserRecommendations(userId, limit = 20) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return; // nếu chưa có userId thì không fetch
    setLoading(true);
    setError(null);

    async function fetchRecommendations() {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/recommendations/${userId}/details?limit=${limit}`
        );
        setData(res.data.data || []); // route /details trả { data: [...] }
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [userId, limit]);

  return { data, loading, error };
}
