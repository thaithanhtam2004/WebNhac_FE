export default function ArtistTag({ name, imageUrl }) {
  return (
    <div className="bg-gradient-to-br from-blue-600/50 via-purple-700/50 to-pink-600/50 p-4 rounded-xl w-60 text-center shadow-lg shadow-black/30 hover:scale-105 transition-transform">
      {/* Hình vuông lớn */}
      <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-800/70 flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-white font-bold text-2xl">{name[0]}</span>
        )}
      </div>

      {/* Tên nghệ sĩ */}
      <p className="mt-3 font-semibold text-white">{name}</p>
    </div>
  );
}
