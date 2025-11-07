import { useState, useEffect, useCallback } from "react";
import { socket } from "../services/socket"; 
import { getRecommendSongWithDetail } from "../services/recommendService";

export const useRecommendations = (userId) => {
  const [data, setData] = useState([]);      // giống useGetHotTrendSong
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    socket.emit("register", { userId });

    const load = async () => {
      setLoading(true);
      try {
        const res = await getRecommendSongWithDetail(userId);
        setData(res || []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Lỗi khi lấy recommendation");
      } finally {
        setLoading(false);
      }
    };

    load();

    const handleRealtime = (realtimeData) => {
      setData(realtimeData.recommendations || []);
    };

    socket.on("recommendations", handleRealtime);
    return () => socket.off("recommendations", handleRealtime);
  }, [userId]);

  const notifyTrackPlayed = useCallback((songId) => {
    if (!userId || !songId) return;
    socket.emit("track_played", { userId, songId });
  }, [userId]);

  return { data, loading, error, notifyTrackPlayed };
};
