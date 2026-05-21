# Font NOTICE — CLACOROO

CLACOROO bundles the following open-source fonts, distributed under the
**SIL Open Font License, Version 1.1**. This license permits redistribution,
modification, and embedding in software products.

## Inter

- **Author**: The Inter Project Authors
- **License**: SIL OFL 1.1 (see `Inter-LICENSE.txt`)
- **Source**: https://github.com/rsms/inter
- **Used as**: free alternative to Anthropic's proprietary Styrene B
  (UI, headings, brand mark)
- **Files**: `InterVariable.woff2`, `InterVariable-Italic.woff2`

## Source Serif 4

- **Author**: Adobe (with Reserved Font Name "Source")
- **License**: SIL OFL 1.1 (see `SourceSerif4-LICENSE.md`)
- **Source**: https://github.com/adobe-fonts/source-serif
- **Used as**: free alternative to Anthropic's proprietary Tiempos
  (body text in long-form content: skill/agent preview modal, onboarding)
- **Files**: `SourceSerif4Variable-Roman.woff2`, `SourceSerif4Variable-Italic.woff2`

## Why not the original Anthropic fonts?

Anthropic uses **Styrene B** (Commercial Type, by Berton Hasebe) for UI and
**Tiempos** (Klim Type Foundry) for body. Both are commercial fonts requiring
paid licenses; they cannot be redistributed in an open-source project.

The chosen alternatives are widely recognized as the closest free matches:
- Source Serif 4 is referenced as "the best free alternative to Tiempos"
- Inter shares the Swiss-grotesque clarity that makes Styrene B legible
  at UI scales, while remaining freely redistributable

## CSP / sandboxing compliance

Fonts are **self-hosted** in this directory and loaded via relative
`url('fonts/...')` references in `style.css`. No remote CDN is required,
which keeps the renderer compatible with the strict CSP
`default-src 'self'` defined in `index.html`.
