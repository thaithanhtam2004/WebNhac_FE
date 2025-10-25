import { useState } from "react";
import Section from "../../elements/Section";
import SearchBar from "../../elements/SearchBar";
import GenreTag from "../../elements/GenreTag";

// Map mood sang màu Tailwind
const moodColors = {
  "Vui vẻ": "text-yellow-400",
  "Buồn": "text-blue-400",
  "Lãng mạn": "text-pink-400",
  "Hưng phấn": "text-orange-400",
  "Thư giãn": "text-green-400",
};

// Component hiển thị mood
function MoodLabel({ mood }) {
  return <p className={`${moodColors[mood] || "text-gray-400"} text-xs mt-1`}>{mood}</p>;
}

// Component hiển thị bài hát
function SongCard({ song }) {
  return (
    <div className="bg-[#1a1a1a] rounded-xl p-3 text-center shadow-md shadow-black/30">
      <img
        src={song.cover}
        alt={song.title}
        className="w-full h-32 rounded-lg object-cover mb-2"
      />
      <p className="font-semibold text-white">{song.title}</p>
      <p className="text-sm text-pink-400">{song.artist}</p>
      <MoodLabel mood={song.mood} />
    </div>
  );
}

export default function SearchResultsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Dữ liệu ảo
  const songs = [
    // 4 bài Vui vẻ của Sơn Tùng
    { id: 1, title: "Bài hát 1", artist: "Sơn Tùng M-TP", genre: "Pop", mood: "Vui vẻ", cover: "https://picsum.photos/seed/song1/80/80" },
    { id: 2, title: "Bài hát 2", artist: "Sơn Tùng M-TP", genre: "Pop", mood: "Vui vẻ", cover: "https://picsum.photos/seed/song2/80/80" },
    { id: 3, title: "Bài hát 3", artist: "Sơn Tùng M-TP", genre: "Pop", mood: "Vui vẻ", cover: "https://picsum.photos/seed/song3/80/80" },
    { id: 4, title: "Bài hát 4", artist: "Sơn Tùng M-TP", genre: "Pop", mood: "Vui vẻ", cover: "https://picsum.photos/seed/song4/80/80" },

    // 4 bài Vui vẻ của ca sĩ khác
    { id: 5, title: "Bài hát 5", artist: "Đen Vâu", genre: "Hip-hop", mood: "Vui vẻ", cover: "https://picsum.photos/seed/song5/80/80" },
    { id: 6, title: "Bài hát 6", artist: "Hoàng Thùy Linh", genre: "Pop", mood: "Vui vẻ", cover: "https://picsum.photos/seed/song6/80/80" },
    { id: 7, title: "Bài hát 7", artist: "Jack", genre: "EDM", mood: "Vui vẻ", cover: "https://picsum.photos/seed/song7/80/80" },
    { id: 8, title: "Bài hát 8", artist: "Min", genre: "Ballad", mood: "Vui vẻ", cover: "https://picsum.photos/seed/song8/80/80" },
  ];

  const allGenres = ["Pop", "Hip-hop", "EDM", "Ballad", "Jazz", "Rock"]; // Danh sách toàn bộ thể loại

  // Kết quả tìm kiếm: 4 bài Vui vẻ của Sơn Tùng
  const filteredSongs = songs
    .filter((song) => song.artist === "Sơn Tùng M-TP" && song.mood === "Vui vẻ")
    .slice(0, 4);

  // Thể loại liên quan: các genre xuất hiện trong filteredSongs
  let relatedGenres = [...new Set(filteredSongs.map((song) => song.genre))];

  // Thêm 2 thể loại khác từ danh sách allGenres, không trùng
  const extraGenres = allGenres.filter((g) => !relatedGenres.includes(g)).slice(0, 2);
  relatedGenres = [...relatedGenres, ...extraGenres];

  // Bài hát liên quan: cùng mood nhưng ca sĩ khác
  const relatedSongs = songs
    .filter(
      (song) =>
        song.mood === "Vui vẻ" &&
        song.artist !== "Sơn Tùng M-TP"
    )
    .slice(0, 4);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <div className="flex flex-col w-full h-full text-white">
      <SearchBar onSearch={handleSearch} />

      <div className="flex-1 p-6 overflow-y-auto">
        {/* Kết quả tìm kiếm */}
        <Section title={`Kết quả  ${searchQuery}`}>
          {filteredSongs.length === 0 ? (
            <p className="text-gray-400 text-center py-10">
              Không tìm thấy kết quả nào.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {filteredSongs.map((song) => (
                <SongCard key={song.id} song={song} />
              ))}
            </div>
          )}
        </Section>

        {/* Thể loại liên quan */}
        {relatedGenres.length > 0 && (
          <Section title="Thể loại liên quan">
            <div className="flex flex-wrap gap-3">
              {relatedGenres.map((g) => (
                <GenreTag key={g} name={g} />
              ))}
            </div>
          </Section>
        )}

        {/* Bài hát liên quan */}
        {relatedSongs.length > 0 && (
          <Section title="Bài hát liên quan">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedSongs.map((song) => (
                <SongCard key={song.id} song={song} />
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}
