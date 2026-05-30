type DateFieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function DateField({ label, name, value, onChange }: DateFieldProps) {
  return (
    <div className="mb-3">
      
      <input
        type="date"
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="form-control"
      />
    </div>
  );
}
