from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app import analisis
from app.database import engine, Base, get_db
from app import models
from pydantic import BaseModel
from typing import Optional
from app import analisis, clasificador
import shutil
import os
import json
from datetime import datetime
from app import proyeccion_diaria
from app import reporte_pdf
from fastapi.responses import StreamingResponse
from app import video_extractor

app = FastAPI(title="Rosas Monitor")
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    # allow_origins=[
    #     "http://localhost:5173",
    #     "http://localhost:8081",
    #     "http://127.0.0.1:8081",
    #     "http://192.168.137.1:8081", 
    #     "http://192.168.137.1:5173"
    # ],
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],

)

Base.metadata.create_all(bind=engine)

CARPETA_FOTOGRAMAS = os.path.join(os.path.dirname(__file__), "app", "fotogramas_temp")

CARPETA_IMAGENES = "app/imagenes"


# --- Esquemas ---

class CamaCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    variedad: Optional[str] = None
    filas_por_cama: int = 1
    largo: Optional[float] = None
    ancho: Optional[float] = None
    responsable: Optional[str] = None

class MetricaCreate(BaseModel):
    registro_id: int
    etapa_crecimiento: Optional[str] = None
    tallos_cortos: int = 0
    tallos_medios: int = 0
    tallos_largos: int = 0
    score_confianza: Optional[float] = None


# --- Camas ---

@app.post("/camas/")
def crear_cama(cama: CamaCreate, db: Session = Depends(get_db)):
    nueva = models.Cama(nombre=cama.nombre, descripcion=cama.descripcion, variedad=cama.variedad, filas_por_cama=cama.filas_por_cama)
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva

@app.get("/camas/")
def listar_camas(db: Session = Depends(get_db)):
    return db.query(models.Cama).all()


# --- Carga de imagen y análisis automático ---

