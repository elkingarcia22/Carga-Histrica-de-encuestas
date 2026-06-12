export const importWizardContent = {
  header: {
    title: 'Importar encuesta finalizada',
    description: 'Carga los archivos exportados desde otra plataforma. El sistema simulará la revisión de su estructura antes de preparar la importación a UBITS.',
    cancelAction: 'Cancelar importación',
  },
  steps: [
    { id: 'upload', label: 'Cargar archivos', status: 'active' as const },
    { id: 'config', label: 'Configurar importación', status: 'pending' as const },
    { id: 'review', label: 'Revisar y mapear', status: 'pending' as const },
    { id: 'import', label: 'Importar encuesta', status: 'pending' as const },
  ],
  uploadZone: {
    label: 'Archivos de la encuesta',
    idleText: 'Seleccionar archivos',
    description: 'Soporta archivos Excel (.xlsx). CSV sujeto a validación técnica.',
    supportedFormats: '.xlsx',
  },
  processInfo: {
    title: '¿Cómo funciona la importación asistida?',
    steps: [
      'Revisaremos la estructura de los archivos.',
      'Sugeriremos homologaciones de columnas y datos.',
      'Pediremos tu confirmación antes de iniciar la importación.',
    ],
  },
  summary: {
    title: 'Resumen del lote',
    emptyState: 'Agrega archivos para comenzar a preparar el análisis simulado.',
    labels: {
      files: 'Archivos',
      mode: 'Modo',
      surveyType: 'Tipo de encuesta',
      privacy: 'Privacidad',
      pendingReviews: 'Revisiones pendientes',
    },
    defaultValues: {
      mode: 'Por detectar',
      surveyType: 'Por definir',
      privacy: 'Por definir',
    },
  },
  footer: {
    backAction: 'Volver',
    nextAction: 'Continuar',
    disabledReason: 'Agrega al menos un archivo para continuar',
  },
};
