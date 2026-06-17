# Fase 4K-R1 · Productive Historical Survey Ingestion Intake

## 1. Git Preflight
```text
branch = main
HEAD = e5d4831181025cc6e26e6dacf900d6e0a4aaaab2
origin/main = e5d4831181025cc6e26e6dacf900d6e0a4aaaab2
remote main = e5d4831181025cc6e26e6dacf900d6e0a4aaaab2
ahead = 0
behind = 0
working tree = limpio
staging = vacío
```

## 2. Bootstrap Evidence Validation
```text
HISTORICAL_IMPORT_PRODUCTIVE_BOOTSTRAP_VALIDATED
HISTORICAL_IMPORT_PRODUCTIVE_BOOTSTRAP_EVIDENCE_RECONCILED
```

## 3. Product Objective
Permitir que un consultor UBITS cargue exportaciones históricas reales de encuestas, procese su estructura de manera segura y auditable, revise el mapeo sugerido, corrija ambigüedades y apruebe una importación hacia staging antes de publicar datos en el modelo UBITS.

**Clasificación:** `PRODUCTIVE_INGESTION_OBJECTIVE_APPROVED`

El objetivo no promete:
* compatibilidad automática universal
* cero revisión humana
* importación directa no validada
* IA como fuente de verdad
* datos productivos sin staging

## 4. Primary User and Roles
**Usuario principal:** Consultor de implementación UBITS

| Rol | Puede cargar | Puede corregir | Puede aprobar | Puede importar | Puede eliminar |
| --- | -----------: | -------------: | ------------: | -------------: | -------------: |
| Consultor de implementación UBITS | Sí | Sí | Sí | Sí | Sí |
| Administrador UBITS | Gate | Gate | Gate | Gate | Gate |
| Revisor de datos | Gate | Gate | Gate | Gate | Gate |
| Operador de soporte | Gate | Gate | Gate | Gate | Gate |
| Administrador del cliente con permisos restringidos | Gate | Gate | Gate | Gate | Gate |

**Clasificación:**
```text
PRIMARY_USER_VALIDATED
ROLE_MODEL_PENDING_OR_VALIDATED
```

## 5. First Productive Vertical
Cargar un archivo → almacenarlo temporalmente → crear un job → validarlo → procesarlo → perfilar hojas y columnas → detectar preguntas y escalas → crear Mapping Draft → consultar Mapping Draft → mostrar tab Preguntas y escalas → corregir inline → recalcular readiness → guardar decisiones → dejar listo para aprobación.

No incluye todavía:
* todos los tabs
* todos los adaptadores
* importación definitiva al Core UBITS
* auto-resolución por IA
* batch resolution
* procesamiento masivo multi-tenant no validado

**Clasificación:** `FIRST_PRODUCTIVE_VERTICAL_DEFINED`

## 6. Platform Scope
Estrategia:
* Generic Tabular Survey Adapter = obligatorio
* Platform-specific adapters = progresivos y validados con muestras

| Plataforma | Archivo disponible | Prioridad | Adaptador dedicado | Estado |
| ---------- | -----------------: | --------: | -----------------: | ------ |
| Qualtrics | No | Pendiente | Pendiente | SAMPLE_REQUIRED |
| SurveyMonkey | No | Pendiente | Pendiente | SAMPLE_REQUIRED |
| Google Forms | No | Pendiente | Pendiente | SAMPLE_REQUIRED |
| Microsoft Forms | No | Pendiente | Pendiente | SAMPLE_REQUIRED |
| Typeform | No | Pendiente | Pendiente | SAMPLE_REQUIRED |
| Other / Unknown | No | 1 | Obligatorio | SAMPLE_REQUIRED |

**Resultado requerido:** `PLATFORM_SCOPE_DEFINED_WITHOUT_FALSE_COMPATIBILITY_CLAIMS`

## 7. Format Scope
| Formato | Prioridad | Parser requerido | Riesgo | Gate |
| ------- | --------: | ---------------- | ------ | ---- |
| xlsx | 1 | Sí | Alto (Tamaño/Fórmulas) | Pendiente |
| csv | 1 | Sí | Medio (Encoding/Delimiters)| Pendiente |
| xls | Pendiente | Sí | Alto (Legacy format) | Pendiente |
| zip | Pendiente | Pendiente | Alto (Malware/Bomb) | NOT_IN_SCOPE |
| json | Pendiente | Pendiente | Medio | NOT_IN_SCOPE |

