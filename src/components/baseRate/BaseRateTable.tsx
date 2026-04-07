import { LatestBaseRate } from "@/types/baseRate";

export default function BaseRateTable({
  data,
  loading,
}: {
  data: LatestBaseRate[];
  loading: boolean;
}) {
  if (loading) {
    return <div className="p-6 text-gray-500">Loading...</div>;
  }

  if (!data.length) {
    return (
      <div className="p-6 text-gray-500 border rounded-xl text-center">
        No base rates yet
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-xl overflow-hidden">

      <div className="p-4 border-b font-medium">
        Current Base Rates
      </div>

      <table className="w-full text-sm">

        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="text-left px-4 py-3">Product</th>
            <th className="text-left px-4 py-3">Rate</th>
            <th className="text-left px-4 py-3">Updated</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr key={item.productId} className="border-b">
              <td className="px-4 py-3 capitalize">
                {item.productName}
              </td>

              <td className="px-4 py-3 font-medium">
                ₹{item.rate.toLocaleString()}
              </td>

              <td className="px-4 py-3 text-gray-500 text-xs">
                {new Date(item.date).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}