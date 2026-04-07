"use client";

import { useEffect, useState } from "react";
import { BaseRate } from "@/types/baseRate";
import { getBaseRateHistory } from "@/services/baseRate.service";

export default function BaseRateHistory({
  productId,
}: {
  productId: string;
}) {
  const [data, setData] = useState<BaseRate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!productId) return;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await getBaseRateHistory(productId);
        setData(res.data); // latest first
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [productId]);

  return (
    <div className="max-h-100 overflow-y-auto">

      {loading ? (
        <div className="p-4 text-gray-500">Loading...</div>
      ) : !data.length ? (
        <div className="p-4 text-gray-500">
          No history available
        </div>
      ) : (

        <div className="space-y-4">

          {data.map((item, index) => {
            const prev = data[index + 1];

            const diff =
              prev ? item.rate - prev.rate : null;

            const isUp = diff !== null && diff > 0;
            const isDown = diff !== null && diff < 0;

            return (
              <div
                key={item._id}
                className={`flex justify-between items-center p-4 rounded-lg border ${index === 0
                    ? "bg-blue-50 border-blue-200"
                    : "bg-white"
                  }`}
              >

                {/* LEFT */}
                <div className="space-y-1">

                  <div className="flex items-center gap-2">

                    <p className="font-semibold text-base">
                      ₹ {item.rate.toLocaleString()}
                    </p>

                    {/* 🔥 CHANGE */}
                    {diff !== null && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${isUp
                            ? "bg-green-100 text-green-700"
                            : isDown
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                      >
                        {isUp ? "↑" : isDown ? "↓" : "→"}{" "}
                        ₹ {Math.abs(diff).toLocaleString()}
                      </span>
                    )}

                    {/* LATEST BADGE */}
                    {index === 0 && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        Latest
                      </span>
                    )}

                  </div>

                  <p className="text-xs text-gray-400">
                    {new Date(item.date).toLocaleString()}
                  </p>

                </div>

                {/* RIGHT TIMELINE DOT */}
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-gray-300 rounded-full" />
                  {index !== data.length - 1 && (
                    <div className="w-0.5 h-10 bg-gray-200" />
                  )}
                </div>

              </div>
            );
          })}

        </div>
      )}
    </div>
  );
}