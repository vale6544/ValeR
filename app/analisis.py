import cv2
import numpy as np


def preprocesar_imagen(ruta: str):
    imagen = cv2.imread(ruta)
    if imagen is None:
        raise ValueError(f"No se pudo cargar la imagen: {ruta}")
    lab = cv2.cvtColor(imagen, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
    l = clahe.apply(l)
    lab = cv2.merge((l, a, b))
    imagen = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)
    alto, ancho = imagen.shape[:2]
    if ancho > 1200:
        factor = 1200 / ancho
        imagen = cv2.resize(imagen, (1200, int(alto * factor)))
    return imagen


def detectar_flores(imagen):
    hsv = cv2.cvtColor(imagen, cv2.COLOR_BGR2HSV)
    rojo1 = cv2.inRange(hsv, np.array([0,   80, 50]),  np.array([12,  255, 255]))
    rojo2 = cv2.inRange(hsv, np.array([150, 60, 50]),  np.array([180, 255, 255]))
    rosa  = cv2.inRange(hsv, np.array([135, 50, 50]),  np.array([175, 255, 255]))
    mascara = cv2.bitwise_or(cv2.bitwise_or(rojo1, rojo2), rosa)
    kernel = np.ones((5, 5), np.uint8)
    mascara = cv2.morphologyEx(mascara, cv2.MORPH_CLOSE, kernel)
    mascara = cv2.morphologyEx(mascara, cv2.MORPH_OPEN,  kernel)
    contornos, _ = cv2.findContours(mascara, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    alto_img, ancho_img = imagen.shape[:2]
    area_total = alto_img * ancho_img
    flores = [c for c in contornos if 80 < cv2.contourArea(c) < area_total * 0.10]
    return flores, alto_img


def clasificar_flores_por_altura(flores, alto_imagen: int):
    tallos_cortos = 0
    tallos_medios = 0
    tallos_largos = 0
    for flor in flores:
        x, y, w, h = cv2.boundingRect(flor)
        centro_y = y + h / 2
        posicion_relativa = centro_y / alto_imagen
        if posicion_relativa > 0.65:
            tallos_largos += 1
        elif posicion_relativa > 0.35:
            tallos_medios += 1
        else:
            tallos_cortos += 1
    return tallos_cortos, tallos_medios, tallos_largos


def detectar_etapa_crecimiento(flores, imagen):
    if len(flores) == 0:
        return "sin_flor"
    puntaje_boton = 0
    puntaje_apertura = 0
    puntaje_abierta = 0
    for flor in flores:
        x, y, w, h = cv2.boundingRect(flor)
        ratio = h / w if w > 0 else 1
        if ratio > 1.4:
            puntaje_boton += 1
        elif ratio > 0.9:
            puntaje_apertura += 1
        else:
            puntaje_abierta += 1
    max_p = max(puntaje_boton, puntaje_apertura, puntaje_abierta)
    if max_p == puntaje_boton:
        return "boton_cerrado"
    elif max_p == puntaje_apertura:
        return "en_apertura"
    else:
        return "flor_abierta"


def calcular_confianza(flores, imagen):
    n = len(flores)
    if n == 0:
        return 0.25
    elif n < 3:
        return 0.50
    elif n < 8:
        return 0.72
    elif n < 20:
        return 0.85
    else:
        return 0.91


def analizar_imagen(ruta: str) -> dict:
    try:
        imagen = preprocesar_imagen(ruta)
        flores, alto_imagen = detectar_flores(imagen)
        tallos_cortos, tallos_medios, tallos_largos = clasificar_flores_por_altura(flores, alto_imagen)
        etapa = detectar_etapa_crecimiento(flores, imagen)
        confianza = calcular_confianza(flores, imagen)
        total = tallos_cortos + tallos_medios + tallos_largos
        return {
            "etapa_crecimiento": etapa,
            "tallos_cortos": tallos_cortos,
            "tallos_medios": tallos_medios,
            "tallos_largos": tallos_largos,
            "total_tallos": total,
            "score_confianza": confianza
        }
    except Exception as e:
        return {
            "etapa_crecimiento": "error_analisis",
            "tallos_cortos": 0,
            "tallos_medios": 0,
            "tallos_largos": 0,
            "total_tallos": 0,
            "score_confianza": 0.0
        }