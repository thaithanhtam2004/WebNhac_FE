import { createContext, useContext, useRef, useState } from "react";

const MusicPlayerContext = createContext();

export function MusicPlayerProvider({ children }) {
  const audioRef = useRef(new Audio());
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const play = (track) => {
    if (!track) return;

    // Nếu bài mới -> set src mới
    if (!currentTrack || currentTrack.songId !== track.songId) {
      audioRef.current.src = track.fileUrl;
      setCurrentTrack(track);
    }

    audioRef.current.play();
    setIsPlaying(true);
  };

  const pause = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const value = {
    currentTrack,
    isPlaying,
    play,     // ✅ export đúng tên
    pause,
    audioRef,
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
    </MusicPlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(MusicPlayerContext);
}
