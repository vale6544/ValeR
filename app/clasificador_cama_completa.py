import anthropic
import base64
import os
import json
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

TALLOS = ["tallo_largo", "tallo_medio", "tallo_corto"]
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


def _resultado_vacio() -> dict:
    vacio = {f"{t}_{b}": 0 for t in TALLOS for b in BOTONES}
    vacio.update({
        "detalle": {},
        "etapa_dominante": "error_clasificacion",
        "confianza": 0.0,
        "total_tallos": 0,
        "total_con_boton": 0,
        "total_sin_boton": 0,
        "nota_solapamiento": ""
    })
    for b in BOTONES:
        vacio[f"total_{b}"] = 0
    for t in TALLOS:
        vacio[f"total_{t}"] = 0
    return vacio


def _procesar_respuesta(datos: dict) -> dict:
    resultado = {
        "detalle": datos,
        "etapa_dominante": datos.get("etapa_dominante", "sin_flor"),
        "confianza": datos.get("confianza", 0.0),
        "nota_solapamiento": datos.get("nota_solapamiento", "")
    }

    for tallo in TALLOS:
        for boton in BOTONES:
            resultado[f"{tallo}_{boton}"] = datos.get(tallo, {}).get(boton, 0)

    resultado["total_tallos"] = sum(
        datos.get(t, {}).get(b, 0) for t in TALLOS for b in BOTONES
    )
    resultado["total_con_boton"] = sum(
        datos.get(t, {}).get(b, 0) for t in TALLOS for b in BOTONES if b != "sin_boton"
    )
    resultado["total_sin_boton"] = sum(
        datos.get(t, {}).get("sin_boton", 0) for t in TALLOS
    )
    for boton in BOTONES:
        resultado[f"total_{boton}"] = sum(
            datos.get(t, {}).get(boton, 0) for t in TALLOS
        )
    for tallo in TALLOS:
        resultado[f"total_{tallo}"] = sum(
            datos.get(tallo, {}).get(b, 0) for b in BOTONES
        )

    return resultado


