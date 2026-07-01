import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Paperclip, X, File as FileIcon, Loader2 } from "lucide-react";

interface MessageComposerProps {
  onSend?: (text: string, files: File[]) => void;
  disabled?: boolean;
  placeholder?: string;
  isProcessing?: boolean;
}

export function MessageComposer({ onSend, disabled, placeholder, isProcessing }: MessageComposerProps) {
  const [text, setText] = useState("");
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!disabled && !isProcessing) {
      textareaRef.current?.focus();
    }
  }, [disabled, isProcessing]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setStagedFiles((prev) => [...prev, ...newFiles]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (indexToRemove: number) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleSend = () => {
    if ((text.trim() || stagedFiles.length > 0) && onSend && !disabled && !isProcessing) {
      onSend(text, stagedFiles);
      setText("");
      setStagedFiles([]);
    }
  };

  const isSendDisabled = disabled || isProcessing || (!text.trim() && stagedFiles.length === 0);

  return (
    <div className={`relative border border-border bg-card rounded-2xl p-4 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all shadow-sm w-full ${disabled || isProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
      <textarea
        ref={textareaRef}
        placeholder={placeholder || "Cuéntame qué encuesta quieres cargar"}
        className="w-full min-h-[100px] bg-transparent outline-none resize-none text-sm placeholder:text-muted-foreground/75 text-foreground pb-12"
        disabled={disabled || isProcessing}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!isSendDisabled && !isProcessing) {
              handleSend();
            }
          }
        }}
      />

      {stagedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8 mt-2 overflow-hidden">
          {stagedFiles.map((f, i) => (
            <div key={i} className="flex items-center gap-2 bg-muted border border-border rounded-md px-3 py-1.5 text-sm max-w-full min-w-0">
              <FileIcon className="w-4 h-4 shrink-0 text-muted-foreground" />
              <div className="flex flex-col min-w-0">
                <span className="font-medium text-xs text-foreground truncate">{f.name}</span>
                <span className="text-[10px] text-muted-foreground truncate">
                  {(f.size / 1024).toFixed(1)} KB • {f.name.split('.').pop()}
                </span>
              </div>
              <button
                onClick={() => removeFile(i)}
                className="ml-1 shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                title="Cancelar adjunto"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="absolute bottom-3 left-3 flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".xlsx,.xls,.csv"
          multiple
          onChange={handleFileSelect}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isProcessing}
          title="Adjuntar archivo"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
      </div>

      <div className="absolute bottom-3 right-3">
        <Button
          size="icon"
          className={`h-8 w-8 rounded-full transition-all border-0 ${
            isSendDisabled
              ? 'bg-muted text-muted-foreground/75 cursor-not-allowed hover:bg-muted'
              : 'bg-ai-gradient shadow-ai-premium text-primary-foreground hover:opacity-90'
          }`}
          disabled={isSendDisabled}
          onClick={handleSend}
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
