import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2, Maximize2, Minimize2, CheckCircle2, FileText, ExternalLink, Activity } from 'lucide-react';
import type { SimulationState, SimulationPlan } from '@/lib/survey-import/simulation/simulationTypes';

export interface SimulatedProcessingTrayProps {
  state: SimulationState;
  plan: SimulationPlan;
  viewMode: 'tray-collapsed' | 'tray-expanded' | 'full';
  onExpand: () => void;
  onCollapse: () => void;
  onRestoreFullView: () => void;
  onPreviewReady: () => void;
}

export function SimulatedProcessingTray({
  state,
  viewMode,
  onExpand,
  onCollapse,
  onRestoreFullView,
  onPreviewReady,
}: SimulatedProcessingTrayProps) {
  const isTerminal = state.status === 'completed' || state.status === 'failed' || state.status === 'cancelled';
  const isCompleted = state.status === 'completed';
  const totalFiles = state.files.length;
  const completedFiles = state.files.filter((f) => f.status === 'completed').length;
  
  const progressValue = totalFiles > 0 ? (completedFiles / totalFiles) * 100 : 0;

  // Recent/Active files (up to 3)
  const displayFiles = [...state.files]
    .filter(f => f.status === 'active' || f.status === 'completed')
    .sort((a, b) => {
      // Active first, then recently completed
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (b.status === 'active' && a.status !== 'active') return 1;
      return b.completedPhases.length - a.completedPhases.length;
    })
    .slice(0, 3);
  
  const remainingFilesCount = Math.max(0, totalFiles - displayFiles.length);

  // Prevent keyboard focus on hidden tray
  if (viewMode === 'full') return null;

  return (
    <div 
      className={`fixed bottom-6 right-6 left-6 sm:left-auto z-50 flex flex-col gap-2 transition-all duration-300 ease-in-out ${
        viewMode === 'tray-collapsed' && !isTerminal ? 'sm:w-auto' : 'sm:w-full sm:max-w-sm'
      }`}
      role="region"
      aria-label="Progreso de análisis simulado"
      aria-live="polite"
    >
      <Card className="shadow-drawer border bg-background">
        
        {/* Collapsed State */}
        {viewMode === 'tray-collapsed' && (
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="shrink-0">
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />
                ) : (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-500" />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold truncate">
                  {isCompleted ? 'Análisis simulado completado' : 'Simulación en curso'}
                </span>
                {!isCompleted && (
                  <span className="text-xs text-muted-foreground">
                    {Math.round(progressValue)}% global
                  </span>
                )}
                {isCompleted && (
                  <span className="text-xs text-muted-foreground">
                    {totalFiles} archivos preparados
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-1 shrink-0">
              {isCompleted ? (
                <Button size="sm" onClick={onPreviewReady} className="h-8">
                  Ver vista previa
                </Button>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={onExpand}
                        aria-label="Expandir bandeja"
                      >
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Expandir bandeja</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={onRestoreFullView}
                        aria-label="Restaurar vista completa"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Restaurar vista completa</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </CardContent>
        )}

        {/* Expanded State */}
        {viewMode === 'tray-expanded' && (
          <>
            <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                Análisis de archivos
              </CardTitle>
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={onCollapse}
                        aria-label="Minimizar bandeja"
                      >
                        <Minimize2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Minimizar bandeja</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={onRestoreFullView}
                        aria-label="Restaurar vista completa"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Restaurar vista completa</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-3 flex flex-col gap-4">
              {isCompleted ? (
                <div className="flex flex-col gap-2 pt-2 pb-2 items-center text-center">
                  <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3 mb-2">
                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-500" />
                  </div>
                  <h4 className="font-bold">Análisis simulado completado</h4>
                  <p className="text-sm text-muted-foreground">{totalFiles} archivos preparados para la vista previa.</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-medium text-muted-foreground">
                      <span>{completedFiles} de {totalFiles} revisados</span>
                      <span>{Math.round(progressValue)}%</span>
                    </div>
                    <Progress value={progressValue} className="h-2" />
                  </div>

                  <div className="flex flex-col gap-3 max-h-[200px] overflow-y-auto pr-1 mt-2">
                    {displayFiles.map(file => (
                      <div key={file.fileId} className="flex items-start gap-3 text-sm">
                        <div className="mt-0.5 shrink-0">
                          {file.status === 'completed' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />
                          ) : file.status === 'active' ? (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-500" />
                          ) : (
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span 
                            className="font-medium truncate" 
                            title={file.displayName}
                          >
                            {file.displayName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {file.status === 'active' ? 'Analizando...' : file.status === 'completed' ? 'Completado' : 'En cola'}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {remainingFilesCount > 0 && (
                      <div className="text-xs text-muted-foreground text-center pt-1 italic">
                        {remainingFilesCount} archivo{remainingFilesCount !== 1 ? 's' : ''} restante{remainingFilesCount !== 1 ? 's' : ''} en cola
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
            
            {isCompleted && (
              <CardFooter className="p-4 pt-0">
                <Button className="w-full" onClick={onPreviewReady}>
                  Ver vista previa
                </Button>
              </CardFooter>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
