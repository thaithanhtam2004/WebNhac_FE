import { createContext, useContext, useRef, useState, useEffect, useCallback } from "react";
import { addHistorySong } from "../services/historyService";
import { useAuth } from "./AuthContext";
import { socket } from "../services/socket";
import axios from "../config/api";

const MusicPlayerContext = createContext();

export function MusicPlayerProvider({ children }) {
  const audioRef = useRef(new Audio());
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const currentTrackRef = useRef(null); // ✅ Dùng ref để tránh stale closure

  const { user } = useAuth();

  // 🔹 Bật/tắt tính năng lưu lịch sử
  // true = lưu sau 1 phút nghe
  // false = bấm play là lưu ngay
  const enableHistoryTracking = false;

  const play = useCallback(async (track) => {
    if (!track) return;

    const audio = audioRef.current;

    // Nếu đổi bài - dùng ref để tránh stale closure
    if (!currentTrackRef.current || currentTrackRef.current.songId !== track.songId) {
      audio.pause();
      audio.src = track.fileUrl;
      audio.load();
      currentTrackRef.current = track; // ✅ cập nhật ref ngay lập tức
      setCurrentTrack(track);

      if (!enableHistoryTracking && user?.userId) {
        try {
          addHistorySong({ userId: user.userId, songId: track.songId });
          socket.emit("track_played", { userId: user.userId, songId: track.songId });
          console.log("📤 Đã gửi socket track_played");
        } catch (err) {
          console.error("⚠️ Lỗi lưu lịch sử nghe:", err);
        }
      }
      
      // 🔥 Tăng view mỗi khi nghe bài mới
      const idToView = track.songId || track._id;
      if (idToView) {
        console.log(`🚀 Đang tăng view cho bài: ${idToView}`);
        axios.post(`/songs/${idToView}/view`)
          .then(() => console.log("✅ Tăng view thành công"))
          .catch(e => console.error("❌ Lỗi tăng view:", e.response?.data || e.message));
      }
    }

    try {
      await audio.play(); // ✅ play mượt
      setIsPlaying(true);
    } catch (e) {
      console.warn("⚠️ Click lại để phát (auto-play bị chặn)");
    }
  }, [user, enableHistoryTracking]);


  const pause = useCallback(() => {
    audioRef.current.pause();
    setIsPlaying(false);
  }, []);

  // 🔹 Lắng nghe timeupdate để lưu sau 1 phút
  useEffect(() => {
    if (!enableHistoryTracking) return;
    if (!currentTrack || !user?.userId) return;

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      if (audio.currentTime >= 5) { // ✅ 1 phút = 60 giây
        addHistorySong({
          userId: user.userId,
          songId: currentTrack.songId,
        }).catch(err => console.error("⚠️ Lỗi lưu lịch sử nghe:", err));

        audio.removeEventListener("timeupdate", handleTimeUpdate);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    return () => audio.removeEventListener("timeupdate", handleTimeUpdate);
  }, [currentTrack, user, enableHistoryTracking]);

  return (
    <MusicPlayerContext.Provider value={{
      currentTrack,
      isPlaying,
      play,
      pause,
      audioRef,
      enableHistoryTracking
    }}>
      {children}
    </MusicPlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(MusicPlayerContext);
}
