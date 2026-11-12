# Acted takes for the dreams episode (2026-11-12)

`tts/act.py`: 3 VoiceDesign takes per line marked `act`, each with the line's emotion. Kept only if speaker similarity to the role's reference clip is >= 0.80 (Chatterbox VoiceEncoder; a clone measures ~0.88, a different person ~0.72) and Whisper heard >= 85% of the words. Otherwise the line is cloned, so no character changes voice.

Result: 12 of 28 acted lines use a take. Mom, Theo and the customer often matched; Dad, the coach, the bus driver and the teacher's designed takes drifted too far from their reference voices (0.58-0.78), so they stay cloned. Lesson: acting via VoiceDesign works best for voices whose reference clip was itself designed close to the emotion; for low/gruff voices, expect to clone.

Line 46 (Mom) had its text changed after the takes were made, so its takes were discarded.

| Line | Role | take 0 sim/words | take 1 | take 2 | Used |
|---|---|---|---|---|---|
| 2 | MOM | 0.77/1.00 | 0.56/1.00 | 0.82/1.00 | 002_2.wav |
| 3 | YOU | 0.75/1.00 | 0.73/1.00 | 0.78/1.00 | clone |
| 11 | DAD | 0.65/1.00 | 0.76/1.00 | 0.58/0.88 | clone |
| 12 | MOM | 0.81/1.00 | 0.73/1.00 | 0.74/1.00 | 012_0.wav |
| 14 | BUS DRIVER | 0.78/1.00 | 0.67/1.00 | 0.73/1.00 | clone |
| 17 | TEACHER | 0.77/1.00 | 0.78/0.92 | 0.68/1.00 | clone |
| 20 | COACH | 0.64/1.00 | 0.68/1.00 | 0.65/1.00 | clone |
| 24 | THEO | 0.81/1.00 | 0.84/1.00 | 0.70/1.00 | 024_1.wav |
| 26 | THEO | 0.60/1.00 | 0.60/0.75 | 0.61/1.00 | clone |
| 29 | DAD | 0.69/1.00 | 0.70/1.00 | 0.74/1.00 | clone |
| 37 | CUSTOMER | 0.87/1.00 | 0.84/1.00 | 0.74/1.00 | 037_0.wav |
| 40 | MAILMAN | 0.74/0.92 | 0.72/0.83 | 0.77/1.00 | clone |
| 45 | DAD | 0.65/1.00 | 0.67/0.91 | 0.75/1.00 | clone |
| 46 | MOM | 0.79/0.67 | 0.67/1.00 | 0.63/1.00 | clone |
| 48 | THEO | 0.77/1.00 | 0.76/1.00 | 0.78/1.00 | clone |
| 50 | THEO | 0.75/1.00 | 0.81/1.00 | 0.66/1.00 | 050_1.wav |
| 59 | MOM | 0.85/1.00 | 0.78/1.00 | 0.84/1.00 | 059_0.wav |
| 60 | DAD | 0.66/1.00 | 0.60/1.00 | 0.70/1.00 | clone |
| 63 | MOM | 0.75/1.00 | 0.79/1.00 | 0.71/1.00 | clone |
| 69 | THEO | 0.79/0.80 | 0.76/1.00 | 0.79/1.00 | clone |
| 76 | MOM | 0.79/1.00 | 0.70/1.00 | 0.81/1.00 | 076_2.wav |
| 77 | MOM | 0.83/0.86 | 0.80/1.00 | 0.72/0.22 | 077_0.wav |
| 81 | DAD | 0.81/1.00 | 0.71/1.00 | 0.78/1.00 | 081_0.wav |
| 82 | DAD | 0.76/0.82 | 0.80/0.91 | 0.66/1.00 | 082_1.wav |
| 83 | MOM | 0.62/1.00 | 0.86/1.00 | 0.76/1.00 | 083_1.wav |
| 84 | THEO | 0.82/1.00 | 0.77/1.00 | 0.81/1.00 | 084_0.wav |
| 88 | YOU | 0.69/0.50 | 0.73/1.00 | 0.72/1.00 | clone |
| 89 | THEO | 0.56/1.00 | 0.61/1.00 | 0.67/1.00 | clone |
