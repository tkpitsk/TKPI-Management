"use client";

import { useState, useEffect } from "react";
import { Company } from "@/types/company";
import {
  createCompany,
  updateCompany,
} from "@/services/company.service";

export default function CompanyModal({
  onClose,
  onSuccess,
  editData,
}: {
  onClose: () => void;
  onSuccess: () => void;
  editData?: Company;
}) {
  const isEdit = !!editData;

  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    gstNumber: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name || "",
        address: editData.address || "",
        phone: editData.phone || "",
        email: editData.email || "",
        gstNumber: editData.gstNumber || "",
      });
    }
  }, [editData]);

  const handleSubmit = async () => {
    setError("");

    if (!form.name.trim()) {
      return setError("Company name required");
    }

    try {
      setLoading(true);

      if (isEdit) {
        await updateCompany(editData!._id, form);
      } else {
        await createCompany(form);
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

      <div className="bg-white w-full max-w-md rounded-xl p-6 space-y-4">

        <div className="flex justify-between items-center">
          <h2 className="font-semibold">
            {isEdit ? "Edit Company" : "Add Company"}
          </h2>
          <button onClick={onClose}>✕</button>
        </div>

        <input
          placeholder="Company Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          className="w-full border px-3 py-2 rounded"
        />

        <input
          placeholder="Address"
          value={form.address}
          onChange={(e) =>
            setForm({ ...form, address: e.target.value })
          }
          className="w-full border px-3 py-2 rounded"
        />

        <input
          placeholder="Phone"
          value={form.phone}
          onChange={(e) =>
            setForm({ ...form, phone: e.target.value })
          }
          className="w-full border px-3 py-2 rounded"
        />

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
          className="w-full border px-3 py-2 rounded"
        />

        <input
          placeholder="GST Number"
          value={form.gstNumber}
          onChange={(e) =>
            setForm({ ...form, gstNumber: e.target.value })
          }
          className="w-full border px-3 py-2 rounded"
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex justify-end gap-3">
          <button onClick={onClose}>Cancel</button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-brand-primary text-white px-4 py-2 rounded"
          >
            {loading
              ? "Saving..."
              : isEdit
              ? "Update"
              : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}