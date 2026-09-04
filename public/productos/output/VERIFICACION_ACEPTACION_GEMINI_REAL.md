# INFORME DE VERIFICACIÓN INDEPENDIENTE — CORRIDA DE ACEPTACIÓN

**DELIVERABLE**: `output/aceptacion.xlsx` (corrida PRUEBA-001)

**OBJETO VERIFICADO**: salida del motor de reglas del proceso de aceptación (convocatoria de condecoración institucional).

**FUENTE PRIMARIA**: `input/pdf/1_SOPORTE 1 ISEM26.pdf` — 299 páginas (texto extraído con PyMuPDF en modo solo lectura).

**MODO DE AUDITORÍA**: SOLO LECTURA. No se modificó ningún archivo, base de datos, decisión ni estado del sistema.

**FECHA DE AUDITORÍA**: 2026-08-28 (fecha base para cálculos de vigencia).

## 1. Resumen ejecutivo

- Evidencias auditadas: **114** de 114 registradas en `DATOS_EVIDENCIAS`.
- Correctas: **93** | Parciales: **17** | Incorrectas: **4** | Mal asignadas: **0**.
- Hallazgos por severidad: CRÍTICO **3**, ALTO **3**, MEDIO **21**, BAJO **0**.
- Hallazgos que **cambian decisión (SI)**: **3**. Que NO cambian decisión: **24**.
- Personas afectadas: **15**.
- Personas con R001 en CUMPLE **sin sustento de identificación válido**: **CABRERA MARTINEZ NORMAN IVAN** y **MONTES MORA ALEXANDER** (error real de decisión).

**VEREDICTO FINAL: NO APROBADO**

El entregable NO APROBADO se sustenta en que existen dos personas cuyo requisito R001 ("Identificación del candidato válida") figura como CUMPLE en el sistema sin que exista evidencia de identificación válida soportada en el PDF (CABRERA y MONTES), además de evidencia incorrectamente tipificada y documentos físicos duplicados dentro del mismo expediente.

## 2. Objeto y alcance

Se verificó la coherencia entre la salida del sistema (`output/aceptacion.xlsx`) y el soporte documental físico (PDF de 299 páginas), atendiendo a las 14 secciones de verificación de la auditoría previa, con los siguientes elementos:

- Verificación **página por página** de las **114 evidencias** registradas en `DATOS_EVIDENCIAS` contra el texto real del PDF (el texto de la página es la fuente primaria; no se reutilizaron clasificaciones previas de forma ciega).
- Los 8 casos previamente fallidos de identificación (R001).
- Los requisitos **R001** (identificación) y **R002** (certificado de antecedentes disciplinarios vigente ≤ 30 días).
- Polaridad de documentos (SOPORTE / CONTRARIA).
- Duplicados físicos dentro del PDF.
- Páginas con contenido documental real **no registradas** como evidencia.
- Trazabilidad persona → requisito → regla → evaluación → evidencia → documento → página.
- Consistencia entre las 5 hojas del Excel.

## 3. Metodología

1. Extracción del texto de las 299 páginas con PyMuPDF (v1.28.2).
2. Clasificación determinista de cada página por marcadores textuales (PROCURADURÍA, CONTRALORÍA, POLICÍA, CÉDULA, CÉDULA MILITAR, CONSTANCIA, SOLICITUD, COMUNICACIÓN OFICIAL, ACTO ADMINISTRATIVO), búsqueda de personas por apellidos (2 primeros tokens) y coincidencia de cédula (OCR tolerante), y extracción de fechas y radicados.
3. Verificación de cada evidencia contra sus páginas reales: tipo del documento, persona/cédula, fecha, polaridad y requisitos asociados.
4. Análisis auxiliares: R001/R002 por persona, duplicados físicos, páginas sin registro, consistencia entre hojas y trazabilidad.
5. Clasificación de hallazgos por severidad (CRÍTICO/ALTO/MEDIO/BAJO) y tipo (ERROR_REAL_DEL_SISTEMA / FALSO_POSITIVO / DUDA_REQUIERE_REVISION), con indicador `cambia_decision` SI/NO.

**Nota metodológica**: el texto del PDF contiene ruido OCR (p. ej. "IDENTIFICACIÓN PERSONA!.", "CÉDULAMELITAR", "julio dei 2026"). Donde el ruido impedía confirmar nombre/cédula de la persona, el hallazgo se clasificó como DUDA_REQUIERE_REVISION (revisión humana) y no se inventaron datos.

## 4. Fuentes de información

| Fuente | Descripción | Rol |
|---|---|---|
| `input/pdf/1_SOPORTE 1 ISEM26.pdf` | 299 páginas del soporte documental | Fuente primaria (verificado página por página) |
| `output/aceptacion.xlsx` | 5 hojas: DATOS_EVIDENCIAS (114), NORMA_REQUISITOS (3), EVALUACION (20+ encabezado), DECISIONES (21), TRAZABILIDAD (134) | Objeto de la auditoría |
| `data/aceptacion.db` | 20 personas, 191 documentos, 114 evidencias, 40 evaluaciones, 21 decisiones, 134 vínculos, 1 corrida | Referencia de trazabilidad (solo lectura) |
| Artefactos previos (`VERIFICACION_GEMINI_REAL.md`, `hallazgos_gemini.json`) | Auditoría anterior | Solo referencia contextual |

## 5. Análisis de las páginas del PDF (299)

Páginas con tipo de documento reconocido: **247**. Sin tipo reconocido (anexos/formula): **52**.

| Tipo detectado | Páginas |
|---|---|
| ACTO_ADMINISTRATIVO | 44 |
| SOLICITUD | 38 |
| PROCURADURIA | 36 |
| CEDULA | 33 |
| CONSTANCIA | 29 |
| POLICIA | 20 |
| CONTRALORIA | 20 |
| CEDULA_MILITAR | 15 |
| COMUNICACION_OFICIAL | 12 |
| **Total con tipo** | **247** |

Páginas sin tipo reconocido (números): 29, 30, 41, 43, 51, 53, 57, 62, 63, 64, 69, 71, 88, 98, 120, 132, 134, 176, 195, 203, 207, 221, 223, 225, 227, 229, 231, 233, 235, 237, 241, 244, 245, 247, 249, 251, 253, 257, 261, 265, 266, 267, 269, 271, 273, 281, 285, 287, 289, 291, 293, 297.

## 6. Verificación individual de las 114 evidencias

Distribución: **CORRECTA 93 | PARCIAL 17 | INCORRECTA 4 | MAL_ASIGNADA 0**.

### 6.1 Evidencia con resultado distinto de CORRECTA

