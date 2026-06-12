import * as React from 'react'
import { UploadCloud, AlertCircle, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { validateFiles } from './uploadUtils'

export interface UploadZoneProps {
  /** Selected files */
  value?: File[]
  /** Callback when selection changes */
  onChange?: (files: File[]) => void
  /** Accepted file types */
  accept?: string
  /** Whether multiple selection is allowed */
  multiple?: boolean
  /** Maximum number of files */
  maxFiles?: number
  /** Maximum file size in MB */
  maxSizeMB?: number
  /** Whether the component is disabled */
  disabled?: boolean
  /** Label above the zone */
  label?: string
  /** Helper description text */
  description?: string
  /** Error message */
  error?: string
  /** Text shown in idle state */
  idleText?: string
  /** Text shown in active drag state */
  activeText?: string
  /** Additional CSS classes */
  className?: string
  /** Compact mode when files are present */
  compact?: boolean
  /** Optional ref to the actionable container */
  actionRef?: React.Ref<HTMLDivElement>
}

/**
 * UploadZone - UBITS component for drag & drop file selection.
 * Desktop-first, B2B enterprise style using native Drag/Drop API.
 * Supports compact mode when files are already present.
 */
export function UploadZone({
  value = [],
  onChange,
  accept,
  multiple = false,
  maxFiles,
  maxSizeMB,
  disabled = false,
  label,
  description,
  error,
  idleText = 'Drag and drop files here or click to browse',
  activeText = 'Drop files here...',
  className,
  compact = false,
  actionRef,
}: UploadZoneProps) {
  const [isDragActive, setIsDragActive] = React.useState(false)
  const [localError, setLocalError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (disabled) return

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true)
    } else if (e.type === 'dragleave') {
      setIsDragActive(false)
    }
  }

  const processFiles = (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return

    const validation = validateFiles(selectedFiles, {
      accept,
      multiple,
      maxFiles,
      maxSizeMB
    }, multiple ? value.length : 0)

    if (!validation.isValid) {
      setLocalError(validation.error || 'Invalid file selection')
      return
    }

    setLocalError(null)
    const newFiles = multiple ? [...value, ...selectedFiles] : selectedFiles
    onChange?.(newFiles)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    if (disabled) return

    const droppedFiles = Array.from(e.dataTransfer.files)
    processFiles(droppedFiles)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    processFiles(selectedFiles)
    if (inputRef.current) inputRef.current.value = ''
  }

  // removeFile was unused, removing to satisfy TS6133
  const displayError = error || localError
  const hasError = !!displayError
  const hasFiles = value.length > 0

  // Compact mode: horizontal layout with button
  if (compact && hasFiles) {
    return (
      <div
        ref={actionRef}
        tabIndex={0}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          'flex items-center gap-4 p-4 border border-dashed rounded-xl transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'bg-muted/30 border-border hover:bg-muted/50 hover:border-primary/50',
          isDragActive && 'bg-primary/5 border-primary',
          hasError && 'bg-destructive/5 border-destructive/50',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleChange}
          className="hidden"
          aria-hidden="true"
        />

        <div className={cn(
          'p-2 rounded-lg',
          isDragActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
          hasError && 'bg-destructive/10 text-destructive'
        )}>
          <Plus className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">
            {isDragActive ? activeText : 'Agregar más archivos'}
          </p>
          <p className="text-xs text-muted-foreground">
            Arrastra o haz clic para buscar
          </p>
        </div>

        {displayError && (
          <p className="text-xs text-destructive font-medium">{displayError}</p>
        )}
      </div>
    )
  }

  // Full mode: vertical layout
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <label className={cn('text-sm font-medium text-foreground', disabled && 'opacity-50')}>
          {label}
        </label>
      )}

      <div
        ref={actionRef}
        tabIndex={0}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          'relative flex flex-col items-center justify-center min-h-[240px] p-10 border-2 border-dashed rounded-xl transition-all cursor-pointer w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'bg-muted/5 border-border hover:bg-muted/10 hover:border-primary/50',
          isDragActive && 'bg-primary/5 border-primary scale-[1.01] shadow-sm',
          hasError && 'bg-destructive/5 border-destructive/50 hover:border-destructive',
          disabled && 'opacity-50 cursor-not-allowed grayscale-[0.5] hover:border-border hover:bg-muted/5'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleChange}
          className="hidden"
          aria-hidden="true"
        />

        <div className="flex flex-col items-center text-center gap-4">
          <div className={cn(
            'p-4 rounded-full bg-background shadow-sm border border-border/50',
            isDragActive && 'text-primary',
            hasError && 'text-destructive'
          )}>
            {hasError ? <AlertCircle className="h-8 w-8" /> : <UploadCloud className="h-8 w-8" />}
          </div>
          
          <div className="space-y-1.5">
            <p className="text-base font-semibold">
              {isDragActive ? activeText : idleText}
            </p>
            {description && !displayError && (
              <p className="text-sm text-muted-foreground max-w-md">{description}</p>
            )}
            {displayError && (
              <p className="text-xs text-destructive font-medium">{displayError}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
