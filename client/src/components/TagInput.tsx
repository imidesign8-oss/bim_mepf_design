import { useState, useRef } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  label?: string;
}

export default function TagInput({ value, onChange, placeholder = "Type and press Enter or comma to add", label }: TagInputProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle Enter key or comma
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
    // Handle backspace to remove last tag if input is empty
    if (e.key === 'Backspace' && input === '' && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const addTag = () => {
    const trimmedInput = input.trim().replace(/,+$/, ''); // Remove trailing commas
    if (trimmedInput && !value.includes(trimmedInput)) {
      onChange([...value, trimmedInput]);
      setInput('');
    }
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleBlur = () => {
    // Add tag when input loses focus if there's text
    if (input.trim()) {
      addTag();
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2 p-2 border border-border rounded-lg bg-background focus-within:ring-2 focus-within:ring-primary">
        {/* Display tags */}
        {value.map((tag, index) => (
          <div
            key={index}
            className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-1 hover:text-primary/80 transition-colors"
              aria-label={`Remove ${tag}`}
            >
              <X size={16} />
            </button>
          </div>
        ))}

        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={value.length === 0 ? placeholder : "Add more..."}
          className="flex-1 min-w-[200px] bg-transparent outline-none text-foreground placeholder-muted-foreground"
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Press Enter or comma to add a service
      </p>
    </div>
  );
}