| Ev | Persona | Tipo registrado | Pág. | Veredicto | Hallazgo |
|---|---|---|---|---|---|
| 32 | GARCIA RENGIFO JHON JAIRO | CEDULA_MILITAR | 70 | PARCIAL | PERSONA_NO_VERIFICADA |
| 31 | GARCIA RENGIFO JHON JAIRO | CONSTANCIA | 75 | PARCIAL | FECHA_REGISTRADA_AUSENTE |
| 93 | VILLAMIZAR PEREZ CONSTANZA | CONSTANCIA | 213 | PARCIAL | FECHA_REGISTRADA_AUSENTE |
| 6 | CABRERA MARTINEZ NORMAN IVAN | CONSTANCIA | 9 | PARCIAL | FECHA_REGISTRADA_AUSENTE |
| 49 | LEAL GARCIA JESUS ARLEY | CONSTANCIA | 115 | PARCIAL | FECHA_REGISTRADA_AUSENTE |
| 18 | MARMOLEJO CUMBE CARLOS ERNESTO | CONSTANCIA | 36 | PARCIAL | FECHA_REGISTRADA_AUSENTE |
| 11 | ARIAS ROJAS EDUARDO ALBERTO | CONSTANCIA | 21 | PARCIAL | FECHA_REGISTRADA_AUSENTE |
| 38 | GARCIA SAAVEDRA ALEXANDER | CONSTANCIA | 94 | PARCIAL | FECHA_REGISTRADA_AUSENTE |
| 77 | ORTIZ PARRA OSCAR ANDRES | CONSTANCIA | 169 | PARCIAL | FECHA_REGISTRADA_AUSENTE |
| 43 | GOMEZ RODRIGUEZ DIEGO FERNANDO | CEDULA | 103 | INCORRECTA | TIPO_INCORRECTO |
| 112 | CORREA VARGAS PAULO IVAN | CEDULA_MILITAR | 286 | PARCIAL | CEDULA_NO_CONFIRMADA |
| 113 | CORREA VARGAS PAULO IVAN | CONSTANCIA | 296 | PARCIAL | FECHA_REGISTRADA_AUSENTE |
| 102 | BURGOS SANDRO RAFAEL | CEDULA_MILITAR | 246 | PARCIAL | PERSONA_NO_VERIFICADA |
| 103 | BURGOS SANDRO RAFAEL | CONSTANCIA | 256 | PARCIAL | FECHA_REGISTRADA_AUSENTE |
| 69 | NUÑEZ CAPACHO ALEX FERNEY | CEDULA | 157 | INCORRECTA | TIPO_INCORRECTO |
| 70 | NUÑEZ CAPACHO ALEX FERNEY | CONSTANCIA | 159 | PARCIAL | FECHA_REGISTRADA_AUSENTE |
| 114 | PORRAS PLATA LUIS ALEXANDER | CEDULA_MILITAR | 177 | PARCIAL | CEDULA_NO_CONFIRMADA |
| 63 | MONTES MORA ALEXANDER | CEDULA | 144 | INCORRECTA | TIPO_INCORRECTO |
| 62 | MONTES MORA ALEXANDER | CONSTANCIA | 143 | PARCIAL | FECHA_REGISTRADA_AUSENTE |
| 58 | LOPEZ ESCOBAR CAMPO ELIAS | CEDULA | 130 | INCORRECTA | TIPO_INCORRECTO |
| 57 | LOPEZ ESCOBAR CAMPO ELIAS | CONSTANCIA | 129 | PARCIAL | FECHA_REGISTRADA_AUSENTE |

Valgan estas acotaciones sobre el detalle anterior:

- **PARCIAL** = documento presente, tipo y/o persona confirmados, pero con una limitación: fecha no registrada en el sistema (13 constancias), nombre o cédula no legibles por OCR (libretas militares de GARCIA RENGIFO, BURGOS, CORREA, PORRAS) o cédula no confirmable en la página (libretas).
- **INCORRECTA (4)** = EV43 (GOMEZ, p103), EV58 (LOPEZ, p130), EV63 (MONTES, p144), EV69 (NUÑEZ, p157): registradas como `CEDULA`, pero el contenido real de la página es una **CONSTANCIA SIJEN** del Ejército Nacional (N° 101374, 101095, 101442, 102610). El sistema tomó como "cédula" páginas que son certificados que citan la cédula del interesado.
- **Caso especial EV83 (TEJADA, p194)**: la página es la **cédula real** (MRZ legible `COL79938063`), reconstruida como CORRECTA tras calibrar OCR; no se cuenta como hallazgo.

## 7. Verificación de los 8 casos previamente fallidos (identificación / R001)

| # | Persona | Estado previo | Evidencia hoy | Página | Veredicto de auditoría |
|---|---|---|---|---|---|
| ARIAS ROJAS EDUARDO ALBERTO | fallido | 10 | CEDULA | 14 | CORRECTA |
| MARMOLEJO CUMBE CARLOS ERNESTO | fallido | 17 | CEDULA | 28 | CORRECTA |
| GARCIA RENGIFO JHON JAIRO | fallido | 32 | CEDULA_MILITAR | 70 | PARCIAL (PERSONA_NO_VERIFICADA) |
| PORRAS PLATA LUIS ALEXANDER | fallido | 114 | CEDULA_MILITAR | 177 | PARCIAL (CEDULA_NO_CONFIRMADA) |
| AGUDELO ROJAS MANUEL DIONICIO | fallido | 97 | CEDULA | 220 | CORRECTA |
| BURGOS SANDRO RAFAEL | fallido | 102 | CEDULA_MILITAR | 246 | PARCIAL (PERSONA_NO_VERIFICADA) |
| CORREA VARGAS PAULO IVAN | fallido | 112 | CEDULA_MILITAR | 286 | PARCIAL (CEDULA_NO_CONFIRMADA) |
| CAMACHO GUZMAN JOHANN RODRIGO | R001 EVIDENCIA_INSUFICIENTE | sin evidencia de identificación en el PDF | - | **Decisión correcta**: no existe página de identificación en el soporte |

Observaciones:

- ARIAS (p14), MARMOLEJO (p28), AGUDELO (p220, reverso de cédula N° 80028026), CORREA (p286, libreta con su nombre) y PORRAS (p177, libreta con su nombre): **identificación válida confirmada**.
- GARCIA (p70) y BURGOS (p246): la página **es** una libreta militar (CÉDULA MILITAR) válida, pero **el nombre del titular no es legible** en el OCR; se requiere revisión humana para confirmar que la libreta pertenece a la persona. No obstante, el tipo de documento es correcto.
- CORREA (p286) y PORRAS (p177): nombre presente; el número de cédula civil no es confirmable en la libreta (normal), DUDA_REQUIERE_REVISION menor.
- **CAMACHO**: se confirmó que **no existe** ninguna página de identificación (cédula o libreta) entre sus páginas 260–276; la decisión del sistema de marcarlo R001 = EVIDENCIA_INSUFICIENTE es **correcta**.

## 8. Verificación del requisito R001 (Identificación del candidato válida)

Regla `R001-EV` (v1.0): tipo `presencia_identificacion`, requiere identificación válida. En el Excel, R001 figura en CUMPLE para 19 personas y EVIDENCIA_INSUFICIENTE para CAMACHO.

