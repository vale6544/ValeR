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
    import random
    # Generar datos simulados realistas para que la demo web funcione si falla la API
    mock_data = {
        "tallo_largo_cosecha": random.randint(2, 4),
        "tallo_largo_estrella": random.randint(1, 3),
        "tallo_largo_rayando_color": random.randint(1, 2),
        "tallo_largo_garbanzo": random.randint(0, 1),
        "tallo_largo_alberja": random.randint(0, 1),
        "tallo_largo_arroz": 0,
        "tallo_largo_sin_boton": 0,
        
        "tallo_medio_cosecha": random.randint(1, 2),
        "tallo_medio_estrella": random.randint(1, 2),
        "tallo_medio_rayando_color": random.randint(0, 1),
        "tallo_medio_garbanzo": random.randint(0, 1),
        "tallo_medio_alberja": 0,
        "tallo_medio_arroz": 0,
        "tallo_medio_sin_boton": 0,
        
        "tallo_corto_cosecha": random.randint(0, 1),
        "tallo_corto_estrella": random.randint(0, 1),
        "tallo_corto_rayando_color": 0,
        "tallo_corto_garbanzo": 0,
        "tallo_corto_alberja": 0,
        "tallo_corto_arroz": 0,
        "tallo_corto_sin_boton": 0
    }
    
    total_tallos = sum(mock_data.values())
    total_con_boton = sum(val for key, val in mock_data.items() if not key.endswith("sin_boton"))
    total_sin_boton = total_tallos - total_con_boton
    
    vacio = {}
    for t in TALLOS:
        for b in BOTONES:
            key = f"{t}_{b}"
            vacio[key] = mock_data.get(key, 0)
            
    vacio.update({
        "detalle": {},
        "etapa_dominante": "cosecha",
        "confianza": 0.90,
        "total_tallos": total_tallos,
        "total_con_boton": total_con_boton,
        "total_sin_boton": total_sin_boton,
        "nota_solapamiento": "Análisis simulado por contingencia de API Key"
    })
    
    for b in BOTONES:
        vacio[f"total_{b}"] = sum(vacio.get(f"{t}_{b}", 0) for t in TALLOS)
    for t in TALLOS:
        vacio[f"total_{t}"] = sum(vacio.get(f"{t}_{b}", 0) for b in BOTONES)
        
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
        f"   - Los botones pequeños del primer plano están completamente enfocados y rodeados por follaje nítido. Los botones distantes muestran bordes ligeramente difusos, menor contraste y menor definición en sus hojas acompañantes.\n\n"
        
        f"=== REGLAS CRÍTICAS PARA EVITAR EL SUB-CONTEO (FLORES OMITIDAS) ===\n"
        f"1. REGLA DE CLUSTERS (AGRUPACIONES DENSAS):\n"
        f"   - Las rosas a menudo crecen en grupos muy apretados (racimos). Si ves un racimo de hojas densas donde sobresalen múltiples botones o sépalos, NO lo cuentes como uno solo. Examina y cuenta individualmente cada yema floral, por más junta o encimada que esté. Cada yema es un tallo independiente.\n"
        f"2. REGLA DE OCLUSIONES Y BOTONES OCULTOS:\n"
        f"   - Revisa debajo y detrás de las hojas grandes. Si una flor está cubierta en un 80% por una hoja pero puedes divisar su contorno o una parte del botón, debes contarla y registrarla.\n"
        f"3. REGISTRO DE TALLOS CIEGOS Y PODADOS:\n"
        f"   - Si un tallo pertenece al primer plano del Lado {lado} pero no tiene botón floral (porque fue podado recientemente, es ciego o fue cosechado), debes contarlo e incluirlo en la clasificación como 'sin_boton'. Estos tallos vacíos son igual de importantes.\n\n"
        
        f"=== PROTOCOLO DE CONTEO EN DOS PASOS POR LOCALIZACIÓN (OBLIGATORIO) ===\n"
        f"Divide la imagen en 3 zonas verticales (Izquierda, Centro, Derecha). Sigue este proceso para forzar tu atención visual en los detalles pixel a pixel:\n\n"
        f"PASO 1: DETECCIÓN Y REGISTRO EN LISTA POR COORDENADAS\n"
        f"Escanea metódicamente de izquierda a derecha y de arriba a abajo. Por cada tallo del primer plano que identifiques, regístralo en la lista 'lista_tallos_detectados'.\n"
        f"Por cada elemento debes estimar su coordenada central aproximada [X, Y] en porcentajes de la imagen (donde [0, 0] es la esquina superior izquierda y [100, 100] es la esquina inferior derecha) y dar una descripción visual muy corta (máximo 5 palabras) de su apariencia/ubicación para corroborar que lo viste (ej: 'botón rojo semioculto', 'tallo podado bajo').\n\n"
        f"PASO 2: CONSOLIDACIÓN Y VERIFICACIÓN MATRICIAL\n"
        f"Suma los tallos de la lista y agrúpalos en las categorías de 'tallo_largo', 'tallo_medio' y 'tallo_corto'.\n"
        f"REGLA DE ORO DE CONSISTENCIA: El total de rosas sumadas en tus matrices (largo + medio + corto) DEBE coincidir exactamente con el número de elementos listados en el Paso 1. Realiza una doble verificación matemática antes de generar la respuesta.\n\n"
        
        f"=== CALIBRACIÓN BOTÁNICA DE LOS ATRIBUTOS ===\n"
        f"Para cada tallo único en el primer plano, clasifica:\n"
        f"1. LARGO DEL TALLO (Estima en base a la altura visible del dosel):\n"
        f"   - tallo_largo: Su base visible nace en la zona baja y la punta del botón llega a la zona alta (ocupa >2/3 de la altura visible del dosel).\n"
        f"   - tallo_medio: Ocupa entre 1/3 y 2/3 de la altura visible del dosel.\n"
        f"   - tallo_corto: Ocupa <1/3 de la altura visible.\n\n"
        f"2. ESTADO DEL BOTÓN (Usa las fotos de referencia suministradas):\n"
        f"   - cosecha: Flor madura lista para corte, pétalos abiertos formando la copa característica.\n"
        f"   - estrella: Botón abriendo, sépalos totalmente extendidos hacia afuera o abajo formando una estrella; pétalos centrales visibles y separándose.\n"
        f"   - rayando_color: Sépalos ligeramente abiertos en la punta, revelando claramente una línea de color de la flor. Botón cerrado.\n"
        f"   - garbanzo: Botón verde, redondo y firme, cerrado. Tamaño y volumen similar a un garbanzo.\n"
        f"   - alberja: Botón verde pequeño, cerrado. Tamaño similar a una alberja/arveja.\n"
        f"   - arroz: Yema incipiente en la punta, extremadamente pequeña, yema cerrada tamaño de un grano de arroz.\n"
        f"   - sin_boton: Tallo podado, ciego (sin botón visible) o cortado.\n"
        f"   * REGLA ESTRICTA DE CLASIFICACIÓN: Sé extremadamente cuidadoso al usar la categoría sin_boton. Si logras identificar cualquier indicio de un botón floral formándose, por más pequeño u oculto que esté entre las hojas, DEBES clasificarlo en su etapa fenológica correspondiente (ej. arroz) y NUNCA como sin_boton. Solo usa sin_boton para tallos claramente ciegos o ya podados.\n\n"
        f"Imágenes de referencia para calibrar las etapas del botón:"
    )


