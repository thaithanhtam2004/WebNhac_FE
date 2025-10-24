import React from "react";

export default function Section({ title, useFetchHook, renderItem }) {
  const { data, loading, error } = useFetchHook();

  if (loading)
    return (
      <section className="mb-8 px-8">
        <h3 className="font-semibold mb-3 text-white">{title}</h3>
        <p className="text-gray-400">Đang tải {title.toLowerCase()}...</p>
      </section>
    );

  if (error)
    return (
      <section className="mb-8 px-8">
        <h3 className="font-semibold mb-3 text-white">{title}</h3>
        <p className="text-red-400">Lỗi khi tải dữ liệu: {error}</p>
      </section>
    );

  if (!data || data.length === 0)
    return (
      <section className="mb-8 px-8">
        <h3 className="font-semibold mb-3 text-white">{title}</h3>
        <p className="text-gray-400">Không có dữ liệu để hiển thị.</p>
      </section>
    );

  // Giới hạn tối đa 100 bài
  const limitedData = data.slice(0, 100);

  return (
    <section className="mb-10 px-8">
      <h3 className="font-semibold mb-4 text-white">{title}</h3>

      {/* Vùng scroll ngang */}
      <div className="flex overflow-x-auto gap-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent pb-2">
        {limitedData.map((item, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-1/5 min-w-[200px]" // Mỗi bài chiếm 1/5 chiều ngang
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </section>
  );
}