| Persona | R001 (Excel) | Evidencias de identificación (ID en Excel) | ¿Soportado por el PDF? |
|---|---|---|---|
| GARCIA RENGIFO JHON JAIRO | CUMPLE | [32] | SÍ |
| VILLAMIZAR PEREZ CONSTANZA | CUMPLE | [89] | SÍ |
| CAÑON PINILLA JIDSELIN | CUMPLE | [23] | SÍ |
| CABRERA MARTINEZ NORMAN IVAN | CUMPLE | ninguna | **NO** |
| LEAL GARCIA JESUS ARLEY | CUMPLE | [44, 45] | SÍ |
| SUAREZ CALDERON JESUS LEONARDO | CUMPLE | [19] | SÍ |
| MARMOLEJO CUMBE CARLOS ERNESTO | CUMPLE | [17] | SÍ |
| ARIAS ROJAS EDUARDO ALBERTO | CUMPLE | [10] | SÍ |
| GARCIA SAAVEDRA ALEXANDER | CUMPLE | [33] | SÍ |
| ORTIZ PARRA OSCAR ANDRES | CUMPLE | [72, 73] | SÍ |
| TEJADA CACERES JOSE JULIAN | CUMPLE | [83] | SÍ |
| AGUDELO ROJAS MANUEL DIONICIO | CUMPLE | [97] | SÍ |
| GOMEZ RODRIGUEZ DIEGO FERNANDO | CUMPLE | [43, 39] | SÍ |
| CORREA VARGAS PAULO IVAN | CUMPLE | [112] | SÍ |
| CAMACHO GUZMAN JOHANN RODRIGO | EVIDENCIA_INSUFICIENTE | ninguna | **NO** |
| BURGOS SANDRO RAFAEL | CUMPLE | [102] | SÍ |
| NUÑEZ CAPACHO ALEX FERNEY | CUMPLE | [69, 65] | SÍ |
| PORRAS PLATA LUIS ALEXANDER | CUMPLE | [114] | SÍ |
| MONTES MORA ALEXANDER | CUMPLE | [63] | **NO** |
| LOPEZ ESCOBAR CAMPO ELIAS | CUMPLE | [53, 58] | SÍ |

**Conclusiones R001:**

- **18 personas sustentan CUMPLE con identificación válida real** (cédula física o libreta militar asociada).
- **CABRERA MARTINEZ NORMAN IVAN**: R001 = CUMPLE **sin sustento**. Sus evidencias (POLICIA, PROCURADURIA, CONTRALORIA, COMUNICACION ×2, CONSTANCIA) no incluyen ningún documento de identificación. En la BD los documentos **2 (CEDULA, p3)** y **3 (CEDULA_MILITAR, p4)** existen pero **no fueron enlazados a la persona ni convertidos en evidencia**. → **ERROR_REAL_DEL_SISTEMA, cambia_decision=SI** (debería ser EVIDENCIA_INSUFICIENTE).
- **MONTES MORA ALEXANDER**: R001 = CUMPLE con evidencia EV63 tipificada como `CEDULA` pero cuya página real es la CONSTANCIA SIJEN N° 101442 (p144); su cédula real (p138, N° 93130276) **no fue registrada**. → **ERROR_REAL_DEL_SISTEMA, cambia_decision=SI**.
- **CAMACHO**: EVIDENCIA_INSUFICIENTE correcta (sin identificación en el PDF).
- GARCIA RENGIFO y BURGOS: CUMPLE con libreta válida pero **pendiente de revisión humana** (nombre no legible por OCR).

## 9. Verificación del requisito R002 (Certificado de antecedentes disciplinarios vigente ≤ 30 días)

Regla `R002-EV` (v1.0): tipo `evidencia_documento` PROCURADURIA, vencimiento 30 días. Vigencia calculada respecto de 2026-08-28.

| Persona | Evidencia | Pág. | Tipo real | Fecha del certificado (PDF) | Días hasta 2026-08-28 | Estado (Excel) |
|---|---|---|---|---|---|---|
| GARCIA RENGIFO JHON JAIRO | EV29 | p73 | PROCURADURIA | 2026-07-01 | 58 | EVIDENCIA_INSUFICIENTE |
| VILLAMIZAR PEREZ CONSTANZA | EV91 | p209 | PROCURADURIA | 2026-07-01 | 58 | EVIDENCIA_INSUFICIENTE |
| CAÑON PINILLA JIDSELIN | EV25 | p59 | PROCURADURIA | 2026-07-01 | 58 | EVIDENCIA_INSUFICIENTE |
| CABRERA MARTINEZ NORMAN IVAN | EV2 | p6 | PROCURADURIA | 2026-07-01 | 58 | EVIDENCIA_INSUFICIENTE |
| LEAL GARCIA JESUS ARLEY | EV47 | p113 | PROCURADURIA | 2026-07-01 | 58 | EVIDENCIA_INSUFICIENTE |
| SUAREZ CALDERON JESUS LEONARDO | EV21 | p46 | PROCURADURIA | 2026-07-01 | 58 | EVIDENCIA_INSUFICIENTE |
| MARMOLEJO CUMBE CARLOS ERNESTO | EV15 | p32 | PROCURADURIA | 2026-07-01 | 58 | EVIDENCIA_INSUFICIENTE |
| ARIAS ROJAS EDUARDO ALBERTO | EV8 | p17 | PROCURADURIA | 2026-07-01 | 58 | EVIDENCIA_INSUFICIENTE |
| GARCIA SAAVEDRA ALEXANDER | EV35 | p91 | PROCURADURIA | 2026-07-01 | 58 | EVIDENCIA_INSUFICIENTE |
| ORTIZ PARRA OSCAR ANDRES | EV75 | p166 | PROCURADURIA | 2026-07-01 | 58 | EVIDENCIA_INSUFICIENTE |
| TEJADA CACERES JOSE JULIAN | EV85 | p197 | PROCURADURIA | 2026-07-01 | 58 | EVIDENCIA_INSUFICIENTE |
| AGUDELO ROJAS MANUEL DIONICIO | EV95 | p226 | PROCURADURIA | 2026-07-01 | 58 | EVIDENCIA_INSUFICIENTE |
| GOMEZ RODRIGUEZ DIEGO FERNANDO | EV41 | p101 | PROCURADURIA | 2026-07-01 | 58 | EVIDENCIA_INSUFICIENTE |
| CORREA VARGAS PAULO IVAN | EV110 | p290 | PROCURADURIA | 2026-07-01 | 58 | EVIDENCIA_INSUFICIENTE |
| CAMACHO GUZMAN JOHANN RODRIGO | EV105 | p270 | PROCURADURIA | 2026-07-01 | 58 | EVIDENCIA_INSUFICIENTE |
| BURGOS SANDRO RAFAEL | EV100 | p250 | PROCURADURIA | 2026-07-01 | 58 | EVIDENCIA_INSUFICIENTE |
| NUÑEZ CAPACHO ALEX FERNEY | EV67 | p155 | PROCURADURIA | 2026-07-01 | 58 | EVIDENCIA_INSUFICIENTE |
| PORRAS PLATA LUIS ALEXANDER | EV79 | p179 | PROCURADURIA | 2026-07-01 | 58 | EVIDENCIA_INSUFICIENTE |
| MONTES MORA ALEXANDER | EV60 | p141 | PROCURADURIA | 2026-07-01 | 58 | EVIDENCIA_INSUFICIENTE |
| LOPEZ ESCOBAR CAMPO ELIAS | EV55 | p127 | PROCURADURIA | 2026-07-01 | 58 | EVIDENCIA_INSUFICIENTE |

**Conclusión R002:** los 20 certificados se expidieron el **2026-07-01** (58 días antes de la fecha de corte). Todos exceden la vigencia de 30 días. La decisión del sistema de marcar **EVIDENCIA_INSUFICIENTE para los 20** es **correcta**.

## 10. Polaridad de los documentos

Se verificó la polaridad registrada contra el contenido real de cada certificado (PROCURADURIA, CONTRALORIA, POLICIA):

