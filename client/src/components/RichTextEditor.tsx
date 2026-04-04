import { useState, useRef } from "react";
import { Bold, Italic, Underline, Link2, Heading2, List, ListOrdered, Code } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const insertLink = () => {
    if (linkUrl) {
      executeCommand("createLink", linkUrl);
      setLinkUrl("");
      setShowLinkInput(false);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="bg-secondary/50 border-b border-border p-2 flex flex-wrap gap-1">
        <button
          onClick={() => executeCommand("bold")}
          className="p-2 hover:bg-secondary rounded transition-colors"
          title="Bold (Ctrl+B)"
        >
          <Bold size={18} />
        </button>
        <button
          onClick={() => executeCommand("italic")}
          className="p-2 hover:bg-secondary rounded transition-colors"
          title="Italic (Ctrl+I)"
        >
          <Italic size={18} />
        </button>
        <button
          onClick={() => executeCommand("underline")}
          className="p-2 hover:bg-secondary rounded transition-colors"
          title="Underline (Ctrl+U)"
        >
          <Underline size={18} />
        </button>

        <div className="w-px bg-border mx-1" />

        <button
          onClick={() => executeCommand("formatBlock", "<h2>")}
          className="p-2 hover:bg-secondary rounded transition-colors"
          title="Heading 2"
        >
          <Heading2 size={18} />
        </button>

        <button
          onClick={() => executeCommand("insertUnorderedList")}
          className="p-2 hover:bg-secondary rounded transition-colors"
          title="Bullet List"
        >
          <List size={18} />
        </button>

        <button
          onClick={() => executeCommand("insertOrderedList")}
          className="p-2 hover:bg-secondary rounded transition-colors"
          title="Numbered List"
        >
          <ListOrdered size={18} />
        </button>

        <div className="w-px bg-border mx-1" />

        <div className="relative">
          <button
            onClick={() => setShowLinkInput(!showLinkInput)}
            className="p-2 hover:bg-secondary rounded transition-colors"
            title="Insert Link"
          >
            <Link2 size={18} />
          </button>
          {showLinkInput && (
            <div className="absolute top-full left-0 mt-1 bg-background border border-border rounded-lg p-2 shadow-lg z-10 w-48">
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-2 py-1 border border-border rounded text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyPress={(e) => e.key === "Enter" && insertLink()}
              />
              <div className="flex gap-1">
                <button
                  onClick={insertLink}
                  className="flex-1 px-2 py-1 bg-primary text-primary-foreground rounded text-sm font-semibold hover:bg-primary/90"
                >
                  Insert
                </button>
                <button
                  onClick={() => setShowLinkInput(false)}
                  className="flex-1 px-2 py-1 bg-secondary rounded text-sm font-semibold hover:bg-secondary/80"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => executeCommand("formatBlock", "<pre>")}
          className="p-2 hover:bg-secondary rounded transition-colors"
          title="Code Block"
        >
          <Code size={18} />
        </button>

        <div className="w-px bg-border mx-1" />

        <button
          onClick={() => executeCommand("removeFormat")}
          className="p-2 hover:bg-secondary rounded transition-colors text-sm font-semibold"
          title="Clear Formatting"
        >
          Clear
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        suppressContentEditableWarning
        className="w-full min-h-[300px] p-4 focus:outline-none bg-background text-foreground"
        style={{
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
        }}
      >
        {!value && <span className="text-muted-foreground">{placeholder || "Start typing..."}</span>}
      </div>

      {/* Character Count */}
      <div className="bg-secondary/50 border-t border-border px-4 py-2 text-xs text-muted-foreground">
        {value.replace(/<[^>]*>/g, "").length} characters
      </div>
    </div>
  );
}