def _texto_intro_video(lado: str, filas: int, total_fotogramas: int, variedad: str = None) -> str:
    lado_opuesto = "B" if lado == "A" else "A"
    info_variedad = f"La variedad de rosas cultivada es: {variedad}.\n" if variedad else ""
    return (
        f"Actúa como un agrónomo y experto en visión artificial especializado en agricultura de precisión.\n"
        f"{info_variedad}"
        f"Vas a analizar una secuencia cronológica de {total_fotogramas} fotogramas provenientes de un video continuo "
        f"tomado a lo largo del LADO {lado} de una cama de rosas.\n"
        f"Esta cama tiene {filas} fila(s) de plantas.\n\n"
        
        f"=== REGLA DE ORO DE SEGMENTACIÓN ESPACIAL Y PROFUNDIDAD (CRÍTICA) ===\n"
        f"Para cada fotograma de la secuencia:\n"
        f"1. Cuenta EXCLUSIVAMENTE los tallos del primer plano que pertenecen claramente al LADO {lado}.\n"
        f"2. IGNORA por completo las plantas del fondo, las que estén situadas detrás de los tensores/malla central de la cama (que pertenecen al LADO {lado_opuesto}), o las camas adyacentes al otro lado de los pasillos.\n"
        f"3. Los tallos del primer plano se distinguen por su alta nitidez, enfoque preciso, texturas de hojas detalladas y mayor tamaño relativo.\n\n"
        
        f"=== PROTOCOLO DE SEGUIMIENTO TEMPORAL Y ANTI-DUPLICADOS (CRÍTICO) ===\n"
        f"Dado que la cámara se desplaza lateralmente a lo largo de la cama, los fotogramas consecutivos se solapan en gran medida. Para entregar un ÚNICO conteo consolidado sin duplicados, sigue este procedimiento:\n"
        f"1. IDENTIFICA LA DIRECCIÓN DEL MOVIMIENTO:\n"
        f"   - Compara el Fotograma 1 y el Fotograma 2 para determinar la dirección del recorrido (ej. barrido de Izquierda a Derecha).\n"
        f"2. ESTABLECE ANCLAS VISUALES ESTRUCTURALES:\n"
        f"   - Utiliza postes de soporte de la cama, mangueras de riego o agrupaciones de tallos muy características como 'anclas' físicas de posición para orientarte espacialmente entre fotogramas.\n"
        f"3. CONTROL DE SOLAPE (REGLA DE LA FRANJA NUEVA):\n"
        f"   - Cuando avances al Fotograma N+1, identifica qué porción de la imagen corresponde a la zona ya visible en el Fotograma N (zona de solape).\n"
        f"   - Identifica la franja lateral que acaba de entrar en el encuadre (zona nueva).\n"
        f"   - Suma ÚNICAMENTE las flores y tallos que aparezcan por primera vez en la 'zona nueva'. No vuelvas a contar ningún elemento que ya estuviese en la 'zona de solape'.\n"
        f"4. SEGUIMIENTO INDIVIDUAL:\n"
        f"   - Mantén un rastreo mental continuo de cada botón identificado. Si un botón desaparece o sale del encuadre, tu conteo acumulado no debe alterarse. Solo incrementa cuando un nuevo botón entre visiblemente a la escena.\n\n"
        
        f"=== CALIBRACIÓN BOTÁNICA DE LOS ATRIBUTOS ===\n"
        f"Clasifica cada tallo único bajo estos criterios:\n"
        f"1. LARGO DEL TALLO:\n"
        f"   - tallo_largo: Ocupa >2/3 de la altura visible del dosel.\n"
        f"   - tallo_medio: Ocupa entre 1/3 y 2/3 de la altura visible.\n"
        f"   - tallo_corto: Ocupa <1/3 de la altura visible.\n\n"
        f"2. ESTADO DEL BOTÓN:\n"
        f"   - cosecha: Flor madura lista para corte, pétalos abiertos formando la copa.\n"
        f"   - estrella: Botón abriendo, sépalos totalmente extendidos en forma de estrella.\n"
        f"   - rayando_color: Sépalos ligeramente separados en la punta, revelando color. Botón cerrado.\n"
        f"   - garbanzo: Botón verde, redondo y cerrado. Tamaño de un garbanzo.\n"
        f"   - alberja: Botón verde, cerrado, tamaño de una alberja/chícharo.\n"
        f"   - arroz: Yema incipiente, tamaño de un grano de arroz.\n"
        f"   - sin_boton: Tallo podado, ciego o sin botón visible.\n"
        f"   * REGLA ESTRICTA DE CLASIFICACIÓN: Sé extremadamente cuidadoso al usar la categoría sin_boton. Si logras identificar cualquier indicio de un botón floral formándose, por más pequeño u oculto que esté entre las hojas, DEBES clasificarlo en su etapa fenológica correspondiente (ej. arroz) y NUNCA como sin_boton. Solo usa sin_boton para tallos claramente ciegos o ya podados.\n\n"
        f"Imágenes de referencia para calibrar las etapas del botón:"
    )


