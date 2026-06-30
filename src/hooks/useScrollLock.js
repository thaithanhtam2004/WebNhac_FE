import { useEffect } from "react";

export function useScrollLock(isLocked) {
  useEffect(() => {
    if (!isLocked) return;

    // Lấy chiều rộng thanh cuộn (scrollbar width)
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    // Lưu lại style cũ để khôi phục
    const originalStyle = window.getComputedStyle(document.body).overflow;
    const originalPaddingRight = window.getComputedStyle(document.body).paddingRight;

    // Khóa cuộn và bù phần padding cho scrollbar để tránh giật layout
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `calc(${originalPaddingRight} + ${scrollbarWidth}px)`;

    return () => {
      // Khôi phục
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isLocked]);
}
