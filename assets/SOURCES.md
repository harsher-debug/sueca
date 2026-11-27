# Asset sources

- `service-maintenance.jpg`: Service banner from the Sueca reference site supplied by the user: https://sueca.aprovabox.com.br/static/version1793982900/frontend/Sueca/storefront/pt_BR/images/banner-servicos-final.jpg. Used as a softly faded decorative background behind the Service content supplied in the screenshot.

- `sueca-logo-original.png`: Original Sueca logo supplied by the user, including its metallic spheres.
- `sueca-logo-original-dark.svg`: Dark-background version of that same image, with white lettering and the original red accent and metallic spheres.
- `skf-logo-white.svg`: official white SKF wordmark, https://www.skf.com/v2/assets/img/Skf_logo_white.svg
- SKF Sans and SKF Display fonts: https://fonts.skf.com/, stored locally in `assets/fonts/` for reliable loading.
- GSAP 3.12.5 and ScrollTrigger 3.12.5: https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/, stored in `assets/vendor/` with original license headers.
- `skf-home-bearing.jpg`: SKF homepage bearing image, https://cdn.skfmediahub.skf.com/api/public/09f4304c62c3334c/jpeg_fullresolution/09f4304c62c3334c_jpeg_fullresolution.jpg (shown at https://www.skf.com/br).
- `skf-chains-sueca.jpg`: SKF chains photo, https://www.sueca.com.br/correntes
- `skf-sensor-bearing-sueca.png`: SKF sensorized bearing photo, https://www.sueca.com.br/unidades-de-rolamento-sensorizado
- `skf-solid-oil-sueca.png`: SKF Solid Oil bearing photo, https://www.sueca.com.br/rolamentos-com-solid-oil
- `whatsapp.svg`: WhatsApp mark from Simple Icons, https://simpleicons.org/icons/whatsapp

## Delivery optimization — November 20, 2026

`optimized/*.webp` are encoded from the existing artwork by `scripts/optimize-assets.py`; the originals are retained. No new scene content was generated in this pass. The phone/app image uses lossless encoding with unchanged dimensions and was checked pixel for pixel. Other images use quality 90–94; only the oversized chain photo is resized to a maximum of 1280 pixels. The 14 processed images total 3.02 MiB instead of 12.44 MiB (75.7% reduction).

Visual reference: https://sueca.aprovabox.com.br/ (reviewed November 20, 2026). Used for Sueca red/grey colors, navigation feedback, card interactions and entrance motion. Typography follows the explicit Montserrat request in the supplied video.

## Generated illustrative images

- `application-industrial-technician.png`: Edited with the built-in image generation tool for the November 16 video review. Illustrative scene, not a photograph of a Sueca employee. Final prompt: "Edit this industrial photograph for a website. Replace the male maintenance worker with an adult female maintenance technician, brown hair tied back securely, safety glasses, dark charcoal industrial coveralls with reflective strips, black work gloves, inspecting the same realistic ball bearing in her hands. Preserve the workshop, electric motor, lighting, photo realism, framing and all other objects. The woman's head must occupy approximately the same location and size as the original head (center x 49%, y 14%), so she fits the existing layout. No text or logos, no graphic effects. Keep 4:3 landscape framing."

