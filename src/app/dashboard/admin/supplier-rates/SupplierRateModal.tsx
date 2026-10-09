import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

interface Supplier {
    _id: string;
    name: string;
}

interface Category {
    _id: string;
    name: string;
}

export default function SupplierRateModal({
    onClose,
    onSuccess,
}: {
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    
    const [supplierId, setSupplierId] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [baseRate, setBaseRate] = useState("");
    
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [supRes, catRes] = await Promise.all([
                    api.get("/suppliers"),
                    api.get("/categories")
                ]);
                setSuppliers(supRes.data);
                setCategories(catRes.data);
            } catch (error) {
                toast.error("Failed to load suppliers and categories");
            } finally {
                setLoadingData(false);
            }
        };
        load();
    }, []);

    const handleSubmit = async () => {
        if (!supplierId || !categoryId || !baseRate) {
            return toast.error("Please fill all fields");
        }
        
        try {
            setLoading(true);
            await api.post("/supplier-base-rates", {
                supplierId,
                categoryId,
                baseRate: Number(baseRate),
                region: "All India"
            });
            toast.success("Rate updated successfully");
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update rate");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-md rounded-[24px] p-6 space-y-5 shadow-xl">
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-lg text-neutral-900">Update Supplier Rate</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-black">✕</button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Supplier</label>
                        <select 
                            value={supplierId} 
                            onChange={(e) => setSupplierId(e.target.value)}
                            disabled={loadingData}
                            className="w-full border px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary"
                        >
                            <option value="">Select Supplier</option>
                            {suppliers.map(s => (
                                <option key={s._id} value={s._id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Category</label>
                        <select 
                            value={categoryId} 
                            onChange={(e) => setCategoryId(e.target.value)}
                            disabled={loadingData}
                            className="w-full border px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary"
                        >
                            <option value="">Select Category</option>
                            {categories.map(c => (
                                <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Base Rate (₹)</label>
                        <input 
                            type="number" 
                            min="1"
                            value={baseRate}
                            onChange={(e) => setBaseRate(e.target.value)}
                            placeholder="Enter base rate"
                            className="w-full border px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors">
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={loading || !supplierId || !categoryId || !baseRate}
                        className="px-6 py-2 rounded-xl bg-brand-primary text-white text-sm font-semibold disabled:opacity-50 hover:bg-brand-primary/90 transition-all"
                    >
                        {loading ? "Updating..." : "Update Rate"}
                    </button>
                </div>
            </div>
        </div>
    );
}
