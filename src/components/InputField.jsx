export default function InputField({
    id,
    label,
    type = "text",
    value,
    onChange,
    required = false,
    placeholder = "",
}) {
    return (
        <div>
            <label htmlFor={id} className="block mb-1 font-medium">
                {label}
            </label>
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                required={required}
                placeholder={placeholder}
                className="w-full p-2 border rounded"
            />
        </div>
    );
}
