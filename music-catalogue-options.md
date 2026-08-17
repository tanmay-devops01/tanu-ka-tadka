# Scalable Music-Catalogue Options

## Key Findings

The current fixed playlist is necessarily small and repeats because every track must be explicitly supplied as a playable YouTube video ID. A client-only static site cannot securely call a discovery API with a private key, and an unreviewed mass list of third-party videos is not a reliable or rights-cleared radio catalogue.

YouTube Data API discovery needs an API key and server-side protection. Official documentation states that `search.list` has a default daily limit of 100 calls, returns up to 50 results per call, and can filter for embeddable, syndicated videos. This supports managed discovery but not a directly hard-coded 100,000-song front-end list.

Spotify has a large searchable catalog, but its full in-browser Web Playback SDK requires every listener to have a Spotify Premium subscription and authenticated playback. It therefore conflicts with the current no-login, instantly-playing radio objective.

## Recommended Decision

Use a managed YouTube discovery backend with an approved-channel registry, 2000s query rules, embeddable/syndicated filters, a local catalogue cache, and a no-repeat history. This will grow the playable selection over time while preserving the current one-tap YouTube player and no-listener-login experience. It requires a YouTube Data API key and a backend upgrade to protect that key.

## Sources

- https://developers.google.com/youtube/v3/determine_quota_cost
- https://developers.google.com/youtube/v3/docs/search/list
- https://developer.spotify.com/documentation/web-playback-sdk
- https://developer.spotify.com/documentation/web-api/reference/search
