import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { mockDashboardResult } from './comparisonDashboardMock';
import type { ComparisonViewModelResult, ComparisonViewModelStatus } from '../parser/view-model/viewModelTypes';

export function ComparisonResultsDashboard() {
  const [data] = useState<ComparisonViewModelResult>(mockDashboardResult);
  const [uiState, setUiState] = useState<ComparisonViewModelStatus>('VIEW_MODEL_READY');

  const { dashboard } = data;

  const renderQAControls = () => (
    <div className="mt-4 flex gap-2">
      <Badge variant="secondary" className="flex items-center">QA States:</Badge>
      <Button size="sm" variant={uiState === 'VIEW_MODEL_READY' ? 'default' : 'outline'} onClick={() => setUiState('VIEW_MODEL_READY')}>READY</Button>
      <Button size="sm" variant={uiState === 'VIEW_MODEL_READY_WITH_WARNINGS' ? 'default' : 'outline'} onClick={() => setUiState('VIEW_MODEL_READY_WITH_WARNINGS')}>WARNINGS</Button>
      <Button size="sm" variant={uiState === 'VIEW_MODEL_REJECTED' ? 'default' : 'outline'} onClick={() => setUiState('VIEW_MODEL_REJECTED')}>EMPTY</Button>
      <Button size="sm" variant={uiState === 'VIEW_MODEL_FAILED' ? 'default' : 'outline'} onClick={() => setUiState('VIEW_MODEL_FAILED')}>ERROR</Button>
    </div>
  );

  if (uiState === 'VIEW_MODEL_FAILED') {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>No se pudo cargar el dashboard de comparativo.</AlertDescription>
        </Alert>
        {renderQAControls()}
      </div>
    );
  }

  if (uiState === 'VIEW_MODEL_REJECTED') {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <Alert>
          <AlertTitle>No hay datos</AlertTitle>
          <AlertDescription>No se encontraron datos comparables suficientes.</AlertDescription>
        </Alert>
        {renderQAControls()}
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{dashboard.dashboardTitle}</h1>
        <p className="text-slate-500 mt-2 text-lg">{dashboard.dashboardSubtitle}</p>

        {/* QA Toggle */}
        {renderQAControls()}
      </div>

      {uiState === 'VIEW_MODEL_READY_WITH_WARNINGS' && (
        <Alert variant="default" className="bg-amber-50 border-amber-200">
          <AlertTitle className="text-amber-800">Advertencias en la comparación</AlertTitle>
          <AlertDescription className="text-amber-700">Algunas métricas no pudieron calcularse correctamente o hay discrepancias en las estructuras.</AlertDescription>
        </Alert>
      )}

      {/* Summary & KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboard.summaryCards.map((card) => (
          <Card key={card.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{card.primaryValue.displayValue}</div>
              {card.delta && (
                <p className={`text-xs mt-1 ${card.tone === 'POSITIVE' ? 'text-green-600' : card.tone === 'NEGATIVE' ? 'text-red-600' : 'text-slate-600'}`}>
                  {card.delta.displayValue} vs base
                </p>
              )}
            </CardContent>
          </Card>
        ))}
        {dashboard.kpiCards.map((card) => (
          <Card key={card.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{card.delta?.displayValue ?? '-'}</div>
              <p className={`text-xs mt-1 ${card.tone === 'POSITIVE' ? 'text-green-600' : card.tone === 'NEGATIVE' ? 'text-red-600' : 'text-slate-600'}`}>
                {card.direction}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Inventory / Health Card */}
      <Card>
        <CardHeader>
          <CardTitle>Inventario de Preguntas</CardTitle>
          <CardDescription>Resumen de preguntas procesadas en ambas encuestas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-8">
            <div>
              <p className="text-sm text-slate-500">Preguntas comparables</p>
              <p className="text-2xl font-semibold text-slate-900">{dashboard.metadata.totalComparableQuestions}</p>
            </div>
            <Separator orientation="vertical" className="h-12" />
            <div>
              <p className="text-sm text-slate-500">Solo en base</p>
              <p className="text-2xl font-semibold text-slate-900">{dashboard.metadata.totalBaseOnlyQuestions}</p>
            </div>
            <Separator orientation="vertical" className="h-12" />
            <div>
              <p className="text-sm text-slate-500">Solo en comparativa</p>
              <p className="text-2xl font-semibold text-slate-900">{dashboard.metadata.totalComparisonOnlyQuestions}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border">
        <span className="text-sm font-medium text-slate-700">Filtros:</span>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo de pregunta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {dashboard.filters.questionTypes.map((t) => (
              <SelectItem key={t.id} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Dirección" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {dashboard.filters.directions.map((d) => (
              <SelectItem key={d.id} value={d.value}>{d.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tono" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {dashboard.filters.tones.map((t) => (
              <SelectItem key={t.id} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Question Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle por pregunta</CardTitle>
          <CardDescription>Mostrando {dashboard.metadata.totalComparableQuestions} preguntas comparables</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pregunta</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Base</TableHead>
                <TableHead className="text-right">Comparativa</TableHead>
                <TableHead className="text-right">Delta</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboard.questionRows.map((row) => (
                <TableRow key={row.questionId}>
                  <TableCell className="font-medium text-slate-900">{row.questionLabel}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{row.questionType}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-slate-700">{row.baseValue?.displayValue ?? '-'}</TableCell>
                  <TableCell className="text-right text-slate-700">{row.comparisonValue?.displayValue ?? '-'}</TableCell>
                  <TableCell className="text-right font-medium">
                    <span className={row.tone === 'POSITIVE' ? 'text-green-600' : row.tone === 'NEGATIVE' ? 'text-red-600' : 'text-slate-600'}>
                      {row.deltaValue?.displayValue ?? '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      row.tone === 'POSITIVE' ? 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200' :
                      row.tone === 'NEGATIVE' ? 'bg-red-100 text-red-800 hover:bg-red-100 border-red-200' :
                      'bg-slate-100 text-slate-800 hover:bg-slate-100 border-slate-200'
                    }>
                      {row.direction}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Distribution Section */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de distribuciones (Ejemplo Q-COMP-001)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Opción de respuesta</TableHead>
                <TableHead className="text-right">Conteo Base</TableHead>
                <TableHead className="text-right">Conteo Comp.</TableHead>
                <TableHead className="text-right">Delta N</TableHead>
                <TableHead className="text-right">Tasa Base</TableHead>
                <TableHead className="text-right">Tasa Comp.</TableHead>
                <TableHead className="text-right">Delta %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboard.distributionRows.map((d) => (
                <TableRow key={`${d.questionId}-${d.bucketLabel}`}>
                  <TableCell className="text-slate-900">{d.bucketLabel}</TableCell>
                  <TableCell className="text-right text-slate-700">{d.baseCount}</TableCell>
                  <TableCell className="text-right text-slate-700">{d.comparisonCount}</TableCell>
                  <TableCell className="text-right text-slate-700">{d.countDelta.displayValue}</TableCell>
                  <TableCell className="text-right text-slate-700">{d.baseRate.displayValue}</TableCell>
                  <TableCell className="text-right text-slate-700">{d.comparisonRate.displayValue}</TableCell>
                  <TableCell className="text-right font-medium">
                     <span className={d.tone === 'POSITIVE' ? 'text-green-600' : d.tone === 'NEGATIVE' ? 'text-red-600' : 'text-slate-600'}>
                      {d.rateDelta.displayValue}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
