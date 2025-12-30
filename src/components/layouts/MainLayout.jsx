import { Outlet } from "react-router-dom";
import Sidebar from "../elements/SideBar";
import MusicPlayerBar from "../elements/MusicPlayerBar";
import { usePlayer } from "../providers/PlayerContext";

export default function MainLayout() {
  const { currentTrack, isPlaying, play, pause, audioRef } = usePlayer();

  // Chiều cao của thanh nhạc (h-24) ~ 96px
  // Chúng ta sẽ đệm thêm một chút (pb-28 ~ 112px) để thoáng
  const bottomPaddingClass = currentTrack ? "pb-28" : "pb-0";

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      {/* ✅ SỬA 1: Thêm padding-bottom cho Sidebar để menu cuối không bị che */}
      <aside 
        className={`w-64 bg-black flex-shrink-0 hidden md:flex md:flex-col border-r border-[#282828] 
          overflow-y-auto transition-all duration-300 ${bottomPaddingClass}`}
      >
        <Sidebar />
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* ✅ SỬA 2: Giữ nguyên padding-bottom cho nội dung chính */}
        <main 
          className={`flex-1 overflow-y-auto bg-gradient-to-b from-[#1a1a1a] to-[#121212] 
            transition-all duration-300 ${bottomPaddingClass}`}
        >
          <Outlet />
        </main>

        {/* --- MUSIC PLAYER BAR --- */}
        {/* Component này dùng fixed position, nó sẽ nổi lên trên cùng */}
        {currentTrack && (
          <div className="absolute bottom-0 left-0 right-0 z-50">
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