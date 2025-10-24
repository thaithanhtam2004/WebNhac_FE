import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Section from "../../elements/Section";
import MusicCard from "../../elements/MusicCard";
import { useGetAllSong } from "../../../hooks/useGetAllSong";
import { useGetSongByReleaseDate } from "../../../hooks/useGetSongByReleaseDate";
import MusicPlayerBar from "../../elements/MusicPlayerBar";

export default function HomePage() {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col w-full h-full text-white p-4 sm:p-6 overflow-y-auto">
      {/* Section 1: Tất cả bài hát */}
      <Section
        title="TẤT CẢ BÀI HÁT"
        useFetchHook={useGetAllSong}
        renderItem={(song) => (
          <MusicCard
            key={song.songId}
            title={song.title}
            artist={song.artist}
            trackPath={song.fileUrl}
            onPlay={() => {
              console.log("Selected track:", song);
              console.log("Track URL:", song.fileUrl);
              setCurrentTrack(song);
              setIsPlaying(true);
            }}
          />
        )}
      />

      {/* Section 2: Bài hát mới nhất */}
      <Section
        title="MỚI PHÁT HÀNH"
        useFetchHook={useGetSongByReleaseDate}
        // headerRight sẽ render nút ở góc phải
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
              console.log("Selected track:", song);
              console.log("Track URL:", song.fileUrl);
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
