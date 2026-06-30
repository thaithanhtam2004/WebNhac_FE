import { useState } from "react";

export default function LikeButton() {
  const [liked, setLiked] = useState(false);
  return (
    <span
      className={`cursor-pointer transition ${liked ? "text-red-400" : "text-white hover:text-red-400"}`}
      onClick={() => setLiked(!liked)}
    >
      ❤️
    </span>
  );
}
