export default function SongItem({ title, artist }) {
  return (
    <div className="flex items-center bg-blue-800 p-3 rounded-lg max-w-md justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-blue-700 h-12 w-12 rounded-lg"></div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-blue-200">{artist}</p>
        </div>
      </div>
      <button className="text-xl">▶️</button>
    </div>
  );
}
