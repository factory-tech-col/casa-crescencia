# VERIFICACION REAL CON GEMINI - CUMPLIMIENTO SG-SST / CONVOCATORIA ISEM26

**Fecha de verificacion:** 2026-08-28  **Proveedor:** Gemini Real (API)  
**Modelos:** models/gemini-3.7-flash, models/gemini-3.6-flash, models/gemini-3.5-flash, models/gemini-3.5-flash-lite, models/gemini-3-flash-preview, models/gemini-3.1-flash-lite  
**Movimientos permitidos:** SOLO verificacion. No se modifico el Excel, la base de datos ni el codigo del proyecto.

---
## 1. Objeto y alcance

- PDF auditado: `input/pdf/1_SOPORTE 1 ISEM26.pdf` (**299 paginas**, capa de texto real).
- Archivo verificado: `output/verificacion.xlsx` (445 evidencias / 20 evaluaciones / 40 decisiones / 551 trazabilidades / 20 personas).
- Cada una de las 445 evidencias se contrasto contra la pagina real del PDF; las paginas se clasificaron con Gemini Real por lotes (4 paginas/llamada) con rotacion de modelos (cuota gratuita 20/dia/modelo).
- **Resultado determinista + verificador IA:** el veredicto de cada evidencia combina el hallazgo local (texto de la pagina) con la lectura del modelo.

---
## 2. Resumen ejecutivo

| Metrica | Valor |
|---|---|
| Paginas del PDF | 299 |
| Paginas verificadas por Gemini | 197 |
| Evidencias registradas (Excel) | 445 |
| Evidencias distintas (sin duplicar) | 278 |
| Evidencias duplicadas | 167 |
| **Veredictos de evidencia** | CORRECTA 180 / PARCIAL 134 / INCORRECTA 98 / MAL_ASIGNADA 33 |
| Hallazgos | CRITICO 84 / ALTO 208 / MEDIO 122 / BAJO 1 (total 415) |
| `cambia_decision` | **SI** (R001 en 8 personas) |
| Personas afectadas | 20 de 20 |

**Conclusion:** el archivo `output/verificacion.xlsx` NO es un respaldo confiable del cumplimiento: contiene 76 evidencias con el tipo de documento mal clasificado (cédulas/procuradurías sobre oficios, cédulas sobre constancias, etc.), polaridad 128 veces invertida (CONTRARIA en certificados limpios), 167 evidencias duplicadas, fechas inconsistentes y, para 8 personas, R001(CUMPLE) no tiene soporte valido de identificacion.

---
## 3. Alcance de la verificacion (paginas)

- Se verificaron 197 de 299 paginas con Gemini (119 paginas referenciadas por evidencias + 78 paginas no referenciadas con contenido documental).
- **119 paginas son referenciadas por evidencias; 180 no tienen ninguna evidencia en el Excel.**
- Paginas no referenciadas con contenido: SOLICITUD 17, CONSTANCIA 31, CEDULA_MILITAR 9, CEDULA 3, ACTO_ADMINISTRATIVO 17, COMUNICACION_OFICIAL 1 (total 78). El resto (102) son hojas sin contenido documental/enlace (continuaciones de resoluciones, hojas en blanco).

---
## 4. Veredictos de evidencia

| Clase | Definicion | Cantidad |
|---|---|---|
| CORRECTA | Tipo, persona, cedula, pagina, polaridad y fecha conformes | 180 |
| PARCIAL | Tipo/persona correctos pero con polaridad o fecha inconsistentes | 134 |
| INCORRECTA | Tipo de documento registrado no coincide con el real (p.ej. cédula sobre un oficio) | 98 |
| MAL_ASIGNADA | Persona/cédula no aparece en la pagina (evidencia ajena al expediente correcto) | 33 |

**Distribucion de desacuerdos de tipo (registrado vs real)**:

| Registrado | Real (Gemini) | n |
|---|---|---|
| CEDULA | CONSTANCIA | 30 |
| CEDULA | COMUNICACION_OFICIAL | 26 |
| CEDULA | ACTO_ADMINISTRATIVO | 8 |
| CEDULA | CEDULA_MILITAR (aceptable) | 6 |
| PROCURADURIA | CONSTANCIA | 12 |
| COMUNICACION_OFICIAL | ACTO_ADMINISTRATIVO | 12 |
| SOLICITUD | CEDULA (escanee real de cedula) | 4 |
| SOLICITUD | CONSTANCIA | 3 |
| ACTO_ADMINISTRATIVO | CONSTANCIA | 3 |