@app.post("/registros/cargar-imagen/")
def cargar_imagen(
    cama_id: int = Form(...),
    observaciones: Optional[str] = Form(None),
    segmento: Optional[str] = Form(None),
    imagen: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Verificar que la cama existe
    cama = db.query(models.Cama).filter(models.Cama.id == cama_id).first()
    if not cama:
        raise HTTPException(status_code=404, detail="Cama no encontrada")

    # Guardar la imagen en disco
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    nombre_original = os.path.basename(imagen.filename)
    nombre_archivo = f"cama{cama_id}_{timestamp}.jpeg"
    ruta = os.path.join(CARPETA_IMAGENES, nombre_archivo)

    with open(ruta, "wb") as buffer:
        shutil.copyfileobj(imagen.file, buffer)

    # Crear el registro en la base de datos
    nuevo_registro = models.Registro(
        cama_id=cama_id,
        ruta_imagen=ruta,
        observaciones=observaciones,
        segmento=segmento
    )
    db.add(nuevo_registro)
    db.commit()
    db.refresh(nuevo_registro)

# Análisis por color (altura de tallos)
    resultado = analisis.analizar_imagen(ruta)

    # Análisis combinado tallo + botón con Claude Vision
    botones = clasificador.clasificar_con_fallback(
        ruta,
        lado="A",
        filas=cama.filas_por_cama or 1,
        variedad=cama.variedad
    )

    # Guardar las métricas combinadas
    nueva_metrica = models.Metrica(
        registro_id=nuevo_registro.id,

        # Análisis por color (compatibilidad)
        etapa_crecimiento=resultado["etapa_crecimiento"],
        tallos_cortos=resultado["tallos_cortos"],
        tallos_medios=resultado["tallos_medios"],
        tallos_largos=resultado["tallos_largos"],
        total_tallos=botones.get("total_tallos", resultado["total_tallos"]),
        score_confianza=resultado["score_confianza"],

        # Totales por tipo de botón
        boton_arroz=botones.get("total_arroz", 0),
        boton_alberja=botones.get("total_alberja", 0),
        boton_garbanzo=botones.get("total_garbanzo", 0),
        boton_rayando_color=botones.get("total_rayando_color", 0),
        boton_estrella=botones.get("total_estrella", 0),
        boton_cosecha=botones.get("total_cosecha", 0),
        etapa_dominante=botones.get("etapa_dominante"),
        total_botones=botones.get("total_con_boton", 0),

        # Detección combinada tallo largo + botón
        tallo_largo_cosecha=botones.get("tallo_largo_cosecha", 0),
        tallo_largo_estrella=botones.get("tallo_largo_estrella", 0),
        tallo_largo_rayando=botones.get("tallo_largo_rayando_color", 0),
        tallo_largo_garbanzo=botones.get("tallo_largo_garbanzo", 0),
        tallo_largo_alberja=botones.get("tallo_largo_alberja", 0),
        tallo_largo_arroz=botones.get("tallo_largo_arroz", 0),
        tallo_largo_sin_boton=botones.get("tallo_largo_sin_boton", 0),

        # Detección combinada tallo medio + botón
        tallo_medio_cosecha=botones.get("tallo_medio_cosecha", 0),
        tallo_medio_estrella=botones.get("tallo_medio_estrella", 0),
        tallo_medio_rayando=botones.get("tallo_medio_rayando_color", 0),
        tallo_medio_garbanzo=botones.get("tallo_medio_garbanzo", 0),
        tallo_medio_alberja=botones.get("tallo_medio_alberja", 0),
        tallo_medio_arroz=botones.get("tallo_medio_arroz", 0),
        tallo_medio_sin_boton=botones.get("tallo_medio_sin_boton", 0),

        # Detección combinada tallo corto + botón
        tallo_corto_cosecha=botones.get("tallo_corto_cosecha", 0),
        tallo_corto_estrella=botones.get("tallo_corto_estrella", 0),
        tallo_corto_rayando=botones.get("tallo_corto_rayando_color", 0),
        tallo_corto_garbanzo=botones.get("tallo_corto_garbanzo", 0),
        tallo_corto_alberja=botones.get("tallo_corto_alberja", 0),
        tallo_corto_arroz=botones.get("tallo_corto_arroz", 0),
        tallo_corto_sin_boton=botones.get("tallo_corto_sin_boton", 0),

        detalle_tallos_json=json.dumps(botones.get("detalle", {})),
        matriz_botones_tallos=json.dumps(botones.get("detalle", {}))
    )
    db.add(nueva_metrica)
    db.commit()

    return {
        "mensaje": "Imagen cargada y analizada correctamente",
        "registro_id": nuevo_registro.id,
        "cama": cama.nombre,
        "ruta_imagen": ruta,
        "analisis": botones
    }

@app.post("/registros/cargar-imagen-doble/")
def cargar_imagen_doble(
    cama_id: int = Form(...),
    segmento: Optional[str] = Form(None),
    observaciones: Optional[str] = Form(None),
    imagen_a: UploadFile = File(...),
    imagen_b: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    cama = db.query(models.Cama).filter(models.Cama.id == cama_id).first()
    if not cama:
        raise HTTPException(status_code=404, detail="Cama no encontrada")

    resultados = {}

    for lado, archivo in [("A", imagen_a), ("B", imagen_b)]:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        nombre_archivo = f"cama{cama_id}_lado{lado}_{timestamp}.jpeg"
        ruta = os.path.join(CARPETA_IMAGENES, nombre_archivo)

        with open(ruta, "wb") as buffer:
            shutil.copyfileobj(archivo.file, buffer)

        nuevo_registro = models.Registro(
            cama_id=cama_id,
            ruta_imagen=ruta,
            observaciones=observaciones,
            segmento=segmento,
            lado=lado
        )
        db.add(nuevo_registro)
        db.commit()
        db.refresh(nuevo_registro)

        analisis_color = analisis.analizar_imagen(ruta)
        botones = clasificador.clasificar_con_fallback(
            ruta,
            lado=lado,
            filas=cama.filas_por_cama or 1,
            variedad=cama.variedad
        )
        nueva_metrica = models.Metrica(
            registro_id=nuevo_registro.id,
            etapa_crecimiento=analisis_color["etapa_crecimiento"],
            tallos_cortos=analisis_color["tallos_cortos"],
            tallos_medios=analisis_color["tallos_medios"],
            tallos_largos=analisis_color["tallos_largos"],
            total_tallos=botones.get("total_tallos", analisis_color["total_tallos"]),
            score_confianza=analisis_color["score_confianza"],
            boton_arroz=botones.get("total_arroz", 0),
            boton_alberja=botones.get("total_alberja", 0),
            boton_garbanzo=botones.get("total_garbanzo", 0),
            boton_rayando_color=botones.get("total_rayando_color", 0),
            boton_estrella=botones.get("total_estrella", 0),
            boton_cosecha=botones.get("total_cosecha", 0),
            etapa_dominante=botones.get("etapa_dominante"),
            total_botones=botones.get("total_con_boton", 0),
            tallo_largo_cosecha=botones.get("tallo_largo_cosecha", 0),
            tallo_largo_estrella=botones.get("tallo_largo_estrella", 0),
            tallo_largo_rayando=botones.get("tallo_largo_rayando_color", 0),
            tallo_largo_garbanzo=botones.get("tallo_largo_garbanzo", 0),
            tallo_largo_alberja=botones.get("tallo_largo_alberja", 0),
            tallo_largo_arroz=botones.get("tallo_largo_arroz", 0),
            tallo_largo_sin_boton=botones.get("tallo_largo_sin_boton", 0),
            tallo_medio_cosecha=botones.get("tallo_medio_cosecha", 0),
            tallo_medio_estrella=botones.get("tallo_medio_estrella", 0),
            tallo_medio_rayando=botones.get("tallo_medio_rayando_color", 0),
            tallo_medio_garbanzo=botones.get("tallo_medio_garbanzo", 0),
            tallo_medio_alberja=botones.get("tallo_medio_alberja", 0),
            tallo_medio_arroz=botones.get("tallo_medio_arroz", 0),
            tallo_medio_sin_boton=botones.get("tallo_medio_sin_boton", 0),
            tallo_corto_cosecha=botones.get("tallo_corto_cosecha", 0),
            tallo_corto_estrella=botones.get("tallo_corto_estrella", 0),
            tallo_corto_rayando=botones.get("tallo_corto_rayando_color", 0),
            tallo_corto_garbanzo=botones.get("tallo_corto_garbanzo", 0),
            tallo_corto_alberja=botones.get("tallo_corto_alberja", 0),
            tallo_corto_arroz=botones.get("tallo_corto_arroz", 0),
            tallo_corto_sin_boton=botones.get("tallo_corto_sin_boton", 0),
            detalle_tallos_json=json.dumps(botones.get("detalle", {})),
            matriz_botones_tallos=json.dumps(botones.get("detalle", {}))
        )
        db.add(nueva_metrica)
        db.commit()

        resultados[lado] = {
            "registro_id": nuevo_registro.id,
            "total_tallos": botones.get("total_tallos", 0),
            "total_botones": botones.get("total_con_boton", 0),
            "etapa_dominante": botones.get("etapa_dominante")
        }

    return {
        "mensaje": "Ambas fotografías cargadas y analizadas correctamente",
        "cama": cama.nombre,
        "segmento": segmento,
        "lado_A": resultados["A"],
        "lado_B": resultados["B"]
    }

@app.get("/registros/")
def listar_registros(db: Session = Depends(get_db)):
    return db.query(models.Registro).all()

@app.get("/metricas/")
def listar_metricas(db: Session = Depends(get_db)):
    return db.query(models.Metrica).all()

from sqlalchemy import func

@app.get("/reportes/resumen-cama/{cama_id}")
def resumen_cama(cama_id: int, db: Session = Depends(get_db)):
    from collections import defaultdict

    cama = db.query(models.Cama).filter(models.Cama.id == cama_id).first()
    if not cama:
        raise HTTPException(status_code=404, detail="Cama no encontrada")

    registros = (
        db.query(models.Registro, models.Metrica)
        .join(models.Metrica, models.Metrica.registro_id == models.Registro.id)
        .filter(models.Registro.cama_id == cama_id)
        .order_by(models.Registro.fecha)
        .all()
    )

    # Registros individuales
    historial = []
    for registro, metrica in registros:
        if metrica.etapa_crecimiento == "error_analisis" or metrica.total_tallos == 0:
            continue
        historial.append({
            "id":                  registro.id,
            "fecha":               registro.fecha.strftime("%d/%m/%Y %H:%M"),
            "fecha_dia":           registro.fecha.strftime("%d/%m/%Y"),
            "segmento":            registro.segmento or "Sin segmento",
            "etapa_crecimiento":   metrica.etapa_crecimiento,
            "etapa_dominante":     metrica.etapa_dominante,
            "tallos_cortos":       metrica.tallos_cortos or 0,
            "tallos_medios":       metrica.tallos_medios or 0,
            "tallos_largos":       metrica.tallos_largos or 0,
            "total_tallos":        metrica.total_tallos or 0,
            "score_confianza":     metrica.score_confianza or 0,
            "boton_arroz":         metrica.boton_arroz or 0,
            "boton_alberja":       metrica.boton_alberja or 0,
            "boton_garbanzo":      metrica.boton_garbanzo or 0,
            "boton_rayando_color": metrica.boton_rayando_color or 0,
            "boton_estrella":      metrica.boton_estrella or 0,
            "boton_cosecha":       metrica.boton_cosecha or 0,
            "total_botones":       metrica.total_botones or 0,
            "matriz": json.loads(metrica.matriz_botones_tallos) if metrica.matriz_botones_tallos else {},
            "tallo_largo_cosecha":   metrica.tallo_largo_cosecha or 0,
            "tallo_largo_estrella":  metrica.tallo_largo_estrella or 0,
            "tallo_largo_rayando":   metrica.tallo_largo_rayando or 0,
            "tallo_largo_garbanzo":  metrica.tallo_largo_garbanzo or 0,
            "tallo_largo_alberja":   metrica.tallo_largo_alberja or 0,
            "tallo_largo_arroz":     metrica.tallo_largo_arroz or 0,
            "tallo_largo_sin_boton": metrica.tallo_largo_sin_boton or 0,
            "tallo_medio_cosecha":   metrica.tallo_medio_cosecha or 0,
            "tallo_medio_estrella":  metrica.tallo_medio_estrella or 0,
            "tallo_medio_rayando":   metrica.tallo_medio_rayando or 0,
            "tallo_medio_garbanzo":  metrica.tallo_medio_garbanzo or 0,
            "tallo_medio_alberja":   metrica.tallo_medio_alberja or 0,
            "tallo_medio_arroz":     metrica.tallo_medio_arroz or 0,
            "tallo_medio_sin_boton": metrica.tallo_medio_sin_boton or 0,
            "tallo_corto_cosecha":   metrica.tallo_corto_cosecha or 0,
            "tallo_corto_estrella":  metrica.tallo_corto_estrella or 0,
            "tallo_corto_rayando":   metrica.tallo_corto_rayando or 0,
            "tallo_corto_garbanzo":  metrica.tallo_corto_garbanzo or 0,
            "tallo_corto_alberja":   metrica.tallo_corto_alberja or 0,
            "tallo_corto_arroz":     metrica.tallo_corto_arroz or 0,
            "tallo_corto_sin_boton": metrica.tallo_corto_sin_boton or 0,
        })

    # Agrupado por día
    por_dia = defaultdict(lambda: {
        "tallos_cortos": 0, "tallos_medios": 0, "tallos_largos": 0, "total_tallos": 0,
        "boton_arroz": 0, "boton_alberja": 0, "boton_garbanzo": 0,
        "boton_rayando_color": 0, "boton_estrella": 0, "boton_cosecha": 0,
        "total_botones": 0, "segmentos": [], "fotos": 0,
        "tallo_largo_cosecha": 0, "tallo_largo_estrella": 0, "tallo_largo_rayando": 0,
        "tallo_largo_garbanzo": 0, "tallo_largo_alberja": 0, "tallo_largo_arroz": 0,
        "tallo_largo_sin_boton": 0, "tallo_medio_cosecha": 0, "tallo_medio_estrella": 0,
        "tallo_medio_rayando": 0, "tallo_medio_garbanzo": 0, "tallo_medio_alberja": 0,
        "tallo_medio_arroz": 0, "tallo_medio_sin_boton": 0, "tallo_corto_cosecha": 0,
        "tallo_corto_estrella": 0, "tallo_corto_rayando": 0, "tallo_corto_garbanzo": 0,
        "tallo_corto_alberja": 0, "tallo_corto_arroz": 0, "tallo_corto_sin_boton": 0,
    })

    for h in historial:
        d = por_dia[h["fecha_dia"]]
        for campo in ["tallos_cortos","tallos_medios","tallos_largos","total_tallos",
                      "boton_arroz","boton_alberja","boton_garbanzo","boton_rayando_color",
                      "boton_estrella","boton_cosecha","total_botones",
                      "tallo_largo_cosecha","tallo_largo_estrella","tallo_largo_rayando",
                      "tallo_largo_garbanzo","tallo_largo_alberja","tallo_largo_arroz",
                      "tallo_largo_sin_boton","tallo_medio_cosecha","tallo_medio_estrella",
                      "tallo_medio_rayando","tallo_medio_garbanzo","tallo_medio_alberja",
                      "tallo_medio_arroz","tallo_medio_sin_boton","tallo_corto_cosecha",
                      "tallo_corto_estrella","tallo_corto_rayando","tallo_corto_garbanzo",
                      "tallo_corto_alberja","tallo_corto_arroz","tallo_corto_sin_boton"]:
            d[campo] += h.get(campo, 0)
        d["fotos"] += 1
        if h["segmento"] not in d["segmentos"]:
            d["segmentos"].append(h["segmento"])

    historial_dia = []
    for fecha, datos in por_dia.items():
        historial_dia.append({
            "fecha":   fecha,
            "fotos":   datos["fotos"],
            "segmentos": datos["segmentos"],
            "tallos_cortos":       datos["tallos_cortos"],
            "tallos_medios":       datos["tallos_medios"],
            "tallos_largos":       datos["tallos_largos"],
            "total_tallos":        datos["total_tallos"],
            "boton_arroz":         datos["boton_arroz"],
            "boton_alberja":       datos["boton_alberja"],
            "boton_garbanzo":      datos["boton_garbanzo"],
            "boton_rayando_color": datos["boton_rayando_color"],
            "boton_estrella":      datos["boton_estrella"],
            "boton_cosecha":       datos["boton_cosecha"],
            "total_botones":       datos["total_botones"],
            "tallo_largo_cosecha":   datos["tallo_largo_cosecha"],
            "tallo_largo_estrella":  datos["tallo_largo_estrella"],
            "tallo_largo_rayando":   datos["tallo_largo_rayando"],
            "tallo_largo_garbanzo":  datos["tallo_largo_garbanzo"],
            "tallo_largo_alberja":   datos["tallo_largo_alberja"],
            "tallo_largo_arroz":     datos["tallo_largo_arroz"],
            "tallo_largo_sin_boton": datos["tallo_largo_sin_boton"],
            "tallo_medio_cosecha":   datos["tallo_medio_cosecha"],
            "tallo_medio_estrella":  datos["tallo_medio_estrella"],
            "tallo_medio_rayando":   datos["tallo_medio_rayando"],
            "tallo_medio_garbanzo":  datos["tallo_medio_garbanzo"],
            "tallo_medio_alberja":   datos["tallo_medio_alberja"],
            "tallo_medio_arroz":     datos["tallo_medio_arroz"],
            "tallo_medio_sin_boton": datos["tallo_medio_sin_boton"],
            "tallo_corto_cosecha":   datos["tallo_corto_cosecha"],
            "tallo_corto_estrella":  datos["tallo_corto_estrella"],
            "tallo_corto_rayando":   datos["tallo_corto_rayando"],
            "tallo_corto_garbanzo":  datos["tallo_corto_garbanzo"],
            "tallo_corto_alberja":   datos["tallo_corto_alberja"],
            "tallo_corto_arroz":     datos["tallo_corto_arroz"],
            "tallo_corto_sin_boton": datos["tallo_corto_sin_boton"],
        })

    return {
        "cama_id": cama_id,
        "cama_nombre": cama.nombre,
        "total_registros": len(historial),
        "historial": historial,
        "historial_dia": historial_dia
    }

@app.get("/reportes/todas-las-camas")
def resumen_todas(db: Session = Depends(get_db)):
    camas = db.query(models.Cama).all()
    resultado = []

    for cama in camas:
        ultimo = (
            db.query(models.Registro, models.Metrica)
            .join(models.Metrica, models.Metrica.registro_id == models.Registro.id)
            .filter(models.Registro.cama_id == cama.id)
            .order_by(models.Registro.fecha.desc())
            .first()
        )

        if ultimo:
            registro, metrica = ultimo
            resultado.append({
                "cama_id": cama.id,
                "cama_nombre": cama.nombre,
                "ultimo_registro": registro.fecha.strftime("%Y-%m-%d %H:%M"),
                "etapa_crecimiento": metrica.etapa_crecimiento,
                "total_tallos": metrica.total_tallos,
                "tallos_cortos": metrica.tallos_cortos,
                "tallos_medios": metrica.tallos_medios,
                "tallos_largos": metrica.tallos_largos,
            })
        else:
            resultado.append({
                "cama_id": cama.id,
                "cama_nombre": cama.nombre,
                "ultimo_registro": None,
                "etapa_crecimiento": None,
                "total_tallos": 0,
                "tallos_cortos": 0,
                "tallos_medios": 0,
                "tallos_largos": 0,
            })

    return resultado

from datetime import timedelta

@app.get("/reportes/proyeccion/{cama_id}")
def proyeccion_cosecha(cama_id: int, db: Session = Depends(get_db)):
    cama = db.query(models.Cama).filter(models.Cama.id == cama_id).first()
    if not cama:
        raise HTTPException(status_code=404, detail="Cama no encontrada")

    ultimo = (
        db.query(models.Registro, models.Metrica)
        .join(models.Metrica, models.Metrica.registro_id == models.Registro.id)
        .filter(models.Registro.cama_id == cama_id)
        .filter(models.Metrica.total_tallos > 0)
        .order_by(models.Registro.fecha.desc())
        .first()
    )

    if not ultimo:
        return {"cama_id": cama_id, "cama_nombre": cama.nombre, "semanas": [], "fecha_base": None}

    registro, metrica = ultimo
    fecha_base = registro.fecha

    # Obtener estadísticas reales de poda
    podas = (
        db.query(models.Poda)
        .filter(models.Poda.cama_id == cama_id)
        .order_by(models.Poda.fecha.desc())
        .limit(30)
        .all()
    )

    # Calcular distribución real o usar default
    if podas:
        total_l = sum(p.tallos_largos for p in podas)
        total_m = sum(p.tallos_medios for p in podas)
        total_c = sum(p.tallos_cortos for p in podas)
        total_poda = total_l + total_m + total_c
        if total_poda > 0:
            pct_largos = total_l / total_poda
            pct_medios = total_m / total_poda
            pct_cortos = total_c / total_poda
            fuente = "estadistica_real"
        else:
            pct_largos, pct_medios, pct_cortos = 0.60, 0.30, 0.10
            fuente = "default"
    else:
        pct_largos, pct_medios, pct_cortos = 0.60, 0.30, 0.10
        fuente = "default"

    # Semanas para cosecha por etapa de botón
    semanas_para_cosecha = {
        "cosecha": 0, "estrella": 1, "rayando": 2,
        "garbanzo": 3, "alberja": 4, "arroz": 5
    }

    semanas = []
    for semana_offset in range(7):
        fecha_semana = fecha_base + timedelta(weeks=semana_offset)
        numero_semana = fecha_semana.isocalendar()[1]
        mes = fecha_semana.strftime("%B %Y")
        fecha_str = fecha_semana.strftime("%d/%m/%Y")

        cosecha_semana = 0
        detalle_por_tallo = {"tallo_largo": 0, "tallo_medio": 0, "tallo_corto": 0}
        detalle_etapas = {}

        for boton, semanas_faltantes in semanas_para_cosecha.items():
            if semanas_faltantes == semana_offset:

                # Obtener total detectado para esta etapa
                total_detectado = sum(
                    getattr(metrica, f"{t}_{boton}", 0) or 0
                    for t in ["tallo_largo", "tallo_medio", "tallo_corto"]
                )

                if total_detectado > 0:
                    # Si hay datos combinados tallo x botón usar directamente
                    largo_directo = getattr(metrica, f"tallo_largo_{boton}", 0) or 0
                    medio_directo = getattr(metrica, f"tallo_medio_{boton}", 0) or 0
                    corto_directo = getattr(metrica, f"tallo_corto_{boton}", 0) or 0

                    if largo_directo + medio_directo + corto_directo > 0:
                        # Usar datos reales del análisis combinado
                        detalle_por_tallo["tallo_largo"] += largo_directo
                        detalle_por_tallo["tallo_medio"] += medio_directo
                        detalle_por_tallo["tallo_corto"] += corto_directo
                        cosecha_semana += largo_directo + medio_directo + corto_directo
                    else:
                        # Usar distribución estadística de podas
                        largo_est = round(total_detectado * pct_largos)
                        medio_est = round(total_detectado * pct_medios)
                        corto_est = total_detectado - largo_est - medio_est
                        detalle_por_tallo["tallo_largo"] += largo_est
                        detalle_por_tallo["tallo_medio"] += medio_est
                        detalle_por_tallo["tallo_corto"] += corto_est
                        cosecha_semana += total_detectado

                    detalle_etapas[boton] = total_detectado

        semanas.append({
            "semana_offset":        semana_offset,
            "numero_semana":        numero_semana,
            "mes":                  mes,
            "fecha":                fecha_str,
            "botones_para_cosecha": cosecha_semana,
            "detalle_por_tallo":    detalle_por_tallo,
            "detalle_etapas":       detalle_etapas,
            "es_semana_actual":     semana_offset == 0,
            "fuente_distribucion":  fuente
        })

    total_por_tallo = {
        "tallo_largo": sum(s["detalle_por_tallo"]["tallo_largo"] for s in semanas),
        "tallo_medio": sum(s["detalle_por_tallo"]["tallo_medio"] for s in semanas),
        "tallo_corto": sum(s["detalle_por_tallo"]["tallo_corto"] for s in semanas),
    }

    return {
        "cama_id":          cama_id,
        "cama_nombre":      cama.nombre,
        "fecha_base":       fecha_base.strftime("%d/%m/%Y %H:%M"),
        "fuente_estadistica": fuente,
        "total_registros_poda": len(podas),
        "distribucion_poda": {
            "pct_largos": round(pct_largos * 100, 1),
            "pct_medios": round(pct_medios * 100, 1),
            "pct_cortos": round(pct_cortos * 100, 1),
        },
        "total_por_tallo":  total_por_tallo,
        "semanas":          semanas
    }

@app.get("/reportes/consolidado-botones")
def consolidado_botones(db: Session = Depends(get_db)):
    camas = db.query(models.Cama).all()
    resultado = []
    totales = {
        "boton_arroz": 0,
        "boton_alberja": 0,
        "boton_garbanzo": 0,
        "boton_rayando_color": 0,
        "boton_estrella": 0,
        "boton_cosecha": 0,
        "total": 0
    }

    for cama in camas:
        ultimo = (
            db.query(models.Registro, models.Metrica)
            .join(models.Metrica, models.Metrica.registro_id == models.Registro.id)
            .filter(models.Registro.cama_id == cama.id)
            .filter(models.Metrica.total_botones > 0)
            .order_by(models.Registro.fecha.desc())
            .first()
        )

        if ultimo:
            registro, metrica = ultimo
            fila = {
                "cama_id": cama.id,
                "cama_nombre": cama.nombre,
                "boton_arroz": metrica.boton_arroz or 0,
                "boton_alberja": metrica.boton_alberja or 0,
                "boton_garbanzo": metrica.boton_garbanzo or 0,
                "boton_rayando_color": metrica.boton_rayando_color or 0,
                "boton_estrella": metrica.boton_estrella or 0,
                "boton_cosecha": metrica.boton_cosecha or 0,
                "total": metrica.total_botones or 0,
                "fecha": registro.fecha.strftime("%d/%m/%Y %H:%M")
            }
            for key in ["boton_arroz","boton_alberja","boton_garbanzo",
                        "boton_rayando_color","boton_estrella","boton_cosecha","total"]:
                totales[key] += fila[key]
            resultado.append(fila)

    return {
        "camas": resultado,
        "totales": totales
    }

@app.get("/reportes/consolidado-fecha/{fecha}")
def consolidado_por_fecha(fecha: str, db: Session = Depends(get_db)):
    # fecha formato DD-MM-YYYY
    try:
        from datetime import datetime
        fecha_dt = datetime.strptime(fecha, "%d-%m-%Y")
        fecha_inicio = fecha_dt.replace(hour=0, minute=0, second=0)
        fecha_fin = fecha_dt.replace(hour=23, minute=59, second=59)
    except Exception:
        raise HTTPException(status_code=400, detail="Formato de fecha inválido. Use DD-MM-YYYY")

    camas = db.query(models.Cama).all()
    resultado = []

    for cama in camas:
        registros = (
            db.query(models.Registro, models.Metrica)
            .join(models.Metrica, models.Metrica.registro_id == models.Registro.id)
            .filter(models.Registro.cama_id == cama.id)
            .filter(models.Registro.fecha >= fecha_inicio)
            .filter(models.Registro.fecha <= fecha_fin)
            .filter(models.Metrica.total_tallos > 0)
            .order_by(models.Registro.fecha)
            .all()
        )

        if not registros:
            continue

        # Sumar todos los registros de la cama en esa fecha
        totales = {
            "tallo_largo_cosecha": 0, "tallo_largo_estrella": 0, "tallo_largo_rayando": 0,
            "tallo_largo_garbanzo": 0, "tallo_largo_alberja": 0, "tallo_largo_arroz": 0,
            "tallo_largo_sin_boton": 0, "tallo_medio_cosecha": 0, "tallo_medio_estrella": 0,
            "tallo_medio_rayando": 0, "tallo_medio_garbanzo": 0, "tallo_medio_alberja": 0,
            "tallo_medio_arroz": 0, "tallo_medio_sin_boton": 0, "tallo_corto_cosecha": 0,
            "tallo_corto_estrella": 0, "tallo_corto_rayando": 0, "tallo_corto_garbanzo": 0,
            "tallo_corto_alberja": 0, "tallo_corto_arroz": 0, "tallo_corto_sin_boton": 0,
            "boton_arroz": 0, "boton_alberja": 0, "boton_garbanzo": 0,
            "boton_rayando_color": 0, "boton_estrella": 0, "boton_cosecha": 0,
            "total_botones": 0, "total_tallos": 0
        }

        segmentos = []
        for registro, metrica in registros:
            for campo in totales:
                totales[campo] += getattr(metrica, campo, 0) or 0
            if registro.segmento and registro.segmento not in segmentos:
                segmentos.append(registro.segmento)

        resultado.append({
            "cama_id": cama.id,
            "cama_nombre": cama.nombre,
            "total_registros": len(registros),
            "segmentos": segmentos,
            **totales
        })

    return {"fecha": fecha, "camas": resultado}


@app.get("/reportes/fechas-disponibles")
def fechas_disponibles(db: Session = Depends(get_db)):
    from sqlalchemy import func
    fechas = (
        db.query(func.date(models.Registro.fecha))
        .join(models.Metrica, models.Metrica.registro_id == models.Registro.id)
        #.filter(models.Metrica.total_tallos > 0)
        .distinct()
        .order_by(func.date(models.Registro.fecha).desc())
        .all()
    )
    return {"fechas": [str(f[0]) for f in fechas]}

# --- Esquema poda ---
class PodaCreate(BaseModel):
    cama_id: int
    tallos_largos: int = 0
    tallos_medios: int = 0
    tallos_cortos: int = 0
    observaciones: Optional[str] = None


@app.post("/podas/")
def registrar_poda(poda: PodaCreate, db: Session = Depends(get_db)):
    cama = db.query(models.Cama).filter(models.Cama.id == poda.cama_id).first()
    if not cama:
        raise HTTPException(status_code=404, detail="Cama no encontrada")

    nueva = models.Poda(
        cama_id=poda.cama_id,
        tallos_largos=poda.tallos_largos,
        tallos_medios=poda.tallos_medios,
        tallos_cortos=poda.tallos_cortos,
        total_podados=poda.tallos_largos + poda.tallos_medios + poda.tallos_cortos,
        observaciones=poda.observaciones
    )
    db.add(nueva)
    db.commit()
    db.refresh(nueva)

    # Comparar contra la proyección pendiente y ajustar el ciclo de la cama
    ajuste = proyeccion_diaria.comparar_y_ajustar(
        db, poda.cama_id, nueva.fecha, nueva.total_podados
    )

    # Registrar la nueva proyección de "mañana" para el próximo ciclo de aprendizaje
    proyeccion_diaria.registrar_proyeccion_de_hoy(db, poda.cama_id)

    return {
        "mensaje": "Poda registrada correctamente",
        "poda_id": nueva.id,
        "cama": cama.nombre,
        "fecha": nueva.fecha.strftime("%d/%m/%Y %H:%M"),
        "tallos_largos": nueva.tallos_largos,
        "tallos_medios": nueva.tallos_medios,
        "tallos_cortos": nueva.tallos_cortos,
        "total_podados": nueva.total_podados,
        "ajuste_modelo": ajuste
    }

@app.get("/podas/{cama_id}")
def listar_podas(cama_id: int, db: Session = Depends(get_db)):
    podas = (
        db.query(models.Poda)
        .filter(models.Poda.cama_id == cama_id)
        .order_by(models.Poda.fecha.desc())
        .all()
    )
    return [
        {
            "id": p.id,
            "fecha": p.fecha.strftime("%d/%m/%Y %H:%M"),
            "tallos_largos": p.tallos_largos,
            "tallos_medios": p.tallos_medios,
            "tallos_cortos": p.tallos_cortos,
            "total_podados": p.total_podados,
            "observaciones": p.observaciones
        }
        for p in podas
    ]


@app.get("/podas/estadisticas/{cama_id}")
def estadisticas_poda(cama_id: int, db: Session = Depends(get_db)):
    podas = (
        db.query(models.Poda)
        .filter(models.Poda.cama_id == cama_id)
        .order_by(models.Poda.fecha.desc())
        .limit(30)  # últimas 30 podas
        .all()
    )

    if not podas:
        return {
            "cama_id": cama_id,
            "total_registros": 0,
            "promedio_diario": 0,
            "pct_largos": 0.33,
            "pct_medios": 0.33,
            "pct_cortos": 0.34,
            "fuente": "default"
        }

    total_largos = sum(p.tallos_largos for p in podas)
    total_medios = sum(p.tallos_medios for p in podas)
    total_cortos = sum(p.tallos_cortos for p in podas)
    total = total_largos + total_medios + total_cortos

    return {
        "cama_id": cama_id,
        "total_registros": len(podas),
        "promedio_diario": round(total / len(podas), 1),
        "total_largos": total_largos,
        "total_medios": total_medios,
        "total_cortos": total_cortos,
        "pct_largos": round(total_largos / total, 3) if total > 0 else 0.33,
        "pct_medios": round(total_medios / total, 3) if total > 0 else 0.33,
        "pct_cortos": round(total_cortos / total, 3) if total > 0 else 0.34,
        "fuente": "estadistica_real"
    }

@app.get("/reportes/comparativa-camas")
def comparativa_camas(db: Session = Depends(get_db)):
    camas = db.query(models.Cama).all()
    resultado = {}

    for cama in camas:
        registros = (
            db.query(models.Registro, models.Metrica)
            .join(models.Metrica, models.Metrica.registro_id == models.Registro.id)
            .filter(models.Registro.cama_id == cama.id)
            .filter(models.Metrica.total_tallos > 0)
            .order_by(models.Registro.fecha)
            .all()
        )

        from collections import defaultdict
        por_dia = defaultdict(lambda: {
            "total_botones": 0, "boton_cosecha": 0, "boton_estrella": 0,
            "boton_rayando_color": 0, "boton_garbanzo": 0,
            "boton_alberja": 0, "boton_arroz": 0, "fotos": 0
        })

        for registro, metrica in registros:
            fecha = registro.fecha.strftime("%d/%m/%Y")
            d = por_dia[fecha]
            d["total_botones"]       += metrica.total_botones or 0
            d["boton_cosecha"]       += metrica.boton_cosecha or 0
            d["boton_estrella"]      += metrica.boton_estrella or 0
            d["boton_rayando_color"] += metrica.boton_rayando_color or 0
            d["boton_garbanzo"]      += metrica.boton_garbanzo or 0
            d["boton_alberja"]       += metrica.boton_alberja or 0
            d["boton_arroz"]         += metrica.boton_arroz or 0
            d["fotos"]               += 1

        historial = []
        for fecha, datos in por_dia.items():
            historial.append({"fecha": fecha, **datos})

        # Calcular tendencia de los últimos 3 días con datos
        tendencia = "sin_datos"
        if len(historial) >= 2:
            ultimos = historial[-3:] if len(historial) >= 3 else historial
            primer_total = ultimos[0]["total_botones"]
            ultimo_total = ultimos[-1]["total_botones"]
            diferencia = ultimo_total - primer_total
            if diferencia > primer_total * 0.05:
                tendencia = "subiendo"
            elif diferencia < -(primer_total * 0.05):
                tendencia = "bajando"
            else:
                tendencia = "estable"
        elif len(historial) == 1:
            tendencia = "estable"

        resultado[cama.nombre] = {
            "cama_id": cama.id,
            "historial": historial,
            "tendencia": tendencia,
            "ultimo_total": historial[-1]["total_botones"] if historial else 0,
            "ultimo_cosecha": historial[-1]["boton_cosecha"] if historial else 0,
        }

    return resultado

# --- Esquemas configuración ---
class CamaUpdate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    variedad: Optional[str] = None
    filas_por_cama: int = 1
    largo: Optional[float] = None
    ancho: Optional[float] = None
    responsable: Optional[str] = None

class SegmentoCreate(BaseModel):
    nombre: str

# --- Endpoints configuración camas ---

@app.get("/configuracion/camas/")
def get_camas_config(db: Session = Depends(get_db)):
    camas = db.query(models.Cama).all()
    resultado = []
    for cama in camas:
        secciones = db.query(models.Segmento).filter(
            models.Segmento.cama_id == cama.id
        ).all()
        resultado.append({
            "id": cama.id,
            "nombre": cama.nombre,
            "descripcion": cama.descripcion,
            "variedad": cama.variedad,
            "filas_por_cama": cama.filas_por_cama,
            "largo": cama.largo,
            "ancho": cama.ancho,
            "responsable": cama.responsable,
            "fecha_creacion": cama.fecha_creacion.strftime("%d/%m/%Y"),
            "secciones": [{"id": s.id, "nombre": s.nombre, "activo": s.activo} for s in secciones]
        })
    return resultado

@app.post("/configuracion/camas/")
def crear_cama_config(cama: CamaCreate, db: Session = Depends(get_db)):
    nueva = models.Cama(
        nombre=cama.nombre,
        descripcion=cama.descripcion,
        variedad=cama.variedad,
        filas_por_cama=cama.filas_por_cama,
        largo=cama.largo,
        ancho=cama.ancho,
        responsable=cama.responsable
    )
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return {
        "id": nueva.id,
        "nombre": nueva.nombre,
        "descripcion": nueva.descripcion,
        "variedad": nueva.variedad,
        "filas_por_cama": nueva.filas_por_cama,
        "largo": nueva.largo,
        "ancho": nueva.ancho,
        "responsable": nueva.responsable,
        "segmentos": []
    }

@app.put("/configuracion/camas/{cama_id}")
def actualizar_cama(cama_id: int, cama: CamaUpdate, db: Session = Depends(get_db)):
    existente = db.query(models.Cama).filter(models.Cama.id == cama_id).first()
    if not existente:
        raise HTTPException(status_code=404, detail="Cama no encontrada")
    existente.nombre = cama.nombre
    existente.descripcion = cama.descripcion
    existente.variedad = cama.variedad
    existente.filas_por_cama = cama.filas_por_cama
    existente.largo = cama.largo
    existente.ancho = cama.ancho
    existente.responsable = cama.responsable
    db.commit()
    return {
        "mensaje": "Cama actualizada",
        "id": cama_id,
        "nombre": cama.nombre,
        "descripcion": existente.descripcion,
        "variedad": existente.variedad,
        "filas_por_cama": existente.filas_por_cama,
        "largo": existente.largo,
        "ancho": existente.ancho,
        "responsable": existente.responsable
    }

@app.delete("/configuracion/camas/{cama_id}")
def eliminar_cama(cama_id: int, db: Session = Depends(get_db)):
    registros = db.query(models.Registro).filter(models.Registro.cama_id == cama_id).count()
    if registros > 0:
        raise HTTPException(status_code=400, detail=f"No se puede eliminar — tiene {registros} registros asociados")
    
    cama = db.query(models.Cama).filter(models.Cama.id == cama_id).first()
    if not cama:
        raise HTTPException(status_code=404, detail="Cama no encontrada")
        
    db.delete(cama)
    db.commit()
    return {"mensaje": "Cama eliminada correctamente"}

@app.post("/configuracion/camas/{cama_id}/segmentos/")
def crear_segmento(cama_id: int, segmento: SegmentoCreate, db: Session = Depends(get_db)):
    cama = db.query(models.Cama).filter(models.Cama.id == cama_id).first()
    if not cama:
        raise HTTPException(status_code=404, detail="Cama no encontrada")
        
    nuevo = models.Segmento(cama_id=cama_id, nombre=segmento.nombre)
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return {"id": nuevo.id, "nombre": nuevo.nombre, "activo": nuevo.activo}

@app.delete("/configuracion/segmentos/{segmento_id}")
def eliminar_segmento(segmento_id: int, db: Session = Depends(get_db)):
    segmento = db.query(models.Segmento).filter(models.Segmento.id == segmento_id).first()
    if not segmento:
        raise HTTPException(status_code=404, detail="Segmento no encontrado")
        
    db.delete(segmento)
    db.commit()
    return {"mensaje": "Segmento eliminado correctamente"}

@app.delete("/registros/{registro_id}")
def eliminar_registro(registro_id: int, db: Session = Depends(get_db)):
    registro = db.query(models.Registro).filter(models.Registro.id == registro_id).first()
    if not registro:
        raise HTTPException(status_code=404, detail="Registro no encontrado")

    # Eliminar métrica asociada primero
    db.query(models.Metrica).filter(models.Metrica.registro_id == registro_id).delete()

    # Eliminar el registro (la foto física se conserva en disco)
    db.delete(registro)
    db.commit()

    return {"mensaje": "Registro eliminado correctamente", "registro_id": registro_id}

@app.get("/reportes/comparativa-secciones/{cama_id}/{fecha}")
def comparativa_secciones(cama_id: int, fecha: str, db: Session = Depends(get_db)):
    # fecha formato DD-MM-YYYY
    try:
        fecha_dt = datetime.strptime(fecha, "%d-%m-%Y")
        fecha_inicio = fecha_dt.replace(hour=0, minute=0, second=0)
        fecha_fin = fecha_dt.replace(hour=23, minute=59, second=59)
    except Exception:
        raise HTTPException(status_code=400, detail="Formato de fecha inválido. Use DD-MM-YYYY")

    cama = db.query(models.Cama).filter(models.Cama.id == cama_id).first()
    if not cama:
        raise HTTPException(status_code=404, detail="Cama no encontrada")

    registros = (
        db.query(models.Registro, models.Metrica)
        .join(models.Metrica, models.Metrica.registro_id == models.Registro.id)
        .filter(models.Registro.cama_id == cama_id)
        .filter(models.Registro.fecha >= fecha_inicio)
        .filter(models.Registro.fecha <= fecha_fin)
        .filter(models.Metrica.total_tallos > 0)
        .order_by(models.Registro.segmento)
        .all()
    )

    campos_matriz = [
        "tallo_largo_cosecha", "tallo_largo_estrella", "tallo_largo_rayando",
        "tallo_largo_garbanzo", "tallo_largo_alberja", "tallo_largo_arroz", "tallo_largo_sin_boton",
        "tallo_medio_cosecha", "tallo_medio_estrella", "tallo_medio_rayando",
        "tallo_medio_garbanzo", "tallo_medio_alberja", "tallo_medio_arroz", "tallo_medio_sin_boton",
        "tallo_corto_cosecha", "tallo_corto_estrella", "tallo_corto_rayando",
        "tallo_corto_garbanzo", "tallo_corto_alberja", "tallo_corto_arroz", "tallo_corto_sin_boton",
    ]

    # Agrupar por sección
    secciones = {}
    for registro, metrica in registros:
        seg = registro.segmento or "Sin sección"
        if seg not in secciones:
            secciones[seg] = {"A": None, "B": None}

        datos = {campo: getattr(metrica, campo, 0) or 0 for campo in campos_matriz}
        datos["total_tallos"] = metrica.total_tallos or 0
        datos["total_botones"] = metrica.total_botones or 0
        datos["fecha"] = registro.fecha.strftime("%d/%m/%Y %H:%M")
        datos["registro_id"] = registro.id

        lado = registro.lado or "A"
        secciones[seg][lado] = datos

    resultado = []
    for seg, lados in secciones.items():
        resultado.append({
            "seccion": seg,
            "lado_A": lados["A"],
            "lado_B": lados["B"]
        })

    return {
        "cama_id": cama_id,
        "cama_nombre": cama.nombre,
        "fecha": fecha,
        "secciones": resultado
    }

@app.get("/reportes/proyeccion-diaria/{cama_id}")
def proyeccion_diaria_endpoint(cama_id: int, dias: int = 14, db: Session = Depends(get_db)):
    resultado = proyeccion_diaria.generar_proyeccion_diaria(db, cama_id, dias_adelante=dias)
    if not resultado.get("dias"):
        raise HTTPException(status_code=404, detail="No hay datos suficientes para proyectar esta cama")

    # Registrar la proyección de "mañana" para poder comparar luego
    proyeccion_diaria.registrar_proyeccion_de_hoy(db, cama_id)

    return resultado


@app.get("/reportes/precision-proyeccion/{cama_id}")
def precision_proyeccion(cama_id: int, db: Session = Depends(get_db)):
    historial = proyeccion_diaria.historial_precision(db, cama_id)
    return {"cama_id": cama_id, "historial": historial}

@app.get("/reportes/pdf-cama/{cama_id}/{fecha}")
def descargar_reporte_pdf(cama_id: int, fecha: str, db: Session = Depends(get_db)):
    # fecha formato DD-MM-YYYY
    cama = db.query(models.Cama).filter(models.Cama.id == cama_id).first()
    if not cama:
        raise HTTPException(status_code=404, detail="Cama no encontrada")

    try:
        fecha_dt = datetime.strptime(fecha, "%d-%m-%Y")
    except Exception:
        raise HTTPException(status_code=400, detail="Formato de fecha inválido. Use DD-MM-YYYY")

    fecha_str_display = fecha_dt.strftime("%d/%m/%Y")

    # --- 1. Datos consolidados del día ---
    fecha_consolidado_str = fecha_dt.strftime("%d-%m-%Y")
    consolidado_resp = consolidado_por_fecha(fecha_consolidado_str, db)
    consolidado_cama = next(
        (c for c in consolidado_resp.get("camas", []) if c["cama_id"] == cama_id),
        None
    )

    # --- 2. Comparativa por sección ---
    try:
        comparativa = comparativa_secciones(cama_id, fecha_consolidado_str, db)
        secciones = comparativa.get("secciones", [])
    except HTTPException:
        secciones = []

    # --- 3. Poda del día ---
    fecha_inicio = fecha_dt.replace(hour=0, minute=0, second=0)
    fecha_fin = fecha_dt.replace(hour=23, minute=59, second=59)
    poda = (
        db.query(models.Poda)
        .filter(models.Poda.cama_id == cama_id)
        .filter(models.Poda.fecha >= fecha_inicio)
        .filter(models.Poda.fecha <= fecha_fin)
        .order_by(models.Poda.fecha.desc())
        .first()
    )
    poda_dict = None
    comparacion_dict = None
    if poda:
        poda_dict = {
            "tallos_largos": poda.tallos_largos,
            "tallos_medios": poda.tallos_medios,
            "tallos_cortos": poda.tallos_cortos,
            "total_podados": poda.total_podados,
            "observaciones": poda.observaciones
        }
        historial_prec = proyeccion_diaria.historial_precision(db, cama_id, limite=60)
        comparacion_dict = next(
            (p for p in historial_prec if p["fecha"] == fecha_str_display),
            None
        )

    # --- 4. Proyección diaria ---
    proyeccion_data = proyeccion_diaria.generar_proyeccion_diaria(db, cama_id, dias_adelante=35)

    # --- Generar PDF ---
    pdf_buffer = reporte_pdf.generar_reporte_cama(
        cama_nombre=cama.nombre,
        fecha_str=fecha_str_display,
        consolidado=consolidado_cama,
        secciones=secciones,
        poda_del_dia=poda_dict,
        comparacion_poda=comparacion_dict,
        proyeccion=proyeccion_data
    )

    nombre_archivo = f"reporte_{cama.nombre.replace(' ', '_')}_{fecha}.pdf"
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={nombre_archivo}"}
    )

@app.post("/registros/cargar-video-fotogramas/")
def cargar_video_fotogramas(
    cama_id: int = Form(...),
    lado: str = Form(...),
    segmento: Optional[str] = Form(None),
    observaciones: Optional[str] = Form(None),
    intervalo_segundos: float = Form(2.0),
    video: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    cama = db.query(models.Cama).filter(models.Cama.id == cama_id).first()
    if not cama:
        raise HTTPException(status_code=404, detail="Cama no encontrada")

    # Guardar el video temporalmente
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    nombre_video = f"video_cama{cama_id}_{timestamp}.mp4"
    ruta_video = os.path.join(CARPETA_FOTOGRAMAS, nombre_video)
    with open(ruta_video, "wb") as buffer:
        shutil.copyfileobj(video.file, buffer)

    try:
        info = video_extractor.info_video(ruta_video)
        rutas_fotogramas = video_extractor.extraer_fotogramas_espaciados(
            ruta_video, CARPETA_FOTOGRAMAS, intervalo_segundos=intervalo_segundos
        )
    except ValueError as e:
        os.remove(ruta_video)
        raise HTTPException(status_code=400, detail=str(e))

    if len(rutas_fotogramas) == 0:
        os.remove(ruta_video)
        raise HTTPException(status_code=400, detail="No se pudieron extraer fotogramas del video")

    # Analizar cada fotograma y sumar resultados
    acumulado = {}
    detalle_fotogramas = []

    for ruta_frame in rutas_fotogramas:
        botones = clasificador.clasificar_con_fallback(
            ruta_frame,
            lado=lado,
            filas=cama.filas_por_cama or 1,
            variedad=cama.variedad
        )
        detalle_fotogramas.append({
            "archivo": os.path.basename(ruta_frame),
            "total_tallos": botones.get("total_tallos", 0)
        })
        for key, val in botones.items():
            if isinstance(val, (int, float)) and key not in ["detalle"]:
                acumulado[key] = acumulado.get(key, 0) + val

    # Guardar el registro consolidado (usamos el video como referencia de imagen)
    nuevo_registro = models.Registro(
        cama_id=cama_id,
        ruta_imagen=ruta_video,
        observaciones=(observaciones or "") + f" [Video — {len(rutas_fotogramas)} fotogramas, intervalo {intervalo_segundos}s]",
        segmento=segmento,
        lado=lado
    )
    db.add(nuevo_registro)
    db.commit()
    db.refresh(nuevo_registro)

    nueva_metrica = models.Metrica(
        registro_id=nuevo_registro.id,
        etapa_crecimiento=None,
        tallos_cortos=0, tallos_medios=0, tallos_largos=0,
        total_tallos=acumulado.get("total_tallos", 0),
        score_confianza=None,
        boton_arroz=acumulado.get("total_arroz", 0),
        boton_alberja=acumulado.get("total_alberja", 0),
        boton_garbanzo=acumulado.get("total_garbanzo", 0),
        boton_rayando_color=acumulado.get("total_rayando_color", 0),
        boton_estrella=acumulado.get("total_estrella", 0),
        boton_cosecha=acumulado.get("total_cosecha", 0),
        etapa_dominante=None,
        total_botones=acumulado.get("total_con_boton", 0),
        tallo_largo_cosecha=acumulado.get("tallo_largo_cosecha", 0),
        tallo_largo_estrella=acumulado.get("tallo_largo_estrella", 0),
        tallo_largo_rayando=acumulado.get("tallo_largo_rayando_color", 0),
        tallo_largo_garbanzo=acumulado.get("tallo_largo_garbanzo", 0),
        tallo_largo_alberja=acumulado.get("tallo_largo_alberja", 0),
        tallo_largo_arroz=acumulado.get("tallo_largo_arroz", 0),
        tallo_largo_sin_boton=acumulado.get("tallo_largo_sin_boton", 0),
        tallo_medio_cosecha=acumulado.get("tallo_medio_cosecha", 0),
        tallo_medio_estrella=acumulado.get("tallo_medio_estrella", 0),
        tallo_medio_rayando=acumulado.get("tallo_medio_rayando_color", 0),
        tallo_medio_garbanzo=acumulado.get("tallo_medio_garbanzo", 0),
        tallo_medio_alberja=acumulado.get("tallo_medio_alberja", 0),
        tallo_medio_arroz=acumulado.get("tallo_medio_arroz", 0),
        tallo_medio_sin_boton=acumulado.get("tallo_medio_sin_boton", 0),
        tallo_corto_cosecha=acumulado.get("tallo_corto_cosecha", 0),
        tallo_corto_estrella=acumulado.get("tallo_corto_estrella", 0),
        tallo_corto_rayando=acumulado.get("tallo_corto_rayando_color", 0),
        tallo_corto_garbanzo=acumulado.get("tallo_corto_garbanzo", 0),
        tallo_corto_alberja=acumulado.get("tallo_corto_alberja", 0),
        tallo_corto_arroz=acumulado.get("tallo_corto_arroz", 0),
        tallo_corto_sin_boton=acumulado.get("tallo_corto_sin_boton", 0),
        detalle_tallos_json=json.dumps(detalle_fotogramas),
        matriz_botones_tallos=json.dumps(detalle_fotogramas)
    )
    db.add(nueva_metrica)
    db.commit()

    # Limpiar fotogramas temporales (ya fueron analizados)
    for ruta_frame in rutas_fotogramas:
        try:
            os.remove(ruta_frame)
        except Exception:
            pass

    return {
        "mensaje": f"Video procesado — {len(rutas_fotogramas)} fotogramas analizados y sumados",
        "registro_id": nuevo_registro.id,
        "info_video": info,
        "total_fotogramas_analizados": len(rutas_fotogramas),
        "total_tallos": acumulado.get("total_tallos", 0),
        "total_botones": acumulado.get("total_con_boton", 0),
        "detalle_por_fotograma": detalle_fotogramas,
        "advertencia": "Este método puede sobreestimar el conteo si el recorrido fue lento o con pausas, ya que el mismo tallo puede aparecer en varios fotogramas."
    }

@app.post("/registros/cargar-video-combinado/")
def cargar_video_combinado(
    cama_id: int = Form(...),
    lado: str = Form(...),
    segmento: Optional[str] = Form(None),
    observaciones: Optional[str] = Form(None),
    cantidad_fotogramas: int = Form(6),
    video: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    cama = db.query(models.Cama).filter(models.Cama.id == cama_id).first()
    if not cama:
        raise HTTPException(status_code=404, detail="Cama no encontrada")

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    nombre_video = f"video_combinado_cama{cama_id}_{timestamp}.mp4"
    ruta_video = os.path.join(CARPETA_FOTOGRAMAS, nombre_video)
    with open(ruta_video, "wb") as buffer:
        shutil.copyfileobj(video.file, buffer)

    try:
        info = video_extractor.info_video(ruta_video)
        rutas_muestra = video_extractor.extraer_por_diferencia_visual(
            ruta_video, CARPETA_FOTOGRAMAS,
            cantidad_maxima=10,
            cantidad_minima=4
        )
    except ValueError as e:
        os.remove(ruta_video)
        raise HTTPException(status_code=400, detail=str(e))

    if len(rutas_muestra) == 0:
        os.remove(ruta_video)
        raise HTTPException(status_code=400, detail="No se pudieron extraer fotogramas del video")

    resultado_analisis = clasificador.clasificar_video_combinado_con_fallback(
        rutas_muestra,
        lado=lado,
        filas=cama.filas_por_cama or 1,
        variedad=cama.variedad
    )
    nuevo_registro = models.Registro(
        cama_id=cama_id,
        ruta_imagen=ruta_video,
        observaciones=(observaciones or "") + f" [Video — muestreo diferencia visual — {len(rutas_muestra)} fotogramas representativos]",
        segmento=segmento,
        lado=lado
    )
    db.add(nuevo_registro)
    db.commit()
    db.refresh(nuevo_registro)

    nueva_metrica = models.Metrica(
        registro_id=nuevo_registro.id,
        etapa_crecimiento=None,
        tallos_cortos=0, tallos_medios=0, tallos_largos=0,
        total_tallos=resultado_analisis.get("total_tallos", 0),
        score_confianza=resultado_analisis.get("confianza", 0.0),
        boton_arroz=resultado_analisis.get("total_arroz", 0),
        boton_alberja=resultado_analisis.get("total_alberja", 0),
        boton_garbanzo=resultado_analisis.get("total_garbanzo", 0),
        boton_rayando_color=resultado_analisis.get("total_rayando_color", 0),
        boton_estrella=resultado_analisis.get("total_estrella", 0),
        boton_cosecha=resultado_analisis.get("total_cosecha", 0),
        etapa_dominante=resultado_analisis.get("etapa_dominante"),
        total_botones=resultado_analisis.get("total_con_boton", 0),
        tallo_largo_cosecha=resultado_analisis.get("tallo_largo_cosecha", 0),
        tallo_largo_estrella=resultado_analisis.get("tallo_largo_estrella", 0),
        tallo_largo_rayando=resultado_analisis.get("tallo_largo_rayando_color", 0),
        tallo_largo_garbanzo=resultado_analisis.get("tallo_largo_garbanzo", 0),
        tallo_largo_alberja=resultado_analisis.get("tallo_largo_alberja", 0),
        tallo_largo_arroz=resultado_analisis.get("tallo_largo_arroz", 0),
        tallo_largo_sin_boton=resultado_analisis.get("tallo_largo_sin_boton", 0),
        tallo_medio_cosecha=resultado_analisis.get("tallo_medio_cosecha", 0),
        tallo_medio_estrella=resultado_analisis.get("tallo_medio_estrella", 0),
        tallo_medio_rayando=resultado_analisis.get("tallo_medio_rayando_color", 0),
        tallo_medio_garbanzo=resultado_analisis.get("tallo_medio_garbanzo", 0),
        tallo_medio_alberja=resultado_analisis.get("tallo_medio_alberja", 0),
        tallo_medio_arroz=resultado_analisis.get("tallo_medio_arroz", 0),
        tallo_medio_sin_boton=resultado_analisis.get("tallo_medio_sin_boton", 0),
        tallo_corto_cosecha=resultado_analisis.get("tallo_corto_cosecha", 0),
        tallo_corto_estrella=resultado_analisis.get("tallo_corto_estrella", 0),
        tallo_corto_rayando=resultado_analisis.get("tallo_corto_rayando_color", 0),
        tallo_corto_garbanzo=resultado_analisis.get("tallo_corto_garbanzo", 0),
        tallo_corto_alberja=resultado_analisis.get("tallo_corto_alberja", 0),
        tallo_corto_arroz=resultado_analisis.get("tallo_corto_arroz", 0),
        tallo_corto_sin_boton=resultado_analisis.get("tallo_corto_sin_boton", 0),
        detalle_tallos_json=json.dumps(resultado_analisis.get("detalle", {})),
        matriz_botones_tallos=json.dumps(resultado_analisis.get("detalle", {}))
    )
    db.add(nueva_metrica)
    db.commit()

    for ruta in rutas_muestra:
        try:
            os.remove(ruta)
        except Exception:
            pass

    return {
        "mensaje": "Video analizado con muestreo inteligente por diferencia visual",
        "registro_id": nuevo_registro.id,
        "info_video": info,
        "fotogramas_usados": len(rutas_muestra),
        "total_tallos": resultado_analisis.get("total_tallos", 0),
        "total_botones": resultado_analisis.get("total_con_boton", 0),
        "nota_solapamiento": resultado_analisis.get("nota_solapamiento", ""),
        "advertencia": "Este método depende de que el modelo identifique correctamente los solapamientos entre fotogramas; puede subestimar o sobreestimar en recorridos muy largos."
    }

# --- Endpoint Demostración Combinado Lado A + Lado B ---
from app import clasificador_bloque

@app.post("/registros/cargar-bloque-demo/")
def cargar_bloque_demo(
    cama_id: int = Form(...),
    segmento: Optional[str] = Form(None),
    video_a: list[UploadFile] = File(...),
    video_b: list[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    cama = db.query(models.Cama).filter(models.Cama.id == cama_id).first()
    if not cama:
        raise HTTPException(status_code=404, detail="Cama no encontrada")

    # Inicializar acumuladores para Lado A
    totales_A = {
        "total_tallos": 0, "total_con_boton": 0, "total_sin_boton": 0,
        "total_arroz": 0, "total_alberja": 0, "total_garbanzo": 0,
        "total_rayando_color": 0, "total_estrella": 0, "total_cosecha": 0
    }
    notas_A = []
    confianzas_A = []

    # Inicializar acumuladores para Lado B
    totales_B = {
        "total_tallos": 0, "total_con_boton": 0, "total_sin_boton": 0,
        "total_arroz": 0, "total_alberja": 0, "total_garbanzo": 0,
        "total_rayando_color": 0, "total_estrella": 0, "total_cosecha": 0
    }
    notas_B = []
    confianzas_B = []

    # Procesar Lado A
    for idx, file in enumerate(video_a):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        path = os.path.join(CARPETA_FOTOGRAMAS, f"demo_cama{cama_id}_ladoA_tramo{idx}_{timestamp}.mp4")
        
        with open(path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        try:
            frames = video_extractor.extraer_por_diferencia_visual(
                path, CARPETA_FOTOGRAMAS, cantidad_maxima=10, cantidad_minima=4
            )
            if frames:
                res = clasificador.clasificar_video_combinado_con_fallback(
                    frames, lado="A", filas=cama.filas_por_cama or 1, variedad=cama.variedad
                )
                
                # Sumar métricas
                for key in totales_A.keys():
                    totales_A[key] += res.get(key, 0)
                
                notas_A.append(f"Tramo {idx + 1}: {res.get('nota_solapamiento', '') or 'Sin nota'}")
                confianzas_A.append(res.get("confianza", 0.0))
                
                # Limpiar fotogramas
                for f in frames:
                    if os.path.exists(f): os.remove(f)
        finally:
            if os.path.exists(path): os.remove(path)

    # Procesar Lado B
    for idx, file in enumerate(video_b):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        path = os.path.join(CARPETA_FOTOGRAMAS, f"demo_cama{cama_id}_ladoB_tramo{idx}_{timestamp}.mp4")
        
        with open(path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        try:
            frames = video_extractor.extraer_por_diferencia_visual(
                path, CARPETA_FOTOGRAMAS, cantidad_maxima=10, cantidad_minima=4
            )
            if frames:
                res = clasificador.clasificar_video_combinado_con_fallback(
                    frames, lado="B", filas=cama.filas_por_cama or 1, variedad=cama.variedad
                )
                
                # Sumar métricas
                for key in totales_B.keys():
                    totales_B[key] += res.get(key, 0)
                
                notas_B.append(f"Tramo {idx + 1}: {res.get('nota_solapamiento', '') or 'Sin nota'}")
                confianzas_B.append(res.get("confianza", 0.0))
                
                # Limpiar fotogramas
                for f in frames:
                    if os.path.exists(f): os.remove(f)
        finally:
            if os.path.exists(path): os.remove(path)

    # Calcular etapa dominante para Lado A
    botones_A = {b: totales_A[f"total_{b}"] for b in ["arroz", "alberja", "garbanzo", "rayando_color", "estrella", "cosecha"]}
    etapa_dominante_A = max(botones_A, key=botones_A.get) if any(botones_A.values()) else "sin_flor"

    # Calcular etapa dominante para Lado B
    botones_B = {b: totales_B[f"total_{b}"] for b in ["arroz", "alberja", "garbanzo", "rayando_color", "estrella", "cosecha"]}
    etapa_dominante_B = max(botones_B, key=botones_B.get) if any(botones_B.values()) else "sin_flor"

    # Promedios de confianza
    conf_A = sum(confianzas_A) / len(confianzas_A) if confianzas_A else 0.0
    conf_B = sum(confianzas_B) / len(confianzas_B) if confianzas_B else 0.0

    return {
        "razonamiento_previo": {
            "analisis_lado_A": " | ".join(notas_A),
            "analisis_lado_B": " | ".join(notas_B)
        },
        "lado_A": {
            "total_tallos": totales_A["total_tallos"],
            "total_botones": totales_A["total_con_boton"],
            "etapa_dominante": etapa_dominante_A,
            "confianza": round(conf_A, 2)
        },
        "lado_B": {
            "total_tallos": totales_B["total_tallos"],
            "total_botones": totales_B["total_con_boton"],
            "etapa_dominante": etapa_dominante_B,
            "confianza": round(conf_B, 2)
        },
        "total_global": {
            "tallos": totales_A["total_tallos"] + totales_B["total_tallos"],
            "botones": totales_A["total_con_boton"] + totales_B["total_con_boton"]
        }
    }

# --- Nuevo Endpoint de Cama Completa ---
from app import clasificador_cama_completa

@app.post("/registros/cargar-cama-completa/")
def cargar_cama_completa(
    cama_id: int = Form(...),
    video_a: UploadFile = File(...),
    video_b: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    cama = db.query(models.Cama).filter(models.Cama.id == cama_id).first()
    if not cama:
        raise HTTPException(status_code=404, detail="Cama no encontrada")

    print(f"\n[INFO] === NUEVA PETICION CAMA COMPLETA ===")
    print(f"[INFO] Cama ID: {cama_id} ({cama.nombre})")
    print(f"[INFO] Recibiendo Video Lado A ({video_a.filename}) y Lado B ({video_b.filename})...")

    # Guardar videos temporales
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    path_a = os.path.join(CARPETA_FOTOGRAMAS, f"video_completo_cama{cama_id}_ladoA_{timestamp}.mp4")
    path_b = os.path.join(CARPETA_FOTOGRAMAS, f"video_completo_cama{cama_id}_ladoB_{timestamp}.mp4")
    
    with open(path_a, "wb") as buffer:
        shutil.copyfileobj(video_a.file, buffer)
    with open(path_b, "wb") as buffer:
        shutil.copyfileobj(video_b.file, buffer)
    
    print(f"[INFO] Videos guardados en disco. Iniciando extracción por diferencia visual...")

    try:
        # Extraer fotogramas dinámicamente para ambos lados
        rutas_a = video_extractor.extraer_por_diferencia_visual(
            path_a, CARPETA_FOTOGRAMAS, cantidad_maxima=None, cantidad_minima=None
        )
        rutas_b = video_extractor.extraer_por_diferencia_visual(
            path_b, CARPETA_FOTOGRAMAS, cantidad_maxima=None, cantidad_minima=None
        )
    except ValueError as e:
        print(f"[ERROR] Fallo en la extracción de fotogramas: {e}")
        if os.path.exists(path_a): os.remove(path_a)
        if os.path.exists(path_b): os.remove(path_b)
        raise HTTPException(status_code=400, detail=str(e))

    if len(rutas_a) == 0 or len(rutas_b) == 0:
        print("[ERROR] No se extrajeron fotogramas de uno o ambos videos.")
        if os.path.exists(path_a): os.remove(path_a)
        if os.path.exists(path_b): os.remove(path_b)
        raise HTTPException(status_code=400, detail="No se pudieron extraer fotogramas de uno o ambos videos")

    print(f"[INFO] Extracción finalizada con éxito:")
    print(f"  - Lado A: {len(rutas_a)} fotogramas obtenidos")
    print(f"  - Lado B: {len(rutas_b)} fotogramas obtenidos")
    print(f"[INFO] Enviando fotogramas a Claude Vision API...")

    # Ejecutar análisis unificado (Lado A + Lado B)
    resultado_analisis = clasificador_cama_completa.clasificar_cama_completa_con_fallback(
        rutas_a, rutas_b,
        filas=cama.filas_por_cama or 1,
        variedad=cama.variedad
    )

    print(f"[INFO] Análisis finalizado por Vision AI:")
    print(f"  - Total Tallos Contados: {resultado_analisis.get('total_tallos', 0)}")
    print(f"  - Confianza: {resultado_analisis.get('confianza', 0.0)}")
    print(f"  - Etapa Dominante: {resultado_analisis.get('etapa_dominante', 'N/A')}")

    # Crear el registro en la base de datos (guardamos la referencia a video_a)
    nuevo_registro = models.Registro(
        cama_id=cama_id,
        ruta_imagen=path_a,  # Guardamos la ruta del lado A como referencia primaria
        observaciones=f"[Cama Completa unificada — Videos de ambos lados: {len(rutas_a)} y {len(rutas_b)} fotogramas]",
        lado="C",
        segmento="Cama Completa"
    )
    db.add(nuevo_registro)
    db.commit()
    db.refresh(nuevo_registro)

    # Guardar las métricas de la cama completa en la base de datos
    nueva_metrica = models.Metrica(
        registro_id=nuevo_registro.id,
        etapa_crecimiento=None,
        tallos_cortos=0, tallos_medios=0, tallos_largos=0,
        total_tallos=resultado_analisis.get("total_tallos", 0),
        score_confianza=resultado_analisis.get("confianza", 0.0),
        boton_arroz=resultado_analisis.get("total_arroz", 0),
        boton_alberja=resultado_analisis.get("total_alberja", 0),
        boton_garbanzo=resultado_analisis.get("total_garbanzo", 0),
        boton_rayando_color=resultado_analisis.get("total_rayando_color", 0),
        boton_estrella=resultado_analisis.get("total_estrella", 0),
        boton_cosecha=resultado_analisis.get("total_cosecha", 0),
        etapa_dominante=resultado_analisis.get("etapa_dominante"),
        total_botones=resultado_analisis.get("total_con_boton", 0),
        tallo_largo_cosecha=resultado_analisis.get("tallo_largo_cosecha", 0),
        tallo_largo_estrella=resultado_analisis.get("tallo_largo_estrella", 0),
        tallo_largo_rayando=resultado_analisis.get("tallo_largo_rayando_color", 0),
        tallo_largo_garbanzo=resultado_analisis.get("tallo_largo_garbanzo", 0),
        tallo_largo_alberja=resultado_analisis.get("tallo_largo_alberja", 0),
        tallo_largo_arroz=resultado_analisis.get("tallo_largo_arroz", 0),
        tallo_largo_sin_boton=resultado_analisis.get("tallo_largo_sin_boton", 0),
        tallo_medio_cosecha=resultado_analisis.get("tallo_medio_cosecha", 0),
        tallo_medio_estrella=resultado_analisis.get("tallo_medio_estrella", 0),
        tallo_medio_rayando=resultado_analisis.get("tallo_medio_rayando_color", 0),
        tallo_medio_garbanzo=resultado_analisis.get("tallo_medio_garbanzo", 0),
        tallo_medio_alberja=resultado_analisis.get("tallo_medio_alberja", 0),
        tallo_medio_arroz=resultado_analisis.get("tallo_medio_arroz", 0),
        tallo_medio_sin_boton=resultado_analisis.get("tallo_medio_sin_boton", 0),
        tallo_corto_cosecha=resultado_analisis.get("tallo_corto_cosecha", 0),
        tallo_corto_estrella=resultado_analisis.get("tallo_corto_estrella", 0),
        tallo_corto_rayando=resultado_analisis.get("tallo_corto_rayando_color", 0),
        tallo_corto_garbanzo=resultado_analisis.get("tallo_corto_garbanzo", 0),
        tallo_corto_alberja=resultado_analisis.get("tallo_corto_alberja", 0),
        tallo_corto_arroz=resultado_analisis.get("tallo_corto_arroz", 0),
        tallo_corto_sin_boton=resultado_analisis.get("tallo_corto_sin_boton", 0),
        detalle_tallos_json=json.dumps(resultado_analisis.get("detalle", {})),
        matriz_botones_tallos=json.dumps(resultado_analisis.get("detalle", {}))
    )
    db.add(nueva_metrica)
    db.commit()

    # Limpiar archivos temporales
    for r in [path_a, path_b] + rutas_a + rutas_b:
        try:
            if os.path.exists(r):
                os.remove(r)
        except Exception:
            pass

    return {
        "mensaje": "Análisis consolidado de cama completa realizado con éxito",
        "registro_id": nuevo_registro.id,
        "fotogramas_procesados_A": len(rutas_a),
        "fotogramas_procesados_B": len(rutas_b),
        "total_tallos": resultado_analisis.get("total_tallos", 0),
        "total_botones": resultado_analisis.get("total_con_boton", 0),
        "etapa_dominante": resultado_analisis.get("etapa_dominante"),
        "razonamiento_previo": resultado_analisis.get("razonamiento_previo", {})
    }

@app.get("/registros/cama-completa/")
def obtener_registros_cama_completa(db: Session = Depends(get_db)):
    registros = db.query(models.Registro).filter(
        models.Registro.segmento == "Cama Completa"
    ).order_by(models.Registro.id.desc()).all()
    
    res = []
    for r in registros:
        metrica = db.query(models.Metrica).filter(models.Metrica.registro_id == r.id).first()
        cama = db.query(models.Cama).filter(models.Cama.id == r.cama_id).first()
        
        registro_data = {
            "id": r.id,
            "cama_id": r.cama_id,
            "cama_nombre": cama.nombre if cama else f"Cama {r.cama_id}",
            "fecha": r.fecha.strftime("%d/%m/%Y %H:%M") if r.fecha else "",
            "observaciones": r.observaciones,
            "lado": r.lado,
            "segmento": r.segmento,
        }
        
        if metrica:
            registro_data.update({
                "total_tallos": metrica.total_tallos or 0,
                "total_botones": metrica.total_botones or 0,
                "etapa_dominante": metrica.etapa_dominante or "sin_flor",
                "confianza": metrica.score_confianza or 0.0,
                
                # Combinaciones tallo x botón individuales
                "tallo_largo_cosecha": metrica.tallo_largo_cosecha or 0,
                "tallo_largo_estrella": metrica.tallo_largo_estrella or 0,
                "tallo_largo_rayando_color": metrica.tallo_largo_rayando or 0,
                "tallo_largo_rayando": metrica.tallo_largo_rayando or 0,
                "tallo_largo_garbanzo": metrica.tallo_largo_garbanzo or 0,
                "tallo_largo_alberja": metrica.tallo_largo_alberja or 0,
                "tallo_largo_arroz": metrica.tallo_largo_arroz or 0,
                "tallo_largo_sin_boton": metrica.tallo_largo_sin_boton or 0,
                
                "tallo_medio_cosecha": metrica.tallo_medio_cosecha or 0,
                "tallo_medio_estrella": metrica.tallo_medio_estrella or 0,
                "tallo_medio_rayando_color": metrica.tallo_medio_rayando or 0,
                "tallo_medio_rayando": metrica.tallo_medio_rayando or 0,
                "tallo_medio_garbanzo": metrica.tallo_medio_garbanzo or 0,
                "tallo_medio_alberja": metrica.tallo_medio_alberja or 0,
                "tallo_medio_arroz": metrica.tallo_medio_arroz or 0,
                "tallo_medio_sin_boton": metrica.tallo_medio_sin_boton or 0,
                
                "tallo_corto_cosecha": metrica.tallo_corto_cosecha or 0,
                "tallo_corto_estrella": metrica.tallo_corto_estrella or 0,
                "tallo_corto_rayando_color": metrica.tallo_corto_rayando or 0,
                "tallo_corto_rayando": metrica.tallo_corto_rayando or 0,
                "tallo_corto_garbanzo": metrica.tallo_corto_garbanzo or 0,
                "tallo_corto_alberja": metrica.tallo_corto_alberja or 0,
                "tallo_corto_arroz": metrica.tallo_corto_arroz or 0,
                "tallo_corto_sin_boton": metrica.tallo_corto_sin_boton or 0,
            })
            
        res.append(registro_data)
        
    return res