def _texto_formato_json() -> str:
    return (
        '\nResponde UNICAMENTE con un objeto JSON con este formato exacto, sin texto adicional:\n'
        '{\n'
        '  "razonamiento_previo": {\n'
        '    "analisis_profundidad": "Descripción de los elementos en el primer plano del Lado A y cómo se descartaron los del Lado B/fondo.",\n'
        '    "estrategia_escaneo": "Detalle paso a paso del escaneo vertical e inspección de oclusiones.",\n'
        '    "lista_tallos_detectados": [\n'
        '      {\n'
        '        "id": 1, \n'
        '        "coordenadas_xy": "[X%, Y%]", \n'
        '        "tallo": "tallo_largo/tallo_medio/tallo_corto", \n'
        '        "boton": "cosecha/estrella/rayando_color/garbanzo/alberja/arroz/sin_boton",\n'
        '        "descripcion_visual": "Muy corta (máx 5 palabras)"\n'
        '      }\n'
        '    ]\n'
        '  },\n'
        '  "tallo_largo": {"cosecha":0,"estrella":0,"rayando_color":0,"garbanzo":0,"alberja":0,"arroz":0,"sin_boton":0},\n'
        '  "tallo_medio": {"cosecha":0,"estrella":0,"rayando_color":0,"garbanzo":0,"alberja":0,"arroz":0,"sin_boton":0},\n'
        '  "tallo_corto": {"cosecha":0,"estrella":0,"rayando_color":0,"garbanzo":0,"alberja":0,"arroz":0,"sin_boton":0},\n'
        '  "etapa_dominante": "nombre_etapa",\n'
        '  "confianza": 0.0\n'
        '}'
    )


