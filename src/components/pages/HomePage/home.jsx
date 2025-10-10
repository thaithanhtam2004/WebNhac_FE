import Sidebar from "../../elements/SideBar";
import MusicCard from "../../elements/MusicCard";
import SongItem from "../../elements/SongItem";
import GenreTag from "../../elements/GenreTag";
import ArtistTag from "../../elements/ArtistTag";
import Section from "../../elements/Section";
import MusicPlayerBar from "../../elements/MusicPlayerBar";
import SearchBar from "../../elements/SearchBar"; // ✅ import mới

export default function HomePage() {

  const handleSearch = (query) => {
    console.log("Đang tìm kiếm:", query);
    // 👉 gọi API tìm kiếm hoặc cập nhật state
  };

  return (
    <div className="flex flex-col h-screen text-white bg-gradient-to-br from-[#0a0f1f] via-[#0d1b2a] to-[#000]">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 flex flex-col">
          {/* Sử dụng component SearchBar */}
          <SearchBar onSearch={handleSearch} />
            <div className="flex-1 p-6 overflow-y-auto text-white">
              <Section title="Bài hát nghe gần đây">
                <div className="grid grid-cols-4 gap-4">
                  <MusicCard title="Bài 1" artist="Nghệ sĩ 1" />
                  <MusicCard title="Bài 2" artist="Nghệ sĩ 2" />
                  <MusicCard title="Bài 3" artist="Nghệ sĩ 3" />
                  <MusicCard title="Bài 4" artist="Nghệ sĩ 4" />
                </div>
              </Section>

              <Section title="Gợi ý bài hát">
                <div className="grid grid-cols-4 gap-4">
                  <SongItem title="Bài 1" artist="Nghệ sĩ 1" />
                  <SongItem title="Bài 2" artist="Nghệ sĩ 2" />
                  <SongItem title="Bài 3" artist="Nghệ sĩ 3" />
                  <SongItem title="Bài 4" artist="Nghệ sĩ 4" />
                </div>
              </Section>

              <Section title="Thể loại">
                <div className="grid grid-cols-4 gap-4">
                  <GenreTag name="Pop" />
                  <GenreTag name="Rock" />
                  <GenreTag name="Jazz" />
                  <GenreTag name="EDM" />
                </div>
              </Section>

              <Section title="Nghệ sĩ nổi bật gần đây">
                <div className="grid grid-cols-4 gap-4">
                  <ArtistTag name="Nghệ sĩ 1" />
                  <ArtistTag name="Nghệ sĩ 2" />
                  <ArtistTag name="Nghệ sĩ 3" />
                  <ArtistTag name="Nghệ sĩ 4" />
                </div>
              </Section>

              <Section title="Bài hát mới phát hành">
                <div className="grid grid-cols-4 gap-4">
                  <SongItem title="Bài 1" artist="Nghệ sĩ 1" />
                  <SongItem title="Bài 2" artist="Nghệ sĩ 2" />
                  <SongItem title="Bài 3" artist="Nghệ sĩ 3" />
                  <SongItem title="Bài 4" artist="Nghệ sĩ 4" />
                </div>
              </Section>

              <Section title="Album Hot">
                <div className="grid grid-cols-4 gap-4">
                  <MusicCard title="Album 1" artist="Nghệ sĩ 1" />
                  <MusicCard title="Album 2" artist="Nghệ sĩ 2" />
                  <MusicCard title="Album 3" artist="Nghệ sĩ 3" />
                  <MusicCard title="Album 4" artist="Nghệ sĩ 4" />
                </div>
              </Section>
            </div>

        </main>
      </div>

      <MusicPlayerBar />
    </div>
  );
}
