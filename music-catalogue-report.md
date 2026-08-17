# Tanu Ka Tadka — 1,000-Track Catalogue Report

## Final Queue

| Measure | Result |
| --- | ---: |
| Hindi tracks | 650 |
| Odia tracks | 350 |
| Total tracks | 1,000 |
| Hindi share | 65% |
| Odia share | 35% |
| Duplicate titles or versions removed during selection | 271 |
| Unavailable tracks replaced during intake | 0 |

The queue is built from public YouTube playlist metadata only. No audio files were downloaded or bundled. Entries that appeared to be long-form jukeboxes, compilations, teasers, trailers, status clips, remixes, or other obvious duplicate variants were excluded before the final selection.

## Public Playlist Sources Used

| Language | Source playlist | Selected tracks | URL |
| --- | --- | ---: | --- |
| Hindi | Tips Official — Bollywood Hits 1990s to 2000s | 212 | https://www.youtube.com/playlist?list=PLinVjP-aRmlshsVijhUMGmvDlm2C6Schu |
| Hindi | Best Bollywood Songs 2000 to 2026 | 48 | https://www.youtube.com/playlist?list=PL-qqrXOEjCIhh0EhSyxJhszA0tt5MfkeR |
| Hindi | Best Hindi Songs Playlist 2026 | 75 | https://www.youtube.com/playlist?list=PLRZlMhcYkA2FYuTGWiVTkSz18o2pK8Hv4 |
| Hindi | Best Bollywood Songs 2010 to 2020 | 33 | https://www.youtube.com/playlist?list=PL91svUwa-fe4FQFHJSLM9qnoz1IhrRg-H |
| Hindi | Tips Official — The Must Have Hits: Dance Vol. 1 | 57 | https://www.youtube.com/playlist?list=PLinVjP-aRmltthWxyInQ6xmDWs-3nm-xK |
| Hindi | Best HD Hindi Songs of 2000 to 2010 | 225 | https://www.youtube.com/playlist?list=PLvQjku2IDsBwCHkWXhX10KvGvEnHuiArC |
| Odia | Sidharth TV — Superhit Odia Album Songs | 244 | https://www.youtube.com/playlist?list=PL263eUaJGdEhXbNfl6F3UU1QIJzlEwFky |
| Odia | Sidharth Music — New Odia Film Songs | 100 | https://www.youtube.com/playlist?list=PLVB25r4Fs6mqvCZHxTfJV0XMHpbbhGfiO |
| Odia | Amara Muzik — Odia Song Nonstop Playlists and Compilations | 6 | https://www.youtube.com/playlist?list=PL5Q4Bu-jOlFf_RXR7XbrDv2Tt-HMWwuz4 |

## Playback Architecture

The catalogue is split into **ten lazy-loaded batches of 100 tracks**. The browser initially keeps a lightweight index of the 1,000 queue positions, language labels, and categories. It downloads a full batch only when a shuffled track from that batch is selected, then preloads the adjacent batch for the next turn.

The player writes a shuffled order, cursor position, history, and unavailable-video exclusions to browser storage. The next track is never repeated until that full cycle completes. If the YouTube player reports an error for a video, the app excludes that video locally and chooses a still-unplayed fallback from the same language and category, protecting the approximate 65% Hindi / 35% Odia balance.

## Ongoing Maintenance

YouTube availability and embedding permissions can change after publication. The built-in fallback handles a single unavailable video during listening; periodic manual re-validation of source playlists is still recommended before shipping a refreshed catalogue.
