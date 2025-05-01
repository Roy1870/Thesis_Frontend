"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

const MessageDisplay = ({ message }) => {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const autoDismissTime = 5000; // 5 seconds

  useEffect(() => {
    if (message.content) {
      setVisible(true);
      setProgress(100);

      // Auto-dismiss timer
      const dismissTimer = setTimeout(() => {
        setVisible(false);
      }, autoDismissTime);

      // Progress bar animation
      const startTime = Date.now();
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / autoDismissTime) * 100);
        setProgress(remaining);

        if (remaining <= 0) {
          clearInterval(progressInterval);
        }
      }, 50);

      return () => {
        clearTimeout(dismissTimer);
        clearInterval(progressInterval);
      };
    } else {
      setVisible(false);
    }
  }, [message]);

  if (!message.content) return null;

  const getIcon = () => {
    switch (message.type) {
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      case "error":
        return <AlertCircle className="w-5 h-5" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5" />;
      case "info":
        return <Info className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-in-out ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-10 pointer-events-none"
      }`}
    >
      <div
        className={`flex items-center shadow-lg rounded-lg px-4 py-3 max-w-md w-full ${
          message.type === "success"
            ? "bg-green-100 text-green-800 border-l-4 border-green-500"
            : message.type === "info"
            ? "bg-blue-100 text-blue-800 border-l-4 border-blue-500"
            : message.type === "warning"
            ? "bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500"
            : "bg-red-100 text-red-800 border-l-4 border-red-500"
        }`}
      >
        <div className="flex-shrink-0 mr-3">{getIcon()}</div>
        <div className="flex-grow mr-3">{message.content}</div>
        <button
          onClick={() => setVisible(false)}
          className="flex-shrink-0 p-1 transition-colors rounded-full hover:bg-gray-200"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 overflow-hidden bg-gray-200 rounded-b-lg">
        <div
          className={`h-full transition-all ease-linear ${
            message.type === "success"
              ? "bg-green-500"
              : message.type === "info"
              ? "bg-blue-500"
              : message.type === "warning"
              ? "bg-yellow-500"
              : "bg-red-500"
          }`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default MessageDisplay;