- Los 20 certificados de procuraduría y los 20 de contraloría indican **NO SE ENCUENTRA REPORTADO / NO SE ENCUENTRA REPORTADO COMO RESPONSABLE FISCAL** → polaridad correcta (SOPORTE).
- Los 20 certificados de policía indican **NO TIENE ASUNTOS PENDIENTES CON LAS AUTORIDADES JUDICIALES** → polaridad correcta (SOPORTE).
- **No se detectó ningún caso de polaridad invertida.**

## 11. Duplicados físicos dentro del PDF

Se detectaron **3 documentos físicos repetidos** (mismo número de radicado/resolución en páginas no consecutivas):

| Documento | Páginas | Detalle |
|---|---|---|
| Oficio No. 20260000891688383 (MDN-COGFM-…) | 8 y 116 | Mismo oficio de "Respuesta de antecedentes" presente dos veces en el PDF; referencia evidencias **EV4/EV50 (CABRERA) y EV5/EV51 (LEAL)** (4 filas de evidencia para 1 documento físico) |
| Oficio/constancia No. 20260000891488093 | 93 y 168 | Copia en expediente de GARCIA SAAVEDRA (EV37) y copia anexa a ORTIZ/PORRAS; p168 sin evidencia registrada |
| Resolución No. 032 DE 2025 (traslado de oficiales) | 184, 238 y 278 | Misma resolución anexada en expedientes de PORRAS, AGUDELO y CAMACHO |

Helo adicional: página 8 y 116 comparten 2 evidencias cada una ({8: EV4,EV5}, {116: EV50,EV51}).

Impacto: MEDIO (afecta trazabilidad y duplicación de registros, no cambia decisiones).

## 12. Páginas con documento real NO registradas como evidencia

Comparando páginas clasificadas del análisis contra páginas referenciadas en evidencias (Excel) o en documentos de la BD:

| Tipo | Páginas sin registro |
|---|---|
| CONSTANCIA | 168 |

Análisis de las páginas no registradas encontradas (1): ver detalle de hallazgos (p168 es la copia duplicada del oficio 20260000891488093).

## 13. Trazabilidad persona → requisito → regla → evaluación → evidencia → documento → página

- El **Excel** referencia 134 vínculos (114 a R001 + 20 a R002); la **BD** tiene 134 `evaluacion_evidencia`, **coinciden**. Todas las Evidencia ID referenciadas existen en `DATOS_EVIDENCIAS`.
- **Observación sistémica**: la hoja TRAZABILIDAD asocia **todas** las evidencias (114) al requisito R001 y solo las PROCURADURIA (20) a R002, cuando la regla R001 es `presencia_identificacion`. La sobre-inclusión no altera resultados (R001 se cumple si hay identificación), pero **ensucia la trazabilidad** (ERROR_REAL_DEL_SISTEMA, severidad MEDIO/ALTO, cambia_decision=NO).
- Los documentos (191 en BD) mapean a páginas por rango `pagina_inicio..pagina_fin` con consistencia frente a las evidencias vinculadas (se validaron rangos de las evidencias de identificación).

## 14. Consistencia entre hojas del Excel

Verificaciones ejecutadas: IDs únicos de evidencia; existencia de todos los IDs en DATOS/TRAZ; igualdad de `Página evidencia` entre DATOS y TRAZ; existencia de `Documento ID` en la BD; coherencia persona–cédula entre EVALUACION y DATOS; unicidad de decisiones; tipos de documento coherentes entre DATOS y TRAZ.

- **No se encontraron errores de consistencia**. Las hojas son internamente coherentes en IDs, páginas, cédulas y tipos.
- Observación: TRAZABILIDAD asocia TODAS las evidencias a R001 (114) y solo las PROCURADURIA a R002 (20)

## 15. Hallazgos detallados

| # | Persona | Severidad | Tipo de hallazgo | Descripción | cambia_decision | Decisión afectada |
|---|---|---|---|---|---|---|
| 1 | MONTES MORA ALEXANDER | CRITICO | ERROR_REAL_DEL_SISTEMA | registrado CEDULA; pagina 144 real=CONSTANCIA | SI | R001 |
| 2 | MONTES MORA ALEXANDER | CRITICO | ERROR_REAL_DEL_SISTEMA | Cédula de ciudadanía real del candidato (p138, N° 93130276) NO registrada en Excel/BD; la evidencia EV63 apunta a CONSTANCIA N° 101442 (p144) | SI | R001 |
| 3 | CABRERA MARTINEZ NORMAN IVAN | CRITICO | ERROR_REAL_DEL_SISTEMA | R001 en CUMPLE sin evidencia de identificacion valida en DATOS_EVIDENCIAS (documentos de identificacion no enlazados como evidencia) | SI | R001 |
| 4 | GARCIA RENGIFO JHON JAIRO | ALTO | DUDA_REQUIERE_REVISION | no se localizó GARCIA RENGIFO JHON JAIRO/18008020 en pag 70-71 (OCR/no legible) | NO | R001 |
| 5 | BURGOS SANDRO RAFAEL | ALTO | DUDA_REQUIERE_REVISION | no se localizó BURGOS SANDRO RAFAEL/88160526 en pag 246-247 (OCR/no legible) | NO | R001 |
| 6 | SISTEMA | ALTO | ERROR_REAL_DEL_SISTEMA | TRAZABILIDAD asocia las 114 evidencias a R001 (sobre-inclusión) y solo 20 PROCURADURIA a R002 | NO | - |
| 7 | GARCIA RENGIFO JHON JAIRO | MEDIO | ERROR_REAL_DEL_SISTEMA | sin fecha de documento en DB/Excel (paginas muestran []) | NO | - |
| 8 | VILLAMIZAR PEREZ CONSTANZA | MEDIO | ERROR_REAL_DEL_SISTEMA | sin fecha de documento en DB/Excel (paginas muestran []) | NO | - |
| 9 | CABRERA MARTINEZ NORMAN IVAN | MEDIO | ERROR_REAL_DEL_SISTEMA | sin fecha de documento en DB/Excel (paginas muestran []) | NO | - |
| 10 | LEAL GARCIA JESUS ARLEY | MEDIO | ERROR_REAL_DEL_SISTEMA | sin fecha de documento en DB/Excel (paginas muestran []) | NO | - |
| 11 | MARMOLEJO CUMBE CARLOS ERNESTO | MEDIO | ERROR_REAL_DEL_SISTEMA | sin fecha de documento en DB/Excel (paginas muestran []) | NO | - |
| 12 | ARIAS ROJAS EDUARDO ALBERTO | MEDIO | ERROR_REAL_DEL_SISTEMA | sin fecha de documento en DB/Excel (paginas muestran []) | NO | - |
| 13 | GARCIA SAAVEDRA ALEXANDER | MEDIO | ERROR_REAL_DEL_SISTEMA | sin fecha de documento en DB/Excel (paginas muestran []) | NO | - |
| 14 | ORTIZ PARRA OSCAR ANDRES | MEDIO | ERROR_REAL_DEL_SISTEMA | sin fecha de documento en DB/Excel (paginas muestran []) | NO | - |
| 15 | GOMEZ RODRIGUEZ DIEGO FERNANDO | MEDIO | FALSO_POSITIVO | registrado CEDULA; pagina 103 real=CONSTANCIA | NO | - |
| 16 | CORREA VARGAS PAULO IVAN | MEDIO | DUDA_REQUIERE_REVISION | nombre CORREA VARGAS PAULO IVAN en pagina pero cédula 80180164 no confirmable | NO | - |
| 17 | CORREA VARGAS PAULO IVAN | MEDIO | ERROR_REAL_DEL_SISTEMA | sin fecha de documento en DB/Excel (paginas muestran []) | NO | - |
| 18 | BURGOS SANDRO RAFAEL | MEDIO | ERROR_REAL_DEL_SISTEMA | sin fecha de documento en DB/Excel (paginas muestran []) | NO | - |
| 19 | NUÑEZ CAPACHO ALEX FERNEY | MEDIO | FALSO_POSITIVO | registrado CEDULA; pagina 157 real=CONSTANCIA | NO | - |
| 20 | NUÑEZ CAPACHO ALEX FERNEY | MEDIO | ERROR_REAL_DEL_SISTEMA | sin fecha de documento en DB/Excel (paginas muestran []) | NO | - |
| 21 | PORRAS PLATA LUIS ALEXANDER | MEDIO | DUDA_REQUIERE_REVISION | nombre PORRAS PLATA LUIS ALEXANDER en pagina pero cédula 91493470 no confirmable | NO | - |
| 22 | MONTES MORA ALEXANDER | MEDIO | ERROR_REAL_DEL_SISTEMA | sin fecha de documento en DB/Excel (paginas muestran []) | NO | - |
| 23 | LOPEZ ESCOBAR CAMPO ELIAS | MEDIO | FALSO_POSITIVO | registrado CEDULA; pagina 130 real=CONSTANCIA | NO | - |
| 24 | LOPEZ ESCOBAR CAMPO ELIAS | MEDIO | ERROR_REAL_DEL_SISTEMA | sin fecha de documento en DB/Excel (paginas muestran []) | NO | - |
| 25 | SISTEMA | MEDIO | ERROR_REAL_DEL_SISTEMA | Documento físico repetido (mismo radicado 20260000891688383) en páginas ['8', '116'] | NO | - |
| 26 | SISTEMA | MEDIO | ERROR_REAL_DEL_SISTEMA | Documento físico repetido (mismo radicado 20260000891488093) en páginas ['93', '168'] | NO | - |
| 27 | SISTEMA | MEDIO | ERROR_REAL_DEL_SISTEMA | Documento físico repetido (mismo radicado 2025315007856528) en páginas ['184', '238', '278'] | NO | - |

