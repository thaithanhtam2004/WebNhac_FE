import { useState } from "react";
import { Search } from "lucide-react";
import Sidebar from "../../elements/SideBar";
import MusicCard from "../../elements/MusicCard";
import SongItem from "../../elements/SongItem";
import GenreTag from "../../elements/GenreTag";
import ArtistTag from "../../elements/ArtistTag";
import Section from "../../elements/Section";
import MusicPlayerBar from "../../elements/MusicPlayerBar";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim() !== "") {
      console.log("Đang tìm kiếm:", searchQuery);
      // 👉 Tại đây bạn có thể gọi API tìm kiếm hoặc cập nhật state
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="flex flex-col h-screen text-white bg-gradient-to-br from-[#0a0f1f] via-[#0d1b2a] to-[#000]">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar cố định bên trái */}
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 flex flex-col">
          {/* Thanh tìm kiếm */}
          <div className="p-6 border-b border-blue-800/40 bg-blue-900/40 backdrop-blur-md sticky top-0 z-10 flex justify-center">
            <div className="relative w-1/2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Tìm kiếm bài hát, nghệ sĩ..."
                className="w-full pl-12 pr-12 py-2 rounded-lg bg-blue-600/30
                           text-white placeholder-white
                           focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
              />

              {/* Icon tìm kiếm - bấm để xác nhận */}
              <button
                onClick={handleSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-blue-700/50 transition"
              >
                <Search className="w-5 h-5 text-white" />
              </button>

              
            </div>
          </div>

          {/* Nội dung cuộn */}
          <div className="flex-1 p-6 overflow-y-auto text-white">
            <Section title="Bài hát nghe gần đây">
              <MusicCard title="Tên bài hát" artist="Tên nghệ sĩ" />
            </Section>

            <Section title="Gợi ý bài hát">
              <SongItem title="Tên bài hát" artist="Tên nghệ sĩ" />
            </Section>

            <Section title="Thể loại">
              <GenreTag name="Tên thể loại" />
            </Section>

            <Section title="Nghệ sĩ nổi bật gần đây">
              <ArtistTag name="Tên nghệ sĩ" />
            </Section>

            <Section title="Bài hát mới phát hành">
              <SongItem title="Tên bài hát" artist="Tên nghệ sĩ" />
            </Section>

            <Section title="Album Hot">
              <MusicCard title="Tên bài hát" artist="Tên nghệ sĩ" />
            </Section>
          </div>
        </main>
      </div>

      <MusicPlayerBar />
    </div>
  );
}
