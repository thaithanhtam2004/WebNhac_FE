import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { addFavorite, removeFavorite } from "../../services/favoriteService";

/**
 * LikeButton – Nút yêu thích bài hát (có thể tái sử dụng)
 *
 * @param {string} userId        - ID người dùng hiện tại
 * @param {string} songId        - ID bài hát
 * @param {boolean} initialLiked - Trạng thái yêu thích ban đầu
 * @param {function} onChange    - Callback khi trạng thái thay đổi (tùy chọn)
 */
export default function LikeButton({ userId, songId, initialLiked = false, onChange }) {
  const [liked, setLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);

  // Đồng bộ trạng thái khi initialLiked thay đổi
  useEffect(() => {
    setLiked(initialLiked);
  }, [initialLiked]);

  const handleClick = async () => {
    if (loading) return;
    if (!userId) {
      alert("⚠️ Vui lòng đăng nhập để thêm bài hát vào yêu thích!");
      return;
    }

    setLoading(true);
    const newValue = !liked;
    setLiked(newValue);

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
      onClick={handleClick}
      title={liked ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
      className={`cursor-pointer transition-all duration-200 ${
        liked
          ? "text-red-400 fill-red-400 scale-110"
          : "text-gray-300 hover:text-red-400 hover:scale-110"
      } ${loading ? "opacity-50 pointer-events-none" : ""}`}
    />
  );
}
