import React from "react";

export default function SectionAlbum({
  title,
  data = [],
  renderItem,
  headerRight,
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

  // Hiển thị hết item
  const limitedData = data;

  return (
    <section className="mb-10 px-8">
      {renderHeader}
      <div className="flex gap-4">
        {limitedData.map((item, index) => (
          <div key={index} className="flex-1 min-w-[200px]">
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </section>
  );
}
