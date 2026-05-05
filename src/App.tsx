import * as React from "react"
import { 
  AppShell, 
  SidebarRail, 
  Header, 
  PageShell 
} from "@/components/layout"
import { TabsNav } from "@/components/navigation"
import { navigationConfig } from "@/config/navigation"
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { StatusBadge, TableShell } from "@/components/data-display"
import { EmptyState } from "@/components/feedback"
import { Info, AlertCircle, CheckCircle2, Inbox, Plus, Save } from "lucide-react"
import { Field, FormSection, SearchableSelect, MultiSelect } from "@/components/forms"
import { FilterBar } from "@/components/filters"
import { ModalShell, DrawerShell, ConfirmDialog } from "@/components/overlays"
import { AIInsightCard, AIPanel } from "@/components/ai"
import { ValidatedFormExample } from "@/examples/forms"
import { toast } from "sonner"
import { UbitsToaster } from "@/components/feedback"
import { 
  Avatar, 
  AvatarImage, 
  AvatarFallback 
} from "@/components/ui/avatar"
import { PaginationShell } from "@/components/navigation"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Tag, SectionHeader, PageHeader } from "@/components/utility"
import { EChart, ChartShell, ChartCard, BarChart, LineChart, AreaChart, DonutChart, SparklineChart, KpiCard, HeatmapChart } from "@/components/charts"
import { 
  DatePicker, 
  DateRangePicker, 
  MonthPicker, 
  QuarterSelector, 
  PeriodSelector, 
  DateFilterBar,
  type DateFilterMode 
} from "@/components/date"
import { Slider } from "@/components/ui/slider"
import { RangeSlider } from "@/components/range"
import { FileUpload, UploadZone, FilePreview, AttachmentList, UploadProgress, ImportCsvPanel } from "@/components/upload"
import { CardSelection, RadioCardGroup, CheckboxCardGroup, SelectableCard, OptionTile, SegmentedControl } from "@/components/selection"
import { UbitsCarousel, Gallery, ImageGrid, PreviewCard, MediaPreview, EmptyGalleryState, type MediaItem } from "@/components/media"
import { DeltaPill, InlineLegend, MetricComparisonFooter, ResponseStackedBar, ResponseStackedBarGroup, TrendMetricLineChart, SurveyMetricCard, FavorabilityDistributionCard, ParticipationTrendCard } from "@/components/survey-analytics"
import { Layers, Zap, Settings, Shield, Clock, MousePointer2, LayoutGrid, BarChart3, List, ChevronRight, Download, ExternalLink, Share2, Trash2 } from "lucide-react"

