import { useState } from "react";
import React from "react";
import { createPortal } from "react-dom";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { useScrollLock } from "./useScrollLock";

export function useConfirmDialog() {
  const [dialog, setDialog] = useState(null);
  
  // Áp dụng hook khóa cuộn khi có dialog
  useScrollLock(!!dialog);

  const confirm = (message, title = "Xác nhận") => {
    return new Promise((resolve) => {
      setDialog({
        title,
        message,
        onConfirm: () => {
          setDialog(null);
          resolve(true);
        },
        onCancel: () => {
          setDialog(null);
          resolve(false);
        },
      });
    });
  };

  const ConfirmUI =
    dialog &&
    createPortal(
      React.createElement(ConfirmDialog, {
        title: dialog.title,
        message: dialog.message,
        onConfirm: dialog.onConfirm,
        onCancel: dialog.onCancel,
      }),
      document.body
    );

  return { confirm, ConfirmUI };
}
