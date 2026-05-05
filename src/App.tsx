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
import { EChart, ChartShell, ChartCard } from "@/components/charts"

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
                        trigger={<Button variant="outline" size="sm" className="text-amber-600 border-amber-200 hover:bg-amber-50">Warning Confirm</Button>}
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
                title="Contenedores Estructurales (Phase 7C.3)"
                description="ChartCard y ChartShell — superficie visual y gestión de estados para dashboards enterprise."
              >
                <div className="space-y-6">
                  {/* ChartCard: datos reales con transición loading → data */}
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

            <Card>
              <CardHeader>
                <CardTitle>Próximos Pasos (Fase 6)</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-text-secondary list-disc pl-4">
                  <li>Implementación de `TableShell` para visualización de datos.</li>
                  <li>Patrones de formularios enterprise.</li>
                  <li>Componentes de feedback y overlays.</li>
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