**Resultado requerido:** `INITIAL_FILE_FORMAT_SCOPE_DEFINED`

## 8. Sample File Inventory
| ID | Nombre anonimizado | Plataforma declarada | Formato | Tamaño | Hojas | Filas estimadas | PII | Estado |
| -- | ------------------ | -------------------- | ------- | -----: | ----: | --------------: | --- | ------ |
| N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | RAW_EXTERNAL_SAMPLE_FILES_AVAILABLE_BUT_NOT_SANITIZED |

**Clasificación:** `PRODUCTIVE_SAFE_SAMPLE_SET_PENDING`

## 9. UBITS Destination Model
| Entidad | Fuente encontrada | Estado | Gap |
| ------- | ----------------- | ------ | --- |
| Survey | DATA_MODEL.md | DEFINED_FUNCTIONALLY | Model required |
| Historical period | Ninguna | ABSENT | Model required |
| Question | DATA_MODEL.md | DEFINED_FUNCTIONALLY | Model required |
| Question type | DATA_MODEL.md | PARTIAL | Model required |
| Scale | Ninguna | ABSENT | Model required |
| Scale option | Ninguna | ABSENT | Model required |
| Polarity | Ninguna | ABSENT | Model required |
| Section | Ninguna | ABSENT | Model required |
| Dimension | Ninguna | ABSENT | Model required |
| Participant | DATA_MODEL.md | DEFINED_FUNCTIONALLY | Model required |
| Participant identifier | DATA_MODEL.md | PARTIAL | Model required |
| Demographic | DATA_MODEL.md | DEFINED_FUNCTIONALLY | Model required |
| Demographic value | DATA_MODEL.md | PARTIAL | Model required |
| Response | DATA_MODEL.md | DEFINED_FUNCTIONALLY | Model required |
| Organization | Ninguna | ABSENT | Model required |
| Tenant | Ninguna | ABSENT | Model required |
| Import job | DATA_MODEL.md | DEFINED_FUNCTIONALLY | Model required |
| Import audit | DATA_MODEL.md | DEFINED_FUNCTIONALLY | Model required |

**Resultado:** 
```text
CANONICAL_UBITS_DESTINATION_MODEL_AVAILABLE_AS_FUNCTIONAL_REFERENCE
PHYSICAL_PRODUCTIVE_SCHEMA_REQUIRED
```

## 10. Volume and Performance
| Límite | Confirmado | Provisional | Evidencia requerida |
| ------ | ---------: | ----------: | ------------------- |
| Tamaño máximo por archivo | No | 25 MB | Sí |
| Archivos por lote | No | 5 | Sí |
| Hojas por archivo | No | 20 | Sí |
| Filas por archivo | No | 100000 | Sí |
| Columnas por hoja | No | 500 | Sí |
| Tiempo objetivo procesamiento | No | < 5 min | Sí |

**Resultado:** 
```text
VOLUME_ASSUMPTIONS_DOCUMENTED
PERFORMANCE_LIMITS_REQUIRE_LOAD_VALIDATION
```

## 11. Infrastructure
| Capa | Disponible | Opción oficial | Propuesta | Gate |
| ---- | ---------: | -------------- | --------- | ---- |
| Cloud principal | UNKNOWN | UNKNOWN | Pendiente | BLOCKING |
| Frontend hosting | UNKNOWN | UNKNOWN | Pendiente | BLOCKING |
| Backend hosting | UNKNOWN | UNKNOWN | Pendiente | BLOCKING |
| Database | UNKNOWN | UNKNOWN | Pendiente | BLOCKING |
| Object storage | UNKNOWN | UNKNOWN | Pendiente | BLOCKING |
| Queue / jobs | UNKNOWN | UNKNOWN | Pendiente | BLOCKING |
| Worker runtime | UNKNOWN | UNKNOWN | Pendiente | BLOCKING |
| Authentication provider | UNKNOWN | UNKNOWN | Pendiente | BLOCKING |
| Secrets manager | UNKNOWN | UNKNOWN | Pendiente | BLOCKING |
| Observability | UNKNOWN | UNKNOWN | Pendiente | BLOCKING |
| Region | UNKNOWN | UNKNOWN | Pendiente | BLOCKING |
| CI/CD | UNKNOWN | UNKNOWN | Pendiente | BLOCKING |

