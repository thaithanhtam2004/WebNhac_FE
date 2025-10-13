// components/MoodSelectorSection.jsx
import { useState } from "react";
import Section from "../../elements/Section";
import SongItem from "../../elements/SongItem";

export default function MoodSelectorSection({ title, moods, songs }) {
  const [selectedMood, setSelectedMood] = useState("Tất cả");

  // Lọc bài hát theo mood
  const filteredSongs =
    selectedMood === "Tất cả"
      ? songs
      : songs.filter((song) => song.mood === selectedMood);

  return (
    <Section
      title={
        <div className="flex items-center gap-3">
          <span className="font-semibold text-white text-lg">{title}</span>
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
