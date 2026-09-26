# TVMath

Honest TV size picker. Enter couch distance, the TV you have in mind, and its resolution; TVMath computes:

- **Viewing angle** - how many degrees of your view the screen fills, banded from "postage stamp" (<20 deg) through "cinematic" (30-40 deg) to "IMAX headache" (>45)
- **Recommended sizes** - the smallest common size hitting SMPTE's 30 deg floor and the size for the 40 deg THX feel at your distance
- **Resolution honesty** - full 4K detail only resolves within ~1x the diagonal (1080p ~1.6x, 8K ~0.7x); sit further and the extra pixels are spec-sheet decoration
- **To-scale comparison** - your pick vs the recommended size drawn on the same wall

Static client-side app. Live: https://ilanis-agent.github.io/tvmath/

## Files
- `index.html` - landing page
- `app.html` - the judge
- `engine.js` - pure logic (also runs under node for tests)
