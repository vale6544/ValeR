"""
Motor de proyección diaria adaptativa por cama.

Cada cama tiene su propio ciclo de maduración estimado (en días) para cada
etapa hasta llegar a cosecha. Este ciclo se ajusta automáticamente comparando
lo proyectado para "hoy" (generado en un día anterior) contra la cosecha
real registrada en la tabla de podas.
"""

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app import models


ETAPAS_CAMPO = {
    "arroz": "dias_arroz_cosecha",
    "alberja": "dias_alberja_cosecha",
    "garbanzo": "dias_garbanzo_cosecha",
    "rayando": "dias_rayando_cosecha",
    "estrella": "dias_estrella_cosecha",
}

DEFAULTS = {
    "dias_arroz_cosecha": 35,
    "dias_alberja_cosecha": 28,
    "dias_garbanzo_cosecha": 21,
    "dias_rayando_cosecha": 14,
    "dias_estrella_cosecha": 7,
}


def obtener_o_crear_ciclo(db: Session, cama_id: int) -> models.CicloCama:
    ciclo = db.query(models.CicloCama).filter(models.CicloCama.cama_id == cama_id).first()
    if not ciclo:
        ciclo = models.CicloCama(cama_id=cama_id, **DEFAULTS)
        db.add(ciclo)
        db.commit()
        db.refresh(ciclo)
    return ciclo