Ejemplo concreto: la cédula de **PORRAS PLATA LUIS ALEXANDER** se registra sobre la pagina 168 (oficio MDN) y la de **GARCIA RENGIFO JHON JAIRO** sobre las paginas 61 (oficio) y 76 (constancia); ninguna de esas paginas contiene cédula.

---
## 5. Requisitos evaluados

- R001 Identificacion del candidato valida (Articulo PRIMERO). Estado en EVALUACION: **CUMPLE x20**.
- R002 Certificado de antecedentes disciplinarios vigente (Articulo SEGUNDO). Estado en EVALUACION: **EVIDENCIA_INSUFICIENTE x20**.

### R001 - Identificacion

El Excel registra CUMPLE para las 20 personas, pero solo 12 personas tienen una evidencia de identificacion real (cédula/libreta militar) referenciada. Para las otras 8 la cédula registrada apunta a oficios, constancias o resoluciones:

| Persona | Cédula | Estado CUMPLE | Soporte identificacion |
|---|---|---|---|
| GARCIA RENGIFO JHON JAIRO | 18008020 | CUMPLE (Excel) | **sin soporte valido** |
| MARMOLEJO CUMBE CARLOS ERNESTO | 79553571 | CUMPLE (Excel) | **sin soporte valido** |
| ARIAS ROJAS EDUARDO ALBERTO | 79608355 | CUMPLE (Excel) | **sin soporte valido** |
| AGUDELO ROJAS MANUEL DIONICIO | 80028026 | CUMPLE (Excel) | **sin soporte valido** |
| CORREA VARGAS PAULO IVAN | 80180164 | CUMPLE (Excel) | **sin soporte valido** |
| CAMACHO GUZMAN JOHANN RODRIGO | 80240511 | CUMPLE (Excel) | **sin soporte valido** |
| BURGOS SANDRO RAFAEL | 88160526 | CUMPLE (Excel) | **sin soporte valido** |
| PORRAS PLATA LUIS ALEXANDER | 91493470 | CUMPLE (Excel) | **sin soporte valido** |

Las paginas de cédula/libreta existen en el PDF (p.ej. 4, 15, 28, 177, 220, 246, 286 y otras) pero **no estan enlazadas** a estas personas como evidencia.

### R002 - Antecedentes

Las 20 personas cuentan con certificado PROCURADURIA en el PDF (fecha 2026-07-01, fuera del plazo de 30 dias del 2026-08-28). La decision **EVIDENCIA_INSUFICIENTE es sostenible** (certificados vencidos). No se requiere cambio de decision; si se recomienda reanudar la emision del mismo.

**Trazabilidad:** en 128 evidencias el rol `Polaridad` se registro como `CONTRARIA` en certificados que estan **limpios** (procuraduria 74, contraloria 54). La traza es inconsistente aunque la decision de fondo (vencido/insuficiente) no cambia.

---
## 6. Matriz por persona

