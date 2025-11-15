import { useState, useEffect } from "react";
import axios from "axios";

export function useGetHotTrendSong() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchSongs() {
      try {
        const res = await axios.get("http://localhost:3000/api/songs/hotTrend");
        if (isMounted) setData(res.data.data || []);
      } catch (err) {
        if (isMounted) setError(err.message || "Lỗi khi lấy hot trend");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchSongs();
    return () => { isMounted = false };
  }, []);

  return { data, loading, error };
}
