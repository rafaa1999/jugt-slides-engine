# JUGT Slides Engine

Conference-grade presentations generated from a single YAML file.

This repository provides a presentation engine used by Java User Group Tunisia (JUGT) to create modern technical slides using YAML instead of PowerPoint or Google Slides.

Slides are rendered using Reveal.js with a custom Java/JVM cinematic theme.

## Features
The system includes:
* Code highlighting
* Animated transitions
* Speaker profiles
* Sponsor ticker
* Image and video slides
* QR code slides
* Responsive layouts

All slides are generated from a single source of truth: `talk.yml`.

---

## How It Works

The slide pipeline works like this:
`talk.yml` **→** `generator` **→** `src/generated/talk-data.json` **→** `render.js` **→** **Reveal.js presentation**

**You only edit one file: `talk.yml`**
Everything else is generated automatically.

### Repository Structure
```text
.
├─ index.html
├─ package.json
├─ README.md
│
├─ talk.yml
│
├─ src
│  ├─ main.js
│  ├─ slides
│  │   └─ render.js
│  │
│  ├─ styles
│  │   ├─ base.css
│  │   └─ theme.css
│  │
│  └─ generated
│      └─ talk-data.json
│
└─ assets
   ├─ jugt-logo.png
   ├─ images
   └─ videos
```

---

## Getting Started

### Requirements
You need the following installed:
* Node.js 18+
* npm

Check your version:
```bash
node -v
```

### Installation
Clone the repository and install dependencies:
```bash
git clone <repository-url>
cd jugt-slides
npm install
```

### Running the Presentation Locally
Start the development server:
```bash
npm run dev
```
Open your browser at [http://localhost:5173](http://localhost:5173).
Slides will automatically update when `talk.yml` is modified.

---

## Branch Workflow (Important)

Each JUGT meetup has its own branch. This allows us to maintain presentations for multiple events without conflicts.

**Example branch naming:**
* `meetup-01`
* `meetup-02`
* `meetup-spring-boot`
* `meetup-quarkus`
* `meetup-kafka`

### Typical Workflow:
1️⃣ **Create a new branch for the meetup**
```bash
git checkout -b meetup-your-topic
```

2️⃣ **Update the presentation content in:** `talk.yml`

3️⃣ **Commit your changes**
```bash
git add .
git commit -m "Add slides for meetup topic"
```

4️⃣ **Push the branch**
```bash
git push origin meetup-your-topic
```
Each meetup can then maintain its own presentation independently.

---

## Creating a Presentation

All presentation content lives in `talk.yml`. Below is a breakdown of the configuration sections.

### Metadata & Theme
The `meta` section describes the presentation (`shortTitle` is used in the bottom overlay). The `theme` section controls visual options.

```yaml
meta:
  title: "JUGT: Building Conference-Grade Slides"
  shortTitle: "Slides Engine"
  event: "Java User Group Tunisia"
  date: "2026-03-15"
  venue: "Tunis, Tunisia"
  language: "en"

theme:
  accentColor: "#7C5CFF"
  slideNumber: true
  showProgress: true
```

| Theme Option | Description |
| :--- | :--- |
| `accentColor` | Main theme color |
| `slideNumber` | Show slide number |
| `showProgress`| Show progress bar |

### Branding, Presenters & Sponsors
Define logos, speakers appearing on the title slide, and sponsors (which appear as a scrolling ticker at the bottom).

```yaml
branding:
  jugtLogo: "/assets/jugt-logo.png"

presenters:
  - name: "Yassin Ghariani"
    role: "Founder"
    company: "Java User Group Tunisia"
    photo: "/assets/yassin.jpg"
    socials:
      - label: "@gharianiyassin"
        url: "[https://github.com](https://github.com)"

sponsors:
  - name: "Acme Cloud"
    tier: "Gold"
    logo: "/assets/acme.png"
    url: "[https://acme.com](https://acme.com)"
```

---

## Slide Types

The engine currently supports the following slide types. Add these under the `slides:` array in your `talk.yml`.

### Title & Agenda Slides
```yaml
slides:
  - type: "title"
    title: "Conference-Grade Slides"
    subtitle: "YAML → Reveal.js"

  - type: "agenda"
    title: "Agenda"
    items:
      - Introduction
      - Architecture
      - Demo
```

### Section & Two-Column Slides
```yaml
  - type: "section"
    title: "Architecture"
    subtitle: "System Design"

  - type: "two-column"
    title: "What you get"
    left:
      heading: "Speakers"
      bullets:
        - Edit YAML
        - No HTML
        - Fast iteration
    right:
      heading: "Organizers"
      bullets:
        - Consistent design
        - GitHub collaboration
```

### Code & Image Slides
```yaml
  - type: "code"
    title: "Java Example"
    language: "java"
    code: |
      public class Demo {
        public static void main(String[] args) {
          System.out.println("Hello JUGT");
        }
      }

  - type: "image"
    title: "Architecture"
    src: "/assets/images/architecture.png"
    caption: "System overview"
```

### Video Slides (YouTube & MP4)
```yaml
  # YouTube example:
  - type: "video"
    title: "Demo"
    mode: "youtube"
    youtubeId: "VIDEO_ID"

  # MP4 example:
  - type: "video"
    mode: "mp4"
    src: "/assets/videos/demo.mp4"
```

### QR & Closing Slides
```yaml
  - type: "qr"
    title: "Join JUGT"
    url: "[https://jugt.org](https://jugt.org)"

  - type: "closing"
    title: "Thank You!"
    subtitle: "Questions?"
```

---

## Assets
Place assets inside the `assets` folder and use relative paths inside `talk.yml` (e.g., `/assets/images/diagram.png`).

**Example Structure:**
```text
assets
 ├ images
 ├ videos
 └ logos
```

---

## Design Features
This engine includes a custom Java/JVM themed design featuring:
* Glass slide cards
* Bytecode-style animated background
* Holographic borders
* Spotlight interaction
* Animated slide transitions
* Sponsor ticker

*Slides are optimized for technical conference talks.*

---

## Best Practices for Speakers
To keep presentations clear and engaging:
* Keep maximum 5 bullets per slide
* Prefer code examples over long explanations
* Use visual diagrams
* Avoid large blocks of text
* Use section slides to structure your talk

---

## About JUGT
This project was created for the Java User Group Tunisia community.

**Founder:** Yassin Ghariani