**Resultado:** `INFRASTRUCTURE_DECISION_MATRIX_CREATED`

## 12. Storage and Retention
Recomendación inicial:
* Archivo original: almacenamiento temporal privado; cifrado; eliminación tras importación exitosa o máximo 7 días.
* Mapping Draft: persistido mientras el job siga activo; retención según política UBITS.
* Audit trail: retención superior al archivo original.

**Resultado:** `STORAGE_AND_RETENTION_POLICY_PENDING_OR_DEFINED`

## 13. Security
| Control | Obligatorio | Disponible | Gap | Gate |
| ------- | ----------: | ---------: | --- | ---- |
| Extension allowlist | Sí | No | Sí | BLOCKING |
| MIME validation | Sí | No | Sí | BLOCKING |
| Magic-byte validation | Sí | No | Sí | BLOCKING |
| File size limit | Sí | Parcial (UI) | Sí | BLOCKING |
| Workbook limits | Sí | No | Sí | BLOCKING |
| Formula sanitization | Sí | No | Sí | BLOCKING |
| External-link sanitization | Sí | No | Sí | BLOCKING |
| Macro handling | Sí | No | Sí | BLOCKING |
| Zip-bomb protection | Sí | No | Sí | BLOCKING |
| Malware scanning | Sí | No | Sí | BLOCKING |
| PII masking | Sí | No | Sí | BLOCKING |
| Tenant isolation | Sí | No | Sí | BLOCKING |
| RBAC | Sí | No | Sí | BLOCKING |
| Audit events | Sí | No | Sí | BLOCKING |
| Rate limiting | Sí | No | Sí | BLOCKING |
| Idempotency | Sí | No | Sí | BLOCKING |
| Deletion | Sí | No | Sí | BLOCKING |

**Resultado:** `PRODUCTIVE_SECURITY_REQUIREMENTS_DEFINED`

## 14. PII and Privacy
No hay política confirmada.

**Resultado:** `PII_POLICY_REQUIRED_BEFORE_PRODUCTIVE_PROCESSING`

## 15. AI Scope
Opcional y secundaria. Solo como asistencia (sugerir dominio, tipo, escala, etc.). Prohibido leer completo por defecto, recibir PII, auto-resolver, o bloquear. 
No hay proveedor autorizado.

**Resultado:** `AI_PROVIDER_DECISION_GATE_REQUIRED`
Arquitectura futura obligatoria:
```text
AI_PROVIDER_AGNOSTIC
DETERMINISTIC_FALLBACK_REQUIRED
HUMAN_IN_THE_LOOP_REQUIRED
```

## 16. Staging and Final Import
Recomendación: `PRODUCTIVE_STAGING_WITH_HUMAN_APPROVAL`
Escritura al Core: transaccional, idempotente, auditable, reversible.

**Resultado:** `STAGING_FIRST_STRATEGY_DEFINED`

## 17. Product Lifecycle
| Estado | Propietario | Entrada | Salida | Retry | Cancelable |
| ------ | ----------- | ------- | ------ | ----: | ---------: |
| created | System | Upload start | uploading | No | Sí |
| uploading | UI | created | uploaded/failed | Sí | Sí |
| uploaded | System | uploading | security-check | No | Sí |
| security-check | System | uploaded | queued/failed | No | Sí |
| queued | System | security-check| profiling | No | Sí |
| profiling | System | queued | mapping/failed | No | Sí |
| mapping | System | profiling | review-required | No | Sí |
| review-required | UI | mapping | ready-for-import| No | Sí |
| ready-for-import| UI | review-required| approved | No | Sí |
| approved | UI | ready-for-import| importing | No | No |
| importing | System | approved | completed/failed | No | No |
| completed | System | importing | - | No | No |
| failed | System | Any | - | Sí | No |
| cancelled | System | Any cancelable| - | No | No |
| expired | System | Any | - | No | No |

