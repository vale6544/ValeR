"""
Generador de reporte PDF consolidado por cama y fecha.

Incluye: datos consolidados, comparativa por sección (lado A/B),
cosecha del día (con comparación proyectado vs real), y proyección
diaria completa de la cama.
"""

import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT

VERDE = colors.HexColor("#2d5a27")
VERDE_CLARO = colors.HexColor("#f0f4f0")
VERDE_MEDIO = colors.HexColor("#d1fae5")
ROSA = colors.HexColor("#ec4899")
MORADO = colors.HexColor("#a78bfa")
NARANJA = colors.HexColor("#f97316")

ETIQUETAS_BOTON = {
    "cosecha": "Cosecha", "estrella": "Estrella", "rayando": "Rayando color",
    "garbanzo": "Garbanzo", "alberja": "Alberja", "arroz": "Arroz", "sin_boton": "Sin botón"
}

TALLOS = ["tallo_largo", "tallo_medio", "tallo_corto"]
TALLOS_LABEL = {"tallo_largo": "Largo", "tallo_medio": "Medio", "tallo_corto": "Corto"}
BOTONES = ["cosecha", "estrella", "rayando", "garbanzo", "alberja", "arroz", "sin_boton"]


def _estilos():
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="TituloReporte", fontSize=18, textColor=VERDE,
                               fontName="Helvetica-Bold", spaceAfter=4, alignment=TA_LEFT))
    styles.add(ParagraphStyle(name="Subtitulo", fontSize=11, textColor=colors.HexColor("#666666"),
                               spaceAfter=14, alignment=TA_LEFT))
    styles.add(ParagraphStyle(name="SeccionTitulo", fontSize=14, textColor=VERDE,
                               fontName="Helvetica-Bold", spaceBefore=18, spaceAfter=8))
    styles.add(ParagraphStyle(name="Nota", fontSize=9, textColor=colors.HexColor("#999999"),
                               spaceAfter=6))
    return styles


def _tabla_matriz(datos: dict, titulo_estilo, styles):
    """Construye una tabla matriz tallo x botón a partir de un dict con campos tallo_X_boton."""
    encabezado = ["Tallo"] + [ETIQUETAS_BOTON[b] for b in BOTONES] + ["Total"]
    filas = [encabezado]

    total_por_boton = {b: 0 for b in BOTONES}
    gran_total = 0

    for t in TALLOS:
        fila = [TALLOS_LABEL[t]]
        total_fila = 0
        for b in BOTONES:
            val = datos.get(f"{t}_{b}", 0) or 0
            fila.append(str(val) if val > 0 else "—")
            total_por_boton[b] += val
            total_fila += val
        fila.append(str(total_fila))
        gran_total += total_fila
        filas.append(fila)

    fila_total = ["Total"] + [str(total_por_boton[b]) if total_por_boton[b] > 0 else "—" for b in BOTONES] + [str(gran_total)]
    filas.append(fila_total)

    tabla = Table(filas, repeatRows=1, hAlign="LEFT")
    tabla.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), VERDE),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("BACKGROUND", (0, -1), (-1, -1), VERDE_CLARO),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cccccc")),
        ("ALIGN", (1, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -2), [colors.white, VERDE_CLARO]),
    ]))
    return tabla


