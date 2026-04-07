"use client";

import { useEffect, useState } from "react";
import { Company } from "@/types/company";
import {
  getCompanies,
  deactivateCompany,
} from "@/services/company.service";
import CompanyModal from "@/components/company/CompanyModal";

export default function CompaniesPage() {
  const [data, setData] = useState<Company[]>([]);
  const [filtered, setFiltered] = useState<Company[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<Company | undefined>();

  /* FETCH */
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await getCompanies();
      setData(res);
      setFiltered(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  /* SEARCH */
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      data.filter((c) =>
        c.name.toLowerCase().includes(q)
      )
    );
  }, [search, data]);

  /* DELETE */
  const handleDelete = async (id: string) => {
    if (!confirm("Deactivate company?")) return;

    await deactivateCompany(id);
    fetchCompanies();
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between">
        <h1 className="text-xl font-semibold">Companies</h1>

        <button
          onClick={() => {
            setEditData(undefined);
            setShowModal(true);
          }}
          className="bg-brand-primary text-white px-4 py-2 rounded"
        >
          + Add Company
        </button>
      </div>

      {/* SEARCH */}
      <input
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border px-3 py-2 rounded"
      />

      {/* TABLE */}
      <div className="bg-white border rounded-xl overflow-hidden">

        {loading ? (
          <div className="p-6">Loading...</div>
        ) : (
          <table className="w-full text-sm">

            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-left px-4 py-2">Phone</th>
                <th className="text-left px-4 py-2">GST</th>
                <th className="text-right px-4 py-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((c) => (
                <tr key={c._id} className="border-t">

                  <td className="px-4 py-2">{c.name}</td>
                  <td className="px-4 py-2">{c.phone}</td>
                  <td className="px-4 py-2">{c.gstNumber}</td>

                  <td className="px-4 py-2 text-right space-x-2">

                    <button
                      onClick={() => {
                        setEditData(c);
                        setShowModal(true);
                      }}
                      className="text-blue-600"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(c._id)}
                      className="text-red-600"
                    >
                      Delete
                    </button>

                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <CompanyModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchCompanies}
          editData={editData}
        />
      )}
    </div>
  );
}