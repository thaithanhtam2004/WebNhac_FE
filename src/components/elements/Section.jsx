<<<<<<< Updated upstream
export default function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h3 className="font-semibold mb-3">{title}</h3>
      {children}
=======
import React from "react";

export default function Section({
  title,
  data = [],
  renderItem,
  headerRight,
  limit,
}) {
  // Header chung
  const renderHeader = (
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-semibold text-white">{title}</h3>
      {headerRight && <div>{headerRight}</div>}
    </div>
  );

  if (!data || data.length === 0)
    return (
      <section className="mb-8 px-8">
        {renderHeader}
        <p className="text-gray-400">Không có dữ liệu để hiển thị.</p>
      </section>
    );

  // Sắp xếp hoặc giới hạn dữ liệu nếu cần
  const items = limit ? data.slice(0, limit) : data;
  // Giới hạn tối đa 5 item (hoặc bạn có thể hiển thị hết)
  //const limitedData = data.slice(0, 5);
  return (
    <section className="mb-10 px-8">
      {renderHeader}
      <div className="flex gap-4 flex-wrap">
        {items.map((item, index) => (
          <div key={item.albumId || index} className="flex-1 min-w-[200px]">
            {renderItem(item, index)}
          </div>
        ))}
      </div>
>>>>>>> Stashed changes
    </section>
  );
}