def generar_proyeccion_diaria(db: Session, cama_id: int, dias_adelante: int = 14) -> dict:
    """
    Genera una proyección día por día (no semanal) usando el ciclo
    aprendido específico de la cama.

    IMPORTANTE: la proyección se calcula sobre la SUMA de todas las
    fotografías/secciones cargadas en el día más reciente con datos,
    no sobre un único registro aislado. Esto consolida toda la cama.
    """
    cama = db.query(models.Cama).filter(models.Cama.id == cama_id).first()
    if not cama:
        return {"cama_id": cama_id, "dias": [], "fecha_base": None}

    # Encontrar la fecha (día calendario) más reciente con registros válidos
    ultimo_registro = (
        db.query(models.Registro)
        .join(models.Metrica, models.Metrica.registro_id == models.Registro.id)
        .filter(models.Registro.cama_id == cama_id)
        .filter(models.Metrica.total_tallos > 0)
        .order_by(models.Registro.fecha.desc())
        .first()
    )

    if not ultimo_registro:
        return {"cama_id": cama_id, "cama_nombre": cama.nombre, "dias": [], "fecha_base": None}

    fecha_base = ultimo_registro.fecha
    dia_inicio = fecha_base.replace(hour=0, minute=0, second=0, microsecond=0)
    dia_fin = fecha_base.replace(hour=23, minute=59, second=59, microsecond=999999)

    # Sumar TODOS los registros (todas las secciones/lados) de ese día calendario
    registros_del_dia = (
        db.query(models.Registro, models.Metrica)
        .join(models.Metrica, models.Metrica.registro_id == models.Registro.id)
        .filter(models.Registro.cama_id == cama_id)
        .filter(models.Registro.fecha >= dia_inicio)
        .filter(models.Registro.fecha <= dia_fin)
        .filter(models.Metrica.total_tallos > 0)
        .all()
    )

    ciclo = obtener_o_crear_ciclo(db, cama_id)

    # Botones consolidados de TODA la cama ese día (sumando todas las secciones)
    cantidad_por_etapa = {
        "cosecha": 0, "estrella": 0, "rayando": 0,
        "garbanzo": 0, "alberja": 0, "arroz": 0,
    }
    secciones_incluidas = []

    for registro, metrica in registros_del_dia:
        cantidad_por_etapa["cosecha"] += metrica.boton_cosecha or 0
        cantidad_por_etapa["estrella"] += metrica.boton_estrella or 0
        cantidad_por_etapa["rayando"] += metrica.boton_rayando_color or 0
        cantidad_por_etapa["garbanzo"] += metrica.boton_garbanzo or 0
        cantidad_por_etapa["alberja"] += metrica.boton_alberja or 0
        cantidad_por_etapa["arroz"] += metrica.boton_arroz or 0
        etiqueta_seccion = f"{registro.segmento or 'S/N'}-{registro.lado or '-'}"
        if etiqueta_seccion not in secciones_incluidas:
            secciones_incluidas.append(etiqueta_seccion)

    dias_para_cosecha = {
        "cosecha": 0,
        "estrella": ciclo.dias_estrella_cosecha,
        "rayando": ciclo.dias_rayando_cosecha,
        "garbanzo": ciclo.dias_garbanzo_cosecha,
        "alberja": ciclo.dias_alberja_cosecha,
        "arroz": ciclo.dias_arroz_cosecha,
    }


    # Para cada etapa, calculamos el día EXACTO (entero) en que está
    # previsto que llegue a cosecha. Cada etapa tiene su propio día,
    # independiente de las demás (arroz=35, alberja=28, garbanzo=21,
    # rayando=14, estrella=7, cosecha=0 por defecto, y se ajustan
    # individualmente con el aprendizaje de cada cama).
    dia_estimado_por_etapa = {
        etapa: max(0, round(dias_restantes))
        for etapa, dias_restantes in dias_para_cosecha.items()
    }

    dias = []
    for offset in range(dias_adelante + 1):
        fecha_dia = fecha_base + timedelta(days=offset)
        cosecha_dia = 0
        origen = {}

        for etapa, dia_estimado in dia_estimado_por_etapa.items():
            if dia_estimado == offset:
                cantidad = cantidad_por_etapa[etapa]
                if cantidad > 0:
                    cosecha_dia += cantidad
                    origen[etapa] = cantidad

        dias.append({
            "offset": offset,
            "fecha": fecha_dia.strftime("%d/%m/%Y"),
            "fecha_iso": fecha_dia.strftime("%Y-%m-%d"),
            "botones_proyectados": cosecha_dia,
            "origen_etapas": origen,
            "es_hoy": offset == 0
        })

    return {
        "cama_id": cama_id,
        "cama_nombre": cama.nombre,
        "fecha_base": fecha_base.strftime("%d/%m/%Y %H:%M"),
        "dia_consolidado": dia_inicio.strftime("%d/%m/%Y"),
        "secciones_incluidas": secciones_incluidas,
        "total_registros_consolidados": len(registros_del_dia),
        "botones_actuales_por_etapa": cantidad_por_etapa,
        "ciclo_actual": {
            "arroz": round(ciclo.dias_arroz_cosecha, 1),
            "alberja": round(ciclo.dias_alberja_cosecha, 1),
            "garbanzo": round(ciclo.dias_garbanzo_cosecha, 1),
            "rayando": round(ciclo.dias_rayando_cosecha, 1),
            "estrella": round(ciclo.dias_estrella_cosecha, 1),
        },
        "ultima_actualizacion_ciclo": ciclo.ultima_actualizacion.strftime("%d/%m/%Y %H:%M"),
        "dias": dias
    }


def registrar_proyeccion_de_hoy(db: Session, cama_id: int):
    """
    Guarda en historial_proyeccion cuánto se proyectó para 'mañana' (offset=1)
    en el momento actual. Esto permite comparar al día siguiente contra la
    cosecha real.
    """
    proyeccion = generar_proyeccion_diaria(db, cama_id, dias_adelante=1)
    if not proyeccion["dias"]:
        return

    dia_mañana = proyeccion["dias"][1] if len(proyeccion["dias"]) > 1 else None
    if not dia_mañana:
        return

    fecha_proyectada = datetime.strptime(dia_mañana["fecha_iso"], "%Y-%m-%d")

    # Evitar duplicar si ya existe una proyección no comparada para esa fecha
    existente = (
        db.query(models.HistorialProyeccion)
        .filter(models.HistorialProyeccion.cama_id == cama_id)
        .filter(models.HistorialProyeccion.fecha_proyectada == fecha_proyectada)
        .filter(models.HistorialProyeccion.comparado == False)
        .first()
    )
    if existente:
        existente.botones_proyectados = dia_mañana["botones_proyectados"]
        existente.fecha_generacion = datetime.utcnow()
    else:
        nuevo = models.HistorialProyeccion(
            cama_id=cama_id,
            fecha_proyectada=fecha_proyectada,
            botones_proyectados=dia_mañana["botones_proyectados"]
        )
        db.add(nuevo)
    db.commit()


