import os
import anthropic
from dotenv import load_dotenv

# Cargar variables del archivo .env local
load_dotenv()

api_key = os.getenv("ANTHROPIC_API_KEY")
if not api_key:
    print("[ERROR] No se encontro la variable ANTHROPIC_API_KEY en el archivo .env")
    exit(1)

print(f"[INFO] Diagnosticando API Key (inicia con: {api_key[:15]}...)")
client = anthropic.Anthropic(api_key=api_key)

modelos_a_probar = [
    "claude-3-5-sonnet-20241022",
    "claude-3-5-sonnet-20240620",
    "claude-3-5-sonnet-latest",
    "claude-3-haiku-20240307",
    "claude-3-opus-20240229"
]

for modelo in modelos_a_probar:
    print(f"\nProbando modelo: '{modelo}'...")
    try:
        respuesta = client.messages.create(
            model=modelo,
            max_tokens=10,
            messages=[{"role": "user", "content": "Hola, responde solo con la palabra 'OK'."}]
        )
        texto = respuesta.content[0].text.strip()
        print(f"  [EXITO] El modelo esta disponible! Respuesta: '{texto}'")
    except anthropic.NotFoundError as e:
        print(f"  [NO DISPONIBLE] Error 404 (No encontrado / No tienes acceso)")
    except anthropic.APIStatusError as e:
        print(f"  [ERROR API] Codigo {e.status_code}: {e.message}")
    except Exception as e:
        print(f"  [ERROR GENERAL]: {type(e).__name__} - {str(e)}")

print("\n--- Diagnostico finalizado ---")
