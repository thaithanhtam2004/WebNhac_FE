import { Outlet } from "react-router-dom";
import Sidebar from "../elements/SideBar";
import MusicPlayerBar from "../elements/MusicPlayerBar";
import { usePlayer } from "../providers/PlayerContext";

export default function MainLayout() {
  const { currentTrack, isPlaying, play, pause, audioRef } = usePlayer();

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar cố định */}
      <aside className="w-64 bg-[#1e1e1e] shadow-lg shadow-black/50 border-r border-gray-800 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Nội dung chính */}
      <div className="flex-1 flex flex-col">
        {/* Main scrollable */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#121212]">
          {/* Container nội dung */}
          <div className="flex flex-col gap-6 min-h-full rounded-xl bg-[#1a1a1a] p-4 shadow-inner shadow-black/40">
            <Outlet />
          </div>
        </main>

        {/* Music Player Bar cố định ở dưới */}
        {currentTrack && (
          <div className="flex-shrink-0">
            <MusicPlayerBar
              tracks={[currentTrack]}
              isPlaying={isPlaying}
              onPlayPause={(state) => (state ? play(currentTrack) : pause())}
              audioRef={audioRef}
            />
          </div>
        )}
      </div>
    </div>
  );
}
