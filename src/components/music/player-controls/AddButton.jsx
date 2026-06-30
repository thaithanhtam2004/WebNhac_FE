export default function AddButton() {
  const handleAdd = () => alert("Đã thêm vào playlist!");
  return (
    <span
      className="cursor-pointer text-white hover:text-green-400 transition"
      onClick={handleAdd}
    >
      ➕
    </span>
  );
}