Resumen por tipo: DUDA_REQUIERE_REVISION=4, ERROR_REAL_DEL_SISTEMA=20, FALSO_POSITIVO=3

### 15.1 Hallazgos que CAMBIAN la decisión (`cambia_decision=SI`, 3)

- **MONTES MORA ALEXANDER** — CRITICO ERROR_REAL_DEL_SISTEMA: registrado CEDULA; pagina 144 real=CONSTANCIA (afecta R001).
- **MONTES MORA ALEXANDER** — CRITICO ERROR_REAL_DEL_SISTEMA: Cédula de ciudadanía real del candidato (p138, N° 93130276) NO registrada en Excel/BD; la evidencia EV63 apunta a CONSTANCIA N° 101442 (p144) (afecta R001).
- **CABRERA MARTINEZ NORMAN IVAN** — CRITICO ERROR_REAL_DEL_SISTEMA: R001 en CUMPLE sin evidencia de identificacion valida en DATOS_EVIDENCIAS (documentos de identificacion no enlazados como evidencia) (afecta R001).

Estos implican que **CABRERA** y **MONTES** deberían quedar en R001 = EVIDENCIA_INSUFICIENTE igual que CAMACHO, agregando filas de decisión CRÍTICA.

## 16. Mapa de hallazgos por persona

- ARIAS ROJAS EDUARDO ALBERTO: M
- BURGOS SANDRO RAFAEL: A, M
- CABRERA MARTINEZ NORMAN IVAN: M, C
- CORREA VARGAS PAULO IVAN: M, M
- GARCIA RENGIFO JHON JAIRO: A, M
- GARCIA SAAVEDRA ALEXANDER: M
- GOMEZ RODRIGUEZ DIEGO FERNANDO: M
- LEAL GARCIA JESUS ARLEY: M
- LOPEZ ESCOBAR CAMPO ELIAS: M, M
- MARMOLEJO CUMBE CARLOS ERNESTO: M
- MONTES MORA ALEXANDER: C, M, C
- NUÑEZ CAPACHO ALEX FERNEY: M, M
- ORTIZ PARRA OSCAR ANDRES: M
- PORRAS PLATA LUIS ALEXANDER: M
- VILLAMIZAR PEREZ CONSTANZA: M

## 17. Recomendaciones

1. **CRÍTICO / R001**: enlazar la identificación real a CABRERA (doc p3 CEDULA, p4 CEDULA_MILITAR) y a MONTES (cédula p138, N° 93130276) y re-evaluar R001; de no contar con soporte, marcar EVIDENCIA_INSUFICIENTE (como CAMACHO).
2. **ALTO**: revisión humana de las libretas militares de GARCIA RENGIFO (p70) y BURGOS (p246) para confirmar titularidad (OCR no legible).
3. Re-tipificar las evidencias EV43, EV58, EV63, EV69 de `CEDULA` a `CONSTANCIA` (falsos positivos de detección) y corregir el documento CEDULA 238 (es Resolución 032 de 2025).
4. Corregir la trazabilidad para vincular solo los documentos de identificación a R001 (114 → ~20) o documentar el propósito de la sobre-inclusión.
5. Eliminar/consolidar duplicados físicos: oficio 20260000891688383 (p8/p116, 4 filas de evidencia), oficio 20260000891488093 (p93/p168) y Resolución 032 (p184/p238/p278).
6. Registrar la **fecha de documento** de las 13 constancias que actualmente no la tienen (FECHA_REGISTRADA_AUSENTE).
7. Registrar la página p168 (copia del oficio) como evidencia del expediente que le corresponde o marcarla como anexo duplicado.

## 18. Limitaciones de la auditoría

- El PDF es una **copia escaneada con ruido OCR**; donde el texto no permitía confirmar nombre/cédula se marcó DUDA_REQUIERE_REVISION y no se asumieron datos.
- La auditoría se realizó sobre el texto (`text_layer`) del PDF generado por PyMuPDF; no se hizo comparación visual píxel a píxel de las imágenes.
- No se validó la veracidad externa de los certificados (web procuraduría/contraloría/policía); solo su presencia, contenido y coherencia documental.
- No se modificó ni verificó la criptografía/documentos digitales: el soporte es análogo escaneado.

## 19. Revisión humana solicitada (DUDA_REQUIERE_REVISION)

- Libretas militares p70 (GARCIA RENGIFO) y p246 (BURGOS): confirmar titularidad.
- Cédula de MONTES p138 (número 93130276) y vínculo a su expediente.
- Identificación de CABRERA (p3/p4) para re-evaluar R001.
- Oficio duplicado p8/p116 y p93/p168: definir cuál copia se conserva.

## 20. Anexo A — Las 114 evidencias auditadas

