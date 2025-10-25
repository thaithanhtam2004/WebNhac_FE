import { useState } from "react";

export default function ControlButton() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="flex items-center gap-4 text-xl text-white">
      <span className="cursor-pointer hover:text-gray-300">⏮️</span>
      <span
        className="cursor-pointer hover:text-gray-300"
        onClick={() => setIsPlaying(!isPlaying)}
      >
        {isPlaying ? "⏸️" : "▶️"}
      </span>
      <span className="cursor-pointer hover:text-gray-300">⏭️</span>
    </div>
  );
}
