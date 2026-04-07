interface Props {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function AuthInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}: Props) {
  return (
    <div>
      <label className="block text-sm mb-1 text-text-secondary">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
      />
    </div>
  );
}