| Ev | Persona | Tipo registr. | Tipo real | Pág. | Requisitos | Veredicto |
|---|---|---|---|---|---|---|
| 1 | CABRERA MARTINEZ NORMAN IVAN | POLICIA | POLICIA | 5 | R001 | CORRECTA |
| 2 | CABRERA MARTINEZ NORMAN IVAN | PROCURADURIA | PROCURADURIA | 6 | R001,R002 | CORRECTA |
| 3 | CABRERA MARTINEZ NORMAN IVAN | CONTRALORIA | CONTRALORIA | 7 | R001 | CORRECTA |
| 4 | CABRERA MARTINEZ NORMAN IVAN | COMUNICACION_OFICIAL | COMUNICACION_OFICIAL | 8 | R001 | CORRECTA |
| 5 | LEAL GARCIA JESUS ARLEY | COMUNICACION_OFICIAL | COMUNICACION_OFICIAL | 8 | R001 | CORRECTA |
| 6 | CABRERA MARTINEZ NORMAN IVAN | CONSTANCIA | CONSTANCIA | 9 | R001 | PARCIAL |
| 7 | ARIAS ROJAS EDUARDO ALBERTO | POLICIA | POLICIA | 16 | R001 | CORRECTA |
| 8 | ARIAS ROJAS EDUARDO ALBERTO | PROCURADURIA | PROCURADURIA | 17 | R001,R002 | CORRECTA |
| 9 | ARIAS ROJAS EDUARDO ALBERTO | CONTRALORIA | CONTRALORIA | 18 | R001 | CORRECTA |
| 10 | ARIAS ROJAS EDUARDO ALBERTO | CEDULA | CEDULA | 14 | R001 | CORRECTA |
| 11 | ARIAS ROJAS EDUARDO ALBERTO | CONSTANCIA | CONSTANCIA | 21 | R001 | PARCIAL |
| 12 | ARIAS ROJAS EDUARDO ALBERTO | ACTO_ADMINISTRATIVO | ACTO_ADMINISTRATIVO | 22 | R001 | CORRECTA |
| 13 | MARMOLEJO CUMBE CARLOS ERNESTO | SOLICITUD | SOLICITUD | 26 | R001 | CORRECTA |
| 14 | MARMOLEJO CUMBE CARLOS ERNESTO | POLICIA | POLICIA | 31 | R001 | CORRECTA |
| 15 | MARMOLEJO CUMBE CARLOS ERNESTO | PROCURADURIA | PROCURADURIA | 32 | R001,R002 | CORRECTA |
| 16 | MARMOLEJO CUMBE CARLOS ERNESTO | CONTRALORIA | CONTRALORIA | 33 | R001 | CORRECTA |
| 17 | MARMOLEJO CUMBE CARLOS ERNESTO | CEDULA | CEDULA | 28 | R001 | CORRECTA |
| 18 | MARMOLEJO CUMBE CARLOS ERNESTO | CONSTANCIA | CONSTANCIA | 36 | R001 | PARCIAL |
| 19 | SUAREZ CALDERON JESUS LEONARDO | CEDULA_MILITAR | CEDULA_MILITAR | 44 | R001 | CORRECTA |
| 20 | SUAREZ CALDERON JESUS LEONARDO | POLICIA | POLICIA | 45 | R001 | CORRECTA |
| 21 | SUAREZ CALDERON JESUS LEONARDO | PROCURADURIA | PROCURADURIA | 46 | R001,R002 | CORRECTA |
| 22 | SUAREZ CALDERON JESUS LEONARDO | CONTRALORIA | CONTRALORIA | 47 | R001 | CORRECTA |
| 23 | CAÑON PINILLA JIDSELIN | CEDULA | CEDULA | 56 | R001 | CORRECTA |
| 24 | CAÑON PINILLA JIDSELIN | POLICIA | POLICIA | 58 | R001 | CORRECTA |
| 25 | CAÑON PINILLA JIDSELIN | PROCURADURIA | PROCURADURIA | 59 | R001,R002 | CORRECTA |
| 26 | CAÑON PINILLA JIDSELIN | CONTRALORIA | CONTRALORIA | 60 | R001 | CORRECTA |
| 27 | CAÑON PINILLA JIDSELIN | COMUNICACION_OFICIAL | COMUNICACION_OFICIAL | 61 | R001 | CORRECTA |
| 28 | GARCIA RENGIFO JHON JAIRO | POLICIA | POLICIA | 72 | R001 | CORRECTA |
| 29 | GARCIA RENGIFO JHON JAIRO | PROCURADURIA | PROCURADURIA | 73 | R001,R002 | CORRECTA |
| 30 | GARCIA RENGIFO JHON JAIRO | CONTRALORIA | CONTRALORIA | 74 | R001 | CORRECTA |
| 31 | GARCIA RENGIFO JHON JAIRO | CONSTANCIA | CONSTANCIA | 75 | R001 | PARCIAL |
| 32 | GARCIA RENGIFO JHON JAIRO | CEDULA_MILITAR | CEDULA_MILITAR | 70 | R001 | PARCIAL |
| 33 | GARCIA SAAVEDRA ALEXANDER | CEDULA_MILITAR | CEDULA_MILITAR | 89 | R001 | CORRECTA |
| 34 | GARCIA SAAVEDRA ALEXANDER | POLICIA | POLICIA | 90 | R001 | CORRECTA |
| 35 | GARCIA SAAVEDRA ALEXANDER | PROCURADURIA | PROCURADURIA | 91 | R001,R002 | CORRECTA |
| 36 | GARCIA SAAVEDRA ALEXANDER | CONTRALORIA | CONTRALORIA | 92 | R001 | CORRECTA |
| 37 | GARCIA SAAVEDRA ALEXANDER | COMUNICACION_OFICIAL | CONSTANCIA | 93 | R001 | CORRECTA |
| 38 | GARCIA SAAVEDRA ALEXANDER | CONSTANCIA | CONSTANCIA | 94 | R001 | PARCIAL |
| 39 | GOMEZ RODRIGUEZ DIEGO FERNANDO | CEDULA_MILITAR | CEDULA_MILITAR | 99 | R001 | CORRECTA |
| 40 | GOMEZ RODRIGUEZ DIEGO FERNANDO | POLICIA | POLICIA | 100 | R001 | CORRECTA |
| 41 | GOMEZ RODRIGUEZ DIEGO FERNANDO | PROCURADURIA | PROCURADURIA | 101 | R001,R002 | CORRECTA |
| 42 | GOMEZ RODRIGUEZ DIEGO FERNANDO | CONTRALORIA | CONTRALORIA | 102 | R001 | CORRECTA |
| 43 | GOMEZ RODRIGUEZ DIEGO FERNANDO | CEDULA | CONSTANCIA | 103 | R001 | INCORRECTA |
| 44 | LEAL GARCIA JESUS ARLEY | CEDULA | CEDULA | 110 | R001 | CORRECTA |
| 45 | LEAL GARCIA JESUS ARLEY | CEDULA_MILITAR | CEDULA_MILITAR | 111 | R001 | CORRECTA |
| 46 | LEAL GARCIA JESUS ARLEY | POLICIA | POLICIA | 112 | R001 | CORRECTA |
| 47 | LEAL GARCIA JESUS ARLEY | PROCURADURIA | PROCURADURIA | 113 | R001,R002 | CORRECTA |
| 48 | LEAL GARCIA JESUS ARLEY | CONTRALORIA | CONTRALORIA | 114 | R001 | CORRECTA |
| 49 | LEAL GARCIA JESUS ARLEY | CONSTANCIA | CONSTANCIA | 115 | R001 | PARCIAL |
| 50 | CABRERA MARTINEZ NORMAN IVAN | COMUNICACION_OFICIAL | COMUNICACION_OFICIAL | 116 | R001 | CORRECTA |
| 51 | LEAL GARCIA JESUS ARLEY | COMUNICACION_OFICIAL | COMUNICACION_OFICIAL | 116 | R001 | CORRECTA |
| 52 | LOPEZ ESCOBAR CAMPO ELIAS | SOLICITUD | SOLICITUD | 123 | R001 | CORRECTA |
| 53 | LOPEZ ESCOBAR CAMPO ELIAS | CEDULA | CEDULA | 124 | R001 | CORRECTA |
| 54 | LOPEZ ESCOBAR CAMPO ELIAS | POLICIA | POLICIA | 126 | R001 | CORRECTA |
| 55 | LOPEZ ESCOBAR CAMPO ELIAS | PROCURADURIA | PROCURADURIA | 127 | R001,R002 | CORRECTA |
| 56 | LOPEZ ESCOBAR CAMPO ELIAS | CONTRALORIA | CONTRALORIA | 128 | R001 | CORRECTA |
| 57 | LOPEZ ESCOBAR CAMPO ELIAS | CONSTANCIA | CONSTANCIA | 129 | R001 | PARCIAL |
| 58 | LOPEZ ESCOBAR CAMPO ELIAS | CEDULA | CONSTANCIA | 130 | R001 | INCORRECTA |
| 59 | MONTES MORA ALEXANDER | POLICIA | POLICIA | 140 | R001 | CORRECTA |
| 60 | MONTES MORA ALEXANDER | PROCURADURIA | PROCURADURIA | 141 | R001,R002 | CORRECTA |
| 61 | MONTES MORA ALEXANDER | CONTRALORIA | CONTRALORIA | 142 | R001 | CORRECTA |
| 62 | MONTES MORA ALEXANDER | CONSTANCIA | CONSTANCIA | 143 | R001 | PARCIAL |
| 63 | MONTES MORA ALEXANDER | CEDULA | CONSTANCIA | 144 | R001 | INCORRECTA |
| 64 | NUÑEZ CAPACHO ALEX FERNEY | SOLICITUD | SOLICITUD | 150 | R001 | CORRECTA |
| 65 | NUÑEZ CAPACHO ALEX FERNEY | CEDULA_MILITAR | CEDULA_MILITAR | 153 | R001 | CORRECTA |
| 66 | NUÑEZ CAPACHO ALEX FERNEY | POLICIA | POLICIA | 154 | R001 | CORRECTA |
| 67 | NUÑEZ CAPACHO ALEX FERNEY | PROCURADURIA | PROCURADURIA | 155 | R001,R002 | CORRECTA |
| 68 | NUÑEZ CAPACHO ALEX FERNEY | CONTRALORIA | CONTRALORIA | 156 | R001 | CORRECTA |
| 69 | NUÑEZ CAPACHO ALEX FERNEY | CEDULA | CONSTANCIA | 157 | R001 | INCORRECTA |
| 70 | NUÑEZ CAPACHO ALEX FERNEY | CONSTANCIA | CONSTANCIA | 159 | R001 | PARCIAL |
| 71 | ORTIZ PARRA OSCAR ANDRES | SOLICITUD | SOLICITUD | 161 | R001 | CORRECTA |
| 72 | ORTIZ PARRA OSCAR ANDRES | CEDULA | CEDULA | 163 | R001 | CORRECTA |
| 73 | ORTIZ PARRA OSCAR ANDRES | CEDULA_MILITAR | CEDULA_MILITAR | 164 | R001 | CORRECTA |
| 74 | ORTIZ PARRA OSCAR ANDRES | POLICIA | POLICIA | 165 | R001 | CORRECTA |
| 75 | ORTIZ PARRA OSCAR ANDRES | PROCURADURIA | PROCURADURIA | 166 | R001,R002 | CORRECTA |
| 76 | ORTIZ PARRA OSCAR ANDRES | CONTRALORIA | CONTRALORIA | 167 | R001 | CORRECTA |
| 77 | ORTIZ PARRA OSCAR ANDRES | CONSTANCIA | CONSTANCIA | 169 | R001 | PARCIAL |
| 78 | PORRAS PLATA LUIS ALEXANDER | POLICIA | POLICIA | 178 | R001 | CORRECTA |
| 79 | PORRAS PLATA LUIS ALEXANDER | PROCURADURIA | PROCURADURIA | 179 | R001,R002 | CORRECTA |
| 80 | PORRAS PLATA LUIS ALEXANDER | CONTRALORIA | CONTRALORIA | 180 | R001 | CORRECTA |
| 81 | PORRAS PLATA LUIS ALEXANDER | CONSTANCIA | CONSTANCIA | 181 | R001 | CORRECTA |
| 82 | PORRAS PLATA LUIS ALEXANDER | COMUNICACION_OFICIAL | COMUNICACION_OFICIAL | 183 | R001 | CORRECTA |
| 83 | TEJADA CACERES JOSE JULIAN | CEDULA | CEDULA | 194 | R001 | CORRECTA |
| 84 | TEJADA CACERES JOSE JULIAN | POLICIA | POLICIA | 196 | R001 | CORRECTA |
| 85 | TEJADA CACERES JOSE JULIAN | PROCURADURIA | PROCURADURIA | 197 | R001,R002 | CORRECTA |
| 86 | TEJADA CACERES JOSE JULIAN | CONTRALORIA | CONTRALORIA | 198 | R001 | CORRECTA |
| 87 | TEJADA CACERES JOSE JULIAN | COMUNICACION_OFICIAL | COMUNICACION_OFICIAL | 201 | R001 | CORRECTA |
| 88 | VILLAMIZAR PEREZ CONSTANZA | SOLICITUD | SOLICITUD | 205 | R001 | CORRECTA |
| 89 | VILLAMIZAR PEREZ CONSTANZA | CEDULA | CEDULA | 206 | R001 | CORRECTA |
| 90 | VILLAMIZAR PEREZ CONSTANZA | POLICIA | POLICIA | 208 | R001 | CORRECTA |
| 91 | VILLAMIZAR PEREZ CONSTANZA | PROCURADURIA | PROCURADURIA | 209 | R001,R002 | CORRECTA |
| 92 | VILLAMIZAR PEREZ CONSTANZA | CONTRALORIA | CONTRALORIA | 210 | R001 | CORRECTA |
| 93 | VILLAMIZAR PEREZ CONSTANZA | CONSTANCIA | CONSTANCIA | 213 | R001 | PARCIAL |
| 94 | AGUDELO ROJAS MANUEL DIONICIO | POLICIA | POLICIA | 224 | R001 | CORRECTA |
| 95 | AGUDELO ROJAS MANUEL DIONICIO | PROCURADURIA | PROCURADURIA | 226 | R001,R002 | CORRECTA |
| 96 | AGUDELO ROJAS MANUEL DIONICIO | CONTRALORIA | CONTRALORIA | 228 | R001 | CORRECTA |
| 97 | AGUDELO ROJAS MANUEL DIONICIO | CEDULA | CEDULA | 220 | R001 | CORRECTA |
| 98 | AGUDELO ROJAS MANUEL DIONICIO | COMUNICACION_OFICIAL | COMUNICACION_OFICIAL | 236 | R001 | CORRECTA |
| 99 | BURGOS SANDRO RAFAEL | POLICIA | POLICIA | 248 | R001 | CORRECTA |
| 100 | BURGOS SANDRO RAFAEL | PROCURADURIA | PROCURADURIA | 250 | R001,R002 | CORRECTA |
| 101 | BURGOS SANDRO RAFAEL | CONTRALORIA | CONTRALORIA | 252 | R001 | CORRECTA |
| 102 | BURGOS SANDRO RAFAEL | CEDULA_MILITAR | CEDULA_MILITAR | 246 | R001 | PARCIAL |
| 103 | BURGOS SANDRO RAFAEL | CONSTANCIA | CONSTANCIA | 256 | R001 | PARCIAL |
| 104 | CAMACHO GUZMAN JOHANN RODRIGO | POLICIA | POLICIA | 268 | R001 | CORRECTA |
| 105 | CAMACHO GUZMAN JOHANN RODRIGO | PROCURADURIA | PROCURADURIA | 270 | R001,R002 | CORRECTA |
| 106 | CAMACHO GUZMAN JOHANN RODRIGO | CONTRALORIA | CONTRALORIA | 272 | R001 | CORRECTA |
| 107 | CAMACHO GUZMAN JOHANN RODRIGO | CONSTANCIA | CONSTANCIA | 274 | R001 | CORRECTA |
| 108 | CAMACHO GUZMAN JOHANN RODRIGO | COMUNICACION_OFICIAL | COMUNICACION_OFICIAL | 276 | R001 | CORRECTA |
| 109 | CORREA VARGAS PAULO IVAN | POLICIA | POLICIA | 288 | R001 | CORRECTA |
| 110 | CORREA VARGAS PAULO IVAN | PROCURADURIA | PROCURADURIA | 290 | R001,R002 | CORRECTA |
| 111 | CORREA VARGAS PAULO IVAN | CONTRALORIA | CONTRALORIA | 292 | R001 | CORRECTA |
| 112 | CORREA VARGAS PAULO IVAN | CEDULA_MILITAR | CEDULA_MILITAR | 286 | R001 | PARCIAL |
| 113 | CORREA VARGAS PAULO IVAN | CONSTANCIA | CONSTANCIA | 296 | R001 | PARCIAL |
| 114 | PORRAS PLATA LUIS ALEXANDER | CEDULA_MILITAR | CEDULA_MILITAR | 177 | R001 | PARCIAL |

