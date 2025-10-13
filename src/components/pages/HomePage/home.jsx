import { useState } from "react";
import MusicCard from "../../elements/MusicCard";
import SongItem from "../../elements/SongItem";
import GenreTag from "../../elements/GenreTag";
import ArtistTag from "../../elements/ArtistTag";
import Section from "../../elements/Section";
import SearchBar from "../../elements/SearchBar";

// Component riêng cho phần Gợi ý bài hát + Dropdown chọn mood
function MoodSuggestions({ songs, moods }) {
  const [selectedMood, setSelectedMood] = useState("Tất cả");

  const filteredSongs =
    selectedMood === "Tất cả"
      ? songs
      : songs.filter((song) => song.mood === selectedMood);

  return (
    <Section
      title={
        <div className="flex items-center gap-3">
          <span className="font-semibold text-white text-lg">Gợi ý bài hát</span>
          <select
            value={selectedMood}
            onChange={(e) => setSelectedMood(e.target.value)}
            className="bg-[#1a1a1a] text-white px-2 py-1 rounded-lg border border-gray-700"
          >
            {moods.map((mood) => (
              <option key={mood} value={mood}>
                {mood}
              </option>
            ))}
          </select>
        </div>
      }
    >
      <div className="grid grid-cols-4 gap-4">
        {filteredSongs.map((song) => (
          <SongItem key={song.id} title={song.title} artist={song.artist} />
        ))}
      </div>
    </Section>
  );
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");

  const moods = ["Tất cả", "Vui vẻ", "Buồn", "Lãng mạn", "Hưng phấn", "Thư giãn"];

  // Dữ liệu mẫu gợi ý bài hát
  const suggestedSongs = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    title: `Bài hát ${i + 1}`,
    artist: ["Sơn Tùng M-TP", "Đen Vâu", "Hoàng Thùy Linh", "Jack", "Min"][i % 5],
    mood: ["Vui vẻ", "Buồn", "Lãng mạn", "Hưng phấn", "Thư giãn"][i % 5],
  }));

  const handleSearch = (query) => {
    setSearchQuery(query);
    console.log("Đang tìm kiếm:", query);
  };

  return (
    <div className="flex flex-col w-full h-full text-white">
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

        {/* Section Gợi ý bài hát với Mood */}
        <MoodSuggestions songs={suggestedSongs} moods={moods} />

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
    </div>
  );
}
