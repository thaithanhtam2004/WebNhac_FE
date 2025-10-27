import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Section from "../../elements/Section";
import MusicCard from "../../elements/MusicCard";
import { useGetSongByReleaseDate } from "../../../hooks/useGetSongByReleaseDate";
import { useGetUserRecommendations } from "../../../hooks/useGetUserRecommendations";
import MusicPlayerBar from "../../elements/MusicPlayerBar";

export default function HomePage({ userId }) {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const navigate = useNavigate();

  // Hook lấy recommendation cho user hiện tại
  const { data: recommendations, loading: recLoading, error: recError } = useGetUserRecommendations("U001");

  // Hook lấy bài hát mới phát hành
  const { data: latestSongs, loading: latestLoading, error: latestError } = useGetSongByReleaseDate();

  return (
    <div className="flex flex-col w-full h-full text-white p-4 sm:p-6 overflow-y-auto">
      
      {/* Section: Gợi ý cho bạn */}
     <Section
  title="GỢI Ý CHO BẠN"
  useFetchHook={() => ({ data: recommendations, loading: recLoading, error: recError })}
  renderItem={(song) => (
    <MusicCard
      key={song.songId}
      title={song.title}
      artist={song.singerName} // sửa từ artist sang singerName
      trackPath={song.fileUrl}
      onPlay={() => {
        setCurrentTrack(song);
        setIsPlaying(true);
      }}
    />
  )}
  headerRight={
    <button
      onClick={() => navigate("/recommendations")}
      className="text-white hover:text-cyan-300 font-semibold text-sm transition"
    >
      Tất cả
    </button>
  }
/>
      {/* Section: Bài hát mới nhất */}
      <Section
        title="MỚI PHÁT HÀNH"
        useFetchHook={() => ({ data: latestSongs, loading: latestLoading, error: latestError })}
        headerRight={
          <button
            onClick={() => navigate("/latest")}
            className="text-white hover:text-cyan-300 font-semibold text-sm transition"
          >
            Tất cả
          </button>
        }
        renderItem={(song) => (
          <MusicCard
            key={song.songId}
            title={song.title}
            artist={song.artist}
            trackPath={song.fileUrl}
            onPlay={() => {
              setCurrentTrack(song);
              setIsPlaying(true);
            }}
          />
        )}
      />

      {/* Music Player Bar */}
      {currentTrack && (
        <MusicPlayerBar
          tracks={[currentTrack]}
          isPlaying={isPlaying}
          onPlayPause={setIsPlaying}
        />
      )}
    </div>
  );
}
