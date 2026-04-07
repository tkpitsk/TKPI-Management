"use client";

import BaseRateHistory from "./BaseRateHistory";

export default function BaseRateHistoryModal({
  productId,
  onClose,
  onUpdate,
}: {
  productId: string;
  onClose: () => void;
  onUpdate: () => void; // 🔥 new
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

      <div className="bg-white rounded-xl w-full max-w-2xl p-6 space-y-4 shadow-xl">

        {/* HEADER */}
        <div className="flex justify-between items-center border-b pb-3">

          <div>
            <h2 className="font-semibold text-lg">Base Rate History</h2>
            <p className="text-xs text-gray-400">
              Track price changes over time
            </p>
          </div>

          <div className="flex items-center gap-3">

            {/* 🔥 UPDATE BUTTON */}
            <button
              onClick={onUpdate}
              className="text-sm bg-brand-primary text-white px-3 py-1.5 rounded-lg hover:bg-brand-primary/90"
            >
              Update Rate
            </button>

            <button onClick={onClose} className="text-gray-500 hover:text-black">
              ✕
            </button>
          </div>

        </div>

        {/* CONTENT */}
        <BaseRateHistory productId={productId} />

      </div>
    </div>
  );
}