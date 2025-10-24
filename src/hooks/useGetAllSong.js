import { useState, useEffect } from "react";
import axios from "axios";

export function useGetAllSong() {
  const [data, setData] = useState([]);
  const [loading, setLoading]= useState(true);
  const [error, setError]= useState(null);

  useEffect(() => {
    async function fetchSongs() {
      try {
        const res = await axios.get("http://localhost:3000/api/songs");
        setData(res.data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSongs();
  }, []);

  return { data, loading, error };
}
