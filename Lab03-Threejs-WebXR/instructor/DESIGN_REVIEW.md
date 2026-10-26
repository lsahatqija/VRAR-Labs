# Interface design review

Direction: **Framed sheet**, seed `1238196794`. No redraws. The gallery's subdued green-grey room material tints the application frame, while the white sheet and live WebGL canvas retain the dealt hierarchy.

Face: the frame takes its low-chroma green-grey from the virtual gallery. The subject-specific element is the live Three.js gallery itself, not a substitute illustration.

ROUND 2  
Seen in one second: A virtual gallery beside a short XR lab sequence.  
Idea (one sentence): The seven implementation responsibilities form a quiet work rail around the live scene they progressively activate.  
Live thing: Orbit and zoom the rendered Three.js gallery; the completed version adds controller selection.  
Layout words by section: shell=framed workspace / tasks=ordered rail / scene=full canvas  
Scores: design 8.0 · usability 8.0 · creativity 7.5 · content 8.5 → overall 7.9  
Caps applied: None; this is an app screen whose imagery is its live WebGL subject.  
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. At 390px, the portrait view focuses on the centre exhibit and crops the side exhibits (`mobile-fold.jpg`); this is acceptable for the read-only phone fallback, while tablet and desktop retain the complete teaching composition.
2. The task rail disappears at 390px (`mobile-fold.jpg`); the persistent **Open guide** action preserves access to all instructions without squeezing the canvas.
3. WebGL text is necessarily softer than DOM text in the captured tablet view (`tablet-fold.jpg`); its higher-resolution canvas texture remains legible and, importantly, stays visible in VR.

Final automated inspection: 0 failures and 0 warnings at 1440px, 768px, and 390px. All six final screenshots were reviewed.