| Persona | Cédula | Evid. | Correctas | Parciales | Incorrectas | Mal asignadas | R001 | R002 |
|---|---|---|---|---|---|---|---|---|
| GARCIA RENGIFO JHON JAIRO | 18008020 | 19 | 8 | 6 | 5 | 0 | **NO** | OK |
| VILLAMIZAR PEREZ CONSTANZA | 52412525 | 24 | 9 | 8 | 3 | 4 | OK | OK |
| CAÑON PINILLA JIDSELIN | 72192689 | 19 | 6 | 7 | 6 | 0 | OK | OK |
| CABRERA MARTINEZ NORMAN IVAN | 73161297 | 26 | 7 | 12 | 4 | 3 | OK | OK |
| LEAL GARCIA JESUS ARLEY | 73183461 | 32 | 11 | 17 | 4 | 0 | OK | OK |
| SUAREZ CALDERON JESUS LEONARDO | 73573626 | 14 | 7 | 2 | 2 | 3 | OK | OK |
| MARMOLEJO CUMBE CARLOS ERNESTO | 79553571 | 24 | 11 | 6 | 5 | 2 | **NO** | OK |
| ARIAS ROJAS EDUARDO ALBERTO | 79608355 | 22 | 8 | 6 | 8 | 0 | **NO** | OK |
| GARCIA SAAVEDRA ALEXANDER | 79645834 | 28 | 11 | 11 | 4 | 2 | OK | OK |
| ORTIZ PARRA OSCAR ANDRES | 79794765 | 27 | 17 | 6 | 2 | 2 | OK | OK |
| TEJADA CACERES JOSE JULIAN | 79938063 | 17 | 6 | 4 | 5 | 2 | OK | OK |
| AGUDELO ROJAS MANUEL DIONICIO | 80028026 | 23 | 4 | 4 | 8 | 7 | **NO** | OK |
| GOMEZ RODRIGUEZ DIEGO FERNANDO | 80055699 | 19 | 7 | 4 | 5 | 3 | OK | OK |
| CORREA VARGAS PAULO IVAN | 80180164 | 19 | 10 | 4 | 5 | 0 | **NO** | OK |
| CAMACHO GUZMAN JOHANN RODRIGO | 80240511 | 19 | 8 | 4 | 7 | 0 | **NO** | OK |
| BURGOS SANDRO RAFAEL | 88160526 | 23 | 8 | 8 | 7 | 0 | **NO** | OK |
| NUÑEZ CAPACHO ALEX FERNEY | 91487547 | 27 | 13 | 9 | 5 | 0 | OK | OK |
| PORRAS PLATA LUIS ALEXANDER | 91493470 | 19 | 8 | 6 | 5 | 0 | **NO** | OK |
| MONTES MORA ALEXANDER | 93130276 | 17 | 7 | 2 | 3 | 5 | OK | OK |
| LOPEZ ESCOBAR CAMPO ELIAS | 93394896 | 27 | 14 | 8 | 5 | 0 | OK | OK |

---
## 7. Hallazgos (resumen por severidad y tipo)

El listado completo (415 hallazgos) esta en `output/hallazgos_gemini.json`. Resumen:

- **POLARIDAD_INVERTIDA**: 128
- **DOCUMENTO_MAL_CLASIFICADO**: 98
- **FECHA_INCORRECTA**: 91
- **EVIDENCIA_PERSONA_EQUIVOCADA**: 42
- **PERSONA_NO_IDENTIFICADA**: 35
- **REQUISITO_SIN_SOPORTE_VALIDO**: 8
- **DOCUMENTO_NO_REGISTRADO**: 6
- **DOCUMENTO_FISICO_REPETIDO**: 3
- **EVIDENCIA_NO_ENCONTRADA**: 2
- **EVIDENCIA_DUPLICADA**: 1
- **DECISIONES_DUPLICADAS_MATRIZ**: 1

**Principales hallazgos confirmados con la pagina (CRITICO/ALTO):**

1. **DOCUMENTO_MAL_CLASIFICADO (76 CRITICO)**: cédulas registradas como CEDULA sobre paginas de oficios/constancias/resoluciones y procuradurias sobre constancias.
2. **REQUISITO_SIN_SOPORTE_VALIDO (8 CRITICO)**: R001=CUMPLE en personas sin ninguna pagina real de identificacion enlazada (AGUDELO, ARIAS, BURGOS, CAMACHO, CORREA, GARCIA RENGIFO, MARMOLEJO, PORRAS).
3. **EVIDENCIA_DUPLICADA (ALTO)**: 167 filas duplicadas exactas; solo 278 evidencias distintas de 445.
4. **PERSONA_EQUIVOCADA / PERSONA_NO_IDENTIFICADA / EVIDENCIA_NO_ENCONTRADA (ALTO)**: 33 evidencias MAL_ASIGNADAS y 25 fragmentos no hallados.
5. **POLARIDAD_INVERTIDA (ALTO)**: 128 certificados limpios registrados como CONTRARIA.
6. **DOCUMENTO_FISICO_REPETIDO (MEDIO, 3 casos)**: el mismo documento escaneado en dos paginas (oficio MDN 20260000891688383 en paginas 8 y 116; oficio 20260000891488093 en paginas 93 y 168; constancia 2026107009907733 en paginas 181 y 182).
7. **DOCUMENTO_NO_REGISTRADO (MEDIO)**: 78 paginas con contenido documental sin evidencia (17 solicitudes, 31 constancias, 12 identificaciones, 17 resoluciones, 1 oficio).
8. **FECHA_INCORRECTA (MEDIO)**: fechas de documento no cuadran (p.ej. 2004-10-05/2321-03-15 vs 2026-07-01 real de los certificados).
9. **DECISIONES_DUPLICADAS_MATRIZ (BAJO)**: la hoja DECISIONES repite 20 personas con matrices 1.0 y 1.1 (40 filas); evaluacion "1.1" vigente.

