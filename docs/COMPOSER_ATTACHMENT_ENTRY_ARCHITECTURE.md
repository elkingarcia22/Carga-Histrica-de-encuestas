# COMPOSER_ATTACHMENT_ENTRY_ARCHITECTURE.md

## 1. Purpose
Definir que la carga de archivos debe vivir en el composer inferior del chat, no como opción primaria dentro del cuerpo conversacional.

## 2. Current Problem
Explicar que el flujo actual carga documentos desde el chat/conversación, lo que no se siente como un chat estándar.

## 3. Target UX
El composer debe tener:
- input de texto normal,
- botón `+` / adjuntar,
- selección de archivo,
- chips/cards compactos de archivos seleccionados,
- acción para continuar análisis local.

## 4. Chat Body Responsibility
El cuerpo del chat queda reservado para:
- mensajes del usuario,
- mensajes del asistente,
- safety gate,
- estado de análisis,
- resumen estructural,
- warnings,
- decisiones una por una.

## 5. Composer Responsibility
El composer se encarga de:
- escribir mensajes,
- seleccionar archivos,
- mostrar adjuntos pendientes,
- permitir cancelar adjuntos,
- disparar el flujo de safety gate.

## 6. Upload Panel Boundary
Definir si `SandboxUploadPanel` se depreca, se reutiliza internamente, o se reduce a lógica visual del composer.

No eliminar en esta fase.

## 7. Safety Gate Flow
El safety gate sigue siendo obligatorio antes de parsear.
El archivo puede estar adjunto en el composer, pero el parser no corre hasta confirmación explícita.

## 8. Runtime Sequence Future
1. Usuario toca `+`.
2. Selecciona archivo.
3. Composer muestra chip/card de archivo.
4. Usuario envía o confirma.
5. Chat muestra safety gate.
6. Usuario confirma.
7. Parser corre.
8. Assembler corre.
9. Chat muestra resumen.
10. Chat muestra primera decisión.

## 9. Visual Rules
- Desktop-first.
- Estilo UBITS B2B enterprise.
- Composer cómodo.
- Cards blancas.
- Fondo gris claro.
- Tokens semánticos.
- Sin HEX.
- Sin `text-white`.
- Sin clases arbitrarias.

## 10. Out of Scope
- implementación UI,
- parser changes,
- assembler changes,
- Claude,
- storage,
- backend,
- matching,
- dashboard,
- comparación.

## 11. Phase Plan
- Fase 8D-H1: Composer Attachment Entry Build.
- Fase 8D-H2: Composer Attachment Entry QA.
- Fase 8E: Conversational Decision Review QA.