## 21. Anexo B — Detalle R002 por persona

| Persona | Cédula | Fecha certificado | Días (vs 2026-08-28) | Estado |
|---|---|---|---|---|
| GARCIA RENGIFO JHON JAIRO | 18008020 | 2026-07-01 | 58 | EVIDENCIA_INSUFICIENTE |
| VILLAMIZAR PEREZ CONSTANZA | 52412525 | 2026-07-01 | 58 | EVIDENCIA_INSUFICIENTE |
| CAÑON PINILLA JIDSELIN | 72192689 | 2026-07-01 | 58 | EVIDENCIA_INSUFICIENTE |
| CABRERA MARTINEZ NORMAN IVAN | 73161297 | 2026-07-01 | 58 | EVIDENCIA_INSUFICIENTE |
| LEAL GARCIA JESUS ARLEY | 73183461 | 2026-07-01 | 58 | EVIDENCIA_INSUFICIENTE |
| SUAREZ CALDERON JESUS LEONARDO | 73573626 | 2026-07-01 | 58 | EVIDENCIA_INSUFICIENTE |
| MARMOLEJO CUMBE CARLOS ERNESTO | 79553571 | 2026-07-01 | 58 | EVIDENCIA_INSUFICIENTE |
| ARIAS ROJAS EDUARDO ALBERTO | 79608355 | 2026-07-01 | 58 | EVIDENCIA_INSUFICIENTE |
| GARCIA SAAVEDRA ALEXANDER | 79645834 | 2026-07-01 | 58 | EVIDENCIA_INSUFICIENTE |
| ORTIZ PARRA OSCAR ANDRES | 79794765 | 2026-07-01 | 58 | EVIDENCIA_INSUFICIENTE |
| TEJADA CACERES JOSE JULIAN | 79938063 | 2026-07-01 | 58 | EVIDENCIA_INSUFICIENTE |
| AGUDELO ROJAS MANUEL DIONICIO | 80028026 | 2026-07-01 | 58 | EVIDENCIA_INSUFICIENTE |
| GOMEZ RODRIGUEZ DIEGO FERNANDO | 80055699 | 2026-07-01 | 58 | EVIDENCIA_INSUFICIENTE |
| CORREA VARGAS PAULO IVAN | 80180164 | 2026-07-01 | 58 | EVIDENCIA_INSUFICIENTE |
| CAMACHO GUZMAN JOHANN RODRIGO | 80240511 | 2026-07-01 | 58 | EVIDENCIA_INSUFICIENTE |
| BURGOS SANDRO RAFAEL | 88160526 | 2026-07-01 | 58 | EVIDENCIA_INSUFICIENTE |
| NUÑEZ CAPACHO ALEX FERNEY | 91487547 | 2026-07-01 | 58 | EVIDENCIA_INSUFICIENTE |
| PORRAS PLATA LUIS ALEXANDER | 91493470 | 2026-07-01 | 58 | EVIDENCIA_INSUFICIENTE |
| MONTES MORA ALEXANDER | 93130276 | 2026-07-01 | 58 | EVIDENCIA_INSUFICIENTE |
| LOPEZ ESCOBAR CAMPO ELIAS | 93394896 | 2026-07-01 | 58 | EVIDENCIA_INSUFICIENTE |

