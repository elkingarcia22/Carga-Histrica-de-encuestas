# Fase 4K-R1H4 · CORPORATE OWNERSHIP EVIDENCE COLLECTION PACK

## 1. Propósito

Solicitar y recopilar evidencia corporativa formal para adjudicar los roles de ownership y las autoridades de workflow requeridas por el proyecto Historical Import.

Actualmente:
```text
EVIDENCE_RECEIVED = NONE
EVIDENCE_ACCEPTED = NONE
OWNERSHIP_DECISIONS_APPROVED = NONE
WAVE_1_OWNERSHIP_GOVERNANCE_STILL_OPEN
WAVE_2_NOT_AUTHORIZED
ARCHITECTURE_LOCK_BLOCKED
NO_IMPLEMENTATION_PHASE_AUTHORIZED
```

Esta solicitud no constituye una asignación de roles, aprobación de arquitectura ni autorización de implementación.

---

## 2. Roles que requieren evidencia

Debe recibirse evidencia independiente para:

1. Product Owner.
2. Technical Owner.
3. Data Owner.
4. Security Owner.
5. Privacy/Legal Approver.
6. Deployment Owner.
7. Incident Owner.
8. Operations and Support Owner.
9. Mapping Approval Authority.
10. Core Publication Authority.
11. Raw File Deletion Authority.
12. Architecture Approval Authority.

Una misma persona o función puede ser propuesta para varios roles, pero cada asignación debe evaluarse por separado y estará sujeta a revisión de segregación de funciones.

---

## 3. Información obligatoria por asignación

Para cada rol, entregar:

```text
Role:
Candidate Name:
Candidate Corporate Role:
Business Area:
Corporate Email:
Appointing Authority:
Evidence Type:
Evidence Reference:
Evidence Date:
Effective Date:
Expiration or Review Date:
Scope:
Responsibilities:
Decision Rights:
Escalation Path:
Delegation Rules:
Backup Owner:
Conflicts of Interest:
Segregation of Duties Considerations:
Approver Name:
Approver Corporate Role:
Approval Date:
```

No incluir datos personales distintos de la información corporativa estrictamente necesaria.

---

## 4. Alcance obligatorio

La evidencia debe indicar explícitamente que la asignación aplica a uno de estos ámbitos:

```text
Historical Import project
Historical survey import capability
Survey data ingestion and governance
Applicable enterprise-wide corporate function
```

Cuando la evidencia sea corporativa y de alcance general, debe explicar por qué cubre Historical Import.

No se aceptarán inferencias basadas únicamente en el cargo de una persona.

---

## 5. Tipos de evidencia aceptables

Se puede presentar:

* RACI corporativo aprobado.
* Acta formal de comité.
* Resolución o decisión de gobierno.
* ADR aprobado por la autoridad correspondiente.
* Ticket corporativo con aprobación verificable.
* Registro oficial de asignación.
* Comunicación corporativa formal del accountable executive.
* Documento aprobado de Security, Privacy, Legal, Data Governance o Architecture.
* Política corporativa vigente que asigne explícitamente la función.

Cada evidencia debe conservar una referencia auditable.

---

## 6. Evidencia que se considerará insuficiente

Se clasificará como `INSUFFICIENT` cuando consista solamente en:

* Una lista de nombres.
* Una conversación informal.
* Una recomendación sin aprobación.
* Una captura sin fuente verificable.
* Una persona mencionada como participante.
* El autor de un documento.
* El desarrollador que implementó una funcionalidad.
* Un cargo que podría realizar el rol, pero no tiene asignación explícita.
* Una evidencia sin fecha o sin alcance.
* Una evidencia vencida.
* Una evidencia que no identifica la autoridad que asigna.
* Una aprobación verbal sin registro auditable.

---

## 7. Criterios de aceptación

Una asignación solo podrá pasar a `ACCEPTED` cuando:

```text
[ ] La fuente está identificada.
[ ] La autoridad emisora es verificable.
[ ] El candidato está identificado inequívocamente.
[ ] La asignación del rol es explícita.
[ ] El alcance cubre Historical Import.
[ ] La evidencia está vigente.
[ ] La fecha efectiva está definida.
[ ] Existe una referencia auditable.
[ ] Las responsabilidades y decision rights están claros.
[ ] No existe contradicción con evidencia de mayor autoridad.
[ ] La revisión de segregación de funciones fue completada.
[ ] No se expone PII innecesaria ni información sensible.
```

---

## 8. Segregación de funciones

Las siguientes combinaciones requieren evaluación explícita:

```text
Uploader + Mapping Corrector
Mapping Corrector + Mapping Approver
Mapping Approver + Core Publisher
Core Publisher + Auditor
Security Owner + Security Auditor
Raw File Deletion Operator + Deletion Evidence Approver
Developer + Production Approver
Architecture Author + Architecture Approval Authority
Incident Owner + Incident Reviewer
Operations Owner + Control Auditor
```