---
## 8. Respuestas A-P

A) **R001 ¿CUMPLE?** 20/20 CUMPLE en EVALUACION; **confirmado solo en 12/20**. 12 personas tienen una pagina real de identificacion; 8 no tienen soporte (las evidencias de cédula apuntan a paginas que no lo son).
B) **Evidencias R001:** 12 personas con pagina de identificacion real (p.ej. CABRERA pag 3; LEAL 110/111; ORTIZ 163/164); las demas no tienen soporte.
C) **R002:** 20/20 **EVIDENCIA_INSUFICIENTE confirmado** (certificados PROCURADURIA vencidos a 2026-07-01); decision sostenible.
D) **Cambio de decision:** SI para R001 en 8 personas (CUMPLE -> EVIDENCIA_INSUFICIENTE / requiere revision). Para R002 no cambia el resultado.
E) **ROCS:** no establecida. No hay un ROCS firmado que cierre el proceso de identificacion/antecedentes; el archivo auditado incluye un estado intermedio (matrices de evaluacion 1.0/1.1).
F) **Espacios vacios:** 180 paginas sin evidencia (78 con contenido), 167 evidencias duplicadas, 102 paginas sin contenido documental; 'Fecha del documento' vacia o incoherente en algunos registros.
G) **Cambio NIF:** no aplica (no se altero el NIF del codigo).
H) **Contexto:** falta foliado de paginas del PDF, hoja de control de versiones por fila y referencia cruzada evidencia<->pagina completada para las 299 paginas.
I) **DUDOSO / ND:** DUDOSO para las 134 evidencias PARCIAL (polaridad o fecha) y para 8 R001; ND en ROCS (E).
J) **Numeral:** no aplica (no hay adenda de requisitos que deba normalizarse).
K) **Identidades:** 20 personas identificables, cada una con un unico numero de cédula en el Excel (sin duplicados de identidad).
L) **Registro de version:** visible en DECISIONES (matrices 1.0 y 1.1); EVALUACION no registra version por fila.
M) **Modelo visible:** si, Gemini (modelos listados en la cabecera); configurado via `GEMINI_API_KEY`.
N) **Columna gucome:** no aplica.
O) **Modo seguro:** no aplica; la verificacion no modifico datos.
P) **Sudo/flags:** no aplica.

---
## 9. Modelo y metodos IA

- **Proveedor:** Google Gemini via `GeminiProvider` (parametro `modelo` en el constructor; sin cambios de codigo).
- **Rotacion por cuota gratuita** (20 peticiones/dia/modelo): pedidos por lotes de 4 paginas.
- Cada pagina se clasifico con: `tipo_documento`, `persona_principal`, `personas_secundarias`, `entidad`, `fecha_documento`, `numero_certificado`, `certificado_limpio`, `nota`.
- Se limito el reenvio de texto a la pagina evaluada (eficiencia).

## 10. Limitaciones

- El `Fecha del documento` del Excel a veces corresponde a otra columna del PDF (fecha de expedicion de la cédula, fecha de nacimiento o numero con OCR) -> DUDOSO.
- 102 paginas sin contenido documental no se enviaron a Gemini (no aportan evidencia).
- El Excel auditado es el dump intermedio `output/verificacion.xlsx`; la version final `output/aceptacion.xlsx` (113 evidencias) NO es el objeto de esta verificacion.

---
## 11. Veredicto final

## **NO APROBADO**

El archivo `output/verificacion.xlsx` no cumple con su rol de verificacion del cumplimiento porque:

1. **Hay hallazgos CRITICOS** (76 documentos mal clasificados + 8 R001 sin soporte valido) -> la instruccion prohíbe declarar APROBADO.
2. **`cambia_decision` = SI**: R001 de 8 personas pierde su soporte de identificacion (CUMPLE -> EVIDENCIA_INSUFICIENTE/REVISION).
3. **Polaridad invertida** en 128 certificados limpios (CONTRARIA), que desvirtua la trazabilidad de la evaluacion.
4. **167 evidencias duplicadas** y 33 mal asignadas -> el conteo de `445 evidencias` no refleja el expediente real.

**Se recomienda:** regenerar la verificacion a partir del proceso actual (que produjo `output/aceptacion.xlsx` con 113 evidencias), corregir la asociacion persona-pagina para las 8 personas sin cédula enlazada, y reemitir la matriz R001 de esas 8 personas como EVIDENCIA_INSUFICIENTE o con la cédula correcta.
