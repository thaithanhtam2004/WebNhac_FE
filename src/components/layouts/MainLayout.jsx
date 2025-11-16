import { Outlet } from "react-router-dom";
import Sidebar from "../elements/SideBar";
import MusicPlayerBar from "../elements/MusicPlayerBar";
import { usePlayer } from "../providers/PlayerContext";

export default function MainLayout() {
  const { currentTrack, isPlaying, play, pause, audioRef } = usePlayer();

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-black flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#1a1a1a] to-[#121212]">
          <Outlet />
        </main>

        {/* Music Player Bar - Fixed at bottom */}
        {currentTrack && (
          <div className="flex-shrink-0 border-t border-[#282828]">
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