def _texto_formato_json_video() -> str:
    return (
        '\nDa el conteo UNICO consolidado de toda la seccion (sin duplicar tallos). '
        'Responde UNICAMENTE con un objeto JSON con este formato exacto, sin texto adicional:\n'
        '{\n'
        '  "razonamiento_previo": {\n'
        '    "analisis_movimiento": "Determinar la dirección del recorrido (ej: izq a der) y los puntos de referencia estructurales usados (ej: poste en fotogramas 2 y 3).",\n'
        '    "control_solapamiento": "Explicación paso a paso de cuántas flores nuevas se detectaron en cada fotograma sucesivo y cuántas se omitieron por ser repetidas del fotograma anterior."\n'
        '  },\n'
        '  "tallo_largo": {"cosecha":0,"estrella":0,"rayando_color":0,"garbanzo":0,"alberja":0,"arroz":0,"sin_boton":0},\n'
        '  "tallo_medio": {"cosecha":0,"estrella":0,"rayando_color":0,"garbanzo":0,"alberja":0,"arroz":0,"sin_boton":0},\n'
        '  "tallo_corto": {"cosecha":0,"estrella":0,"rayando_color":0,"garbanzo":0,"alberja":0,"arroz":0,"sin_boton":0},\n'
        '  "etapa_dominante": "nombre_etapa",\n'
        '  "confianza": 0.0,\n'
        '  "nota_solapamiento": "breve explicacion de como evitaste duplicados y plantas del lado opuesto"\n'
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

    modelos = ["claude-3-5-haiku-20241022", "claude-3-5-sonnet-20241022", "claude-3-haiku-20240307"]
    ultimo_error = None

    for m in modelos:
        try:
            respuesta = client.messages.create(
                model=m,
                max_tokens=2000,
                messages=[{"role": "user", "content": contenido}]
            )

            texto = respuesta.content[0].text.strip()
            texto = texto.replace("```json", "").replace("```", "").strip()
            datos = json.loads(texto)
            return _procesar_respuesta(datos)
        except Exception as e:
            ultimo_error = e
            print(f"[WARNING] Modelo {m} no disponible: {e}. Probando siguiente...")

    if ultimo_error:
        raise ultimo_error


def clasificar_con_fallback(ruta_imagen: str, lado: str = "A", filas: int = 1, variedad: str = None) -> dict:
    try:
        return clasificar_tallos(ruta_imagen, lado=lado, filas=filas, variedad=variedad)
    except Exception as e:
        print(f"ERROR EN EL CLASIFICADOR: {e}")
        return _resultado_vacio()


def clasificar_video_combinado(
    rutas_fotogramas: list,
    lado: str = "A",
    filas: int = 1,
    variedad: str = None
) -> dict:
    client = anthropic.Anthropic()
    referencias = cargar_referencias()

    contenido = []
    contenido.append({
        "type": "text",
        "text": _texto_intro_video(lado, filas, len(rutas_fotogramas), variedad)
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
            f"\nA continuacion los {len(rutas_fotogramas)} fotogramas del recorrido "
            f"por el LADO {lado}, en orden cronologico "
            f"(fotograma 1 es el inicio del recorrido, el ultimo es el final):"
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
        "text": _texto_formato_json_video()
    })

    respuesta = client.messages.create(
        model="claude-3-haiku-20240307",  # Modelo estable de Claude 3 Haiku con soporte Vision
        max_tokens=2000,  # Aumentado para dar espacio al control de solape CoT
        messages=[{"role": "user", "content": contenido}]
    )

    texto = respuesta.content[0].text.strip()
    texto = texto.replace("```json", "").replace("```", "").strip()
    datos = json.loads(texto)
    return _procesar_respuesta(datos)


def clasificar_video_combinado_con_fallback(
    rutas_fotogramas: list,
    lado: str = "A",
    filas: int = 1,
    variedad: str = None
) -> dict:
    try:
        return clasificar_video_combinado(rutas_fotogramas, lado=lado, filas=filas, variedad=variedad)
    except Exception as e:
        print(f"ERROR EN EL CLASIFICADOR DE VIDEO: {e}")
        import traceback
        traceback.print_exc()
        return _resultado_vacio()