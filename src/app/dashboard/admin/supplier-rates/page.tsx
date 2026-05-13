import SupplierRatesClient from "./SupplierRatesClient";

export const metadata = {
    title: "Supplier Base Rates | KPI Admin",
    description: "Update daily market rates from your suppliers",
};

export default function SupplierRatesPage() {
    return <SupplierRatesClient />;
}
