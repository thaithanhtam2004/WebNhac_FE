import { Play, Pause } from "lucide-react";

export default function PlayButton({
  song,
  isPlaying = false,
  isCurrent = false,
  onPlay,
  onPause,
  variant = "simple",  // "simple" | "circle"
}) {

  const handleClick = () => {
    if (!song) return;

    if (isCurrent && isPlaying) {
      onPause?.(); // nếu đang phát bài đó thì pause
    } else {
      onPlay?.(song); // nếu bài mới hoặc đang stop thì play
    }
  };

const baseStyle = `
  flex items-center justify-center
  w-10 h-10
  hover:scale-110 transition active:scale-95
`;

const variantStyle =
  variant === "circle"
    ? "bg-white text-black rounded-full hover:bg-gray-200 shadow-lg"
    : "text-white"; // simple = chỉ icon trắng, không nền


  return (
    <button onClick={handleClick} className={`${baseStyle} ${variantStyle}`}>
      {isCurrent && isPlaying ? <Pause size={18} /> : <Play size={18} className="translate-x-[1px]" />}
    </button>
  );
}
