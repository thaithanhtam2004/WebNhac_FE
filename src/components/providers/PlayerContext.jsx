import { createContext, useContext, useRef, useState, useEffect } from "react";
import { addHistorySong } from "../../services/historyService";
import { useAuth } from "./AuthContext";
import { socket } from "../../services/socket";  // đường dẫn đúng theo project bạn

const MusicPlayerContext = createContext();

export function MusicPlayerProvider({ children }) {
  const audioRef = useRef(new Audio());
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const { user } = useAuth();

  // 🔹 Bật/tắt tính năng lưu lịch sử
  // true = lưu sau 1 phút nghe
  // false = bấm play là lưu ngay
  const enableHistoryTracking = false;

const play = async (track) => {
  if (!track) return;

  const audio = audioRef.current;

  console.log("Play track:", track, "user:", user);

  // Nếu đổi bài
  if (!currentTrack || currentTrack.songId !== track.songId) {
    audio.pause();              // ✅ đảm bảo reset
    audio.src = track.fileUrl;
    audio.load();               // ✅ bắt load bài mới
    setCurrentTrack(track);

    if (!enableHistoryTracking && user?.userId) {
      try {
        // ⬇️ Không await để không chặn play
        addHistorySong({ userId: user.userId, songId: track.songId });

        socket.emit("track_played", { userId: user.userId, songId: track.songId });
        console.log("📤 Đã gửi socket track_played");
      } catch (err) {
        console.error("⚠️ Lỗi lưu lịch sử nghe:", err);
      }
    }
  }

  try {
    await audio.play(); // ✅ play mượt
    setIsPlaying(true);
  } catch (e) {
    console.warn("⚠️ Click lại để phát (auto-play bị chặn)");
  }
};


  const pause = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };

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
