"use client";

import { useEffect, useState } from "react";
import { LatestBaseRate } from "@/types/baseRate";
import { getAllLatestBaseRates } from "@/services/baseRate.service";

import BaseRateModal from "@/components/baseRate/BaseRateModal";
import BaseRateHistoryModal from "@/components/baseRate/BaseRateHistoryModal";

export default function BaseRatesPage() {
  const [data, setData] = useState<LatestBaseRate[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [historyProduct, setHistoryProduct] = useState<string | null>(null);

  /* ================= FETCH ================= */
  const fetchRates = async () => {
    try {
      setLoading(true);
      const res = await getAllLatestBaseRates();
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Base Rates</h1>
          <p className="text-sm text-gray-500">
            Track and manage product pricing changes
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-brand-primary text-white px-4 py-2 rounded-lg text-sm"
        >
          + Add Base Rate
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-xl overflow-hidden">

        {loading ? (
          <div className="p-6 text-gray-500">Loading...</div>
        ) : data.length === 0 ? (
          <div className="p-6 text-gray-500 text-center">
            No base rates found
          </div>
        ) : (
          <table className="w-full text-sm">

            <thead className="bg-gray-50 border-b text-gray-600">
              <tr>
                <th className="text-left px-4 py-3">Product</th>
                <th className="text-left px-4 py-3">Current Rate</th>
                <th className="text-left px-4 py-3">Change</th>
                <th className="text-left px-4 py-3">Updated</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {data.map((item) => (
                <tr key={item.productId} className="border-b">

                  <td className="px-4 py-3 capitalize font-medium">
                    {item.productName}
                  </td>

                  <td className="px-4 py-3 font-semibold">
                    ₹ {item.rate.toLocaleString()}
                  </td>

                  <td className="px-4 py-3">
                    {item.previousRate !== undefined ? (
                      <div className="flex items-center gap-2">

                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${item.rate > item.previousRate
                              ? "bg-green-100 text-green-700"
                              : item.rate < item.previousRate
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                        >
                          {item.rate > item.previousRate
                            ? "↑"
                            : item.rate < item.previousRate
                              ? "↓"
                              : "→"}{" "}
                          ₹ {Math.abs(item.rate - item.previousRate).toLocaleString()}
                        </span>

                        {/* optional % change */}
                        <span className="text-xs text-gray-400">
                          {item.previousRate > 0
                            ? `${(
                              ((item.rate - item.previousRate) / item.previousRate) *
                              100
                            ).toFixed(1)}%`
                            : ""}
                        </span>

                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">New</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(item.updatedAt).toLocaleString()}
                  </td>

                  <td className="px-4 py-3 text-right space-x-3">

                    <button
                      onClick={() => setHistoryProduct(item.productId)}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </button>

                    <button
                      onClick={() => setShowModal(true)}
                      className="text-green-600 hover:underline"
                    >
                      Update
                    </button>

                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        )}
      </div>

      {/* ADD MODAL */}
      {showModal && (
        <BaseRateModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchRates}
        />
      )}

      {/* HISTORY MODAL */}
      {historyProduct && (
        <BaseRateHistoryModal
          productId={historyProduct}
          onClose={() => setHistoryProduct(null)}
          onUpdate={() => {
            setHistoryProduct(null);
            setShowModal(true);
          }}
        />
      )}
    </div>
  );
}