import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, Briefcase } from 'lucide-react';

interface Props {
  fileCount: number;
  familySummary: Record<string, number>;
  roleSummary: Record<string, number>;
}

export function InheritedNormalizationSummary({ fileCount, familySummary, roleSummary }: Props) {
  const familiesCount = Object.keys(familySummary).length;
  const rolesCount = Object.keys(roleSummary).length;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Resumen de normalización heredado</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-slate-100 rounded-md dark:bg-zinc-800">
              <FileText className="w-4 h-4 text-slate-600 dark:text-zinc-400" />
            </div>
            <div>
              <p className="text-sm font-medium">{fileCount} archivos</p>
              <p className="text-xs text-muted-foreground">Procesados</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-2 bg-slate-100 rounded-md dark:bg-zinc-800">
              <Briefcase className="w-4 h-4 text-slate-600 dark:text-zinc-400" />
            </div>
            <div>
              <p className="text-sm font-medium">{familiesCount} familias</p>
              <p className="text-xs text-muted-foreground">Detectadas</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-2 bg-slate-100 rounded-md dark:bg-zinc-800">
              <Users className="w-4 h-4 text-slate-600 dark:text-zinc-400" />
            </div>
            <div>
              <p className="text-sm font-medium">{rolesCount} roles</p>
              <p className="text-xs text-muted-foreground">Detectados</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