def comparar_y_ajustar(db: Session, cama_id: int, fecha_cosecha: datetime, total_cosechado: int):
    """
    Busca si existe una proyección pendiente para esta fecha y cama.
    Si existe, compara contra lo cosechado real y ajusta el ciclo
    de la cama proporcionalmente al error detectado.
    """
    fecha_dia = fecha_cosecha.replace(hour=0, minute=0, second=0, microsecond=0)

    pendiente = (
        db.query(models.HistorialProyeccion)
        .filter(models.HistorialProyeccion.cama_id == cama_id)
        .filter(models.HistorialProyeccion.fecha_proyectada == fecha_dia)
        .filter(models.HistorialProyeccion.comparado == False)
        .first()
    )

    if not pendiente:
        return None

    pendiente.botones_cosechados_real = total_cosechado
    pendiente.comparado = True
    db.commit()

    proyectado = pendiente.botones_proyectados or 0
    real = total_cosechado

    if proyectado == 0 and real == 0:
        return {"ajuste_aplicado": False, "motivo": "sin_datos"}

    ciclo = obtener_o_crear_ciclo(db, cama_id)

    # Si se cosechó más de lo proyectado, las etapas están maturando más
    # rápido de lo esperado -> reducir días. Si se cosechó menos, alargar.
    if proyectado > 0:
        ratio = real / proyectado
    else:
        ratio = 1.5 if real > 0 else 1.0  # hubo cosecha sorpresa, acelerar ciclo

    # Factor de ajuste conservador: nos movemos solo una fracción del error
    # para evitar oscilaciones bruscas con un solo dato.
    factor_aprendizaje = 0.15
    ajuste = 1 - (ratio - 1) * factor_aprendizaje
    ajuste = max(0.85, min(1.15, ajuste))  # limitar el cambio por ciclo a +/-15%

    ciclo.dias_arroz_cosecha = max(1, ciclo.dias_arroz_cosecha * ajuste)
    ciclo.dias_alberja_cosecha = max(1, ciclo.dias_alberja_cosecha * ajuste)
    ciclo.dias_garbanzo_cosecha = max(1, ciclo.dias_garbanzo_cosecha * ajuste)
    ciclo.dias_rayando_cosecha = max(1, ciclo.dias_rayando_cosecha * ajuste)
    ciclo.dias_estrella_cosecha = max(1, ciclo.dias_estrella_cosecha * ajuste)
    ciclo.ultima_actualizacion = datetime.utcnow()
    db.commit()

    return {
        "ajuste_aplicado": True,
        "proyectado": proyectado,
        "real": real,
        "ratio": round(ratio, 3),
        "factor_ajuste": round(ajuste, 3)
    }


def historial_precision(db: Session, cama_id: int, limite: int = 30) -> list:
    """Retorna las últimas comparaciones proyección vs realidad para una cama."""
    registros = (
        db.query(models.HistorialProyeccion)
        .filter(models.HistorialProyeccion.cama_id == cama_id)
        .filter(models.HistorialProyeccion.comparado == True)
        .order_by(models.HistorialProyeccion.fecha_proyectada.desc())
        .limit(limite)
        .all()
    )
    resultado = []
    for r in registros:
        error_abs = abs((r.botones_cosechados_real or 0) - r.botones_proyectados)
        error_pct = (error_abs / r.botones_proyectados * 100) if r.botones_proyectados > 0 else None
        resultado.append({
            "fecha": r.fecha_proyectada.strftime("%d/%m/%Y"),
            "proyectado": r.botones_proyectados,
            "real": r.botones_cosechados_real,
            "error_absoluto": error_abs,
            "error_porcentual": round(error_pct, 1) if error_pct is not None else None
        })
    return resultado
