"""Reconnaissance vocale locale de Jarvis (Whisper, sur le Mac, sans Internet).
Reçoit sur stdin des lignes JSON {"id": ..., "path": "fichier PCM 16 kHz mono int16"},
renvoie sur stdout {"id": ..., "text": ..., "ms": ...}. Le modèle reste chargé en mémoire."""
import json
import sys
import time

import numpy as np
from faster_whisper import WhisperModel

MODEL = sys.argv[1] if len(sys.argv) > 1 else "small"
# « small » pour les phrases courtes (rapide) ; un modèle plus précis, chargé à la demande, pour les longues dictées.
models = {MODEL: WhisperModel(MODEL, device="cpu", compute_type="int8")}
def get(name):
    if name not in models:
        models[name] = WhisperModel(name, device="cpu", compute_type="int8")
    return models[name]
# Les mots qu'il doit reconnaître du premier coup.
PROMPT = "Jarvis, Keeply, Keeply HQ, Tapas World, Agadir, Marrakech, Instagram, Meta Ads, prospection, Claude."
print(json.dumps({"ready": True, "model": MODEL}), flush=True)

for line in sys.stdin:
    try:
        job = json.loads(line)
        t = time.time()
        audio = np.fromfile(job["path"], dtype=np.int16).astype(np.float32) / 32768
        segs, _ = get(job.get("model") or MODEL).transcribe(audio, language="fr", beam_size=1, vad_filter=True, initial_prompt=PROMPT, condition_on_previous_text=False)
        # On garde seulement ce que Whisper a entendu clairement (une voix lointaine ou la télé donne une
        # transcription peu sûre : probabilité de « pas de parole » haute ou confiance basse).
        text = " ".join(s.text.strip() for s in segs if s.no_speech_prob < 0.6 and s.avg_logprob > -1.0).strip()
        # Whisper invente parfois une phrase sur du silence : on l'écarte.
        if text.lower().strip(" .!") in {"", "merci", "sous-titres réalisés par la communauté d'amara.org", "merci d'avoir regardé"}:
            text = ""
        print(json.dumps({"id": job["id"], "text": text, "ms": int((time.time() - t) * 1000)}), flush=True)
    except Exception as e:  # une erreur sur un extrait ne doit pas arrêter le service
        print(json.dumps({"id": job.get("id") if isinstance(job, dict) else None, "error": str(e)}), flush=True)
