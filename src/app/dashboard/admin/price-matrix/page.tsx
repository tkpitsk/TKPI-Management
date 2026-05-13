import PriceMatrixClient from "./PriceMatrixClient";

export const metadata = {
    title: "Price Matrix Dashboard | KPI Admin",
    description: "Compare supplier pricing in real-time",
};

export default function PriceMatrixPage() {
    return <PriceMatrixClient />;
}
