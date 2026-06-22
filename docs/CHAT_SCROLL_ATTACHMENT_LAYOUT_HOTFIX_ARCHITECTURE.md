# CHAT_SCROLL_ATTACHMENT_LAYOUT_HOTFIX_ARCHITECTURE.md

## 1. Purpose
Definir el hotfix visual para corregir scroll del chat y visualización de adjuntos.

## 2. Current Problem
Documentar:
- composer debe permanecer visible/fijo,
- contenido del chat debe scrollear,
- archivos aparecen como grilla grande en el cuerpo del chat,
- cards de archivo se ven rotas/saturadas,
- se pierde la sensación de chat estándar.

## 3. Target Layout
Definir:
- shell con altura controlada,
- área de mensajes con overflow vertical,
- composer fijo/sticky en la parte inferior,
- padding inferior seguro para que mensajes no queden tapados.

## 4. Chat Body Responsibility
El cuerpo del chat solo muestra:
- mensajes,
- safety gate,
- análisis,
- resumen estructural,
- warnings,
- decisión actual.

No muestra grilla de archivos.

## 5. Composer Responsibility
El composer muestra:
- input de texto,
- botón adjuntar,
- chips/cards compactos de archivos seleccionados,
- cancelar adjunto.

## 6. File Summary After Send
Después de enviar archivos, el chat debe mostrar un resumen compacto:
- “Recibí N archivos en modo sandbox.”
- máximo 3 nombres visibles,
- contador “+X archivos más” si aplica,
- no cards por archivo,
- no MIME largo visible,
- no grid.

## 7. Attachment Card Rules
Si se muestran chips en composer:
- nombre truncado con `truncate`,
- `min-w-0`,
- tamaño legible,
- botón cancelar claro,
- sin badges superpuestos,
- sin overflow horizontal.

## 8. Scroll Rules
Definir:
- contenedor raíz sin scroll global innecesario,
- timeline con `overflow-y-auto`,
- composer con `shrink-0` o sticky bottom,
- padding inferior usando spacing tokens, no valores arbitrarios.

## 9. Design Rules
- UBITS B2B enterprise.
- Cards blancas.
- Fondo gris claro.
- Tokens semánticos.
- Sin HEX.
- Sin `text-white`.
- Sin Tailwind arbitrary values.
- Desktop-first.

## 10. Out of Scope
- parser changes,
- assembler changes,
- matching engine,
- Claude,
- backend,
- storage,
- dashboard,
- comparison,
- new route.

## 11. Phase Plan
- Fase 8D-H3B: Chat Scroll & Attachment Layout Hotfix Build.
- Fase 8D-H3C: Chat Scroll & Attachment Layout QA.
- Luego retomar Fase 9B closure si lint gate queda reconciliado.
- Luego Fase 9C.
