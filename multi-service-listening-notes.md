# No-Key Multi-Service Listening Assessment

## Service Fit

| Service | Supported role in Tanu Ka Tadka without a catalog API key | Playback model | Constraint |
| --- | --- | --- | --- |
| SoundCloud | Optional curated playlist/track embed | In-page embed with Widget API controls and events | Requires the specific SoundCloud URL; not a general open catalog feed. |
| Bandcamp | Optional artist-authorized record/track embed | In-page embed supplied by the artist/label | Requires a specific public release or owner-provided embed. |
| Amazon Music | Open current song or playlist in Amazon Music | Listener-initiated external link | No suitable public no-key browser playback integration for this radio. |
| JioSaavn | Open current song or playlist in JioSaavn | Listener-initiated external link | No public official playback API; its terms prohibit automated/unofficial access. |

## Recommended No-Key Design

Keep the existing YouTube player for direct listening, but expand the player into a `Where to listen` menu. It will expose SoundCloud and Bandcamp only for curated URLs that you provide, and Amazon Music/JioSaavn as search/link-out options for the current track. This respects provider interfaces and avoids pretending an external catalog is playable in the radio player.

To eliminate the current short loop without an API key, the site can implement a history-aware shuffle which never repeats a track until the entire approved queue has been played. However, a substantially larger mixed queue must still be supplied or curated over time; no provider above offers a legal anonymous 100,000-track full-playback feed through a static website.

## Official Sources

- https://developers.soundcloud.com/docs/api/html5-widget
- https://get.bandcamp.help/en/articles/15263063-how-do-i-set-up-an-exclusive-embed
- https://developer.amazon.com/docs/music/API_web_overview.html
- https://www.jiosaavn.com/corporate/terms/
