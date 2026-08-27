import anthropic
import base64
import os
import json
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BOTONES = ["cosecha", "estrella", "rayando_color", "garbanzo", "alberja", "arroz", "sin_boton"]
CARPETA_REFERENCIAS = "app/referencias"


def imagen_a_base64(ruta: str) -> tuple[str, str]:
    extension = Path(ruta).suffix.lower()
    tipos = {".jpg": "image/jpeg", ".jpeg": "image/jpeg",
             ".png": "image/png", ".webp": "image/webp"}
    media_type = tipos.get(extension, "image/jpeg")
    with open(ruta, "rb") as f:
        data = base64.standard_b64encode(f.read()).decode("utf-8")
    return data, media_type


def cargar_referencias() -> dict:
    referencias = {}
    categorias = ["boton_arroz", "boton_alberja", "boton_garbanzo",
                  "boton_rayando_color", "boton_estrella", "boton_cosecha"]
    for categoria in categorias:
        carpeta = os.path.join(CARPETA_REFERENCIAS, categoria)
        if not os.path.exists(carpeta):
            continue
        fotos = [f for f in os.listdir(carpeta)
                 if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))]
        if fotos:
            ruta = os.path.join(carpeta, fotos[0])
            try:
                data, media_type = imagen_a_base64(ruta)
                referencias[categoria] = (data, media_type)
            except Exception:
                continue
    return referencias


def _resultado_error(mensaje: str) -> dict:
    vacio = {b: 0 for b in BOTONES}
    vacio.update({
        "detalle": {},
        "etapa_dominante": "error_analisis",
        "confianza": 0.0,
        "total_tallos": 0,
        "total_con_boton": 0,
        "total_sin_boton": 0,
        "error": True,
        "mensaje_error": mensaje,
        "nota_solapamiento": f"Análisis fallido: {mensaje}",
    })
    for b in BOTONES:
        vacio[f"total_{b}"] = 0
    return vacio


def _procesar_respuesta(datos: dict) -> dict:
    conteo = datos.get("conteo", {})

    resultado = {
        "detalle": datos,
        "etapa_dominante": datos.get("etapa_dominante", "sin_flor"),
        "confianza": datos.get("confianza", 0.0),
        "nota_solapamiento": datos.get("nota_solapamiento", ""),
        "error": False,
    }

    for boton in BOTONES:
        resultado[f"total_{boton}"] = conteo.get(boton, 0)

    resultado["total_tallos"] = sum(conteo.get(b, 0) for b in BOTONES)
    resultado["total_con_boton"] = sum(conteo.get(b, 0) for b in BOTONES if b != "sin_boton")
    resultado["total_sin_boton"] = conteo.get("sin_boton", 0)

    return resultado