Para cada combinación, la autoridad corporativa debe indicar uno de estos resultados:

```text
ACCEPTABLE
ACCEPTABLE_WITH_CONTROLS
CONFLICT_REQUIRES_DECISION
PROHIBITED
```

Cuando se permita una combinación con controles, deben documentarse:

* Revisión independiente.
* Doble aprobación.
* Evidencia de auditoría.
* Separación temporal.
* Restricción de permisos.
* Escalación obligatoria.
* Revisión periódica.

---

## 9. Formato de respuesta por rol

Usar este bloque por cada asignación propuesta:

```text
Role:

Candidate:

Evidence:
- Evidence Type:
- Evidence Reference:
- Issuer:
- Approving Authority:
- Evidence Date:
- Effective Date:
- Review or Expiration Date:

Scope:

Responsibilities:

Decision Rights:

Escalation Path:

Backup Owner:

Segregation of Duties:

Conflicts:

Corporate Approval:

Additional Notes:
```

---

## 10. Instrucciones de entrega

La evidencia debe enviarse mediante un canal corporativo autorizado.

No adjuntar:

* Archivos productivos de clientes.
* Encuestas reales.
* Respuestas de empleados.
* Raw files de importación.
* Credenciales.
* Tokens.
* Secrets.
* Logs productivos.
* Información personal no necesaria.
* Datos sensibles de tenants.

Cuando un documento incluya contenido sensible, proporcionar una referencia controlada en lugar de copiarlo al repositorio.

---

## 11. Adjudicación posterior

Cada asignación será clasificada individualmente como:

```text
ACCEPTED
REJECTED
INSUFFICIENT
NOT PROVIDED
```

Cada rol tendrá además un `Decision Status` independiente:

```text
OPEN
APPROVED
REJECTED
```

`BLOCKED` no será utilizado como estado de la decisión. Los bloqueos se registrarán únicamente como `Gate Effect`.

---

## 12. Condición de cierre de Wave 1

Wave 1 solo podrá cerrarse cuando los doce roles estén aprobados y la evaluación de segregación de funciones esté completa.

Hasta entonces se mantienen:

```text
WAVE_1_OWNERSHIP_GOVERNANCE_STILL_OPEN
WAVE_2_NOT_AUTHORIZED
ARCHITECTURE_LOCK_BLOCKED
NO_IMPLEMENTATION_PHASE_AUTHORIZED
```

Una aprobación parcial no autoriza el inicio de Wave 2.

---

## 13. Safe postures vigentes

Permanecen activos:

```text
NO_PRODUCTIVE_FILE_UPLOAD
NO_PRODUCTIVE_FILE_PROCESSING
NO_MULTI_TENANT_PROCESSING
NO_CORE_PUBLICATION
NO_PRODUCTIVE_PERSISTENCE
NO_RAW_FILES_IN_GIT
NO_PRODUCTIVE_PII_IN_LOGS
NO_PRODUCTIVE_FILE_CONTENT_SENT_TO_AI
NO_UNATTENDED_APPROVAL
NO_IMPLEMENTATION_PHASE_AUTHORIZED
AI_PRODUCTIVE_FILE_CONTENT_DISABLED_UNTIL_CORPORATE_APPROVAL
PRODUCTIVE_RAW_SAMPLE_PROCESSING_NOT_AUTHORIZED
NO_TECHNICAL_PROVIDER_SELECTION_WITHOUT_ACCOUNTABLE_OWNER
NO_ARCHITECTURE_APPROVAL_WITHOUT_GOVERNANCE_AUTHORITY
```

---

## 14. Respuesta solicitada a los stakeholders

Por favor:

1. Confirmar qué roles pueden ser formalmente asignados.
2. Proporcionar la evidencia corporativa correspondiente.
3. Identificar la autoridad que realiza cada asignación.
4. Confirmar el alcance y la vigencia.
5. Declarar posibles conflictos de segregación de funciones.
6. Documentar los controles compensatorios cuando correspondan.
7. Indicar explícitamente los roles para los que aún no existe una decisión corporativa.

No responder únicamente con nombres o recomendaciones informales.

---

## 15. Estado de esta fase

```text
CORPORATE_OWNERSHIP_EVIDENCE_COLLECTION_REQUESTED
GOVERNANCE_EXTERNAL_ACTION_REQUIRED
REPOSITORY_PHASES_PAUSED_PENDING_EVIDENCE
WAVE_1_OWNERSHIP_GOVERNANCE_STILL_OPEN
WAVE_2_NOT_AUTHORIZED
ARCHITECTURE_LOCK_BLOCKED
NO_IMPLEMENTATION_PHASE_AUTHORIZED
```
