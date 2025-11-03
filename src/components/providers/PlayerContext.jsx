import { createContext, useContext, useRef, useState, useEffect } from "react";
import { addHistorySong } from "../../services/historyService";
import { useAuth } from "./AuthContext";

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

  console.log("Play track:", track, "user:", user);

  if (!currentTrack || currentTrack.songId !== track.songId) {
    audioRef.current.src = track.fileUrl;
    setCurrentTrack(track);

    if (!enableHistoryTracking) {
      if (!user?.userId || !track?.songId) {
        console.warn("Không lưu lịch sử: thiếu userId hoặc songId");
      } else {
        try {
          console.log("Gửi request lưu lịch sử:", { userId: user.userId, songId: track.songId });
          await addHistorySong({ userId: user.userId, songId: track.songId });
        } catch (err) {
          console.error("⚠️ Lỗi lưu lịch sử nghe:", err);
        }
      }
    }
  }

  audioRef.current.play();
  setIsPlaying(true);
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
