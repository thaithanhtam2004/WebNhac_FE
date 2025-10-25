export default function MusicCard({ title, artist }) {
  return (
    <div className="bg-gradient-to-br from-blue-600/50 via-purple-700/50 to-pink-600/50 p-4 rounded-xl w-60 text-center shadow-lg shadow-black/30 hover:scale-105 transition-transform">
      <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 h-32 w-full rounded-lg mb-3"></div>
      <p className="font-semibold text-white">{title}</p>
      <p className="text-sm text-pink-200 mb-2">{artist}</p>
      <div className="flex justify-center gap-4 text-lg">
        <span className="hover:text-red-400 transition">❤️</span>
        <span className="hover:text-green-400 transition">➕</span>
        <span className="hover:text-cyan-400 transition">▶️</span>
      </div>
    </div>
  );
}
