interface Props {
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export default function AuthButton({
  loading,
  children,
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full mt-4 rounded-lg bg-brand-primary text-white py-2.5 text-sm font-medium transition hover:opacity-90 disabled:opacity-50"
    >
      {loading ? "Processing..." : children}
    </button>
  );
}