- `sueca-wave.svg`: Code-native vector inspired by the multi-line grey/red wave reference supplied by Sueca on November 16, 2026.
- `sueca-presence.svg`: Derived from the existing `brasil-ufs.svg`, highlighting RS, PR, SP, MT and GO to match the existing branch information.
- `fonts/Montserrat-{400,500,600,700}.woff2`: Montserrat from Google Fonts (https://fonts.google.com/specimen/Montserrat), downloaded from Google's font CDN and compressed to WOFF2 locally. SIL Open Font License in `fonts/Montserrat-OFL.txt`.

- `skf-mapro-clean.png`: Edited from `skf-mapro-blue.jpg` with the built-in image generation tool for the second LP review. Prompt: "Edit this exact product photograph. Remove ONLY the dark grey caption 'TMFT 36' in the upper left white margin, replacing that text with pure white matching the background. Preserve the blue tool case, every tool, geometry, foam, lighting, scale, composition and all details of the photographed product unchanged. Do not redesign the product or add anything. Plain white background, same framing."

- `skf-authenticate-industrial.png`: Generated editorial illustration of a hand holding a phone in an industrial setting, using the user-provided SKF Authenticate screen as a visual reference.
- `skf-authenticate-industrial-wide.png`: Wider generated adaptation of the Authenticate image, extending the industrial environment for the landing page panel.
- `skf-authorized-distributor.png`: Generated with the built-in image generation tool from the user-provided SKF Distribuidor Autorizado mark. Square cobalt-blue field with a white SKF logotype and the Portuguese wording ?DISTRIBUIDOR AUTORIZADO?. Used in the authorized distributor certification card.

- `skf-cmp-mark.png`: Generated using the built-in image generation tool from the user-provided SKF Certified Maintenance Partner logo image as a visual reference. Square cobalt-blue field with white SKF mark and the lines “CERTIFIED / MAINTENANCE / PARTNER”. Placed beside the existing Sueca CMP seal.

- `bearing-exploded-realistic.png`: Generated with the built-in image generation tool. Final prompt: One photorealistic exploded illustration of a single open deep-groove ball bearing on transparent background. Four coaxial layers along an upper-left to lower-right axis: outer race, polished steel balls, stamped cage, inner race. Visible air gaps and hollow center; brushed steel microtexture, machining grooves, crisp chamfers and controlled studio reflections. One continuous composition, no panels, labels, arrows or logos. Educational illustration, not a product photograph. Descriptions and callout lines are rendered in HTML/SVG.

- `bearing-components.png`: Created with the built-in image generation tool. Prompt: Square transparent 2 by 2 sprite atlas of four isolated deep groove ball bearing components: outer race at top left, circular array of polished balls at top right, empty stamped steel cage at bottom left, inner race at bottom right. Photorealistic ground steel, fine machining texture, studio reflections, matching three-quarter perspective, separate cells with clear margins, no labels or logos. Educational illustration; components are not to scale. CSS displays each quadrant as a separate animated layer.

- `skf-bearing-detailed.png`: Generated with the built-in image generation tool, editing `skf-bearing.png`. Prompt: Improve the bearing cutaway with photorealistic machined steel microtexture, concentric machining marks, crisp beveled edges, natural metallic reflections, detailed stamped steel cage and clear separation between races and balls. Preserve original geometry, silhouette, orientation, camera perspective, framing and component positions for existing callouts. Transparent background with subtle contact shadow; no text, labels, arrows, logos or watermark. Illustrative rendering, not a product photograph.

Created with the built-in `imagegen` tool and optimized as JPEGs. These are illustrative scenes, not photographs of Sueca employees, facilities, or customer installations.

- `institutional-industrial.jpg`: Prompt: Cinematic editorial photograph of a Brazilian industrial maintenance engineer in a modern factory, standing on the right in dark workwear and safety glasses, realistic machinery and shafts, cool natural window light, subtle red industrial details, clean darker negative space on the left for white typography, premium industrial advertising, no logos, no text, landscape.
- `application-industrial.jpg`: Prompt: Photorealistic close-up of a large industrial motor and precision shaft assembly with a visible steel bearing in a clean Brazilian factory, technician hands at work, crisp metallic detail, blue-grey industrial light with small warm accents, premium commercial photography, no logos, no text, landscape.
- `application-agro.jpg`: Prompt: Photorealistic red agricultural harvester wheel hub and bearing assembly in a field at golden hour, maintenance technician inspecting the component, machinery dominant, practical agricultural context, premium commercial photography, no logos, no text, landscape.
# Revisão de 23 de novembro

- `favicon.ico`: arquivo original do favicon usado em https://sueca.aprovabox.com.br/media/favicon/stores/1/sueca-favicon-e-transparente.ico. Os ícones PNG para navegador e atalho de celular são derivados desse mesmo arquivo.
- `favicon.svg`: letra E da identidade Sueca, com barra superior vermelha e demais barras adaptadas por `prefers-color-scheme` para abas claras e escuras, conforme solicitação de 27/11/2026. ICO e PNG permanecem como alternativas para navegadores sem favicon SVG.

- `sueca-presence-depth.svg`: derivado do mapa vetorial `sueca-presence.svg` já usado na página. Mantém os contornos dos estados e destaca RS, PR, SP, MT e GO; adiciona volume e siglas conforme a referência enviada pelo cliente. O painel de fundo é implementado em CSS para manter os textos legíveis e o layout responsivo.