function App() {
  const [activeNavId, setActiveNavId] = React.useState(navigationConfig[1].id) // Default to Learning
  const [activeTabId, setActiveTabId] = React.useState("")
  
  // Technical states for FilterBar demo
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filterStatus, setFilterStatus] = React.useState("")
  const [filterTeams, setFilterTeams] = React.useState<string[]>([])
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
  const [isConfirmLoading, setIsConfirmLoading] = React.useState(false)
  const [progressValue, setProgressValue] = React.useState(13)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [demoLoading, setDemoLoading] = React.useState(true)

  // Phase 7D.1A: Date & Range Inputs demo states
  const [date, setDate] = React.useState<Date>()
  const [dateRange, setDateRange] = React.useState<{ from?: Date; to?: Date }>()

  // Phase 7D.1B: Slider & Range Selection demo states
  const [sliderValue, setSliderValue] = React.useState([50])
  const [rangeValue, setRangeValue] = React.useState<[number, number]>([20, 80])
  const [percentageValue, setPercentageValue] = React.useState<[number, number]>([0, 100])

  // Phase 7D.1C: Period Selection & Filter Bar demo states
  const [month, setMonth] = React.useState({ year: 2026, month: 4 })
  const [quarter, setQuarter] = React.useState<{ year: number; quarter: 1 | 2 | 3 | 4 }>({ year: 2026, quarter: 2 })
  const [period, setPeriod] = React.useState('last_30_days')
  const [filterBarMode, setFilterBarMode] = React.useState<DateFilterMode>('period')
  const [fbPeriod, setFbPeriod] = React.useState('this_month')
  const [fbDate, setFbDate] = React.useState<Date>()
  const [fbRange, setFbRange] = React.useState<{ from?: Date; to?: Date }>()

  // Phase 7D.2A: Upload & Files demo states
  const [singleFile, setSingleFile] = React.useState<File[]>([])
  const [multipleFiles, setMultipleFiles] = React.useState<File[]>([])
  const [dropZoneFiles, setDropZoneFiles] = React.useState<File[]>([])

  // Phase 7D.2C: Data Import & Progress demo states
  const [, setImportFile] = React.useState<File[]>([])
  const [importStatus, setImportStatus] = React.useState<'idle' | 'validating' | 'uploading' | 'success' | 'error'>('idle')
  const [importProgress, setImportProgress] = React.useState(0)

  // Phase 7D.3A: Visual Selection demo states
  const [selectedCard, setSelectedCard] = React.useState("pro")
  const [selectedRadio, setSelectedRadio] = React.useState("standard")

  // Phase 7D.3B: Selection Multi & Densa demo states
  const [selectedChecks, setSelectedChecks] = React.useState<string[]>(["mfa"])
  const [isCardSelected, setIsCardSelected] = React.useState(false)
  const [selectedTile, setSelectedTile] = React.useState("opt2")

  // Phase 7D.3C: SegmentedControl demo states
  const [segmentedValue, setSegmentedValue] = React.useState("grid")
  const [segmentedView, setSegmentedView] = React.useState("detail")
  const [segmentedPeriod, setSegmentedPeriod] = React.useState("month")

  // Phase 7D.4B: Gallery & ImageGrid demo states
  const [selectedMedia, setSelectedMedia] = React.useState<string[]>(["m2"])
  
  const mockMedia: MediaItem[] = [
    { id: "m1", title: "Elemento de ejemplo 1", description: "Descripción técnica del recurso multimedia.", kind: "image", badge: "HD", metadata: "2.4 MB" },
    { id: "m5", title: "Bento Wide", description: "Elemento con span horizontal.", colSpan: 2, kind: "image", badge: "Bento" },
    { id: "m2", title: "Elemento de ejemplo 2", description: "Descripción técnica del recurso multimedia.", kind: "video", badge: "4K", metadata: "15:30" },
    { id: "m6", title: "Bento Tall", description: "Elemento con span vertical.", rowSpan: 2, kind: "video", badge: "Bento" },
    { id: "m3", title: "Elemento de ejemplo 3", description: "Descripción técnica del recurso multimedia.", kind: "document", metadata: "PDF" },
    { id: "m4", title: "Elemento de ejemplo 4", description: "Descripción técnica del recurso multimedia.", kind: "image", metadata: "PNG" },
    { id: "m7", title: "Recurso 7", description: "Descripción del recurso.", kind: "image", metadata: "JPG" },
    { id: "m8", title: "Recurso 8", description: "Descripción del recurso.", kind: "document", metadata: "DOCX" },
  ]

  const [activePreviewItem, setActivePreviewItem] = React.useState<MediaItem | undefined>(mockMedia[0])

  const activeNav = navigationConfig.find(n => n.id === activeNavId) || navigationConfig[0]

  React.useEffect(() => {
    const timer = setTimeout(() => setProgressValue(66), 500)
    return () => clearTimeout(timer)
  }, [])

  React.useEffect(() => {
    const timer = setTimeout(() => setDemoLoading(false), 1800)
    return () => clearTimeout(timer)
  }, [])
  
  // Update activeTabId when nav changes
  React.useEffect(() => {
    if (activeNav.tabs && activeNav.tabs.length > 0) {
      setActiveTabId(activeNav.tabs[0].id)
    } else {
      setActiveTabId("")
    }
  }, [activeNavId])

  return (
    <TooltipProvider>
      <UbitsToaster />
      <AppShell
        sidebar={
          <SidebarRail 
            activeId={activeNavId} 
            onItemSelect={(id) => setActiveNavId(id)} 
          />
        }
      header={
        <Header 
          title={activeNav.label} 
          description={activeNav.description}
          breadcrumbs={activeNav.breadcrumbs}
        />
      }
    >
      <div className="flex flex-col h-full">
        {/* Navigation Tabs (Only if present) */}
        {activeNav.tabs && activeNav.tabs.length > 0 && (
          <TabsNav 
            tabs={activeNav.tabs} 
            activeTabId={activeTabId} 
            onTabChange={(id) => setActiveTabId(id)}
          />
        )}

        <PageShell>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Estado de la Fase 5C</CardTitle>
                  <CardDescription>Navegación funcional básica</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Breadcrumbs</span>
                    <Badge variant="positive">OK</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">TabsNav</span>
                    <Badge variant="positive">OK</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Sidebar State</span>
                    <Badge variant="positive">OK</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Playground Técnico: {activeNav.label}</CardTitle>
                  <CardDescription>
                    ID Activo: <code className="bg-surface-muted px-1 rounded">{activeNavId}</code>
                    {activeTabId && (
                      <> | Tab Activa: <code className="bg-surface-muted px-1 rounded">{activeTabId}</code></>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-text-secondary">
                    Esta es una demostración técnica de la navegación funcional. 
                    No hay rutas reales de react-router-dom, todo se maneja con estado local.
                  </p>
                  <div className="flex space-x-2">
                    <Button>Acción Primaria</Button>
                    <Button variant="outline">Secundaria</Button>
                  </div>
                  <div className="max-w-xs pt-4">
                    <Input placeholder="Prueba de input..." />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Validación Técnica: Table</CardTitle>
                <CardDescription>Renderizado base de shadcn/ui table</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Concepto</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">INV001</TableCell>
                        <TableCell>Suscripción Mensual</TableCell>
                        <TableCell>Pagado</TableCell>
                        <TableCell className="text-right">$250.00</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">INV002</TableCell>
                        <TableCell>Licencia Enterprise</TableCell>
                        <TableCell>Pendiente</TableCell>
                        <TableCell className="text-right">$1,200.00</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <div className="md:col-span-3">
              <ValidatedFormExample />
            </div>

            <div className="md:col-span-3">
              <FormSection
                title="Controles de Selección Avanzada"
                description="Demos técnicas de SearchableSelect para listas medianas/largas."
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Selección Buscable Simple">
                    <SearchableSelect
                      options={[
                        { value: "1", label: "Opción A" },
                        { value: "2", label: "Opción B" },
                        { value: "3", label: "Opción C" },
                      ]}
                      placeholder="Selecciona una opción..."
                    />
                  </Field>

                  <Field label="Selección con Descripciones">
                    <SearchableSelect
                      options={[
                        { value: "admin", label: "Administrador", description: "Acceso total al sistema" },
                        { value: "editor", label: "Editor", description: "Puede modificar contenidos" },
                        { value: "viewer", label: "Lector", description: "Solo lectura", disabled: true },
                      ]}
                      placeholder="Asignar rol..."
                    />
                  </Field>

                  <div className="md:col-span-2">
                    <Field label="Selección Múltiple Enterprise">
                      <MultiSelect
                        options={[
                          { value: "dev", label: "Desarrollo", description: "Perfil técnico" },
                          { value: "design", label: "Diseño", description: "Perfil visual" },
                          { value: "product", label: "Producto", description: "Perfil de negocio" },
                          { value: "marketing", label: "Marketing", description: "Perfil comercial" },
                        ]}
                        placeholder="Selecciona perfiles..."
                      />
                    </Field>
                  </div>
                </div>
              </FormSection>
            </div>

            <div className="md:col-span-3">
              <FormSection
                title="Infraestructura de Filtrado (FilterBar)"
                description="Demo técnica de FilterBar combinando búsqueda, selects y badges activos."
              >
                <div className="space-y-4">
                  <FilterBar
                    searchValue={searchQuery}
                    onSearchChange={setSearchQuery}
                    searchPlaceholder="Buscar por nombre técnico..."
                    filters={
                      <>
                        <div className="w-40">
                          <SearchableSelect
                            options={[
                              { value: "active", label: "Activo" },
                              { value: "inactive", label: "Inactivo" },
                              { value: "pending", label: "Pendiente" },
                            ]}
                            value={filterStatus}
                            onValueChange={setFilterStatus}
                            placeholder="Estado"
                          />
                        </div>
                        <div className="w-56">
                          <MultiSelect
                            options={[
                              { value: "engineering", label: "Ingeniería" },
                              { value: "product", label: "Producto" },
                              { value: "design", label: "Diseño" },
                            ]}
                            value={filterTeams}
                            onValueChange={setFilterTeams}
                            placeholder="Equipos"
                          />
                        </div>
                      </>
                    }
                    actions={
                      <Button variant="outline" size="sm" className="h-10">
                        <Plus className="h-4 w-4 mr-2" />
                        Añadir Registro
                      </Button>
                    }
                    activeFilters={[
                      ...(filterStatus ? [{
                        id: "status",
                        label: "Estado",
                        value: filterStatus === "active" ? "Activo" : filterStatus === "inactive" ? "Inactivo" : "Pendiente",
                        onRemove: () => setFilterStatus("")
                      }] : []),
                      ...filterTeams.map(team => ({
                        id: `team-${team}`,
                        label: "Equipo",
                        value: team === "engineering" ? "Ingeniería" : team === "product" ? "Producto" : "Diseño",
                        onRemove: () => setFilterTeams(filterTeams.filter(t => t !== team))
                      }))
                    ]}
                    onClearFilters={() => {
                      setFilterStatus("")
                      setFilterTeams([])
                      setSearchQuery("")
                    }}
                  />
                  
                  <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground bg-muted/20">
                    {searchQuery || filterStatus || filterTeams.length > 0 ? (
                      <p>Resultados filtrados para: <span className="font-mono text-primary">{searchQuery || "(sin texto)"}</span></p>
                    ) : (
                      <p>La vista de datos se renderizaría aquí. Prueba a interactuar con la FilterBar.</p>
                    )}
                  </div>
                </div>
              </FormSection>
            </div>

            <div className="md:col-span-3">
              <AIPanel
                title="Resumen Ejecutivo IA"
                description="Análisis automático de patrones y riesgos detectados en el segmento actual."
                actions={
                  <Button variant="ghost" size="sm" className="text-primary font-semibold h-8">
                    Refrescar
                  </Button>
                }
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AIInsightCard
                    type="insight"
                    confidence="high"
                    title="Tendencia de participación al alza"
                    description="Se observa un incremento sostenido en la interacción durante las últimas 4 semanas."
                    evidence="+15% vs mes anterior"
                    impact="Alto"
                    actionLabel="Ver reporte detallado"
                  />
                  <AIInsightCard
                    type="risk"
                    confidence="medium"
                    title="Riesgo de deserción en segmento técnico"
                    description="Los indicadores de actividad muestran una caída inusual en perfiles senior."
                    evidence="Desviación del 8%"
                    impact="Crítico"
                    actionLabel="Plan de retención"
                  />
                  <AIInsightCard
                    type="recommendation"
                    confidence="high"
                    title="Optimización de contenidos sugerida"
                    description="La mayoría de las interacciones exitosas ocurren en formatos breves de video."
                    impact="Mejora UX"
                    actionLabel="Aplicar cambios"
                  />
                </div>
              </AIPanel>
            </div>

            <div className="md:col-span-3">
              <FormSection
                title="Context & Overlays (Phase 7B.2)"
                description="Demo técnica de Dropdown, Tooltip, Separator y ScrollArea."
              >
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">Menú de Acciones</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Acciones técnicas</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem>
                            <Plus className="mr-2 h-4 w-4" />
                            <span>Crear nuevo</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Save className="mr-2 h-4 w-4" />
                            <span>Guardar progreso</span>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive">
                          <span>Eliminar registro</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="secondary" size="icon">
                          <Inbox className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Ayuda contextual breve</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Contenido con Scroll Controlado</h4>
                    <ScrollArea className="h-40 w-full rounded-md border p-4">
                      <div className="space-y-4">
                        <p className="text-sm">Contenido de ejemplo 1: El ScrollArea permite manejar listas largas o bloques de texto sin afectar el scroll global de la página.</p>
                        <Separator className="my-2" />
                        <p className="text-sm">Contenido de ejemplo 2: Manteniendo la densidad visual enterprise.</p>
                        <Separator className="my-2" />
                        <p className="text-sm">Contenido de ejemplo 3: Ideal para logs, terminales o previsualizaciones densas.</p>
                        <Separator className="my-2" />
                        <p className="text-sm">Contenido de ejemplo 4: Soportando light y dark mode automáticamente.</p>
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </FormSection>
            </div>

            <div className="md:col-span-3">
              <FormSection
                title="Binary Form Controls (Phase 7B.3)"
                description="Demo técnica de Checkbox, Radio Group y Switch."
              >
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-muted-foreground">Checkboxes</h4>
                      <div className="space-y-3">
                        <Field
                          label="Activar opción"
                          description="Permite habilitar funcionalidades adicionales."
                        >
                          <Checkbox id="check-1" />
                        </Field>
                        <Field
                          label="Opción deshabilitada"
                        >
                          <Checkbox id="check-disabled" disabled />
                        </Field>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-muted-foreground">Switches</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <label className="text-sm font-medium">Recibir notificaciones</label>
                            <p className="text-xs text-muted-foreground">Alertas de sistema por correo.</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-3 opacity-50">
                          <div className="space-y-0.5">
                            <label className="text-sm font-medium">Modo de configuración</label>
                          </div>
                          <Switch disabled />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">Radio Group</h4>
                    <RadioGroup defaultValue="opcion-a">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="opcion-a" id="r1" />
                        <label htmlFor="r1" className="text-sm font-medium leading-none cursor-pointer">Opción A</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="opcion-b" id="r2" />
                        <label htmlFor="r2" className="text-sm font-medium leading-none cursor-pointer">Opción B</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="opcion-c" id="r3" />
                        <label htmlFor="r3" className="text-sm font-medium leading-none cursor-pointer">Opción C</label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </FormSection>
            </div>

            <div className="md:col-span-3">
              <FormSection 
                title="Perfil del Colaborador (Visual Only)" 
                description="Información básica y administrativa para la gestión de cuenta."
                actions={
                  <Button size="sm" variant="outline" className="flex items-center gap-2">
                    <Save size={14} />
                    Guardar Cambios
                  </Button>
                }
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field 
                    label="Nombre Completo" 
                    required 
                    description="Como aparece en el documento de identidad."
                  >
                    <Input placeholder="Ej. Andrés García" />
                  </Field>
                  
                  <Field 
                    label="Correo Electrónico" 
                    required 
                    error="El formato del correo es inválido"
                  >
                    <Input defaultValue="andres-invalid-email" />
                  </Field>

                  <Field 
                    label="Cargo / Posición" 
                    description="Puesto actual en la organización."
                  >
                    <Input placeholder="Ej. Senior Developer" />
                  </Field>

                  <Field 
                    label="País de Residencia" 
                    required
                  >
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un país" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="co">Colombia</SelectItem>
                        <SelectItem value="mx">México</SelectItem>
                        <SelectItem value="pe">Perú</SelectItem>
                        <SelectItem value="cl">Chile</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field 
                    label="ID de Empleado" 
                    disabled 
                    description="Campo bloqueado por administración."
                  >
                    <Input defaultValue="EMP-12345" />
                  </Field>

                  <div className="md:col-span-2">
                    <Field 
                      label="Biografía / Resumen Profesional" 
                      description="Breve descripción de trayectoria y habilidades clave."
                    >
                      <Textarea placeholder="Cuéntanos un poco sobre tu experiencia..." />
                    </Field>
                  </div>
                </div>
              </FormSection>
            </div>

            <div className="md:col-span-3">
              <FormSection 
                title="Shell Overlays (Phase 7B.4.1)" 
                description="Patrones de modales y diálogos estructurados UBITS."
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">Variantes de Tamaño</h4>
                    <div className="flex flex-wrap gap-2">
                      <ModalShell 
                        size="sm"
                        title="Modal Pequeño (SM)"
                        description="Ideal para confirmaciones rápidas o alertas."
                        trigger={<Button variant="outline" size="sm">Small Modal</Button>}
                        actions={<Button size="sm">Entendido</Button>}
                      >
                        <p className="text-sm">Contenido compacto con ancho máximo de 384px.</p>
                      </ModalShell>

                      <ModalShell 
                        size="md"
                        title="Modal Estándar (MD)"
                        description="Tamaño predeterminado para la mayoría de los flujos."
                        trigger={<Button variant="outline" size="sm">Medium Modal</Button>}
                        actions={
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Cancelar</Button>
                            <Button size="sm">Guardar</Button>
                          </div>
                        }
                      >
                        <p className="text-sm">Contenido estándar con ancho máximo de 448px.</p>
                      </ModalShell>

                      <ModalShell 
                        size="lg"
                        title="Modal Amplio (LG)"
                        description="Para visualizaciones de datos o formularios medianos."
                        trigger={<Button variant="outline" size="sm">Large Modal</Button>}
                      >
                        <p className="text-sm">Contenido amplio con ancho máximo de 512px.</p>
                      </ModalShell>

                      <ModalShell 
                        size="xl"
                        title="Modal Extra Largo (XL)"
                        description="Máxima capacidad para contenido denso o tablas."
                        trigger={<Button variant="outline" size="sm">Extra Large Modal</Button>}
                      >
                        <p className="text-sm">Contenido denso con ancho máximo de 576px.</p>
                      </ModalShell>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">Modo Controlado</h4>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg border bg-muted/30">
                        <div className="text-sm mb-4">Estado del modal: <Badge variant="outline">{isModalOpen ? "Abierto" : "Cerrado"}</Badge></div>
                        <Button onClick={() => setIsModalOpen(true)} size="sm">
                          Abrir por Estado
                        </Button>
                      </div>

                      <ModalShell 
                        open={isModalOpen}
                        onOpenChange={setIsModalOpen}
                        title="Gestión de Estado"
                        description="Demostración de control programático."
                        actions={
                          <Button size="sm" onClick={() => setIsModalOpen(false)}>
                            Cerrar Modal
                          </Button>
                        }
                      >
                        <div className="bg-primary/5 p-4 rounded border border-primary/20 text-xs text-primary font-mono">
                          const [isOpen, setIsOpen] = useState(false);
                        </div>
                      </ModalShell>
                    </div>
                  </div>
                </div>
              </FormSection>

              <FormSection 
                title="Shell Overlays: Drawers (Phase 7B.4.2)" 
                description="Paneles laterales para detalles o configuraciones contextuales."
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">Variantes de Posición y Tamaño</h4>
                    <div className="flex flex-wrap gap-2">
                      <DrawerShell 
                        side="right"
                        size="md"
                        title="Panel Derecho"
                        description="Posición estándar para edición o detalles."
                        trigger={<Button variant="outline" size="sm">Right Drawer</Button>}
                        actions={<Button size="sm">Cerrar</Button>}
                      >
                        <div className="space-y-4">
                          <p className="text-sm">Este es el panel lateral derecho estándar (MD: 448px).</p>
                          <div className="h-40 rounded bg-muted/50 flex items-center justify-center border border-dashed">
                            Contenido del Panel
                          </div>
                        </div>
                      </DrawerShell>

                      <DrawerShell 
                        side="left"
                        size="sm"
                        title="Panel Izquierdo"
                        description="Usado ocasionalmente para navegación secundaria."
                        trigger={<Button variant="outline" size="sm">Left Drawer</Button>}
                      >
                        <p className="text-sm">Panel lateral izquierdo (SM: 384px).</p>
                      </DrawerShell>

                      <DrawerShell 
                        side="bottom"
                        size="md"
                        title="Panel Inferior"
                        description="Útil para logs o acciones masivas rápidas."
                        trigger={<Button variant="outline" size="sm">Bottom Drawer</Button>}
                      >
                        <p className="text-sm">Panel inferior con altura del 50% de la pantalla.</p>
                      </DrawerShell>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">Modo Controlado</h4>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg border bg-muted/30">
                        <div className="text-sm mb-4">Estado del drawer: <Badge variant="outline">{isDrawerOpen ? "Abierto" : "Cerrado"}</Badge></div>
                        <Button onClick={() => setIsDrawerOpen(true)} size="sm">
                          Abrir por Estado
                        </Button>
                      </div>

                      <DrawerShell 
                        open={isDrawerOpen}
                        onOpenChange={setIsDrawerOpen}
                        title="Gestión de Estado"
                        description="Demostración de control programático."
                        actions={
                          <Button size="sm" onClick={() => setIsDrawerOpen(false)}>
                            Cerrar Panel
                          </Button>
                        }
                      >
                        <div className="bg-primary/5 p-4 rounded border border-primary/20 text-xs text-primary font-mono">
                          const [isOpen, setIsOpen] = useState(false);
                        </div>
                      </DrawerShell>
                    </div>
                  </div>
                </div>
              </FormSection>

              <FormSection 
                title="Shell Overlays: Confirmations (Phase 7B.4.3)" 
                description="Diálogos para acciones críticas o irreversibles."
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">Variantes Semánticas</h4>
                    <div className="flex flex-wrap gap-2">
                      <ConfirmDialog 
                        title="¿Deseas confirmar esta acción?"
                        description="Esta es una confirmación estándar para procesos no críticos."
                        trigger={<Button variant="outline" size="sm">Default Confirm</Button>}
                        onConfirm={() => alert("Confirmado")}
                      />

                      <ConfirmDialog 
                        variant="warning"
                        title="Atención: Acción Importante"
                        description="Estás a punto de desactivar un servicio. Podrás revertirlo después."
                        confirmLabel="Desactivar"
                        trigger={<Button variant="outline" size="sm" className="text-warning border-warning/20 hover:bg-warning/10">Warning Confirm</Button>}
                        onConfirm={() => alert("Advertido")}
                      />

                      <ConfirmDialog 
                        variant="destructive"
                        title="¿Eliminar elemento permanentemente?"
                        description="Esta acción no se puede deshacer. Se borrarán todos los datos asociados."
                        confirmLabel="Eliminar"
                        trigger={<Button variant="outline" size="sm" className="text-destructive border-destructive/20 hover:bg-destructive/10">Destructive Confirm</Button>}
                        onConfirm={() => alert("Eliminado")}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">Estados y Feedback</h4>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg border bg-muted/30">
                        <p className="text-sm mb-4">Simulación de proceso asíncrono:</p>
                        <ConfirmDialog 
                          title="Procesando solicitud"
                          description="Se ejecutará una tarea en segundo plano que puede tardar unos segundos."
                          loading={isConfirmLoading}
                          trigger={<Button variant="outline" size="sm">Probar Loading</Button>}
                          onConfirm={() => {
                            setIsConfirmLoading(true)
                            setTimeout(() => {
                              setIsConfirmLoading(false)
                              alert("Proceso completado")
                            }, 2000)
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </FormSection>

              <FormSection 
                title="Feedback & Status (Phase 7B.5)" 
                description="Comunicación de estados del sistema, procesos de carga y notificaciones efímeras."
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-muted-foreground">Alertas Inline</h4>
                      <div className="space-y-3">
                        <Alert variant="info">
                          <Info className="h-4 w-4" />
                          <AlertTitle>Información del sistema</AlertTitle>
                          <AlertDescription>
                            Tu licencia ha sido renovada exitosamente hasta el próximo año.
                          </AlertDescription>
                        </Alert>

                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Error Crítico</AlertTitle>
                          <AlertDescription>
                            No se pudo sincronizar la base de datos de usuarios. Reintenta más tarde.
                          </AlertDescription>
                        </Alert>

                        <Alert variant="warning">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Acción Pendiente</AlertTitle>
                          <AlertDescription>
                            Debes completar tu perfil profesional para acceder a todas las funcionalidades.
                          </AlertDescription>
                        </Alert>

                        <Alert variant="success">
                          <CheckCircle2 className="h-4 w-4" />
                          <AlertTitle>Operación Exitosa</AlertTitle>
                          <AlertDescription>
                            El reporte mensual ha sido generado y enviado a tu correo.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-muted-foreground">Toasts (Sonner)</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toast.success("Acción completada", {
                            description: "El elemento ha sido guardado exitosamente."
                          })}
                        >
                          Toast Success
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toast.error("No se pudo completar la acción", {
                            description: "Hubo un problema de conexión con el servidor."
                          })}
                        >
                          Toast Error
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toast.warning("Revisa la configuración", {
                            description: "Algunos campos podrían requerir atención."
                          })}
                        >
                          Toast Warning
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toast.info("Notificación de ejemplo", {
                            description: "Este es un mensaje informativo técnico."
                          })}
                        >
                          Toast Info
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="col-span-2"
                          onClick={() => {
                            const promise = () => new Promise((resolve) => setTimeout(resolve, 2000));
                            toast.promise(promise, {
                              loading: "Procesando solicitud...",
                              success: "Proceso completado",
                              error: "Error en el proceso",
                            });
                          }}
                        >
                          Toast Promise / Loading
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-muted-foreground">Skeleton Loaders</h4>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-[90%]" />
                          <Skeleton className="h-4 w-[80%]" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-muted-foreground">Progreso Lineal</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Sincronizando archivos...</span>
                          <span>{progressValue}%</span>
                        </div>
                        <Progress value={progressValue} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              </FormSection>

              <FormSection 
                title="Identity & Navigation (Phase 7B.6.1)" 
                description="Componentes de identidad visual y navegación de listas/tablas."
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">Avatares</h4>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center gap-1">
                        <Avatar>
                          <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100" />
                          <AvatarFallback>UB</AvatarFallback>
                        </Avatar>
                        <span className="text-[10px] text-muted-foreground">Default</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <Avatar size="lg">
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <span className="text-[10px] text-muted-foreground">Large (Fallback)</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <Avatar size="sm">
                          <AvatarFallback>A</AvatarFallback>
                        </Avatar>
                        <span className="text-[10px] text-muted-foreground">Small</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">PaginationShell</h4>
                    <PaginationShell 
                      page={currentPage} 
                      pageCount={8} 
                      totalItems={72}
                      pageSize={10}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                </div>
              </FormSection>

              <FormSection 
                title="Utility UI (Phase 7B.6.2)" 
                description="Pequeños componentes utilitarios frecuentes en plataformas B2B."
              >
                <div className="space-y-10">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">Headers (Page & Section)</h4>
                    <div className="space-y-8 rounded-xl border p-6 bg-surface-subtle/30">
                      <PageHeader 
                        title="Título de la Página" 
                        description="Descripción detallada de la página con contexto adicional."
                        breadcrumbs={<div className="text-xs text-muted-foreground">Dashboard / Reportes / Detalle</div>}
                        actions={
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Secundaria</Button>
                            <Button size="sm">Primaria</Button>
                          </div>
                        }
                        meta={
                          <div className="flex gap-4">
                            <span>ID: 99283</span>
                            <span>Creado: 04/05/2026</span>
                          </div>
                        }
                      />
                      
                      <Separator />

                      <SectionHeader 
                        title="Sección de Información" 
                        description="Subtítulo informativo para agrupar campos."
                        eyebrow="Configuración"
                        actions={<Button variant="ghost" size="sm">Ver más</Button>}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-muted-foreground">Accordion</h4>
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                          <AccordionTrigger>¿Cómo funciona la sincronización?</AccordionTrigger>
                          <AccordionContent>
                            La sincronización ocurre de forma automática cada vez que se detectan cambios en el sistema.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                          <AccordionTrigger>Límites de almacenamiento</AccordionTrigger>
                          <AccordionContent>
                            El límite estándar es de 10GB por organización en el plan enterprise.
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-muted-foreground">Tags Standalone</h4>
                      <div className="flex flex-wrap gap-2">
                        <Tag label="Neutral" tone="neutral" />
                        <Tag label="Información" tone="info" />
                        <Tag label="Éxito" tone="success" />
                        <Tag label="Advertencia" tone="warning" />
                        <Tag label="Peligro" tone="danger" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Tag label="Removible" tone="neutral" removable onRemove={() => toast.info("Tag eliminado")} />
                        <Tag label="Filtro: Activo" tone="info" removable onRemove={() => toast.info("Filtro desactivado")} />
                      </div>
                    </div>
                  </div>
                </div>
              </FormSection>

              <FormSection
                title="Contenedores Estructurales (Phase 7C.3) + Presets (Phase 7C.4)"
                description="ChartCard, ChartShell, BarChart, LineChart y AreaChart — componentes reutilizables para dashboards enterprise."
              >
                <div className="space-y-6">
                  {/* Preset Charts: BarChart, LineChart, AreaChart */}
                  <div className="space-y-6">
                    <h4 className="text-sm font-medium text-muted-foreground">Presets de Gráficos (Fase 7C.4)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <BarChart
                        title="Comparación por Categoría"
                        description="Unidades distribuidas por área"
                        data={[
                          { label: "Categoría A", value: 420 },
                          { label: "Categoría B", value: 580 },
                          { label: "Categoría C", value: 350 },
                          { label: "Categoría D", value: 270 },
                        ]}
                        seriesName="Unidades"
                        height={260}
                        loading={demoLoading}
                      />
                      <LineChart
                        title="Tendencia Semanal"
                        description="Actividad día a día"
                        data={[
                          { label: "Lunes", value: 150 },
                          { label: "Martes", value: 230 },
                          { label: "Miércoles", value: 200 },
                          { label: "Jueves", value: 300 },
                          { label: "Viernes", value: 280 },
                        ]}
                        seriesName="Actividad"
                        smooth={true}
                        height={260}
                        loading={demoLoading}
                      />
                      <AreaChart
                        title="Acumulado Mensual"
                        description="Volumen acumulativo de ingresos"
                        data={[
                          { label: "Semana 1", value: 1000 },
                          { label: "Semana 2", value: 2300 },
                          { label: "Semana 3", value: 3800 },
                          { label: "Semana 4", value: 5200 },
                        ]}
                        seriesName="Ingresos"
                        height={260}
                        loading={demoLoading}
                      />
                      <BarChart
                        title="Comparación Horizontal"
                        description="Ranking de desempeño por equipo"
                        data={[
                          { label: "Equipo A", value: 85 },
                          { label: "Equipo B", value: 92 },
                          { label: "Equipo C", value: 78 },
                          { label: "Equipo D", value: 88 },
                          { label: "Equipo E", value: 81 },
                        ]}
                        seriesName="Desempeño"
                        horizontal={true}
                        height={260}
                        loading={demoLoading}
                      />
                    </div>
                  </div>

                  {/* Preset Charts: DonutChart, SparklineChart, KpiCard (Fase 7C.5) */}
                  <div className="space-y-6">
                    <h4 className="text-sm font-medium text-muted-foreground">Composición e Indicadores (Fase 7C.5)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <DonutChart
                        title="Distribución de Componentes"
                        description="Breakdown técnico"
                        data={[
                          { label: "Core", value: 300 },
                          { label: "UI", value: 200 },
                          { label: "Charts", value: 150 },
                          { label: "Utility", value: 100 },
                        ]}
                        seriesName="Componentes"
                        variant="donut"
                        height={260}
                        loading={demoLoading}
                      />
                      <DonutChart
                        title="Variante Pie"
                        description="Mismo data, distinto style"
                        data={[
                          { label: "Frontend", value: 400 },
                          { label: "Backend", value: 300 },
                          { label: "DevOps", value: 200 },
                        ]}
                        seriesName="Stack"
                        variant="pie"
                        height={260}
                        loading={demoLoading}
                      />
                      <div className="space-y-4">
                        <KpiCard
                          title="Métrica Ejemplo 1"
                          value="$2,450"
                          delta="+12%"
                          trend="positive"
                          description="Comparado al período anterior"
                          sparklineData={[
                            { label: "W1", value: 2000 },
                            { label: "W2", value: 2100 },
                            { label: "W3", value: 2300 },
                            { label: "W4", value: 2450 },
                          ]}
                          footer="Actualizado hace 2 horas"
                        />
                        <KpiCard
                          title="Métrica Ejemplo 2"
                          value="78.5%"
                          delta="-2.1%"
                          trend="negative"
                          description="Tasa de ejemplo"
                          sparklineData={[
                            { label: "Day 1", value: 85 },
                            { label: "Day 2", value: 82 },
                            { label: "Day 3", value: 80 },
                            { label: "Day 4", value: 78.5 },
                          ]}
                          footer="Datos técnicos genéricos"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Standalone SparklineChart demo */}
                  <div className="space-y-6">
                    <h4 className="text-sm font-medium text-muted-foreground">Sparkline (Fase 7C.5)</h4>
                    <div className="flex items-center gap-4 p-4 border rounded-lg bg-card">
                      <div className="flex-1">
                        <p className="text-sm font-medium">Tendencia Técnica</p>
                        <p className="text-xs text-muted-foreground">Datos en tiempo de ejecución</p>
                      </div>
                      <div className="w-32">
                        <SparklineChart
                          data={[
                            { label: "T1", value: 45 },
                            { label: "T2", value: 52 },
                            { label: "T3", value: 48 },
                            { label: "T4", value: 61 },
                            { label: "T5", value: 55 },
                          ]}
                          height={32}
                          trend="positive"
                          showTooltip={true}
                          ariaLabel="Sparkline demo chart"
                        />
                      </div>
                    </div>
                  </div>

                  {/* HeatmapChart demo (Fase 7C.6) */}
                  <HeatmapChart
                    title="Densidad de Actividad por Zona Horaria"
                    description="Distribución técnica de eventos por día y hora"
                    xLabels={["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]}
                    yLabels={["00:00-06:00", "06:00-12:00", "12:00-18:00", "18:00-24:00"]}
                    data={[
                      { x: "Lunes", y: "00:00-06:00", value: 12 },
                      { x: "Lunes", y: "06:00-12:00", value: 35 },
                      { x: "Lunes", y: "12:00-18:00", value: 62 },
                      { x: "Lunes", y: "18:00-24:00", value: 28 },
                      { x: "Martes", y: "00:00-06:00", value: 15 },
                      { x: "Martes", y: "06:00-12:00", value: 42 },
                      { x: "Martes", y: "12:00-18:00", value: 71 },
                      { x: "Martes", y: "18:00-24:00", value: 33 },
                      { x: "Miércoles", y: "00:00-06:00", value: 10 },
                      { x: "Miércoles", y: "06:00-12:00", value: 38 },
                      { x: "Miércoles", y: "12:00-18:00", value: 58 },
                      { x: "Miércoles", y: "18:00-24:00", value: 25 },
                      { x: "Jueves", y: "00:00-06:00", value: 18 },
                      { x: "Jueves", y: "06:00-12:00", value: 48 },
                      { x: "Jueves", y: "12:00-18:00", value: 75 },
                      { x: "Jueves", y: "18:00-24:00", value: 40 },
                      { x: "Viernes", y: "00:00-06:00", value: 20 },
                      { x: "Viernes", y: "06:00-12:00", value: 55 },
                      { x: "Viernes", y: "12:00-18:00", value: 82 },
                      { x: "Viernes", y: "18:00-24:00", value: 45 },
                    ]}
                    min={0}
                    max={100}
                    height={320}
                    loading={demoLoading}
                    ariaLabel="Heatmap de densidad de actividad por zona horaria"
                    summary={
                      <p>
                        Mapa de calor que muestra la distribución técnica de eventos a través de
                        5 días de la semana (Lunes-Viernes) en 4 franjas horarias (00:00-06:00, 06:00-12:00,
                        12:00-18:00, 18:00-24:00). Valores de ejemplo oscilan entre 10 y 82 unidades.
                      </p>
                    }
                  />

                  {/* Legacy ChartCard examples for reference */}
                  <h4 className="text-sm font-medium text-muted-foreground">Contenedores Estructurales (Fase 7C.3) - Directos</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ChartCard
                      title="Distribución por Categoría"
                      description="Unidades por área de negocio"
                      meta="Resumen mensual"
                      loading={demoLoading}
                      option={{
                        xAxis: { type: 'category', data: ['Cat A', 'Cat B', 'Cat C', 'Cat D'] },
                        yAxis: { type: 'value' },
                        series: [{ data: [120, 200, 150, 80], type: 'bar' }],
                      }}
                      height={240}
                      ariaLabel="Gráfico de barras: distribución por categoría"
                      summary={<p>Categorías: Cat A 120, Cat B 200, Cat C 150, Cat D 80.</p>}
                    />
                    <ChartCard
                      title="Tendencia Semanal"
                      description="Actividad acumulada de lunes a viernes"
                      loading={demoLoading}
                      option={{
                        xAxis: { type: 'category', data: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'] },
                        yAxis: { type: 'value' },
                        series: [{ data: [15, 23, 20, 30, 28], type: 'line', smooth: true }],
                      }}
                      height={240}
                      ariaLabel="Gráfico de línea: tendencia semanal"
                      summary={<p>Lun 15, Mar 23, Mié 20, Jue 30, Vie 28.</p>}
                    />
                  </div>

                  {/* ChartShell standalone: estados vacío y error */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground px-1">ChartShell — Estado vacío</p>
                      <ChartShell
                        option={{}}
                        height={160}
                        empty
                        ariaLabel="Sin datos disponibles"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground px-1">ChartShell — Estado error</p>
                      <ChartShell
                        option={{}}
                        height={160}
                        error="No se pudo conectar con el servicio de datos."
                        ariaLabel="Error al cargar el gráfico"
                      />
                    </div>
                  </div>

                  {/* EChart directo: acceso raw al wrapper base */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground px-1">EChart (wrapper base) — Theming dinámico via MutationObserver</p>
                    <Card className="p-6">
                      <EChart
                        height={200}
                        option={{
                          xAxis: { type: 'category', data: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'] },
                          yAxis: { type: 'value' },
                          series: [{ data: [42, 58, 50, 73, 65, 80], type: 'bar' }],
                        }}
                      />
                    </Card>
                  </div>
                </div>
              </FormSection>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Validación: StatusBadge</CardTitle>
                <CardDescription>Variantes semánticas enterprise</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <StatusBadge status="active" />
                <StatusBadge status="inactive" />
                <StatusBadge status="pending" />
                <StatusBadge status="completed" />
                <StatusBadge status="warning" />
                <StatusBadge status="error" />
                <StatusBadge status="info" />
                <StatusBadge status="neutral" />
                <StatusBadge status="active" label="En curso" />
              </CardContent>
            </Card>

            <div className="md:col-span-3">
              <TableShell 
                title="Gestión de Usuarios" 
                description="Listado de colaboradores activos en el sistema con sus respectivos estados de licencia."
                actions={
                  <Button size="sm" className="flex items-center gap-2">
                    <Plus size={14} />
                    Nuevo Usuario
                  </Button>
                }
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Colaborador</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Último Acceso</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Andrés García</TableCell>
                      <TableCell>andres@ubits.com</TableCell>
                      <TableCell><StatusBadge status="active" /></TableCell>
                      <TableCell className="text-right">Hoy, 14:30</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Beatriz López</TableCell>
                      <TableCell>beatriz@ubits.com</TableCell>
                      <TableCell><StatusBadge status="pending" /></TableCell>
                      <TableCell className="text-right">Ayer</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Carlos Ruiz</TableCell>
                      <TableCell>carlos@ubits.com</TableCell>
                      <TableCell><StatusBadge status="inactive" /></TableCell>
                      <TableCell className="text-right">Hace 1 semana</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableShell>
            </div>

            <div className="md:col-span-3">
              <TableShell 
                title="Resultados Filtrados" 
                description="Esta tabla muestra el comportamiento del TableShell cuando no hay datos."
                empty
              >
                <Table />
              </TableShell>
            </div>

            <div className="md:col-span-3">
              <EmptyState 
                icon={Inbox}
                title="No hay registros encontrados"
                description="Parece que todavía no has agregado información. Haz clic en el botón inferior para comenzar el proceso de configuración."
                action={
                  <Button className="flex items-center gap-2">
                    <Plus size={16} />
                    Crear nuevo registro
                  </Button>
                }
              />
            </div>

            <FormSection
              title="Date & Range Inputs (Phase 7D.1A)"
              description="Componentes base para selección de fechas y rangos temporales. Usa Date nativo + Intl.DateTimeFormat (sin date-fns)."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">DatePicker Controlado</h4>
                    <DatePicker
                      label="Fecha de ejemplo"
                      value={date}
                      onChange={setDate}
                      placeholder="Selecciona una fecha"
                      description="Single date selection con validación nativa"
                    />
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">DatePicker Deshabilitado</h4>
                    <DatePicker
                      label="Fecha deshabilitada"
                      value={date}
                      onChange={setDate}
                      placeholder="No seleccionable"
                      disabled={true}
                      description="Estado disabled aplicado"
                    />
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">DatePicker con Error</h4>
                    <DatePicker
                      label="Fecha con error"
                      value={undefined}
                      onChange={() => {}}
                      placeholder="Campo requerido"
                      error="Debe seleccionar una fecha válida"
                      description="Validación visual de error"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">DateRangePicker Controlado</h4>
                    <DateRangePicker
                      label="Rango de ejemplo"
                      value={dateRange}
                      onChange={setDateRange}
                      placeholder="Selecciona un rango"
                      description="Selecciona desde y hasta con doble calendario"
                    />
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">DateRangePicker Deshabilitado</h4>
                    <DateRangePicker
                      label="Rango deshabilitado"
                      value={dateRange}
                      onChange={setDateRange}
                      placeholder="No seleccionable"
                      disabled={true}
                      description="Estado disabled en rango"
                    />
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">DateRangePicker con Restricción</h4>
                    <DateRangePicker
                      label="Rango restringido"
                      value={dateRange}
                      onChange={setDateRange}
                      placeholder="Selecciona un rango"
                      minDate={new Date(2026, 4, 1)}
                      maxDate={new Date(2026, 4, 31)}
                      description="Solo fechas de mayo de 2026 permitidas"
                    />
                  </div>
                </div>
              </div>
            </FormSection>

            <FormSection
              title="Slider & Range Selection (Phase 7D.1B)"
              description="Controles para selección de valores numéricos, rangos, porcentajes y umbrales."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">Slider Básico</h4>
                    <div className="px-1">
                      <Slider
                        value={sliderValue}
                        onValueChange={setSliderValue}
                        max={100}
                        step={1}
                      />
                      <p className="text-xs text-muted-foreground mt-2">Valor actual: {sliderValue[0]}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">Slider Deshabilitado</h4>
                    <div className="px-1">
                      <Slider
                        defaultValue={[30]}
                        disabled
                        max={100}
                        step={1}
                      />
                      <p className="text-xs text-muted-foreground mt-2">No interactuable</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-2">
                    <RangeSlider
                      label="Rango de ejemplo"
                      value={rangeValue}
                      onChange={setRangeValue}
                      min={0}
                      max={100}
                      description="Selecciona un rango de valores numéricos"
                    />
                  </div>
                  <div className="space-y-2">
                    <RangeSlider
                      label="Porcentaje de ejemplo"
                      value={percentageValue}
                      onChange={setPercentageValue}
                      min={0}
                      max={100}
                      valueFormatter={(v) => `${v}%`}
                      description="Uso de formateador para porcentajes"
                    />
                  </div>
                  <div className="space-y-2">
                    <RangeSlider
                      label="Rango con Error"
                      value={[10, 40]}
                      onChange={() => {}}
                      error="El rango seleccionado no es válido para esta configuración"
                      description="Validación visual de error en rangos"
                    />
                  </div>
                </div>
              </div>
            </FormSection>

            <FormSection
              title="Period Selection & Filter Bar (Phase 7D.1C)"
              description="Componentes para filtrado temporal avanzado en dashboards y reportes."
            >
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <MonthPicker
                    label="Mes de ejemplo"
                    value={month}
                    onChange={setMonth}
                    description="Selección de mes y año"
                  />
                  <QuarterSelector
                    label="Trimestre de ejemplo"
                    value={quarter}
                    onChange={setQuarter}
                    description="Selección de Q1-Q4 y año"
                  />
                  <PeriodSelector
                    label="Periodo de ejemplo"
                    value={period}
                    onChange={setPeriod}
                    description="Opciones predefinidas"
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground">DateFilterBar (Demo Técnica)</h4>
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <DateFilterBar
                      mode={filterBarMode}
                      onModeChange={setFilterBarMode}
                      period={fbPeriod}
                      onPeriodChange={setFbPeriod}
                      date={fbDate}
                      onDateChange={setFbDate}
                      range={fbRange}
                      onRangeChange={setFbRange}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Modo activo: <span className="font-mono font-bold uppercase text-primary">{filterBarMode}</span>
                  </p>
                </div>
              </div>
            </FormSection>

            <FormSection
              title="Upload & Files (Phase 7D.2A)"
              description="Infraestructura base para selección y arrastre de archivos usando APIs nativas."
            >
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <FileUpload
                      label="Selección de archivo único"
                      value={singleFile}
                      onChange={setSingleFile}
                      accept=".pdf,.doc,.docx"
                      description="Solo PDF o Word, máx. 5MB"
                      maxSizeMB={5}
                    />
                    
                    <FileUpload
                      label="Selección múltiple"
                      value={multipleFiles}
                      onChange={setMultipleFiles}
                      multiple
                      maxFiles={3}
                      description="Máximo 3 archivos de cualquier tipo"
                    />

                    <FileUpload
                      label="Estado deshabilitado"
                      disabled
                      buttonLabel="No disponible"
                      description="El componente bloquea la interacción"
                    />
                  </div>

                  <div className="space-y-6">
                    <UploadZone
                      label="Área de arrastre (Dropzone)"
                      value={dropZoneFiles}
                      onChange={setDropZoneFiles}
                      multiple
                      description="Arrastra tus reportes aquí (Cualquier formato)"
                    />

                    <UploadZone
                      label="Dropzone con validación"
                      accept="image/*"
                      maxSizeMB={2}
                      error="Solo se permiten imágenes menores a 2MB"
                      description="Ejemplo de feedback de error inmediato"
                    />
                  </div>
                </div>
              </div>
            </FormSection>

            <FormSection
              title="Visualización de Adjuntos (Phase 7D.2B)"
              description="Visualización de metadata, variantes de previsualización y gestión de listas."
            >
              <div className="space-y-12">
                {/* Variant Row & Compact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <SectionHeader title="Variantes de Previsualización" />
                    <div className="space-y-4">
                      {singleFile.length > 0 ? (
                        <FilePreview 
                          file={singleFile[0]} 
                          variant="row" 
                          removable 
                          onRemove={() => setSingleFile([])}
                          className="bg-primary/5 border-primary/20"
                        />
                      ) : (
                        <div className="p-4 border border-dashed rounded-lg text-center text-xs text-muted-foreground">
                          Selecciona un archivo arriba para ver la previsualización en fila
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2">
                        <FilePreview 
                          file={new File([""], "manual_user_guide.pdf", { type: "application/pdf" })} 
                          variant="compact"
                        />
                        <FilePreview 
                          file={new File([""], "budget_2026.xlsx", { type: "application/vnd.ms-excel" })} 
                          variant="compact"
                          removable
                        />
                        <FilePreview 
                          file={new File([""], "invalid_format.exe", { type: "application/x-msdownload" })} 
                          variant="compact"
                          error="Formato no permitido"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <SectionHeader title="Estado de Error y Deshabilitado" />
                    <div className="space-y-4">
                      <FilePreview 
                        file={new File([""], "corrupted_image.png", { type: "image/png" })} 
                        variant="row" 
                        error="El archivo está dañado o no se puede leer"
                      />
                      <FilePreview 
                        file={new File([""], "system_config.json", { type: "application/json" })} 
                        variant="row" 
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* AttachmentList demos */}
                <div className="space-y-8">
                  <div className="space-y-4">
                    <SectionHeader title="Listado de Adjuntos (Layout Grid)" />
                    <AttachmentList 
                      files={multipleFiles} 
                      variant="grid" 
                      removable 
                      onRemove={(idx) => setMultipleFiles(multipleFiles.filter((_, i) => i !== idx))}
                    />
                  </div>

                  <div className="space-y-4">
                    <SectionHeader title="Listado Vacío" />
                    <AttachmentList files={[]} />
                  </div>
                </div>
              </div>
            </FormSection>

            <FormSection
              title="Data Import & Progress (Phase 7D.2C)"
              description="Panel visual de importación con previsualización de datos y feedback de estado."
            >
              <div className="space-y-12">
                {/* UploadProgress Variants */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <SectionHeader title="Estados de Progreso" />
                    <UploadProgress 
                      value={45} 
                      status="uploading" 
                      label="Cargando archivo..." 
                      description="Subiendo reporte_mensual_v2.csv"
                    />
                    <UploadProgress 
                      value={100} 
                      status="success" 
                      label="Carga completada" 
                      description="El archivo ha sido procesado exitosamente"
                    />
                  </div>
                  <div className="space-y-6">
                    <SectionHeader title="Estados de Error" />
                    <UploadProgress 
                      value={78} 
                      status="error" 
                      label="Error en la validación" 
                      error="La columna 'email' contiene formatos inválidos en la fila 42."
                    />
                    <UploadProgress 
                      value={0} 
                      status="idle" 
                      label="Esperando inicio..." 
                      description="El proceso comenzará al confirmar la importación"
                    />
                  </div>
                </div>

                <Separator />

                {/* ImportCsvPanel demos */}
                <div className="space-y-8">
                  <SectionHeader title="Panel de Importación CSV (Composite)" />
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Empty / Idle State */}
                    <ImportCsvPanel 
                      onFileChange={setImportFile}
                      className="h-full"
                    />

                    {/* Preview State (Simulated) */}
                    <ImportCsvPanel 
                      file={new File([""], "nomina_mayo_2026.csv", { type: "text/csv" })}
                      status={importStatus}
                      progress={importProgress}
                      previewColumns={[
                        { key: 'id', label: 'ID' },
                        { key: 'name', label: 'Nombre' },
                        { key: 'role', label: 'Cargo' },
                        { key: 'status', label: 'Estado' }
                      ]}
                      previewRows={[
                        { id: '001', name: 'Ana Garcia', role: 'UX Designer', status: 'Activo' },
                        { id: '002', name: 'Carlos Ruiz', role: 'DevOps', status: 'Pendiente' },
                        { id: '003', name: 'Marta Sanz', role: 'Product Manager', status: 'Activo' }
                      ]}
                      onFileChange={(files) => {
                        if (files.length === 0) {
                          setImportStatus('idle')
                          setImportProgress(0)
                        } else {
                          // Simulate process for demo
                          setImportStatus('validating')
                          setImportProgress(30)
                          setTimeout(() => {
                            setImportStatus('uploading')
                            setImportProgress(75)
                            setTimeout(() => {
                              setImportStatus('success')
                              setImportProgress(100)
                            }, 1000)
                          }, 1000)
                        }
                      }}
                      actions={
                        <>
                          <Button variant="outline" size="sm" onClick={() => {
                            setImportStatus('idle')
                            setImportProgress(0)
                          }}>
                            Cancelar
                          </Button>
                          <Button size="sm" disabled={importStatus === 'uploading' || importStatus === 'validating'}>
                            Confirmar Importación
                          </Button>
                        </>
                      }
                    />
                  </div>
                </div>
              </div>
            </FormSection>

            <FormSection
              title="Visual Selection (Phase 7D.3A)"
              description="Selección visual mediante Cards y Radio Groups con estética enterprise."
            >
              <div className="space-y-12">
                <div className="grid grid-cols-1 gap-10">
                  {/* CardSelection Demo */}
                  <div className="space-y-6">
                    <SectionHeader title="CardSelection (Single Selection)" />
                    <CardSelection 
                      label="Plan de suscripción"
                      description="Elige el plan que mejor se adapte a tu equipo."
                      value={selectedCard}
                      onChange={setSelectedCard}
                      columns={3}
                      options={[
                        { 
                          value: "basic", 
                          label: "Básico", 
                          description: "Ideal para individuos o startups pequeñas.",
                          eyebrow: "Starter",
                          icon: Settings
                        },
                        { 
                          value: "pro", 
                          label: "Profesional", 
                          description: "Herramientas avanzadas para equipos en crecimiento.",
                          eyebrow: "Recomendado",
                          badge: "Popular",
                          icon: Zap
                        },
                        { 
                          value: "ent", 
                          label: "Enterprise", 
                          description: "Control total y seguridad para grandes corporaciones.",
                          eyebrow: "Corporativo",
                          icon: Layers
                        }
                      ]}
                    />
                  </div>

                  <Separator />

                  {/* RadioCardGroup Demo */}
                  <div className="space-y-6">
                    <SectionHeader title="RadioCardGroup (Native Accessibility)" />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <RadioCardGroup 
                        label="Tipo de configuración"
                        value={selectedRadio}
                        onChange={setSelectedRadio}
                        columns={2}
                        options={[
                          { 
                            value: "standard", 
                            label: "Configuración Estándar", 
                            description: "Parámetros predefinidos por el sistema.",
                            badge: "Default"
                          },
                          { 
                            value: "custom", 
                            label: "Personalizado", 
                            description: "Ajusta cada detalle manualmente.",
                          }
                        ]}
                      />

                      <RadioCardGroup 
                        label="Opciones Deshabilitadas"
                        disabled
                        value="off"
                        options={[
                          { 
                            value: "on", 
                            label: "Activado", 
                            description: "El servicio está funcionando.",
                          },
                          { 
                            value: "off", 
                            label: "Desactivado", 
                            description: "El servicio se encuentra en pausa.",
                          }
                        ]}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </FormSection>

            <FormSection
              title="Selection Multi & Densa (Phase 7D.3B)"
              description="Selección múltiple mediante cards y tiles de alta densidad para interfaces complejas."
            >
              <div className="space-y-12">
                <div className="grid grid-cols-1 gap-10">
                  {/* CheckboxCardGroup Demo */}
                  <div className="space-y-6">
                    <SectionHeader title="CheckboxCardGroup (Multiple Selection)" />
                    <CheckboxCardGroup 
                      label="Configuración de Seguridad"
                      description="Habilita las capas de protección para tu cuenta."
                      value={selectedChecks}
                      onChange={setSelectedChecks}
                      columns={3}
                      options={[
                        { 
                          value: "mfa", 
                          label: "Autenticación MFA", 
                          description: "Requiere un código adicional para iniciar sesión.",
                          badge: "Seguro",
                          icon: Shield
                        },
                        { 
                          value: "logs", 
                          label: "Registro de Actividad", 
                          description: "Historial completo de accesos y cambios.",
                          icon: Clock
                        },
                        { 
                          value: "ip", 
                          label: "Restricción por IP", 
                          description: "Solo permite accesos desde redes conocidas.",
                          disabled: true,
                          icon: MousePointer2
                        }
                      ]}
                    />
                  </div>

                  <Separator />

                  {/* SelectableCard & OptionTile Standalone */}
                  <div className="space-y-6">
                    <SectionHeader title="SelectableCard & OptionTile (Standalone)" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">SelectableCard</p>
                        <SelectableCard 
                          option={{
                            value: "standalone",
                            label: "Card Independiente",
                            description: "Haz click para alternar el estado de selección.",
                            icon: Zap
                          }}
                          selected={isCardSelected}
                          onSelect={() => setIsCardSelected(!isCardSelected)}
                          mode="multiple"
                        />
                      </div>
                      <div className="space-y-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">OptionTile (Densa)</p>
                        <div className="space-y-2">
                          {[
                            { value: "opt1", label: "Opción Compacta A", description: "Detalle corto", icon: Settings },
                            { value: "opt2", label: "Opción Compacta B", description: "Detalle corto", badge: "Nuevo", icon: Zap },
                            { value: "opt3", label: "Opción Compacta C", description: "Detalle corto", icon: Layers }
                          ].map(opt => (
                            <OptionTile 
                              key={opt.value}
                              option={opt}
                              selected={selectedTile === opt.value}
                              onSelect={setSelectedTile}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FormSection>

            <FormSection
              title="Segmented Control (Phase 7D.3C)"
              description="Controles compactos para alternar entre estados, vistas o periodos."
            >
              <div className="space-y-12">
                <div className="grid grid-cols-1 gap-10">
                  {/* SegmentedControl Variants */}
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <SectionHeader title="Solid Variant (Default)" />
                        <SegmentedControl 
                          label="Vista de visualización"
                          value={segmentedValue}
                          onChange={setSegmentedValue}
                          options={[
                            { value: "grid", label: "Cuadrícula", icon: LayoutGrid },
                            { value: "list", label: "Lista", icon: List },
                            { value: "chart", label: "Gráficos", icon: BarChart3 }
                          ]}
                        />
                      </div>

                      <div className="space-y-6">
                        <SectionHeader title="Underline Variant (Minimalist)" />
                        <SegmentedControl 
                          variant="underline"
                          label="Nivel de detalle"
                          value={segmentedView}
                          onChange={setSegmentedView}
                          options={[
                            { value: "summary", label: "Resumen" },
                            { value: "detail", label: "Detalle" },
                            { value: "trend", label: "Tendencia" }
                          ]}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <SectionHeader title="Outline Variant (Size SM)" />
                        <SegmentedControl 
                          variant="outline"
                          size="sm"
                          label="Periodo de reporte"
                          value={segmentedPeriod}
                          onChange={setSegmentedPeriod}
                          options={[
                            { value: "day", label: "Diario" },
                            { value: "week", label: "Semanal" },
                            { value: "month", label: "Mensual" }
                          ]}
                        />
                      </div>

                      <div className="space-y-6">
                        <SectionHeader title="Disabled States" />
                        <SegmentedControl 
                          disabled
                          value="opt1"
                          options={[
                            { value: "opt1", label: "Opción 1" },
                            { value: "opt2", label: "Opción 2" },
                            { value: "opt3", label: "Opción Deshabilitada", disabled: true }
                          ]}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FormSection>

            <FormSection
              title="Carousel & Media (Phase 7D.4A)"
              description="Componentes de navegación horizontal y visualización de contenido multimedia."
            >
              <div className="space-y-12">
                <div className="grid grid-cols-1 gap-10">
                  {/* UbitsCarousel Demo */}
                  <div className="space-y-6">
                    <UbitsCarousel 
                      title="Nuevos Cursos Disponibles"
                      description="Explora las últimas adiciones a nuestro catálogo corporativo."
                      showDots
                      actions={
                        <Button variant="ghost" size="sm" className="font-semibold text-primary">
                          Ver todo <ChevronRight className="ml-1" />
                        </Button>
                      }
                      itemClassName="md:basis-1/2 lg:basis-1/3"
                    >
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Card key={i} className="group overflow-hidden border-border/50 hover:border-primary/50 transition-colors">
                          <div className="aspect-video bg-muted/50 flex items-center justify-center relative">
                            <span className="text-muted-foreground font-mono text-xs">Preview {i}</span>
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <CardHeader className="p-4">
                            <CardTitle className="text-sm">Card de ejemplo {i}</CardTitle>
                            <p className="text-xs text-muted-foreground">Descripción técnica del elemento de ejemplo en el carrusel.</p>
                          </CardHeader>
                        </Card>
                      ))}
                    </UbitsCarousel>
                  </div>
                </div>
              </div>
            </FormSection>

            <FormSection
              title="Gallery & Grid (Phase 7D.4B)"
              description="Visualización de colecciones multimedia en grillas enterprise y layouts bento."
            >
              <div className="space-y-12">
                <div className="grid grid-cols-1 gap-10">
                  {/* Gallery with Cards Variant */}
                  <div className="space-y-6">
                    <Gallery 
                      title="Galería de Recursos"
                      description="Gestiona y selecciona los elementos multimedia de tu biblioteca."
                      items={mockMedia.slice(0, 4)}
                      selectable
                      selectedIds={selectedMedia}
                      onSelect={(id) => setSelectedMedia(prev => 
                        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
                      )}
                      actions={
                        <Button size="sm">
                          <Plus className="mr-2 h-4 w-4" /> Añadir recurso
                        </Button>
                      }
                    />
                  </div>

                  <Separator />

                  {/* ImageGrid Compact & Bento */}
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <SectionHeader title="ImageGrid (Compact Variant)" />
                        <ImageGrid 
                          variant="compact"
                          columns={4}
                          items={mockMedia.slice(0, 4)}
                        />
                      </div>

                      <div className="space-y-6">
                        <SectionHeader title="ImageGrid (Bento Layout)" />
                        <ImageGrid 
                          variant="bento"
                          items={mockMedia}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Empty State Demo */}
                  <div className="space-y-6">
                    <SectionHeader title="Gallery (Empty State)" />
                    <Gallery items={[]} />
                  </div>
                </div>
              </div>
            </FormSection>

            <FormSection
              title="Media Previews (Phase 7D.4C)"
              description="Visores y tarjetas de previsualización técnica para elementos multimedia."
            >
              <div className="space-y-12">
                <div className="grid grid-cols-1 gap-12">
                  {/* MediaPreview Inline Demo */}
                  <div className="space-y-6">
                    <SectionHeader 
                      title="MediaPreview (Inline)" 
                      description="Previsualización detallada de un recurso seleccionado."
                    />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <Card className="lg:col-span-2 p-6">
                        <MediaPreview 
                          item={activePreviewItem}
                          actions={
                            <>
                              <Button variant="outline" size="sm">
                                <Download className="mr-2 h-4 w-4" /> Descargar
                              </Button>
                              <Button variant="outline" size="sm">
                                <Share2 className="mr-2 h-4 w-4" /> Compartir
                              </Button>
                              <Button size="sm">
                                <ExternalLink className="mr-2 h-4 w-4" /> Abrir original
                              </Button>
                            </>
                          }
                        />
                      </Card>
                      
                      <div className="space-y-6">
                        <SectionHeader title="Selector de Preview" />
                        <div className="grid grid-cols-1 gap-4">
                          {mockMedia.slice(0, 3).map((item) => (
                            <PreviewCard 
                              key={item.id}
                              item={item}
                              selected={activePreviewItem?.id === item.id}
                              onSelect={() => setActivePreviewItem(item)}
                              className="w-full"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* PreviewCard Variants */}
                  <div className="space-y-6">
                    <SectionHeader title="PreviewCard Variants" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <PreviewCard 
                        item={{ ...mockMedia[0], badge: "Nuevo", metadata: "2.4 MB" }} 
                        actions={<Button variant="ghost" size="sm" className="w-full">Ver detalles</Button>}
                      />
                      <PreviewCard 
                        item={{ id: "m-no-src", title: "Recurso sin imagen", kind: "document", metadata: "PDF" }} 
                      />
                      <PreviewCard 
                        item={{ ...mockMedia[1], disabled: true }} 
                        disabled
                      />
                      <PreviewCard 
                        item={mockMedia[2]} 
                        actions={
                          <div className="flex gap-2 w-full">
                            <Button variant="outline" size="sm" className="flex-1">Editar</Button>
                            <Button variant="outline" size="sm" className="px-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        }
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Empty Gallery State */}
                  <div className="space-y-6">
                    <SectionHeader title="Empty States Especializados" />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <EmptyGalleryState 
                        title="Tu galería está vacía"
                        description="Comienza subiendo tus primeros recursos multimedia para gestionarlos desde aquí."
                        action={<Button><Plus className="mr-2 h-4 w-4" /> Subir archivos</Button>}
                      />
                      <MediaPreview 
                        emptyState={
                          <EmptyGalleryState 
                            title="Selección requerida" 
                            description="Haz clic en una tarjeta de la izquierda para ver los detalles técnicos aquí."
                            className="h-full min-h-[400px]"
                          />
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </FormSection>

            <FormSection
              title="Survey Analytics Foundations (Phase 7D.5A)"
              description="Átomos analíticos para la construcción de dashboards y reportes de encuestas."
            >
              <div className="space-y-12">
                <div className="grid grid-cols-1 gap-12">
                  {/* DeltaPill Demos */}
                  <div className="space-y-6">
                    <SectionHeader title="DeltaPill Variants" description="Indicadores de cambio con tonos semánticos." />
                    <div className="flex flex-wrap gap-4 items-center">
                      <DeltaPill value={12.5} />
                      <DeltaPill value={-3.2} />
                      <DeltaPill value={0} />
                      <DeltaPill label="+5.2pp" tone="positive" direction="up" />
                      <DeltaPill label="-1.8pp" tone="negative" direction="down" />
                      <DeltaPill label="Sin cambio" tone="neutral" showIcon={false} />
                      <DeltaPill value={24} size="sm" />
                      <DeltaPill value={-12} size="sm" />
                    </div>
                  </div>

                  <Separator />

                  {/* InlineLegend Demos */}
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <SectionHeader title="InlineLegend (Horizontal)" />
                        <Card className="p-6">
                          <InlineLegend 
                            items={[
                              { label: "Promotores", value: "65%", tone: "positive", description: "9-10 pts" },
                              { label: "Pasivos", value: "20%", tone: "warning", description: "7-8 pts" },
                              { label: "Detractores", value: "15%", tone: "negative", description: "0-6 pts" },
                            ]}
                          />
                        </Card>
                      </div>

                      <div className="space-y-6">
                        <SectionHeader title="InlineLegend (Vertical)" />
                        <Card className="p-6">
                          <InlineLegend 
                            orientation="vertical"
                            items={[
                              { label: "Métrica A", value: 85, tone: "primary" },
                              { label: "Métrica B", value: 72, tone: "info" },
                              { label: "Métrica C", value: 45, tone: "neutral" },
                            ]}
                          />
                        </Card>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* MetricComparisonFooter Demos */}
                  <div className="space-y-6">
                    <SectionHeader title="MetricComparisonFooter" description="Comparativos de alta densidad para footers de cards." />
                    <Card className="max-w-3xl">
                      <div className="p-6 pb-0">
                        <h4 className="text-sm font-bold">Resultado General</h4>
                        <p className="text-2xl font-bold mt-1">78%</p>
                      </div>
                      <MetricComparisonFooter 
                        className="px-6"
                        items={[
                          { label: "VS Periodo Anterior", value: "72%", delta: 6, tone: "positive" },
                          { label: "VS Benchmark", value: "80%", delta: -2, tone: "negative" },
                          { label: "VS Meta", value: "75%", deltaLabel: "Superado", tone: "positive" },
                        ]}
                      />
                    </Card>
                  </div>
                </div>
              </div>
            </FormSection>

            <FormSection
              title="Response Distribution (Phase 7D.5B)"
              description="Visualización de distribución de respuestas y escalas de favorabilidad."
            >
              <div className="space-y-12">
                <div className="grid grid-cols-1 gap-12">
                  {/* Single ResponseStackedBar Demos */}
                  <div className="space-y-6">
                    <SectionHeader title="ResponseStackedBar" description="Barra 100% apilada con tonos semánticos." />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <Card className="p-6 space-y-6">
                        <h4 className="text-sm font-bold">Distribución de Favorabilidad</h4>
                        <ResponseStackedBar 
                          showLegend
                          segments={[
                            { id: "1", label: "Positivo", value: 65, tone: "positive" },
                            { id: "2", label: "Neutro", value: 20, tone: "neutral" },
                            { id: "3", label: "Negativo", value: 15, tone: "negative" },
                          ]}
                        />
                      </Card>

                      <Card className="p-6 space-y-6">
                        <h4 className="text-sm font-bold">Escala Likert (5 niveles)</h4>
                        <ResponseStackedBar 
                          size="sm"
                          showLegend
                          segments={[
                            { id: "l1", label: "Muy desacuerdo", value: 5, tone: "negative" },
                            { id: "l2", label: "Desacuerdo", value: 10, tone: "warning" },
                            { id: "l3", label: "Neutro", value: 15, tone: "neutral" },
                            { id: "l4", label: "Acuerdo", value: 40, tone: "info" },
                            { id: "l5", label: "Muy acuerdo", value: 30, tone: "positive" },
                          ]}
                        />
                      </Card>
                    </div>
                  </div>

                  <Separator />

                  {/* ResponseStackedBarGroup Demo */}
                  <div className="space-y-6">
                    <SectionHeader title="ResponseStackedBarGroup" description="Comparativa de múltiples segmentos o preguntas." />
                    <Card className="p-8">
                      <ResponseStackedBarGroup 
                        title="Clima Organizacional por Segmento"
                        description="Comparativa de favorabilidad en las dimensiones principales de la encuesta."
                        items={[
                          {
                            id: "q1",
                            label: "Liderazgo y Dirección",
                            description: "N=450 respuestas",
                            segments: [
                              { id: "q1s1", label: "Favorabilidad", value: 78, tone: "positive" },
                              { id: "q1s2", label: "Neutralidad", value: 12, tone: "neutral" },
                              { id: "q1s3", label: "Desfavorabilidad", value: 10, tone: "negative" },
                            ]
                          },
                          {
                            id: "q2",
                            label: "Ambiente de Trabajo",
                            description: "N=445 respuestas",
                            segments: [
                              { id: "q2s1", label: "Favorabilidad", value: 62, tone: "positive" },
                              { id: "q2s2", label: "Neutralidad", value: 25, tone: "neutral" },
                              { id: "q2s3", label: "Desfavorabilidad", value: 13, tone: "negative" },
                            ]
                          },
                          {
                            id: "q3",
                            label: "Compensación y Beneficios",
                            description: "N=438 respuestas",
                            segments: [
                              { id: "q3s1", label: "Favorabilidad", value: 45, tone: "positive" },
                              { id: "q3s2", label: "Neutralidad", value: 30, tone: "neutral" },
                              { id: "q3s3", label: "Desfavorabilidad", value: 25, tone: "negative" },
                            ]
                          }
                        ]}
                      />
                    </Card>
                  </div>

                  <Separator />

                  {/* Trend Analytics Demo (Phase 7D.5C) */}
                  <div className="space-y-6">
                    <SectionHeader title="Trend Analytics (Phase 7D.5C)" description="Visualización de tendencias temporales de métricas." />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <TrendMetricLineChart 
                        title="Tendencia de Satisfacción"
                        description="Evolución mensual del indicador principal."
                        series={[
                          {
                            id: "s1",
                            label: "Satisfacción General",
                            tone: "primary",
                            data: [
                              { label: "Ene", value: 4.2 },
                              { label: "Feb", value: 4.5 },
                              { label: "Mar", value: 4.3 },
                              { label: "Abr", value: 4.8 },
                              { label: "May", value: 4.6 },
                              { label: "Jun", value: 4.9 },
                            ]
                          }
                        ]}
                        height={280}
                      />

                      <TrendMetricLineChart 
                        title="Comparativa de Participación"
                        description="Tendencia entre el periodo actual y el anterior."
                        series={[
                          {
                            id: "p1",
                            label: "Periodo Actual",
                            tone: "positive",
                            data: [
                              { label: "Q1", value: 320 },
                              { label: "Q2", value: 450 },
                              { label: "Q3", value: 410 },
                              { label: "Q4", value: 540 },
                            ]
                          },
                          {
                            id: "p2",
                            label: "Periodo Anterior",
                            tone: "neutral",
                            data: [
                              { label: "Q1", value: 280 },
                              { label: "Q2", value: 310 },
                              { label: "Q3", value: 350 },
                              { label: "Q4", value: 390 },
                            ]
                          }
                        ]}
                        height={280}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <TrendMetricLineChart 
                        title="Estado: Cargando"
                        series={[]}
                        loading={true}
                        height={200}
                      />
                      <TrendMetricLineChart 
                        title="Estado: Vacío"
                        series={[]}
                        empty={true}
                        height={200}
                      />
                      <TrendMetricLineChart 
                        title="Estado: Error"
                        series={[]}
                        error="Error al conectar con la base de datos de encuestas."
                        height={200}
                      />
                    </div>
                  </div>

                  {/* Survey Metric Cards Demo (Phase 7D.5D) */}
                  <div className="space-y-6">
                    <SectionHeader title="Survey Metric Cards (Phase 7D.5D)" description="Composición de átomos en tarjetas analíticas de alto nivel." />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <SurveyMetricCard 
                        title="NPS General"
                        description="Net Promoter Score calculado este mes."
                        value="72"
                        subtitle="Puntos de favorabilidad"
                        delta={8}
                        deltaTone="positive"
                        comparisonItems={[
                          { label: "VS Mes Anterior", value: "64", delta: 8, tone: "positive" },
                          { label: "VS Benchmark", value: "68", delta: 4, tone: "positive" },
                        ]}
                        footer="Próxima actualización en 12 días"
                      />

                      <SurveyMetricCard 
                        title="Satisfacción Promedio"
                        description="Promedio de todas las dimensiones."
                        value="4.6"
                        subtitle="/ 5.0 total"
                        delta={-0.2}
                        deltaTone="negative"
                        trendDirection="down"
                        comparisonItems={[
                          { label: "VS Q1", value: "4.8", delta: -0.2, tone: "negative" },
                          { label: "VS Q2", value: "4.5", delta: 0.1, tone: "positive" },
                        ]}
                        footer="N=1,240 respondientes"
                      />

                      <SurveyMetricCard 
                        title="Tasa de Respuesta"
                        description="Participación sobre el total invitado."
                        value="84%"
                        delta={12}
                        deltaTone="positive"
                        comparisonItems={[
                          { label: "VS 2025", value: "72%", delta: 12, tone: "positive" },
                        ]}
                        footer="Meta: 85%"
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <FavorabilityDistributionCard 
                        title="Favorabilidad por Dimensión"
                        description="Distribución agregada de clima organizacional."
                        segments={[
                          { id: "1", label: "Favorable", value: 650, tone: "positive", description: "Respuestas 4 y 5" },
                          { id: "2", label: "Neutral", value: 200, tone: "neutral", description: "Respuesta 3" },
                          { id: "3", label: "Desfavorable", value: 150, tone: "negative", description: "Respuestas 1 y 2" },
                        ]}
                        total={1000}
                        showComparisonFooter={true}
                        comparisonItems={[
                          { label: "Favorabilidad Q1", value: "62%", delta: 3, tone: "positive" },
                          { label: "Favorabilidad Q2", value: "65%", delta: 0, tone: "neutral" },
                        ]}
                        footer="Basado en 15 preguntas de opción múltiple"
                      />

                      <ParticipationTrendCard 
                        title="Tendencia de Participación"
                        description="Volumen de respuestas recolectadas por periodo."
                        value="5,240"
                        subtitle="Total respuestas"
                        delta={15}
                        deltaTone="positive"
                        series={[
                          {
                            id: "current",
                            label: "Actual",
                            tone: "primary",
                            data: [
                              { label: "Semana 1", value: 1200, comparisonValue: 1000 },
                              { label: "Semana 2", value: 1500, comparisonValue: 1600 },
                              { label: "Semana 3", value: 2100, comparisonValue: 1900 },
                              { label: "Semana 4", value: 5240, comparisonValue: 4800 },
                            ]
                          }
                        ]}
                        footer="Actualizado hace 5 minutos"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                      <SurveyMetricCard 
                        title="Estado: Cargando"
                        value="---"
                        loading={true}
                      />
                      <FavorabilityDistributionCard 
                        title="Estado: Vacío"
                        segments={[]}
                        empty={true}
                      />
                      <SurveyMetricCard 
                        title="Estado: Error"
                        value="ERR"
                        error="No se pudo recuperar la métrica de participación."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </FormSection>

            <Card>
              <CardHeader>
                <CardTitle>Próximos Pasos (Fase 7D.5E)</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-text-secondary list-disc pl-4">
                  <li>QA Integral de Survey Analytics Suite.</li>
                  <li>Detección de insights automáticos (IA-first ready).</li>
                  <li>Implementación de Dashboard Layout (Fase 7D.6).</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </PageShell>
      </div>
      </AppShell>
    </TooltipProvider>
  )
}

export default App
