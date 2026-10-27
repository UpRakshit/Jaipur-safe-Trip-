# Jaipur SafeTrip

A static discovery guide to Jaipur landmarks and Rajasthani food, with an interest-based itinerary planner and a session-based travel chat interface. It uses semantic HTML, CSS and vanilla JavaScript; there is no database or frontend framework.

## Features

- Responsive landmark and cuisine cards with accessible detail dialogs, photo credits and local image fallbacks.
- A 1–5 day itinerary planner with budget style, group size, accommodation, nine trip purposes, pace and optional accessibility preferences. It preserves all six original interests: historical heritage, Rajasthani cuisine, royal stays, markets and crafts, outdoor activities, and wellness. It creates a day-by-day route with suggested times, descriptions, destination photographs and sample activity cost ranges where the supplied itinerary has them.
- A trip budget band computed from the older planner's illustrative daily bands and trip duration. These are not live quotes; the source does not define group-size adjustments. Stop-level amounts from the supplied sample have no stated unit and are shown separately, not added to the trip total.
- Direct PDF download of the generated itinerary and trip overview, with a readable text layout. It uses jsPDF from jsDelivr; PDF download needs that script to load. Sharing uses the browser share sheet or clipboard when supported.
- A travel chat with clickable prompts, session conversation history, loading and error states. There are no API credentials or server endpoint in this project, so messages are not sent or answered until a secure backend is connected. The interface never substitutes scripted content for AI output.
- No live safety monitoring, weather, booking or emergency-response features.

## Run locally

From the project directory, start a local static server:

```sh
python3 -m http.server 8000
```

Open <http://localhost:8000>. Google Fonts, Wikimedia photographs and jsPDF are loaded from external services and need an internet connection. If an image fails, the page uses `assets/image-unavailable.svg`; PDF export reports when its library is unavailable.

## Project structure

```text
.
├── index.html
├── css/styles.css
├── js/app.js
├── js/data.js
├── assets/image-unavailable.svg
└── README.md
```

`enhanced-jaipur-website.html` and `cursorjt.html` are preserved reference drafts; the deployed site is `index.html` with the shared CSS and JavaScript files.

## Connect a real AI assistant

No AI provider key, backend, or API endpoint is configured. To enable real responses:

1. Deploy a server or serverless function at a same-origin route such as `POST /api/chat`.
2. Keep the provider key in that server's secret environment (for example, `OPENAI_API_KEY`). Do not put it in `index.html`, `js/app.js`, a public environment variable, or a checked-in file.
3. Validate request size and rate limits on the server. Accept `{ "message": "...", "history": [{ "role": "user|assistant", "content": "..." }] }`, call the chosen model on the server, and return `{ "reply": "..." }`. Return a non-2xx status for failures.
4. Add `data-chat-endpoint="/api/chat"` to the opening `<html>` tag in `index.html`. The browser sends only to this configured route and displays the server's reply as text. The chat history lives in `sessionStorage` for the current browser session.
5. Deploy the function and static site together, then verify a successful reply and a failed-request message. A static-only Netlify Drop deployment cannot host this endpoint; use a host with serverless functions or a separate secured backend and set the endpoint URL accordingly. Configure CORS on that service if it is cross-origin.

## Deploy the static site

The project has no package manager, dependency install or production build command. Its production output is the project folder itself. For a manual Netlify deployment:

1. Open [Netlify Drop](https://app.netlify.com/drop) and sign in.
2. Drag the project folder **Jaipur safe trip** (the folder containing `index.html`) onto the deploy area.
3. Open the generated site URL and check the home page, images, detail dialogs, planner, PDF download and mobile menu.

For repeat deployments, connect the project repository to a static host and set the publish directory to the project root. No build command is needed. To add AI, deploy a serverless function alongside the site and follow the secure endpoint steps above; do not report AI as live until an actual response has been verified.

## Cost and photography notes

Planner budget bands and selected activity ranges are carried over from the supplied legacy planner and itinerary sample. They are presented as illustrative reference values, not current prices. The project has no verified distance, live traffic or opening-hours feed; route order and suggested slots are planning prompts, not live routing. Check all costs, access, opening hours, transport and menus with current local sources. Place and food images are matched in `js/data.js` to the named Commons subject. Source metadata remains in that mapping for maintainer attribution and license checks; detail dialogs do not display image-resource links. Follow the attribution and license terms shown on each Commons file page when reusing photographs.
