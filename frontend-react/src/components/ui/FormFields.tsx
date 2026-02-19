interface InputFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
}

export const InputField = ({ label, value, onChange, placeholder, type = "text" }: InputFieldProps) => (
    <div>
        <label className="text-sm font-semibold text-gray-700 mb-2 block">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
    </div>
);

interface TextareaFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
}

export const TextareaField = ({ label, value, onChange, placeholder, rows = 3 }: TextareaFieldProps) => (
    <div>
        <label className="text-sm font-semibold text-gray-700 mb-2 block">{label}</label>
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
    </div>
);

interface SelectOption {
    value: string;
    label: string;
}

interface SelectFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
}

export const SelectField = ({ label, value, onChange, options, placeholder = "Pilih..." }: SelectFieldProps) => (
    <div>
        <label className="text-sm font-semibold text-gray-700 mb-2 block">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    </div>
);

interface DisplayFieldProps {
    label: string;
    value: string;
    placeholder?: string;
}

export const DisplayField = ({ label, value, placeholder = "-" }: DisplayFieldProps) => (
    <div>
        <label className="text-sm font-semibold text-gray-700 mb-2 block">{label}</label>
        <div className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-700">
            {value || placeholder}
        </div>
    </div>
);