def _texto_intro_cama_completa_lado(lado: str, total_fotogramas: int, filas: int, variedad: str = None) -> str:
    lado_opuesto = "B" if lado == "A" else "A"
    info_variedad = f"La variedad de rosas cultivada es: {variedad}.\n" if variedad else ""
    return (
        f"Actúa como un agrónomo y experto en visión artificial especializado en agricultura de precisión para floricultura.\n"
        f"Tu objetivo es realizar un censo consolidado y ultra-preciso de los tallos y botones de rosas en una CAMA COMPLETA CONTINUA analizando el pasillo del LADO {lado}.\n"
        f"Se te proporciona una secuencia cronológica de {total_fotogramas} fotogramas extraídos de un video continuo tomado a lo largo del LADO {lado}.\n"
        f"Las imágenes cubren la totalidad del recorrido de toda la cama por este lado.\n"
        f"{info_variedad}"
        f"Esta cama tiene {filas} fila(s) de plantas.\n\n"
        
        f"=== REGLA DE ORO DE SEGMENTACIÓN ESPACIAL (CRÍTICA) ===\n"
        f"1. Cuenta exclusivamente los tallos y botones que pertenecen al primer plano del LADO {lado} (el lado pasillo por donde pasa la cámara).\n"
        f"2. IGNORA por completo cualquier flor del fondo (LADO {lado_opuesto}), las cuales se distinguen por estar detrás de los tensores metálicos, mallas de soporte central, o ser notablemente más borrosas y pequeñas.\n"
        f"3. Ignora flores de camas contiguas separadas por el pasillo.\n\n"
        
        f"=== PROTOCOLO ANTI-DUPLICACIÓN EXHAUSTIVO PARA CAMAS COMPLETAS (CRÍTICO) ===\n"
        f"Para garantizar un censo consolidado único sin importar la longitud de la cama:\n"
        f"1. IDENTIFICA PUNTOS DE REFERENCIA ESTRUCTURALES:\n"
        f"   - Busca postes de soporte de madera o metal, uniones de mallas, tensores principales o marcas en el suelo a lo largo de los fotogramas para usarlos como anclas espaciales de transición.\n"
        f"2. ESTIMACIÓN DE SOLAPE TEMPORAL:\n"
        f"   - Compara Fotograma N con Fotograma N+1. Identifica qué porción del encuadre es redundante (zona de solape) y qué porción es nueva (zona nueva de avance).\n"
        f"   - Suma únicamente las rosas nuevas que entran por primera vez en la 'zona nueva' de avance. Descarta y no vuelvas a registrar las que ya contaste en la zona de solape.\n"
        f"3. DEDUPLICACIÓN ACTIVA:\n"
        f"   - Si el avance es lento, los mismos tallos se mantendrán en múltiples fotogramas. Haz un seguimiento individual de cada flor a medida que cruza la pantalla.\n\n"
        
        f"=== REGLA DE LOS BORDES (ANTI-DUPLICACIÓN) (CRÍTICA) ===\n"
        f"1. NUNCA cuentes una flor o tallo si está parcialmente cortado por el borde lateral (izquierdo o derecho) del fotograma.\n"
        f"2. Si una flor está asomando o entrando por el borde de avance, IGNÓRALA por completo. Cuéntala ÚNICAMENTE en el siguiente fotograma, cuando ya haya entrado por completo y sea 100% visible dentro del encuadre.\n"
        f"3. Esta es la única forma de garantizar que no cuentes la misma flor a medias en un fotograma y entera en el siguiente.\n\n"
        
        f"=== CALIBRACIÓN BOTÁNICA DE LOS ATRIBUTOS ===\n"
        f"Clasifica cada tallo único bajo estos criterios:\n"
        f"1. LARGO DEL TALLO:\n"
        f"   - tallo_largo: Ocupa >2/3 de la altura visible del dosel.\n"
        f"   - tallo_medio: Ocupa entre 1/3 y 2/3 de la altura visible.\n"
        f"   - tallo_corto: Ocupa <1/3 de la altura visible.\n\n"
        f"2. ESTADO DEL BOTÓN:\n"
        f"   - cosecha: Flor madura lista para corte, pétalos abiertos formando la copa.\n"
        f"   - estrella: Botón abriendo, sépalos extendidos en forma de estrella.\n"
        f"   - rayando_color: Sépalos ligeramente abiertos en la punta, revelando color. Botón cerrado.\n"
        f"   - garbanzo: Botón verde, redondo y cerrado. Tamaño de un garbanzo.\n"
        f"   - alberja: Botón verde, cerrado, tamaño de una alberja/chícharo.\n"
        f"   - arroz: Yema incipiente, tamaño de un grano de arroz.\n"
        f"   - sin_boton: Tallo podado, ciego o sin botón visible.\n"
        f"   * REGLA ESTRICTA DE CLASIFICACIÓN: Sé extremadamente cuidadoso al usar la categoría sin_boton. Si logras identificar cualquier indicio de un botón floral formándose, por más pequeño u oculto que esté entre las hojas, DEBES clasificarlo en su etapa fenológica correspondiente (ej. arroz) y NUNCA como sin_boton. Solo usa sin_boton para tallos claramente ciegos o ya podados.\n\n"
        
        f"Imágenes de referencia para calibrar las etapas del botón:"
    )


def _texto_formato_json_cama_completa_lado(lado: str) -> str:
    return (
        f'\nResponde UNICAMENTE con un objeto JSON con este formato exacto para el LADO {lado}, sin texto adicional:\n'
        '{\n'
        '  "razonamiento_previo": {\n'
        '    "analisis_movimiento": "Determina la dirección del avance de la cámara e identifica los postes o referencias estructurales usadas como anclas.",\n'
        '    "control_solapamiento": "Explica la deduplicación de tallos entre fotogramas consecutivos y cómo evitaste el sobreconteo."\n'
        '  },\n'
        '  "tallo_largo": {"cosecha":0,"estrella":0,"rayando_color":0,"garbanzo":0,"alberja":0,"arroz":0,"sin_boton":0},\n'
        '  "tallo_medio": {"cosecha":0,"estrella":0,"rayando_color":0,"garbanzo":0,"alberja":0,"arroz":0,"sin_boton":0},\n'
        '  "tallo_corto": {"cosecha":0,"estrella":0,"rayando_color":0,"garbanzo":0,"alberja":0,"arroz":0,"sin_boton":0},\n'
        '  "etapa_dominante": "nombre_etapa",\n'
        '  "confianza": 0.0,\n'
        '  "nota_solapamiento": "breve explicacion de como evitaste duplicados y plantas del lado opuesto"\n'
        '}'
    )


