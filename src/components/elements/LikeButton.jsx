import { useState } from "react";
import { Heart } from "lucide-react";
import { addFavorite, removeFavorite } from "@/services/favoriteService";

/**
 * LikeButton – nút yêu thích bài hát
 *
 * @param {number|string} userId  - ID người dùng hiện tại
 * @param {number|string} songId  - ID bài hát
 * @param {boolean} initialLiked  - Trạng thái yêu thích ban đầu (true/false)
 * @param {function} onChange     - (optional) Callback khi trạng thái thay đổi
 */
export default function LikeButton({ userId, songId, initialLiked = false, onChange }) {
  const [liked, setLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return; // tránh spam click
    setLoading(true);

    const newValue = !liked;
    setLiked(newValue); // cập nhật UI ngay lập tức

    try {
      if (newValue) {
        await addFavorite(userId, songId);
      } else {
        await removeFavorite(userId, songId);
      }

      if (onChange) onChange(newValue);
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật yêu thích:", error);
      setLiked(!newValue); // rollback nếu lỗi
    } finally {
      setLoading(false);
    }
  };

  return (
    <Heart
      size={20}
      title={liked ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
      className={`cursor-pointer transition-transform duration-200 ${
        liked
          ? "text-red-400 fill-red-400 scale-110"
          : "text-gray-300 hover:text-red-400 hover:scale-110"
      } ${loading ? "opacity-50 pointer-events-none" : ""}`}
      onClick={handleClick}
    />
  );
}
