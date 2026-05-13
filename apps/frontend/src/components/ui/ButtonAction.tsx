import React from "react";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";

interface ButtonActionProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onReset?: () => void;
  onView?: () => void;
  className?: string;
}

export function ButtonAction({ onEdit, onDelete, onReset, onView, className }: ButtonActionProps) {
  return (
    <div className={cn("flex items-center justify-end gap-2", className)}>
      {onView && (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); onView(); }}
          className="p-2.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl transition-all shadow-md shadow-emerald-200 border-none"
          title="View / Detail"
        >
          <Icon name="eye" className="w-4 h-4" />
        </button>
      )}
      {onReset && (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); onReset(); }}
          className="p-2.5 bg-amber-500 text-white hover:bg-amber-600 rounded-xl transition-all shadow-md shadow-amber-200 border-none"
          title="Reset Password / Access"
        >
          <Icon name="lock" className="w-4 h-4" />
        </button>
      )}
      {onEdit && (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); onEdit(); }}
          className="p-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-200 border-none"
          title="Edit Data"
        >
          <Icon name="edit" className="w-4 h-4" />
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); onDelete(); }}
          className="p-2.5 bg-red-600 text-white hover:bg-red-700 rounded-xl transition-all shadow-md shadow-red-200 border-none"
          title="Delete Data"
        >
          <Icon name="trash" className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