def clasificar_un_lado(
    rutas_fotogramas: list,
    lado: str,
    filas: int = 1,
    variedad: str = None
) -> dict:
    client = anthropic.Anthropic()
    referencias = cargar_referencias()

    contenido = []
    contenido.append({
        "type": "text",
        "text": _texto_intro_cama_completa_lado(lado, len(rutas_fotogramas), filas, variedad)
    })

    for categoria, (data, media_type) in referencias.items():
        nombre = categoria.replace("boton_", "").replace("_", " ")
        contenido.append({"type": "text", "text": f"\nReferencia — {nombre}:"})
        contenido.append({
            "type": "image",
            "source": {"type": "base64", "media_type": media_type, "data": data}
        })

    contenido.append({
        "type": "text",
        "text": (
            f"\nA continuación se presentan los {len(rutas_fotogramas)} fotogramas representativos "
            f"del recorrido continuo a lo largo del LADO {lado}, ordenados cronológicamente "
            f"(del inicio de la cama al final):"
        )
    })

    for i, ruta in enumerate(rutas_fotogramas, 1):
        data, media_type = imagen_a_base64(ruta)
        contenido.append({
            "type": "text",
            "text": f"\nFotograma {i} de {len(rutas_fotogramas)} — LADO {lado}:"
        })
        contenido.append({
            "type": "image",
            "source": {"type": "base64", "media_type": media_type, "data": data}
        })

    contenido.append({
        "type": "text",
        "text": _texto_formato_json_cama_completa_lado(lado)
    })

    try:
        respuesta = client.messages.create(
            model="claude-3-5-sonnet-20241022",  # Modelo oficial de producción
            max_tokens=3000,
            messages=[{"role": "user", "content": contenido}]
        )

        texto = respuesta.content[0].text.strip()
        print(f"\n--- RESPUESTA CRUDA DE CLAUDE LADO {lado} ---")
        print(texto)
        print("---------------------------------------------\n")
        
        texto = texto.replace("```json", "").replace("```", "").strip()
        datos = json.loads(texto)
        return datos
    except Exception as e:
        print(f"ERROR EN clasificar_un_lado PARA LADO {lado}: {e}")
        import traceback
        traceback.print_exc()
        raise e


def sumar_resultados(datos_a: dict, datos_b: dict) -> dict:
    resultado = {
        "razonamiento_previo": {
            "analisis_lado_A": datos_a.get("razonamiento_previo", {}).get("control_solapamiento", "") or datos_a.get("razonamiento_previo", {}).get("analisis_movimiento", ""),
            "analisis_lado_B": datos_b.get("razonamiento_previo", {}).get("control_solapamiento", "") or datos_b.get("razonamiento_previo", {}).get("analisis_movimiento", "")
        },
        "nota_solapamiento": f"Lado A: {datos_a.get('nota_solapamiento', '')} | Lado B: {datos_b.get('nota_solapamiento', '')}"
    }

    # Sumar matrices tallo x boton
    for tallo in TALLOS:
        resultado[tallo] = {}
        for boton in BOTONES:
            val_a = datos_a.get(tallo, {}).get(boton, 0)
            val_b = datos_b.get(tallo, {}).get(boton, 0)
            resultado[tallo][boton] = val_a + val_b

    # Determinar etapa dominante agregada
    totales_botones = {b: 0 for b in BOTONES if b != "sin_boton"}
    for b in totales_botones.keys():
        totales_botones[b] = sum(resultado[t][b] for t in TALLOS)

    etapa_dominante = max(totales_botones, key=totales_botones.get) if any(totales_botones.values()) else "sin_flor"
    resultado["etapa_dominante"] = etapa_dominante

    # Promedio de confianza
    conf_a = datos_a.get("confianza", 0.0)
    conf_b = datos_b.get("confianza", 0.0)
    resultado["confianza"] = round((conf_a + conf_b) / 2.0, 2)

    return resultado


def clasificar_cama_completa(
    rutas_a: list,
    rutas_b: list,
    filas: int = 1,
    variedad: str = None
) -> dict:
    # LLamadas separadas a Claude por Lado
    datos_a = clasificar_un_lado(rutas_a, lado="A", filas=filas, variedad=variedad)
    datos_b = clasificar_un_lado(rutas_b, lado="B", filas=filas, variedad=variedad)
    
    # Sumar resultados matemáticamente
    resultado_sumado = sumar_resultados(datos_a, datos_b)
    
    # Formatear el resultado final de vuelta
    return _procesar_respuesta(resultado_sumado)


def clasificar_cama_completa_con_fallback(
    rutas_a: list,
    rutas_b: list,
    filas: int = 1,
    variedad: str = None
) -> dict:
    try:
        return clasificar_cama_completa(rutas_a, rutas_b, filas=filas, variedad=variedad)
    except Exception as e:
        print(f"ERROR EN EL CLASIFICADOR DE CAMA COMPLETA: {e}")
        import traceback
        traceback.print_exc()
        return _resultado_vacio()