def generar_reporte_cama(
    cama_nombre: str,
    fecha_str: str,
    consolidado: dict,
    secciones: list,
    poda_del_dia: dict,
    comparacion_poda: dict,
    proyeccion: dict
) -> io.BytesIO:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter,
                             topMargin=1.5*cm, bottomMargin=1.5*cm,
                             leftMargin=1.5*cm, rightMargin=1.5*cm)
    styles = _estilos()
    story = []

    # Encabezado
    story.append(Paragraph(f"🌹 Reporte de Cultivo — {cama_nombre}", styles["TituloReporte"]))
    story.append(Paragraph(
        f"Fecha del reporte: {fecha_str} · Generado el {datetime.now().strftime('%d/%m/%Y %H:%M')}",
        styles["Subtitulo"]
    ))

    # ===== SECCIÓN 1 — Datos consolidados =====
    story.append(Paragraph("📊 Datos consolidados del día", styles["SeccionTitulo"]))
    if consolidado and consolidado.get("total_registros", 0) > 0:
        story.append(Paragraph(
            f"{consolidado.get('total_registros', 0)} registro(s) · Segmentos: {', '.join(consolidado.get('segmentos', []))}",
            styles["Nota"]
        ))
        story.append(_tabla_matriz(consolidado, styles["SeccionTitulo"], styles))
    else:
        story.append(Paragraph("No hay datos consolidados para esta fecha.", styles["Nota"]))

    # ===== SECCIÓN 2 — Comparativa por sección (lado A vs B) =====
    story.append(Paragraph("🔍 Comparativa por sección (Lado A vs Lado B)", styles["SeccionTitulo"]))
    if secciones:
        for sec in secciones:
            total_a = sec["lado_A"]["total_tallos"] if sec.get("lado_A") else 0
            total_b = sec["lado_B"]["total_tallos"] if sec.get("lado_B") else 0
            story.append(Paragraph(
                f"<b>Sección {sec['seccion']}</b> — Lado A: {total_a} tallos · Lado B: {total_b} tallos · Total: {total_a + total_b}",
                styles["Normal"]
            ))
            story.append(Spacer(1, 4))
    else:
        story.append(Paragraph("No hay datos por sección para esta fecha.", styles["Nota"]))

    story.append(PageBreak())

    # ===== SECCIÓN 3 — Cosecha del día =====
    story.append(Paragraph("Cosecha registrada", styles["SeccionTitulo"]))
    if poda_del_dia:
        filas = [
            ["Tallos largos", "Tallos medios", "Tallos cortos", "Total cosechado"],
            [str(poda_del_dia.get("tallos_largos", 0)),
             str(poda_del_dia.get("tallos_medios", 0)),
             str(poda_del_dia.get("tallos_cortos", 0)),
             str(poda_del_dia.get("total_podados", 0))]
        ]
        tabla_poda = Table(filas, hAlign="LEFT")
        tabla_poda.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), VERDE),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cccccc")),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("BACKGROUND", (0, 1), (-1, 1), VERDE_CLARO),
        ]))
        story.append(tabla_poda)
        if poda_del_dia.get("observaciones"):
            story.append(Paragraph(f"Observaciones: {poda_del_dia['observaciones']}", styles["Nota"]))

        if comparacion_poda:
            story.append(Spacer(1, 10))
            diferencia = poda_del_dia.get("total_podados", 0) - comparacion_poda.get("proyectado", 0)
            color_dif = "green" if abs(comparacion_poda.get("error_porcentual") or 0) <= 10 else \
                        "orange" if abs(comparacion_poda.get("error_porcentual") or 0) <= 30 else "red"
            story.append(Paragraph(
                f"<b>Comparación con proyección:</b> Proyectado {comparacion_poda.get('proyectado')} · "
                f"Real {poda_del_dia.get('total_podados', 0)} · "
                f"Diferencia: <font color='{color_dif}'>{'+' if diferencia >= 0 else ''}{diferencia} "
                f"({comparacion_poda.get('error_porcentual', '—')}%)</font>",
                styles["Normal"]
            ))
    else:
        story.append(Paragraph("No hay poda registrada para esta fecha.", styles["Nota"]))

    # ===== SECCIÓN 4 — Proyección por cama =====
    story.append(Paragraph("📅 Proyección diaria de cosecha", styles["SeccionTitulo"]))
    if proyeccion and proyeccion.get("dias"):
        ciclo = proyeccion.get("ciclo_actual", {})
        story.append(Paragraph(
            f"Ciclo aprendido (días hasta cosecha) — Arroz: {ciclo.get('arroz')} · "
            f"Alberja: {ciclo.get('alberja')} · Garbanzo: {ciclo.get('garbanzo')} · "
            f"Rayando: {ciclo.get('rayando')} · Estrella: {ciclo.get('estrella')}",
            styles["Nota"]
        ))

        filas_proy = [["Fecha", "Botones proyectados", "Origen (etapa actual)"]]
        for d in proyeccion["dias"]:
            if d["botones_proyectados"] > 0 or d["es_hoy"]:
                origen_txt = ", ".join(
                    f"{ETIQUETAS_BOTON.get(e, e)}: {c}" for e, c in d.get("origen_etapas", {}).items()
                ) or "—"
                filas_proy.append([d["fecha"] + (" (hoy)" if d["es_hoy"] else ""),
                                    str(d["botones_proyectados"]), origen_txt])

        tabla_proy = Table(filas_proy, repeatRows=1, hAlign="LEFT", colWidths=[5*cm, 4*cm, 8*cm])
        tabla_proy.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), VERDE),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cccccc")),
            ("ALIGN", (1, 0), (1, -1), "CENTER"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, VERDE_CLARO]),
        ]))
        story.append(tabla_proy)

        total_proyectado = sum(d["botones_proyectados"] for d in proyeccion["dias"])
        story.append(Spacer(1, 8))
        story.append(Paragraph(f"<b>Total proyectado en el rango:</b> {total_proyectado} botones", styles["Normal"]))
    else:
        story.append(Paragraph("No hay datos suficientes para proyectar esta cama.", styles["Nota"]))

    doc.build(story)
    buffer.seek(0)
    return buffer
