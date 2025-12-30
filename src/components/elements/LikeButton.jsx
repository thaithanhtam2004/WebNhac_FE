import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Heart } from "lucide-react";
import { addFavorite, removeFavorite } from "../../services/favoriteService";
import Notification from "./Notification";

export default function LikeButton({ userId, songId, initialLiked = false, onChange }) {
  const [liked, setLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    setLiked(initialLiked);
  }, [initialLiked]);

  const showNotify = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleClick = async (e) => {
    e.stopPropagation(); // Quan trọng: Chặn click xuyên qua card
    
    if (loading) return;
    if (!userId) {
      showNotify("warning", "Vui lòng đăng nhập để yêu thích!");
      return;
    }

    setLoading(true);
    const newValue = !liked;
    setLiked(newValue); // Optimistic UI

    try {
      if (newValue) {
        await addFavorite(userId, songId);
        showNotify("success", "Đã thêm vào yêu thích ❤️");
      } else {
        await removeFavorite(userId, songId);
        showNotify("success", "Đã xóa khỏi yêu thích");
      }

      if (onChange) onChange(newValue);
    } catch (error) {
      console.error(error);
      setLiked(!newValue); // Rollback
      showNotify("error", "Lỗi kết nối, thử lại sau!");
    } finally {
      setLoading(false);
    }
  };

  const notificationContent = notification ? (
    <Notification type={notification.type} message={notification.message} onClose={() => setNotification(null)} />
  ) : null;

  return (
    <>
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
      
      {/* Portal cho Notification */}
      {createPortal(notificationContent, document.body)}
    </>
  );
}