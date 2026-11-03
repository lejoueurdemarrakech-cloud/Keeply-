"""Reconnaissance vocale locale de Jarvis (Whisper, sur le Mac, sans Internet).
Reçoit sur stdin des lignes JSON {"id": ..., "path": "fichier PCM 16 kHz mono int16"},
renvoie sur stdout {"id": ..., "text": ..., "ms": ...}. Le modèle reste chargé en mémoire."""
import json
import sys
import time

import numpy as np
from faster_whisper import WhisperModel

MODEL = sys.argv[1] if len(sys.argv) > 1 else "small"
model = WhisperModel(MODEL, device="cpu", compute_type="int8")
# Les mots qu'il doit reconnaître du premier coup.
PROMPT = "Jarvis, Keeply, Keeply HQ, Tapas World, Agadir, Marrakech, Instagram, Meta Ads, prospection, Claude."
print(json.dumps({"ready": True, "model": MODEL}), flush=True)

for line in sys.stdin:
    try:
        job = json.loads(line)
        t = time.time()
        audio = np.fromfile(job["path"], dtype=np.int16).astype(np.float32) / 32768
        segs, _ = model.transcribe(audio, language="fr", beam_size=1, vad_filter=True, initial_prompt=PROMPT, condition_on_previous_text=False)
        text = " ".join(s.text.strip() for s in segs).strip()
        # Whisper invente parfois une phrase sur du silence : on l'écarte.
        if text.lower().strip(" .!") in {"", "merci", "sous-titres réalisés par la communauté d'amara.org", "merci d'avoir regardé"}:
            text = ""
        print(json.dumps({"id": job["id"], "text": text, "ms": int((time.time() - t) * 1000)}), flush=True)
    except Exception as e:  # une erreur sur un extrait ne doit pas arrêter le service
        print(json.dumps({"id": job.get("id") if isinstance(job, dict) else None, "error": str(e)}), flush=True)
