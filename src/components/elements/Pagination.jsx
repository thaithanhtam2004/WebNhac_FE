// src/components/elements/Pagination.jsx
export default function Pagination({ currentPage, totalItems, onPageChange }) {
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages === 0) {
    return <div className="mt-8 mb-4 h-8" />;
  }

  const renderPages = () => {
    const pages = [];

    if (totalPages <= 7) {
      // Hiện tất cả nếu <= 7 trang
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Luôn có trang đầu + cuối
      if (currentPage > 4) pages.push(1, "...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 3) pages.push("...", totalPages);
    }

    return pages;
  };

  const pages = renderPages();

  return (
    <div className="mt-8 mb-4 flex justify-center items-center gap-2 select-none">
      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1.5 rounded-md border border-gray-300 text-sm text-gray-700 bg-white 
                   hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed 
                   transition-all duration-200"
      >
        Previous
      </button>

      {/* Page Numbers */}
      {pages.map((page, idx) =>
        page === "..." ? (
          <span key={`dots-${idx}`} className="px-2 text-gray-500 select-none">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1.5 rounded-md border text-sm font-medium transition-all duration-200
              ${
                currentPage === page
                  ? "bg-black text-white border-black shadow"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
          >
            {page}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 rounded-md border border-gray-300 text-sm text-gray-700 bg-white 
                   hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed 
                   transition-all duration-200"
      >
        Next
      </button>
    </div>
  );
}