**Resultado:** `PRODUCTIVE_JOB_LIFECYCLE_DRAFTED`

## 18. Success Criteria
1. Puede recibir un archivo real anonimizado.
2. El archivo se almacena de forma segura.
3. El procesamiento no bloquea el frontend.
4. Se crea un job observable.
5. Se detectan hojas y columnas.
6. Se generan múltiples preguntas y escalas.
7. La UI muestra colecciones reales.
8. El consultor puede corregir inline.
9. Solo `no-interpretable` bloquea.
10. Las decisiones se persisten.
11. Existe auditoría.
12. El flujo funciona sin IA.
13. La IA nunca confirma automáticamente.
14. No se expone PII.
15. No se escribe directamente al Core sin aprobación.
16. Los errores son recuperables.
17. Los jobs pueden reintentarse o cancelarse.
18. El sistema respeta aislamiento por tenant.

**Resultado:** `PRODUCTIVE_SUCCESS_CRITERIA_DEFINED`

## 19. Risks
| Riesgo | Probabilidad | Impacto | Mitigación | Gate |
| ------ | ------------ | ------- | ---------- | ---- |
| File parsing complexity | Alta | Alto | Límite de tamaño y timeout | BLOCKING |
| Unknown platform structures | Alta | Medio | Adapter genérico robusto | Pendiente |
| PII exposure | Media | Crítico | Sanitización en backend, masking | BLOCKING |
| Malicious files | Baja | Crítico | Validación magic bytes, limit, AV | BLOCKING |
| Large workbooks | Media | Alto | Streams, worker threads, limits | BLOCKING |
| Memory exhaustion | Media | Alto | Carga por lotes, no DOM ref | BLOCKING |
| Queue failures | Media | Medio | Dead-letter queues, retries | BLOCKING |
| Partial imports | Baja | Alto | Transacciones, rollback | BLOCKING |
| Duplicate imports | Baja | Medio | Hash control, idempotency key | BLOCKING |
| Incorrect AI suggestions | Alta | Medio | Revisión humana obligatoria | BLOCKING |
| Schema drift | Media | Alto | Versionado de mappings | BLOCKING |
| Tenant leakage | Baja | Crítico | Row-level security, isolation | BLOCKING |
| Retention failures | Media | Medio | Cron jobs de limpieza | BLOCKING |
| Observability gaps | Alta | Alto | Logging estructurado, traces | BLOCKING |
| Lockfile reproducibility | Alta | Medio | Fijar dependencias estrictamente | BLOCKING |
| Vendor lock-in | Baja | Medio | Interfaces agnósticas | Pendiente |

## 20. Decision Gates Closed
- Objetivo productivo
- Primer vertical productivo
- Ciclo de vida del producto (Product Lifecycle Drafted)
- Criterios de éxito
- Staging and Final Import strategy

## 21. Decision Gates Pending
- Sample files
- UBITS destination model
- Infrastructure owner
- Database
- Storage
- Async jobs
- Authentication
- Tenant model
- PII policy
- Retention policy
- Security controls
- AI provider decision
- Region
- Staging approval model
- Volume assumptions
- SLA
- Observability
- Deployment ownership
- Platform and format final scope

## 22. Architecture Lock Readiness
**NO LISTO.** Faltan decisiones críticas sobre el modelo destino, la infraestructura, las políticas de seguridad y PII, así como muestras anonimizadas reales para validar el scope.

## 23. Files Created or Modified
- `docs/HISTORICAL_IMPORT_PRODUCTIVE_INGESTION_INTAKE.md`
- `docs/PROMPT_LOG.md`

## 24. QA Result
`PRODUCTIVE_INGESTION_INTAKE_DOCUMENTATION_QA_PASSED`

## 25. Final Status
`HISTORICAL_IMPORT_PRODUCTIVE_INGESTION_INTAKE_BLOCKED`

## 26. Next Maximum Authorizable Phase
Ninguna autorizada hasta resolver los gates bloqueantes (R2 requiere intake limpio). Se requieren respuestas a los decision gates pendientes.
