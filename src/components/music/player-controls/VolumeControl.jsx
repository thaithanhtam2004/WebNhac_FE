import { useState } from "react";

export default function VolumeControl() {
  const [volume, setVolume] = useState(50);

  return (
    <div className="flex items-center gap-3 text-white text-xl">
      <span className="cursor-pointer hover:text-gray-300">🔊</span>
      <input
        type="range"
        min="0"
        max="100"
        value={volume}
        onChange={(e) => setVolume(e.target.value)}
        className="w-24 h-1 rounded-lg accent-white cursor-pointer"
      />
    </div>
  );
}
