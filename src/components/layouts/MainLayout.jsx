import { Outlet } from "react-router-dom";
import Sidebar from "../elements/SideBar";
import MusicPlayerBar from "../elements/MusicPlayerBar";
import { usePlayer } from "../providers/PlayerContext";

export default function MainLayout() {
  const { currentTrack, isPlaying, play, pause, audioRef } = usePlayer();

  return (
    <div className="flex flex-col h-screen bg-black text-white">

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-[#1e1e1e] shadow-lg shadow-black/50 border-r border-gray-800">
          <Sidebar />
        </aside>

        {/* Main content area */}
        <main className="flex-1 bg-[#121212] p-6 overflow-y-auto">
          <div className="rounded-xl bg-[#1a1a1a] p-4 shadow-inner shadow-black/40">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ✅ Global Player Bar — nằm ngoài Outlet, nên trang nào cũng hiện */}
      {currentTrack && (
        <MusicPlayerBar
          tracks={[currentTrack]}
          isPlaying={isPlaying}
          onPlayPause={(state) => (state ? play(currentTrack) : pause())}
          audioRef={audioRef}
        />
      )}
    </div>
  );
}
