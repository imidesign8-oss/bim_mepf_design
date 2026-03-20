import { useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  Link2,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Code,
  Quote,
  Undo2,
  Redo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your blog content here...",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (editorRef.current && !isInitialized.current) {
      editorRef.current.innerHTML = value;
      isInitialized.current = true;
    }
  }, []);

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertLink = () => {
    const url = prompt("Enter URL:", "https://");
    if (url) {
      executeCommand("createLink", url);
    }
  };

  const handleInput = () => {
    updateContent();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    updateContent();
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-secondary/50 border-b border-border p-2 flex flex-wrap gap-1">
        <div className="flex gap-1 border-r border-border pr-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => executeCommand("undo")}
            title="Undo"
            className="h-8 w-8 p-0"
          >
            <Undo2 size={16} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => executeCommand("redo")}
            title="Redo"
            className="h-8 w-8 p-0"
          >
            <Redo2 size={16} />
          </Button>
        </div>

        <div className="flex gap-1 border-r border-border pr-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => executeCommand("bold")}
            title="Bold (Ctrl+B)"
            className="h-8 w-8 p-0"
          >
            <Bold size={16} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => executeCommand("italic")}
            title="Italic (Ctrl+I)"
            className="h-8 w-8 p-0"
          >
            <Italic size={16} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => executeCommand("underline")}
            title="Underline (Ctrl+U)"
            className="h-8 w-8 p-0"
          >
            <Underline size={16} />
          </Button>
        </div>

        <div className="flex gap-1 border-r border-border pr-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => executeCommand("formatBlock", "h1")}
            title="Heading 1"
            className="h-8 w-8 p-0"
          >
            <Heading1 size={16} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => executeCommand("formatBlock", "h2")}
            title="Heading 2"
            className="h-8 w-8 p-0"
          >
            <Heading2 size={16} />
          </Button>
        </div>

        <div className="flex gap-1 border-r border-border pr-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => executeCommand("insertUnorderedList")}
            title="Bullet List"
            className="h-8 w-8 p-0"
          >
            <List size={16} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => executeCommand("insertOrderedList")}
            title="Numbered List"
            className="h-8 w-8 p-0"
          >
            <ListOrdered size={16} />
          </Button>
        </div>

        <div className="flex gap-1 border-r border-border pr-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={insertLink}
            title="Insert Link"
            className="h-8 w-8 p-0"
          >
            <Link2 size={16} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => executeCommand("formatBlock", "blockquote")}
            title="Quote"
            className="h-8 w-8 p-0"
          >
            <Quote size={16} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => executeCommand("formatBlock", "pre")}
            title="Code Block"
            className="h-8 w-8 p-0"
          >
            <Code size={16} />
          </Button>
        </div>

        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => executeCommand("removeFormat")}
            title="Clear Formatting"
            className="h-8 px-2 text-xs"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        className="min-h-96 p-4 focus:outline-none prose prose-sm max-w-none
          [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-4 [&>h1]:mt-4
          [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mb-3 [&>h2]:mt-3
          [&>p]:mb-3 [&>p]:leading-relaxed
          [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:mb-3
          [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:mb-3
          [&>li]:mb-2
          [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:mb-3
          [&>pre]:bg-secondary [&>pre]:p-3 [&>pre]:rounded [&>pre]:overflow-x-auto [&>pre]:mb-3
          [&>a]:text-primary [&>a]:underline [&>a]:hover:text-primary/80
        "
        data-placeholder={placeholder}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cdefs%3E%3Cpattern id='lines' width='100%25' height='24' patternUnits='userSpaceOnUse'%3E%3Cline x1='0' y1='24' x2='100%25' y2='24' stroke='%23e5e7eb' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23lines)'/%3E%3C/svg%3E")`,
          backgroundAttachment: "local",
          backgroundPosition: "0 0.5em",
          backgroundRepeat: "repeat",
          backgroundSize: "100% 1.5em",
          paddingTop: "0.5em",
        }}
      />
    </div>
  );
}
