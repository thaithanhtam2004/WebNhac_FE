import { useState, useEffect } from "react";
import Notification from "../components/elements/Notification";
import React from "react"; // ⚠️ cần import React để dùng createElement

export function useNotification() {
  const [notif, setNotif] = useState(null);

  useEffect(() => {
    if (notif) {
      const timer = setTimeout(() => setNotif(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notif]);

  const showNotification = (type, message) => {
    setNotif({ type, message });
  };

  const NotificationUI =
    notif &&
    React.createElement(Notification, {
      type: notif.type,
      message: notif.message,
      onClose: () => setNotif(null),
    });

  return { showNotification, NotificationUI };
}
