# HISTORICAL_IMPORT_PRIVACY_RETENTION_MATRIX

## Overview
This matrix consolidates the PII classification and data retention policies based on evidence found in the repository.

## Verdict
**RETENTION_POLICY_CORPORATE_APPROVAL_REQUIRED**
There are no official security or privacy policies documented in the repository as code (e.g. Terraform configs, Vault, or compliance documentation). All statuses reflect the lack of corporate evidence.

## PII Classification Matrix

| Category | Item | Status |
|----------|------|--------|
| **A. Identificadores directos** | Nombre | REQUIRES_SECURITY_DECISION |
| | Email | REQUIRES_SECURITY_DECISION |
| | Documento | REQUIRES_SECURITY_DECISION |
| | Employee ID | REQUIRES_SECURITY_DECISION |
| | Teléfono | REQUIRES_SECURITY_DECISION |
| | Dirección | REQUIRES_SECURITY_DECISION |
| | IP | REQUIRES_SECURITY_DECISION |
| | Identificadores de autenticación | REQUIRES_SECURITY_DECISION |
| **B. Identificadores indirectos** | Cargo | REQUIRES_SECURITY_DECISION |
| | Equipo | REQUIRES_SECURITY_DECISION |
| | Ubicación | REQUIRES_SECURITY_DECISION |
| | Líder | REQUIRES_SECURITY_DECISION |
| | Antigüedad | REQUIRES_SECURITY_DECISION |
| | Combinaciones reidentificables | REQUIRES_SECURITY_DECISION |
| **C. Texto libre** | Comentarios | REQUIRES_SECURITY_DECISION |
| | Respuestas abiertas | REQUIRES_SECURITY_DECISION |
| | Feedback | REQUIRES_SECURITY_DECISION |
| | Observaciones | REQUIRES_SECURITY_DECISION |
| **D. Metadata de archivos** | Autor | REQUIRES_SECURITY_DECISION |
| | Empresa | REQUIRES_SECURITY_DECISION |
| | Rutas | REQUIRES_SECURITY_DECISION |
| | Comentarios (del archivo) | REQUIRES_SECURITY_DECISION |
| | Named ranges | REQUIRES_SECURITY_DECISION |
| | Hidden sheets | REQUIRES_SECURITY_DECISION |
| | External links | REQUIRES_SECURITY_DECISION |
| | Document properties | REQUIRES_SECURITY_DECISION |

## Retention Policy Matrix

| Data artifact | Retention period | Retention trigger | Deletion mechanism | Deletion owner | Deletion evidence | Backup treatment | Legal hold | Source of truth | Gate status |
|---------------|------------------|-------------------|--------------------|----------------|-------------------|------------------|------------|-----------------|-------------|
| Archivo original | PENDING | Upload | PENDING | PENDING | PENDING | PENDING | Pending | None | PENDING |
| Archivo sanitizado | PENDING | Sanitization | PENDING | PENDING | PENDING | PENDING | Pending | None | PENDING |
| Archivo normalizado| PENDING | Normalization | PENDING | PENDING | PENDING | PENDING | Pending | None | PENDING |
| Filas rechazadas | PENDING | Validation | PENDING | PENDING | PENDING | PENDING | Pending | None | PENDING |
| Mapping draft | PENDING | Generation | PENDING | PENDING | PENDING | PENDING | Pending | None | PENDING |
| Staging import | PENDING | Staging phase | PENDING | PENDING | PENDING | PENDING | Pending | None | PENDING |
| Errores | PENDING | Occurrence | PENDING | PENDING | PENDING | PENDING | Pending | None | PENDING |
| Logs | PENDING | Generation | PENDING | PENDING | PENDING | PENDING | Pending | None | PENDING |
| Audit trail | PENDING | Generation | PENDING | PENDING | PENDING | PENDING | Pending | None | PENDING |
| Backups | PENDING | Generation | PENDING | PENDING | PENDING | PENDING | Pending | None | PENDING |
| Datos publicados | PENDING | Publication | PENDING | PENDING | PENDING | PENDING | Pending | None | PENDING |
| Artefactos de IA | PENDING | Generation | PENDING | PENDING | PENDING | PENDING | Pending | None | PENDING |
