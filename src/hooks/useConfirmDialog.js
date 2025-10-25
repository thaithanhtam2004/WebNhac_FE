import { useState } from "react";
import React from "react";
import ConfirmDialog from "../components/elements/ConfirmDialog";

export function useConfirmDialog() {
  const [dialog, setDialog] = useState(null);

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
    React.createElement(ConfirmDialog, {
      title: dialog.title,
      message: dialog.message,
      onConfirm: dialog.onConfirm,
      onCancel: dialog.onCancel,
    });

  return { confirm, ConfirmUI };
}
