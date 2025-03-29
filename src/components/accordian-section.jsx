"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

function AccordionSection({ title, children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded-md mb-4 overflow-hidden">
      <div
        className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-sm font-medium">{title}</h3>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </div>
      {isOpen && <div className="p-3 border-t">{children}</div>}
    </div>
  );
}

export default AccordionSection;
