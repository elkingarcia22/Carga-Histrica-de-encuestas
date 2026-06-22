import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UploadCloud, AlertCircle } from "lucide-react";

export interface SandboxFileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  rawFile?: File;
}

interface SandboxUploadPanelProps {
  onFilesSelected: (files: SandboxFileMetadata[]) => void;
}

export function SandboxUploadPanel({ onFilesSelected }: SandboxUploadPanelProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const processFiles = (fileList: FileList) => {
    const filesArray: SandboxFileMetadata[] = Array.from(fileList).map(file => ({
      name: file.name,
      size: file.size,
      type: file.type || file.name.split('.').pop() || "unknown",
      lastModified: file.lastModified,
      rawFile: file,
    }));
    onFilesSelected(filesArray);
  };

  return (
    <Card className="w-full bg-card border-border shadow-sm">
      <CardContent className="p-4 flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">Cargar encuesta</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Sandbox mode: Selecciona tus archivos locales. 
          </p>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center transition-colors ${
            dragActive ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
        >
          <UploadCloud className="h-8 w-8 text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">
            Haz clic o arrastra archivos aquí
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Formatos permitidos: .xlsx, .xls, .csv
          </p>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".xlsx,.xls,.csv"
            multiple
            onChange={handleChange}
          />
          <Button variant="secondary" size="sm" className="pointer-events-none">
            Seleccionar archivos
          </Button>
        </div>

        <div className="flex items-start gap-2 bg-muted/50 p-3 rounded-lg">
          <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-snug">
            Los archivos se mantienen solo en esta sesión y no se suben a servidores. No se procesará contenido real todavía.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