def _texto_intro_foto(lado: str, filas: int, variedad: str = None) -> str:
    lado_opuesto = "B" if lado == "A" else "A"
    info_variedad = f"La variedad de rosas cultivada es: {variedad}.\n" if variedad else ""
    return (
        f"Actúa como un agrónomo y experto en visión artificial especializado en floricultura de precisión.\n"
        f"{info_variedad}"
        f"Tu tarea es realizar un censo visual ultra-preciso de los tallos y botones de rosas en el LADO {lado} de una cama de cultivo.\n"
        f"Esta cama tiene {filas} fila(s) de plantas.\n\n"

        f"=== REGLA DE ORO DE SEGMENTACIÓN ESPACIAL Y PROFUNDIDAD (CRÍTICA) ===\n"
        f"1. PRIMER PLANO (OBJETIVO):\n"
        f"   - Cuenta EXCLUSIVAMENTE los tallos y botones que pertenezcan a la fila del primer plano del LADO {lado}.\n"
        f"   - Las hojas y botones de este lado se caracterizan por una alta nitidez, texturas de hojas bien enfocadas y un tamaño relativo mayor.\n"
        f"2. IDENTIFICACIÓN DE BARRERAS FÍSICAS:\n"
        f"   - Localiza visualmente la malla metálica de soporte o los alambres tensores longitudinales que corren por el centro de la cama.\n"
        f"   - CUALQUIER botón o flor situado detrás de estos tensores centrales pertenece al LADO {lado_opuesto} o a una cama vecina. IGÓRALOS por completo.\n"
        f"3. TAMAÑO VS DISTANCIA:\n"
        f"   - No confundas un botón del primer plano que sea pequeño debido a su yema temprana (ej. 'arroz' o 'alberja') con un botón grande del Lado B o cama vecina que se vea pequeño debido a la distancia.\n"
        f"   - Los botones pequeños del primer plano están completamente enfocados y rodeados por follaje nítido.\n\n"

        f"=== CALIBRACIÓN BOTÁNICA DEL ESTADO DEL BOTÓN ===\n"
        f"Para cada tallo único en el primer plano, clasifica su estado de botón (NO clasifiques por longitud del tallo):\n"
        f"   - cosecha: Flor madura lista para corte, pétalos abiertos formando la copa.\n"
        f"   - estrella: Botón abriendo, sépalos totalmente extendidos en forma de estrella.\n"
        f"   - rayando_color: Sépalos ligeramente abiertos en la punta, revelando color. Botón cerrado.\n"
        f"   - garbanzo: Botón verde, redondo y cerrado. Tamaño de un garbanzo.\n"
        f"   - alberja: Botón verde, cerrado, tamaño de una alberja/chícharo.\n"
        f"   - arroz: Yema incipiente, tamaño de un grano de arroz.\n"
        f"   - sin_boton: Tallo podado, ciego o sin botón visible.\n\n"
        f"Imágenes de referencia para calibrar las etapas del botón:"
    )


def _texto_formato_json() -> str:
    return (
        '\nResponde UNICAMENTE con un objeto JSON con este formato exacto, sin texto adicional:\n'
        '{\n'
        '  "conteo": {"cosecha":0,"estrella":0,"rayando_color":0,"garbanzo":0,"alberja":0,"arroz":0,"sin_boton":0},\n'
        '  "etapa_dominante": "nombre_etapa",\n'
        '  "confianza": 0.0\n'
        '}'
    )


def clasificar_tallos(ruta_imagen: str, lado: str = "A", filas: int = 1, variedad: str = None) -> dict:
    client = anthropic.Anthropic()
    referencias = cargar_referencias()

    contenido = []
    contenido.append({"type": "text", "text": _texto_intro_foto(lado, filas, variedad)})

    for categoria, (data, media_type) in referencias.items():
        nombre = categoria.replace("boton_", "").replace("_", " ")
        contenido.append({"type": "text", "text": f"\nReferencia — {nombre}:"})
        contenido.append({
            "type": "image",
            "source": {"type": "base64", "media_type": media_type, "data": data}
        })

    data_analizar, media_type_analizar = imagen_a_base64(ruta_imagen)
    contenido.append({
        "type": "text",
        "text": (
            f"\nAhora analiza esta fotografia del LADO {lado}. "
            "Cuenta solo las plantas del primer plano de este lado."
        ) + _texto_formato_json()
    })
    contenido.append({
        "type": "image",
        "source": {"type": "base64", "media_type": media_type_analizar, "data": data_analizar}
    })

    respuesta = client.messages.create(
        model="claude-3-haiku-20240307",
        max_tokens=2000,
        messages=[{"role": "user", "content": contenido}]
    )

    texto = respuesta.content[0].text.strip()
    texto = texto.replace("```json", "").replace("```", "").strip()
    datos = json.loads(texto)
    return _procesar_respuesta(datos)


def clasificar_con_fallback(ruta_imagen: str, lado: str = "A", filas: int = 1, variedad: str = None) -> dict:
    try:
        return clasificar_tallos(ruta_imagen, lado=lado, filas=filas, variedad=variedad)
    except Exception as e:
        print(f"ERROR EN EL CLASIFICADOR: {e}")
        return _resultado_error(str(e))