## 22. Veredicto final

| Concepto | Valor |
|---|---|
| Evidencias auditadas | 114 |
| Correctas | 93 |
| Parciales | 17 |
| Incorrectas | 4 |
| Mal asignadas | 0 |
| Hallazgos CRÍTICO | 3 |
| Hallazgos ALTO | 3 |
| Hallazgos MEDIO | 21 |
| Hallazgos BAJO | 0 |
| cambia_decision = SI | 3 |
| cambia_decision = NO | 24 |
| Personas afectadas | 15 |

**VEREDICTO FINAL: NO APROBADO**

### Justificación

El sistema contiene **errores reales que afectan decisiones (R001)** para dos personas (CABRERA y MONTES), cuya identificación no está soportada por evidencia válida en el PDF aunque figuran como CUMPLE. Un requisito de aprobación exige que todas las decisiones y resultados se soporten documentalmente; al existir CUMPLE sin soporte y evidencias tipificadas de forma incorrecta (4 constancias creadas como CÉDULA) y duplicados físicos, el entregable **no puede ser aprobado sin corrección sustantiva**. La corrección de R001 para CABRERA y MONTES (que pasarían a EVIDENCIA_INSUFICIENTE) mantiene el resultado global de las personas en no-aprobado, por lo que la decisión final de la convocatoria actual no cambiaría, pero la corrida como entregable auditable debe reprocesarse.

---
Generado automáticamente el 2026-08-28 por el módulo de verificación independiente (solo lectura). Entregables: este informe y `output/hallazgos_aceptacion_gemini.json`.