import React from "react";
import { useState } from "react";
import Section from "../../elements/Section";
import MusicCard from "../../elements/MusicCard";
import { useGetAllSong } from "../../../hooks/useGetAllSong";
import MusicPlayerBar from "../../elements/MusicPlayerBar";
// Giả lập thêm các hook khác (bạn có thể thay bằng API thật)
// import { useGetRecentSongs } from "../../hooks/useGetRecentSongs";
// import { useGetTopTrendingSongs } from "../../hooks/useGetTopTrendingSongs";
// import { useGetNewReleaseSongs } from "../../hooks/useGetNewReleaseSongs";
export default function HomePage() {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    
    <div className="flex flex-col w-full h-full text-white p-4 sm:p-6 overflow-y-auto">
      {/* Section 1: Tất cả bài hát */}
      <Section
        title="Tất cả bài hát"
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
              setIsPlaying(true); // bật nhạc ngay
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

      // {/* Section 2: Gần đây */}
      // <Section
      //   title="Bài hát nghe gần đây"
      //   useFetchHook={useGetRecentSongs}
      //   renderItem={(song) => (
      //     <MusicCard key={song.songId} title={song.title} artist={song.artist} />
      //   )}
      // />

      // {/* Section 3: Top Trending */}
      // <Section
      //   title="Top Trending"
      //   useFetchHook={useGetTopTrendingSongs}
      //   renderItem={(song) => (
      //     <MusicCard key={song.songId} title={song.title} artist={song.artist} />
      //   )}
      // />

      // {/* Section 4: Mới phát hành */}
      // <Section
      //   title="Bài hát mới phát hành"
      //   useFetchHook={useGetNewReleaseSongs}
      //   renderItem={(song) => (
      //     <MusicCard key={song.songId} title={song.title} artist={song.artist} />
      //   )}
      // />