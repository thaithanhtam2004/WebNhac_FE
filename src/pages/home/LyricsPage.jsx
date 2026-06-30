import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Music2, User } from "lucide-react";
import { toast } from "react-hot-toast";

// Services
import { getSongById } from "../../services/songService";

export default function LyricsPage() {
  const { songId } = useParams();
  const navigate = useNavigate();
  
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch song data
  useEffect(() => {
    const fetchSong = async () => {
      setLoading(true);
      try {
        const data = await getSongById(songId);
        console.log("Song data received:", data); // 🔍 Debug: xem structure
        console.log("Lyrics:", data?.lyric || data?.lyrics); // 🔍 Debug: xem field lyrics
        setSong(data || null);
      } catch (err) {
        console.error("Error fetching song:", err);
        toast.error("Không thể tải thông tin bài hát!");
      } finally {
        setLoading(false);
      }
    };
    fetchSong();
  }, [songId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-white text-lg">Đang tải lời bài hát...</p>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-white text-lg">Không tìm thấy bài hát.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full text-white overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-gray-900 via-gray-900/95 to-transparent p-6 pb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition mb-6"
        >
          <ArrowLeft size={20} />
          <span className="font-semibold">Quay lại</span>
        </button>

        <div className="flex items-center gap-6">
          {/* Song Cover */}
          <div className="w-32 h-32 rounded-lg overflow-hidden shadow-2xl flex-shrink-0">
            {song.coverUrl ? (
              <img
                src={song.coverUrl}
                alt={song.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                <Music2 size={40} className="text-gray-500" />
              </div>
            )}
          </div>

          {/* Song Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{song.title}</h1>
            <div className="flex items-center gap-2 text-gray-400">
              <User size={16} />
              <span className="text-lg">
                {song.singerName || song.artist || "Unknown Artist"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lyrics Content */}
      <div className="flex-1 px-6 pb-20">
        <div className="max-w-3xl mx-auto">
          {(song.lyrics || song.lyric) ? (
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-xl p-8 shadow-lg">
              <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed text-gray-200">
                {song.lyrics || song.lyric}
              </pre>
            </div>
          ) : (
            <div className="bg-gray-800/40 rounded-xl p-12 text-center">
              <Music2 size={48} className="mx-auto mb-4 text-gray-500" />
              <p className="text-gray-400 text-lg">
                Lời bài hát chưa được cập nhật.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}