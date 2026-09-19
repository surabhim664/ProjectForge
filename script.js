/* ============================================================
   ProjectForge — frontend logic
   - Idea validation that accepts short, long and detailed input
   - Ranked domain detection + blueprint generation
   - Keyword extraction, smart titles, personalized features/tasks
   - Example suggestion chips, nav menu, card tilt, reveals,
     blueprint copy-to-clipboard
   ============================================================ */

function scrollToGenerator() {
    document.getElementById("build").scrollIntoView({
        behavior: "smooth"
    });
}

function scrollToFeatures() {
    document.getElementById("features").scrollIntoView({
        behavior: "smooth"
    });
}


// ============================================
// BACKEND CONFIGURATION
// ============================================

// Override by setting window.PROJECTFORGE_API_BASE before loading script.js.
const API_BASE = window.PROJECTFORGE_API_BASE || "http://localhost:5000";

// The blueprint currently shown in the dashboard (also used by Save / Download).
let currentBlueprint = null;

function safeParse(value, fallback) {
    if (Array.isArray(value)) return value;
    if (typeof value !== "string") return fallback;
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : fallback;
    }
    catch (err) {
        return fallback;
    }
}

function formatDate(value) {
    if (!value) return "";
    const date = new Date(value);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}


// ============================================
// IDEA VALIDATION
// ============================================

const STOPWORDS = new Set([
    "a", "an", "the", "of", "to", "for", "and", "or", "with", "my", "i",
    "me", "we", "our", "make", "making", "create", "creating", "build",
    "building", "develop", "developing", "app", "apps", "application",
    "applications", "website", "websites", "web", "project", "projects",
    "system", "systems", "site", "page", "pages", "thing", "things",
    "something", "tool", "platform", "new", "online", "using", "use",
    "based", "simple", "basic", "just", "want", "can", "could", "please",
    "design", "designing", "help", "also", "would", "will", "should",
    "people", "users", "user", "kind", "like"
]);

const NOISE = new Set([
    "abc", "abcd", "xyz", "qwerty", "asdf", "asdfg", "asdfgh", "hello",
    "hi", "hey", "test", "testing", "foo", "bar", "lorem", "ipsum", "dummy",
    "example", "demo", "nothing", "random", "blah", "lol", "ok", "hmm",
    "tester", "sample", "misc", "na"
]);

const HAS_VOWEL = /[aeiouy]/;

// Detect keyboard-mashing noise like "asdfasdf" or "xxxxxx".
function looksRandom(word) {

    if (/(.)\1{2,}/.test(word)) return true;

    if (word.length >= 5) {

        for (let size = 3; size <= 4; size++) {

            const seen = { };

            for (let i = 0; i + size <= word.length; i++) {

                const part = word.substring(i, i + size);

                if (seen[part]) return true;

                seen[part] = true;
            }
        }
    }

    return false;
}

function tokenizeIdea(idea) {
    return idea
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter(function (word) {
            return word.length > 0;
        });
}

function validateIdea(idea) {

    if (idea === "") {
        return "Please enter your project idea.";
    }

    const words = tokenizeIdea(idea);

    if (!words.length) {
        return "Please enter your project idea.";
    }

    const content = words.filter(function (word) {
        return word.length >= 2 && !STOPWORDS.has(word);
    });

    // Nothing meaningful remains.
    if (content.length === 0) {

        const hasGenericFiller = words.some(function (word) {
            return word.length >= 3 && STOPWORDS.has(word);
        });

        return hasGenericFiller
            ? "Please describe your project idea in more detail so ProjectForge can create a useful blueprint."
            : "Please enter a meaningful project idea.";
    }

    // Junk / noise detection.
    // A real topic word anywhere in the idea is enough to accept it, so
    // long paragraphs and technical abbreviations always go through.
    // Inputs that are entirely knock-off gibberish get rejected.
    const meaningful = content.filter(function (word) {
        return !NOISE.has(word) &&
            !looksRandom(word) &&
            (/\d/.test(word) || HAS_VOWEL.test(word));
    });

    if (meaningful.length === 0) {
        return "Please enter a meaningful project idea.";
    }

    // Very long inputs still need at least a handful of real words.
    if (content.length >= 15 && meaningful.length < 3) {
        return "Please enter a meaningful project idea.";
    }

    return "";
}


// ============================================
// VALIDATION UI
// ============================================

function showIdeaError(message) {

    const ideaBox = document.getElementById("ideaBox");
    const errorRegion = document.getElementById("ideaError");
    const errorText = document.getElementById("ideaErrorText");
    const ideaInput = document.getElementById("projectIdea");

    if (errorText) {
        errorText.textContent = message;
    }

    if (errorRegion) {
        errorRegion.classList.add("show");
    }

    if (ideaBox) {
        ideaBox.classList.add("error");

        requestAnimationFrame(function () {
            ideaBox.classList.remove("error");
            void ideaBox.offsetWidth;
            ideaBox.classList.add("error");
        });
    }

    if (ideaInput) {
        ideaInput.setAttribute("aria-invalid", "true");
        ideaInput.focus({ preventScroll: true });
    }
}

function hideIdeaError() {

    const ideaBox = document.getElementById("ideaBox");
    const errorRegion = document.getElementById("ideaError");
    const ideaInput = document.getElementById("projectIdea");

    if (errorRegion) {
        errorRegion.classList.remove("show");
    }

    if (ideaBox) {
        ideaBox.classList.remove("error");
    }

    if (ideaInput) {
        ideaInput.removeAttribute("aria-invalid");
    }
}


// ============================================
// IDEA CHAR COUNTER
// ============================================

const IDEA_MAX_LENGTH = 2000;

function updateIdeaCount() {

    const ideaInput = document.getElementById("projectIdea");
    const counter = document.getElementById("ideaCount");

    if (!ideaInput || !counter) return;

    const length = ideaInput.value.length;

    counter.textContent = length + " / " + IDEA_MAX_LENGTH;

    counter.classList.toggle("near-limit", length > IDEA_MAX_LENGTH * 0.85);
}


// ============================================
// CONTENT HEURISTICS
// ============================================

const INTENT_FEATURES = [
    { k: ["login", "signup", "register", "account", "auth", "authentication"],    f: "User authentication and role-based access", t: "Add authentication and user roles" },
    { k: ["profile", "profiles", "avatar"],                                       f: "User profiles", t: "Build user profiles" },
    { k: ["search", "find", "filter", "query"],                                   f: "Advanced search and filtering", t: "Implement search and filtering" },
    { k: ["dashboard", "analytics", "insight", "charts"],                         f: "Analytics dashboard", t: "Create an analytics dashboard" },
    { k: ["notification", "notify", "alert", "email"],                            f: "Email and notification alerts", t: "Add email / notification alerts" },
    { k: ["chat", "message", "messaging", "inbox"],                               f: "Real-time messaging", t: "Build real-time messaging" },
    { k: ["payment", "pay", "checkout", "billing", "card", "transaction"],        f: "Payments and secure checkout", t: "Integrate payments and checkout" },
    { k: ["order", "orders", "invoice", "billing"],                               f: "Order and invoice management", t: "Manage orders and invoices" },
    { k: ["upload", "file", "files", "image", "photo", "media", "document", "video"], f: "File and media uploads", t: "Add file / media uploads" },
    { k: ["location", "map", "gps", "geofence", "route"],                         f: "Location and map services", t: "Integrate maps and location services" },
    { k: ["api", "webhook", "integration", "third"],                              f: "Third-party API integrations", t: "Connect third-party services" },
    { k: ["schedule", "calendar", "booking", "appointment", "slot"],              f: "Booking and scheduling", t: "Build booking and scheduling" },
    { k: ["track", "tracking", "progress", "status"],                             f: "Live progress tracking", t: "Add live progress tracking" },
    { k: ["report", "reports", "export", "csv", "pdf"],                           f: "Reports and data export", t: "Add reports and data export" },
    { k: ["review", "rating", "feedback", "comment", "review"],                   f: "Ratings and reviews", t: "Add ratings and reviews" },
    { k: ["cart", "shopping", "wishlist"],                                        f: "Shopping cart and wishlist", t: "Implement the shopping cart" },
    { k: ["recommend", "suggestion", "personalized"],                             f: "Personalized recommendations", t: "Add recommendations" },
    { k: ["camera", "vision", "face", "scan", "ocr"],                             f: "Camera and vision processing", t: "Integrate camera / vision processing" },
    { k: ["voice", "speech", "audio", "podcast"],                                 f: "Voice and audio features", t: "Add voice / audio support" },
    { k: ["iot", "sensor", "device", "hardware"],                                 f: "IoT device integration", t: "Connect IoT devices and sensors" },
    { k: ["subscription", "plan", "premium", "billing"],                          f: "Subscriptions and pricing plans", t: "Add subscription plans" },
    { k: ["social", "feed", "share", "post", "community"],                        f: "Social feed and sharing", t: "Build social / community features" },
    { k: ["qr", "barcode", "code"],                                               f: "QR / barcode scanning", t: "Add QR / barcode support" },
    { k: ["inventory", "stock", "warehouse", "supply"],                           f: "Inventory management", t: "Manage inventory and stock" },
    { k: ["resume", "cv", "job", "career", "hiring"],                             f: "Resume and job matching", t: "Build resume / job matching" },
    { k: ["gamif", "quiz", "challenge", "leaderboard", "points"],                 f: "Gamification and leaderboards", t: "Add gamification elements" },
    { k: ["survey", "poll", "form", "feedback"],                                  f: "Surveys and dynamic forms", t: "Build surveys and forms" }
];

const ACRONYMS = new Set([
    "ai", "ml", "nlp", "llm", "api", "cv", "ocr", "iot",
    "ui", "ux", "qr", "ar", "vr", "saas", "ecommerce"
]);

const TITLE_FILLERS = new Set([
    "smart", "online", "simple", "modern", "basic", "advanced",
    "powerful", "best", "easy", "new", "full", "digital",
    "intelligent", "automated", "custom", "great", "useful",
    "amazing", "awesome", "cool", "management", "software",
    "simple", "personal", "professional", "complete", "integrated"
]);

const DOMAIN_LABELS = {
    ai: "AI & Machine Learning",
    attendance: "Attendance & Recognition",
    ecommerce: "E-Commerce",
    education: "Education & Learning",
    healthcare: "Healthcare",
    general: "Full-Stack Web"
};

function titleCaseWord(word) {
    if (ACRONYMS.has(word)) return word.toUpperCase();
    if (word === "ecommerce") return "E-Commerce";
    if (word === "face") return "Face";
    return word.charAt(0).toUpperCase() + word.slice(1);
}

// Rank the meaningful words in the idea by frequency, length and
// how strongly they map to the detected domain.
function extractKeyTerms(words, domain) {

    const freq = { };
    const order = [];

    words.forEach(function (word) {

        if (word.length < 3 || STOPWORDS.has(word)) return;

        const junk = NOISE.has(word) ||
            (!/\d/.test(word) && word.length <= 4 && !HAS_VOWEL.test(word));

        if (junk) return;

        if (!(word in freq)) order.push(word);

        freq[word] = (freq[word] || 0) + 1;
    });

    const scored = order.map(function (word) {

        let score = Math.min(6, (freq[word] || 1) * 2);

        if (word.length >= 6) score += 1.5;
        if (word.length >= 9) score += 1;

        (domain.keywords || []).forEach(function (keyword) {

            const parts = keyword.split(" ");

            if (keyword === word || parts.indexOf(word) > -1) {
                score += 4;
            }
        });

        return { word: word, score: score };
    });

    scored.sort(function (a, b) {
        return b.score - a.score;
    });

    return scored.map(function (item) {
        return item.word;
    });
}

// Build a readable noun phrase like "attendance, face recognition and students".
function buildFocusPhrase(keyTerms) {

    const picks = keyTerms.filter(function (term) {
        return !TITLE_FILLERS.has(term);
    }).slice(0, 3);

    if (!picks.length) return "";

    if (picks.length === 1) return picks[0];

    return picks.slice(0, -1).join(", ") + " and " + picks[picks.length - 1];
}

// Pick the topic word that is NOT implied by the detected domain
// (e.g. "booking" in a healthcare idea), used for nicer titles.
function distinctiveTerm(domain, terms) {

    const it = terms.find(function (term) {

        const implied = (domain.keywords || []).some(function (keyword) {
            return keyword === term || keyword.split(" ").indexOf(term) > -1;
        });

        return !implied && !TITLE_FILLERS.has(term);
    });

    return it || "";
}

// Produce a clean, professional project title from the idea.
function generateTitle(domain, keyTerms) {

    const meaningful = keyTerms.filter(function (term) {
        return !TITLE_FILLERS.has(term);
    });

    const first = meaningful[0] ? titleCaseWord(meaningful[0]) : "";
    const second = meaningful[1] ? titleCaseWord(meaningful[1]) : "";

    switch (domain.type) {

        case "ai": {
            const aiDrop = /^(ai|ml|chatbot|bot|assistant|intelligence|learning|model|machine)$/i;
            const aiTerms = meaningful.filter(function (term) {
                return !aiDrop.test(term);
            }).slice(0, 2);

            if (!aiTerms.length) return "AI Assistant";

            const aiFirst = titleCaseWord(aiTerms[0]);

            if (aiTerms.length === 1) return "AI " + aiFirst;

            return "AI " + aiFirst + " " + titleCaseWord(aiTerms[1]);
        }

        case "attendance":
            if (/face|recogn|vision|biometric/i.test(first)) {
                return first + (second ? " " + second : "") + " System";
            }
            return first === "Attendance" ? "Smart Attendance System" : first + " Attendance System";

        case "ecommerce": {
            const niche = distinctiveTerm(domain, meaningful);
            return niche ? titleCaseWord(niche) + " Store" : "Online Store";
        }

        case "education":
            if (!first) return "E-Learning Platform";
            if (/learning|school|education|study/i.test(first)) {
                return (second ? second : "E-Learning") + " Platform";
            }
            return first + " Learning Platform";

        case "healthcare": {
            const niche = distinctiveTerm(domain, meaningful);
            return niche
                ? titleCaseWord(niche) + " Healthcare Platform"
                : "Healthcare Platform";
        }

        default:
            if (!first) return "Web Application";
            return first + " Platform";
    }
}

// Write a professional description paragraph for the blueprint.
function buildDescription(domain, focusPhrase) {

    if (domain.type === "general") {

        if (focusPhrase) {
            return "A full-stack web application centered around " + focusPhrase +
                ". It pairs a modern, responsive front end with a clean REST API " +
                "and a structured database, so the project can grow from a working " +
                "prototype into a production-ready product.";
        }

        return "A full-stack web application with a modern, responsive user " +
            "interface, a clean REST API and a structured database. It is " +
            "designed to scale from a working prototype into a production-ready product.";
    }

    let text = domain.description;

    if (focusPhrase) {
        text += " This blueprint is tailored around " + focusPhrase + ".";
    }

    return text;
}

// Detect feature intents mentioned in the free-form idea.
function detectIntents(lowerIdea) {

    const hits = [];

    INTENT_FEATURES.forEach(function (intent) {

        const found = intent.k.some(function (keyword) {

            const re = new RegExp(
                "(^|[^a-z0-9])" + keyword + "([^a-z0-9]|$)",
                "i"
            );

            return re.test(lowerIdea);
        });

        if (found) hits.push(intent);
    });

    return hits;
}

function buildFeatures(domain, intents) {

    const features = [];

    domain.features.forEach(function (feature) {
        features.push(feature);
    });

    intents.forEach(function (intent) {

        const exists = features.some(function (feature) {
            return feature.toLowerCase() === intent.f.toLowerCase();
        });

        if (!exists) features.push(intent.f);
    });

    return features.slice(0, 7);
}

function buildTasks(domain, intents) {

    const base = domain.tasks.slice();
    const tasks = [];

    tasks.push("Set up the project environment and tooling");
    tasks.push("Design the data model");

    // Core implementation steps from the domain template.
    base.slice(1, base.length - 1).forEach(function (task) {
        tasks.push(task);
    });

    // Personalised steps from the free-form idea.
    intents.slice(0, 3).forEach(function (intent) {
        tasks.push(intent.t);
    });

    tasks.push("Build the responsive user interface");

    if (!base.join(" ").toLowerCase().indexOf("api") > -1) {
        tasks.push("Connect the frontend to the backend API");
    }

    if (!/auth/.test(base.join(" ").toLowerCase())) {
        tasks.push("Add user authentication and authorization");
    }

    tasks.push("Run tests, fix issues and ship to production");

    // De-duplicate while preserving order.
    const seen = { };
    const ordered = [];

    tasks.forEach(function (task) {

        const key = task.toLowerCase();

        if (!seen[key]) {
            seen[key] = true;
            ordered.push(task);
        }
    });

    // Keep the plan readable: always start with setup and end with shipping,
    // trimming extra steps from the middle when the list gets long.
    const cap = 8;

    if (ordered.length <= cap) return ordered;

    const head = ordered.slice(0, 2);
    const tail = ordered.slice(-2);
    const middle = ordered.slice(2, -2);

    const result = head.concat(
        middle.slice(0, cap - head.length - tail.length)
    ).concat(tail);

    return result;
}


// ============================================
// BLUEPRINT GENERATION
// ============================================

const DOMAINS = [
    {
        type: "ai",
        keywords: [
            "ai", "artificial intelligence", "machine learning",
            "ml", "prediction", "predict", "chatbot", "neural",
            "nlp", "llm", "recommend", "smart assistant"
        ],
        baseScore: 60,
        stack: ["Python", "React", "Flask", "AI / ML", "MySQL"],
        description: "An AI-powered application that uses intelligent models to analyze data, generate insights and provide useful predictions or recommendations.",
        features: [
            "AI-powered analysis",
            "Intelligent predictions",
            "Data processing",
            "User dashboard",
            "Automated recommendations"
        ],
        tasks: [
            "Set up project environment",
            "Prepare data pipeline",
            "Build AI module",
            "Create frontend dashboard",
            "Connect backend API",
            "Test AI predictions",
            "Deploy application"
        ],
        chain: ["User", "React Frontend", "Flask API", "AI Engine", "MySQL Database"]
    },
    {
        type: "attendance",
        keywords: [
            "attendance", "face recognition", "biometric",
            "automatic attendance", "marking"
        ],
        baseScore: 55,
        stack: ["Python", "React", "Flask", "OpenCV", "MySQL"],
        description: "A smart attendance management system that automates attendance using face recognition and provides dashboards and analytics for administrators.",
        features: [
            "Student registration",
            "Face recognition",
            "Automatic attendance",
            "Attendance dashboard",
            "Reports and analytics"
        ],
        tasks: [
            "Set up project environment",
            "Create student database",
            "Implement face recognition",
            "Build attendance engine",
            "Create admin dashboard",
            "Add reports and analytics",
            "Test and deploy"
        ],
        chain: ["Student / Admin", "React Dashboard", "Flask API", "Face Recognition", "MySQL Database"]
    },
    {
        type: "ecommerce",
        keywords: [
            "ecommerce", "e-commerce", "shopping", "online store",
            "cart", "checkout", "marketplace", "buy", "payment", "orders",
            "store", "wishlist"
        ],
        baseScore: 50,
        stack: ["HTML", "CSS", "JavaScript", "Node.js", "MongoDB"],
        description: "A modern e-commerce platform where users can browse products, manage their shopping cart, place orders and complete online payments.",
        features: [
            "Product catalog",
            "Shopping cart",
            "User authentication",
            "Order management",
            "Online payments"
        ],
        tasks: [
            "Set up project environment",
            "Create product database",
            "Build product pages",
            "Implement shopping cart",
            "Add user authentication",
            "Integrate payment system",
            "Test and deploy"
        ],
        chain: ["Customer", "Web Store", "Node.js API", "Payment Service", "MongoDB Database"]
    },
    {
        type: "education",
        keywords: [
            "education", "learning", "course", "e-learning", "elearning",
            "school", "student", "tutor", "training", "study"
        ],
        baseScore: 45,
        stack: ["React", "JavaScript", "Flask", "Python", "MySQL"],
        description: "A digital learning platform that helps students access courses, track their progress and understand their learning performance through analytics.",
        features: [
            "Course management",
            "Video and content learning",
            "Progress tracking",
            "Student dashboard",
            "Learning analytics"
        ],
        tasks: [
            "Set up project environment",
            "Create course database",
            "Build course interface",
            "Add progress tracking",
            "Create student dashboard",
            "Add learning analytics",
            "Test and deploy"
        ],
        chain: ["Student", "React Learning Platform", "Flask API", "Learning Engine", "MySQL Database"]
    },
    {
        type: "healthcare",
        keywords: [
            "health", "healthcare", "hospital", "medical", "doctor",
            "patient", "clinic", "appointment", "medicine"
        ],
        baseScore: 60,
        stack: ["React", "Python", "Flask", "PostgreSQL", "REST API"],
        description: "A healthcare management platform designed to organize patient information, appointments, medical records and healthcare analytics.",
        features: [
            "Patient management",
            "Medical records",
            "Appointment scheduling",
            "Doctor dashboard",
            "Healthcare analytics"
        ],
        tasks: [
            "Set up project environment",
            "Design healthcare database",
            "Build patient management",
            "Create appointment system",
            "Build doctor dashboard",
            "Add analytics",
            "Test and deploy"
        ],
        chain: ["Patient / Doctor", "React Dashboard", "Flask API", "Healthcare Services", "PostgreSQL Database"]
    },
    {
        type: "general",
        keywords: [],
        baseScore: 40,
        stack: ["HTML", "CSS", "JavaScript", "Flask", "MySQL"],
        description: "",
        features: [
            "User authentication",
            "Interactive dashboard",
            "Data management",
            "Search and filtering",
            "Analytics"
        ],
        tasks: [
            "Set up project environment",
            "Design application structure",
            "Build frontend interface",
            "Create backend API",
            "Connect database",
            "Add authentication",
            "Test and deploy"
        ],
        chain: ["User", "React Frontend", "Flask API", "MySQL Database"]
    }
];

function detectBestDomain(lowerIdea) {

    let bestDomain = DOMAINS[DOMAINS.length - 1];
    let bestScore = 0;

    DOMAINS.forEach(function (domain) {

        let score = 0;

        (domain.keywords || []).forEach(function (keyword) {

            const weight = keyword.indexOf(" ") > -1 ? 2 : 1;
            const matches = keyword.indexOf(" ") > -1
                ? lowerIdea.indexOf(keyword) > -1
                : new RegExp(
                      "(^|[^a-z0-9])" + keyword + "([^a-z0-9]|$)"
                  ).test(lowerIdea);

            if (matches) score += weight;
        });

        if (score > bestScore) {
            bestScore = score;
            bestDomain = domain;
        }
    });

    return bestDomain;
}

function buildBlueprint(idea) {

    const trimmed = idea.trim();
    const lowerIdea = trimmed.toLowerCase();
    const ideaWords = tokenizeIdea(lowerIdea);

    const domain = detectBestDomain(lowerIdea);

    const keyTerms = extractKeyTerms(ideaWords, domain);
    const focusPhrase = buildFocusPhrase(keyTerms);
    const intents = detectIntents(lowerIdea);

    const stack = domain.stack.slice();
    const features = buildFeatures(domain, intents);
    const tasks = buildTasks(domain, intents);

    const title = generateTitle(domain, keyTerms);
    const description = buildDescription(domain, focusPhrase);

    // Complexity grows with idea detail so longer, richer
    // descriptions produce a genuinely more accurate estimate.
    const wordRichness = Math.min(14, Math.round(ideaWords.length * 1.5));

    let complexityScore = Math.min(
        100,
        domain.baseScore + wordRichness + (intents.length * 2)
    );

    let complexityLevel;
    if (complexityScore >= 80) complexityLevel = "Advanced";
    else if (complexityScore >= 55) complexityLevel = "Intermediate";
    else complexityLevel = "Beginner";

    let estimatedTime;
    if (complexityScore >= 80) estimatedTime = "4–6 weeks";
    else if (complexityScore >= 65) estimatedTime = "3–4 weeks";
    else if (complexityScore >= 50) estimatedTime = "2–3 weeks";
    else estimatedTime = "1–2 weeks";

    return {
        projectType: domain.type,
        domainLabel: DOMAIN_LABELS[domain.type],
        title: title,
        subtitle: trimmed,
        description: description,
        stack: stack,
        features: features,
        tasks: tasks,
        chain: domain.chain,
        complexityScore: complexityScore,
        complexityLevel: complexityLevel,
        estimatedTime: estimatedTime
    };
}


// ============================================
// ARCHITECTURE VISUALIZATION
// ============================================

function archIcon(label) {

    const low = label.toLowerCase();

    const svg = {
        person: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.5" stroke="currentColor" stroke-width="1.7"/><path d="M5 20c0-3.5 3.1-5.5 7-5.5s7 2 7 5.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
        layout: '<svg viewBox="0 0 24 24" fill="none"><rect x="3.5" y="4.5" width="17" height="12" rx="2.5" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 10.5h17M7 8h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
        server: '<svg viewBox="0 0 24 24" fill="none"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 10.5h17" stroke="currentColor" stroke-width="1.8"/><circle cx="8" cy="7.6" r="1" fill="currentColor"/><circle cx="12" cy="7.6" r="1" fill="currentColor"/></svg>',
        db: '<svg viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="5.5" rx="7.5" ry="3" stroke="currentColor" stroke-width="1.8"/><path d="M4.5 5.5v13c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-13" stroke="currentColor" stroke-width="1.8"/><path d="M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3" stroke="currentColor" stroke-width="1.8"/></svg>',
        spark: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3v6M12 15v6M3 12h6M15 12h6M5.6 5.6l4.2 4.2M14.2 14.2l4.2 4.2M18.4 5.6l-4.2 4.2M9.8 14.2l-4.2 4.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
        card: '<svg viewBox="0 0 24 24" fill="none"><rect x="3.5" y="5" width="17" height="14" rx="2.5" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 9.5h17" stroke="currentColor" stroke-width="1.8"/></svg>'
    };

    if (/(user|admin|customer|patient|doctor|student)/.test(low)) {
        return svg.person;
    }

    if (/(frontend|store|platform|dashboard|learning)/.test(low)) {
        return svg.layout;
    }

    if (/(api|flask|service|services|node)/.test(low)) {
        return svg.server;
    }

    if (/(database|mysql|postgres|mongo)/.test(low)) {
        return svg.db;
    }

    if (/(\bai\b|face|recognition)/.test(low)) {
        return svg.spark;
    }

    if (/(payment)/.test(low)) {
        return svg.card;
    }

    return svg.spark;
}

function buildArchitecture(chain) {

    const boxes = [];

    chain.forEach(function (label, index) {

        if (index > 0) {
            boxes.push('<div class="arrow"></div>');
        }

        boxes.push(
            '<div class="architecture-box">' +
                '<i class="arch-glyph">' +
                    archIcon(label) +
                '</i>' +
                '<span class="arch-label">' +
                    label +
                '</span>' +
            '</div>'
        );
    });

    return boxes.join("");
}


// ============================================
// GENERATE BLUEPRINT
// ============================================

async function generateProject() {

    const ideaInput = document.getElementById("projectIdea");
    const idea = ideaInput.value.trim();

    const validationError = validateIdea(idea);

    if (validationError) {
        showIdeaError(validationError);
        return;
    }

    hideIdeaError();
    setButtonLoading(true);

    const ideaBox = document.getElementById("ideaBox");
    const generateStatus = document.getElementById("generateStatus");
    const generationProgress = document.getElementById("generationProgress");

    if (ideaBox) {
        ideaBox.classList.add("generating");
    }

    const steps = [
        "Understanding your idea...",
        "Designing architecture...",
        "Selecting technology...",
        "Planning implementation..."
    ];

    for (let i = 0; i < steps.length; i++) {

        if (generateStatus) {
            generateStatus.textContent = steps[i];
        }

        if (generationProgress) {
            generationProgress.style.width =
                ((i + 1) / steps.length * 100) + "%";
        }

        await new Promise(function (resolve) {
            setTimeout(resolve, 420);
        });
    }

    const blueprint = buildBlueprint(idea);

    renderBlueprint(blueprint, idea);

    if (generateStatus) {
        generateStatus.textContent = "Blueprint generated \u2713";
    }

    const statePill = document.getElementById("statePill");

    if (statePill) {
        statePill.innerHTML = '<span class="pill-dot"></span> Blueprint ready';
    }

    if (ideaBox) {
        ideaBox.classList.remove("generating");
    }

    setButtonLoading(false);
}


// ============================================
// RENDER BLUEPRINT
// (shared by live generation and saved projects)
// ============================================

function renderBlueprint(blueprint, subtitle) {

    currentBlueprint = blueprint;

    // PROJECT TITLE & SUBTITLE

    document.getElementById("projectTitle").textContent = blueprint.title;

    const subtitleElement = document.getElementById("projectSubtitle");

    const message = (subtitle != null && subtitle !== "")
        ? subtitle
        : (blueprint.subtitle || "");

    if (subtitleElement) {
        subtitleElement.textContent = message;
    }

    // DOMAIN BADGE

    const domainPill = document.getElementById("domainPill");

    if (domainPill) {
        domainPill.innerHTML =
            '<span class="pill-dot domain-' + blueprint.projectType + '"></span> ' +
            blueprint.domainLabel;
    }

    // PROJECT DESCRIPTION

    document.getElementById("overview").textContent = blueprint.description;

    // TECHNOLOGY STACK

    const techStack = document.getElementById("techStack");

    techStack.innerHTML = "";

    blueprint.stack.forEach(function (technology) {

        const tag = document.createElement("span");

        tag.textContent = technology;

        techStack.appendChild(tag);
    });

    // FEATURES

    const featuresList = document.getElementById("featuresList");

    featuresList.innerHTML = "";

    blueprint.features.forEach(function (feature) {

        const item = document.createElement("span");

        item.textContent = "\u2713 " + feature;

        featuresList.appendChild(item);
    });

    // DEVELOPMENT TASKS

    const tasksList = document.getElementById("tasksList");

    tasksList.innerHTML = "";

    blueprint.tasks.forEach(function (task, index) {

        const taskElement = document.createElement("div");

        taskElement.className = "task";

        taskElement.innerHTML =
            '<span class="task-number">' +
            String(index + 1).padStart(2, "0") +
            '</span>' +
            task;

        tasksList.appendChild(taskElement);
    });

    // DEVELOPMENT ROADMAP

    const roadmap = document.getElementById("roadmap");

    if (roadmap) {

        const picks = [
            0,
            Math.max(1, Math.floor((blueprint.tasks.length - 1) / 2)),
            blueprint.tasks.length - 2,
            blueprint.tasks.length - 1
        ];

        const unique = [];

        picks.forEach(function (index) {

            if (index >= 0 && index < blueprint.tasks.length && unique.indexOf(index) === -1) {
                unique.push(index);
            }
        });

        roadmap.innerHTML = unique.map(function (index, position) {

            return (
                '<div class="roadmap-item">' +
                    '<span>' +
                        String(position + 1).padStart(2, "0") +
                    '</span>' +
                    blueprint.tasks[index] +
                '</div>'
            );
        }).join("");
    }

    // ARCHITECTURE

    const architecture = document.getElementById("architecture");

    architecture.innerHTML = buildArchitecture(blueprint.chain);

    Array.prototype.forEach.call(
        architecture.children,
        function (child, index) {
            child.style.animationDelay = (index * 80) + "ms";
        }
    );

    // DISPLAY COMPLEXITY

    const complexityScoreElement = document.getElementById("complexityScore");
    const complexityLevelElement = document.getElementById("complexityLevel");
    const estimatedTimeElement = document.getElementById("estimatedTime");
    const complexityProgress = document.getElementById("complexityProgress");

    if (complexityScoreElement) complexityScoreElement.textContent = "0";
    if (complexityLevelElement) complexityLevelElement.textContent = blueprint.complexityLevel;
    if (estimatedTimeElement) estimatedTimeElement.textContent = blueprint.estimatedTime;
    if (complexityProgress) complexityProgress.style.width = "0%";

    // SHOW BLUEPRINT

    const blueprintSection = document.getElementById("blueprint");

    blueprintSection.style.display = "block";

    restartAnimations(blueprintSection);
    restartAnimations(architecture);

    if (complexityScoreElement) {
        animateValue(complexityScoreElement, 0, blueprint.complexityScore, 900);
    }

    if (complexityProgress) {

        requestAnimationFrame(function () {

            requestAnimationFrame(function () {

                complexityProgress.style.width = blueprint.complexityScore + "%";
            });
        });
    }

    const complexityRing = document.getElementById("complexityRing");

    if (complexityRing) {

        complexityRing.style.setProperty("--p", "0%");

        requestAnimationFrame(function () {

            requestAnimationFrame(function () {

                animateRing(complexityRing, blueprint.complexityScore, 900);
            });
        });
    }

    blueprintSection.scrollIntoView({ behavior: "smooth" });

    // Reset save / download controls for this (possibly new) blueprint.

    const saveBtn = document.getElementById("saveProjectBtn");
    const downloadBtn = document.getElementById("downloadBtn");
    const saveLabel = document.querySelector("#saveProjectBtn .btn-label-copy");

    if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.classList.remove("saved");
        if (saveLabel) saveLabel.textContent = "Save Project";
    }

    if (downloadBtn) {
        downloadBtn.disabled = false;
    }
}


// ============================================
// COPY BLUEPRINT
// ============================================

function copyBlueprint() {

    const titleEl = document.getElementById("projectTitle");
    const overviewEl = document.getElementById("overview");
    const stackEl = document.getElementById("techStack");
    const featuresEl = document.getElementById("featuresList");
    const tasksEl = document.getElementById("tasksList");
    const complexityEl = document.getElementById("complexityScore");
    const levelEl = document.getElementById("complexityLevel");
    const etaEl = document.getElementById("estimatedTime");

    const title = titleEl ? titleEl.textContent : "";
    const overview = overviewEl ? overviewEl.textContent : "";

    const stack = stackEl
        ? Array.prototype.map.call(stackEl.children, function (el) {
              return "  \u2022 " + el.textContent;
          }).join("\n")
        : "";

    const features = featuresEl
        ? Array.prototype.map.call(featuresEl.children, function (el) {
              return "  \u2022 " + el.textContent.replace(/^\u2713\s*/, "");
          }).join("\n")
        : "";

    const tasks = tasksEl
        ? Array.prototype.map.call(tasksEl.children, function (el) {
              return "  " + el.textContent.trim();
          }).join("\n")
        : "";

    const score = complexityEl ? complexityEl.textContent : "0";
    const level = levelEl ? levelEl.textContent : "";
    const eta = etaEl ? etaEl.textContent : "";

    const text =
        "\u201C" + title + "\u201D \u2014 ProjectForge Blueprint\n" +
        "==============================================\n\n" +
        "Overview\n" +
        overview + "\n\n" +
        "Tech stack\n" +
        stack + "\n\n" +
        "Features\n" +
        features + "\n\n" +
        "Tasks\n" +
        tasks + "\n\n" +
        "Complexity: " + score + "/100 (" + level + ")\n" +
        "Estimated time: " + eta + "\n\n" +
        "Generated with ProjectForge \u2014 build smarter, ship faster.";

    const done = function () {
        showToast("Blueprint copied to clipboard");
    };

    const fail = function () {
        showToast("Could not copy \u2014 please copy manually");
    };

    if (navigator.clipboard && window.isSecureContext) {

        navigator.clipboard.writeText(text).then(done).catch(fail);
        return;
    }

    // Fallback for older browsers / non-secure contexts.
    const textarea = document.createElement("textarea");

    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";

    document.body.appendChild(textarea);

    textarea.select();

    try {
        document.execCommand("copy") ? done() : fail();
    }
    catch (err) {
        fail();
    }

    document.body.removeChild(textarea);
}

function showToast(message) {

    let toast = document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast._timer);

    showToast._timer = setTimeout(function () {
        toast.classList.remove("show");
    }, 2200);
}


// ============================================
// SAVE PROJECT
// ============================================

async function saveProject() {

    if (!currentBlueprint) {
        showToast("Generate a blueprint first");
        return;
    }

    const saveBtn = document.getElementById("saveProjectBtn");
    const saveLabel = document.querySelector("#saveProjectBtn .btn-label-copy");

    if (saveBtn) {
        saveBtn.disabled = true;
    }

    const payload = {
        title: currentBlueprint.title,
        idea: currentBlueprint.subtitle,
        projectType: currentBlueprint.projectType,
        description: currentBlueprint.description,
        stack: currentBlueprint.stack,
        features: currentBlueprint.features,
        tasks: currentBlueprint.tasks,
        chain: currentBlueprint.chain,
        complexityScore: currentBlueprint.complexityScore,
        complexityLevel: currentBlueprint.complexityLevel,
        estimatedTime: currentBlueprint.estimatedTime
    };

    try {

        const response = await fetch(API_BASE + "/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Could not save the project.");
        }

        currentBlueprint.savedId = data.id;

        showToast("Project saved \u2713");

        if (saveBtn) {
            saveBtn.classList.add("saved");
            if (saveLabel) saveLabel.textContent = "Saved \u2713";
        }

        loadSavedProjects();
    }
    catch (err) {

        showToast("Could not save \u2014 is the backend running?");

        if (saveBtn) {
            saveBtn.disabled = false;
        }
    }
}


// ============================================
// DOWNLOAD BLUEPRINT (print / save-as-PDF)
// ============================================

function downloadBlueprint() {

    if (!currentBlueprint) {
        showToast("Generate a blueprint first");
        return;
    }

    fillDownloadDocument(currentBlueprint);
    openDownloadModal();
}

function openDownloadModal() {

    const modal = document.getElementById("downloadModal");

    if (!modal) return;

    modal.classList.add("open");
    document.body.classList.add("modal-open");

    const dialog = modal.querySelector(".modal-dialog");

    if (dialog) {
        restartAnimations(dialog);
    }
}

function closeDownloadModal() {

    const modal = document.getElementById("downloadModal");

    if (!modal) return;

    modal.classList.remove("open");
    document.body.classList.remove("modal-open");
}

function printBlueprint() {

    document.body.classList.add("printing-download");

    const finishPrint = function () {
        document.body.classList.remove("printing-download");
        window.removeEventListener("afterprint", finishPrint);
    };

    window.addEventListener("afterprint", finishPrint);

    window.setTimeout(function () {
        window.print();
    }, 60);
}

function fillDownloadDocument(blueprint) {

    const preview = document.getElementById("downloadPreview");

    if (!preview) return;

    const stackItems = (blueprint.stack || []).map(function (item) {
        return '<li>' + item + '</li>';
    }).join("");

    const featureItems = (blueprint.features || []).map(function (item) {
        return '<li>' + item + '</li>';
    }).join("");

    const taskItems = (blueprint.tasks || []).map(function (task, index) {
        return '<li><span class="doc-task-num">' +
            String(index + 1).padStart(2, "0") +
            '</span>' + task + '</li>';
    }).join("");

    const chip = function (label, value) {
        return '<span class="doc-chip">' + label + ': <strong>' + value + '</strong></span>';
    };

    preview.innerHTML =
        '<div class="doc-header">' +
            '<div class="doc-marks">' +
                '<span class="doc-logo">' +
                    'Project<span class="doc-logo-accent">Forge</span>' +
                '</span>' +
                '<span class="doc-tag">Project Blueprint</span>' +
            '</div>' +
            '<div class="doc-date">' +
                (formatDate(new Date().toISOString()) || "") +
            '</div>' +
        '</div>' +

        '<div class="doc-title-block">' +
            '<h1>' + escapeHtml(blueprint.title) + '</h1>' +
            '<p class="doc-subtitle">' +
                '<span class="doc-type">' + escapeHtml(blueprint.domainLabel) + '</span>' +
                (blueprint.subtitle
                    ? '<span class="doc-idea">' + escapeHtml(blueprint.subtitle.substring(0, 220)) + '</span>'
                    : "") +
            '</p>' +
        '</div>' +

        '<div class="doc-stats">' +
            chip("Complexity", blueprint.complexityScore + "/100 \u00B7 " + blueprint.complexityLevel) +
            chip("Estimated time", blueprint.estimatedTime || "\u2014") +
        '</div>' +

        '<div class="doc-section">' +
            '<h2>Overview</h2>' +
            '<p>' + escapeHtml(blueprint.description) + '</p>' +
        '</div>' +

        (stackItems
            ? '<div class="doc-section">' +
                '<h2>Technology Stack</h2>' +
                '<ul class="doc-list doc-grid">' + stackItems + '</ul>' +
              '</div>'
            : "") +

        (featureItems
            ? '<div class="doc-section">' +
                '<h2>Core Features</h2>' +
                '<ul class="doc-list">' + featureItems + '</ul>' +
              '</div>'
            : "") +

        '<div class="doc-section">' +
            '<h2>Architecture</h2>' +
            '<div class="doc-flow">' +
                (blueprint.chain || []).map(function (node, index) {
                    return (index > 0 ? '<span class="doc-flow-arrow">&rarr;</span>' : "") +
                        '<span class="doc-flow-node">' +
                            escapeHtml(node) +
                        '</span>';
                }).join("") +
            '</div>' +
        '</div>' +

        (taskItems
            ? '<div class="doc-section">' +
                '<h2>Development Tasks</h2>' +
                '<ol class="doc-tasks">' + taskItems + '</ol>' +
              '</div>'
            : "") +

        '<div class="doc-footer">' +
            '<p>Generated with ProjectForge \u2014 AI-assisted suggestions for planning. ' +
            'Review and validate before starting development.</p>' +
            '<p class="doc-footer-brand">ProjectForge \u00B7 Build Smarter</p>' +
        '</div>';
}

function escapeHtml(value) {

    return String(value == null ? "" : value).replace(/[&<>"']/g, function (character) {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}


// ============================================
// SAVED PROJECTS ("My Projects")
// ============================================

function mapRowToBlueprint(row) {

    return {
        id: row.id,
        projectType: row.project_type || "general",
        domainLabel: DOMAIN_LABELS[row.project_type] || "General",
        title: row.title,
        subtitle: row.idea,
        description: row.description || "",
        stack: safeParse(row.tech_stack, []),
        features: safeParse(row.features, []),
        tasks: safeParse(row.tasks, []),
        chain: safeParse(row.architecture, ["User", "Frontend", "Backend API", "Database"]),
        complexityScore: row.complexity_score || 0,
        complexityLevel: row.complexity_level || "Beginner",
        estimatedTime: row.estimated_time || "\u2014",
        createdAt: row.created_at
    };
}

async function loadSavedProjects() {

    const grid = document.getElementById("savedProjectsGrid");
    const empty = document.getElementById("savedProjectsEmpty");
    const status = document.getElementById("savedProjectsStatus");

    if (!grid) return;

    if (status) {
        status.textContent = "Loading your projects\u2026";
        status.classList.remove("show");

        requestAnimationFrame(function () {
            status.classList.add("show");
        });
    }

    try {

        const response = await fetch(API_BASE + "/api/projects");

        if (!response.ok) {
            throw new Error("Backend returned an error");
        }

        const rows = await response.json();

        renderSavedProjects(rows, grid, empty);
    }
    catch (err) {

        if (status) {
            status.textContent = "Could not load saved projects \u2014 is the backend running on " + API_BASE + "?";
            status.classList.add("show");
        }

        if (grid) grid.innerHTML = "";
        if (empty) empty.innerHTML = "";
    }
}

function renderSavedProjects(rows, grid, empty) {

    const status = document.getElementById("savedProjectsStatus");

    grid.innerHTML = "";

    if (!rows || !rows.length) {

        if (status) {
            status.textContent = "";
            status.classList.remove("show");
        }

        if (empty) {
            empty.style.display = "block";
            empty.innerHTML =
                '<div class="saved-empty-card">' +
                    '<h3>No saved blueprints yet</h3>' +
                    '<p>Generate a project and hit \u201CSave Project\u201D to keep it here.</p>' +
                '</div>';
        }

        return;
    }

    if (empty) {
        empty.style.display = "none";
    }

    if (status) {
        status.textContent = rows.length + (rows.length === 1
            ? " blueprint saved"
            : " blueprints saved");
        status.classList.add("show");
    }

    const card = function (blueprint, index) {

        const accent = "var(--acc, #8b5cf6)";

        return (
            '<article class="saved-card reveal in-view" style="--i: ' + index + '; --acc: ' + accent + '" data-id="' + blueprint.id + '">' +
                '<div class="saved-head">' +
                    '<span class="saved-type">' + escapeHtml(blueprint.domainLabel) + '</span>' +
                    '<span class="saved-date">' + escapeHtml(formatDate(blueprint.createdAt)) + '</span>' +
                '</div>' +
                '<h3 class="saved-title">' + escapeHtml(blueprint.title) + '</h3>' +
                '<p class="saved-idea">' + escapeHtml(blueprint.subtitle.substring(0, 140)) + '</p>' +
                '<div class="saved-meta">' +
                    '<span>Complexity ' + blueprint.complexityScore + '/100</span>' +
                    '<span class="saved-dot"></span>' +
                    '<span>' + escapeHtml(blueprint.complexityLevel) + '</span>' +
                    '<span class="saved-dot"></span>' +
                    '<span>ETA ' + escapeHtml(blueprint.estimatedTime) + '</span>' +
                '</div>' +
                '<div class="saved-actions">' +
                    '<button class="btn btn-primary saved-open" type="button" onclick="openProject(' + blueprint.id + ')">' +
                        'Open blueprint' +
                    '</button>' +
                    '<button class="btn btn-ghost saved-del" type="button" ' +
                        'onclick="deleteProject(' + blueprint.id + ', this)" data-id="' + blueprint.id + '">' +
                        'Delete' +
                    '</button>' +
                '</div>' +
            '</article>'
        );
    };

    grid.innerHTML = rows.map(function (row, index) {
        return card(mapRowToBlueprint(row), index);
    }).join("");
}

async function openProject(id) {

    try {

        const response = await fetch(API_BASE + "/api/projects/" + id);

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Could not open project.");
        }

        renderBlueprint(mapRowToBlueprint(data));
    }
    catch (err) {

        showToast("Could not open project \u2014 is the backend running?");
    }
}

async function deleteProject(id, button) {

    if (!window.confirm("Delete this saved project?")) return;

    try {

        const response = await fetch(API_BASE + "/api/projects/" + id, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Could not delete project.");
        }

        showToast("Project deleted");

        loadSavedProjects();
    }
    catch (err) {

        showToast("Could not delete \u2014 is the backend running?");
    }
}


// ============================================
// CONTACT CONFIG
// ============================================

async function fetchContactConfig() {

    try {

        const response = await fetch(API_BASE + "/api/config");

        if (!response.ok) {
            throw new Error("Backend returned an error");
        }

        const data = await response.json();

        applyContactEmail(data.contactEmail || "");
    }
    catch (err) {

        applyContactEmail("");
    }
}

function applyContactEmail(email) {

    const link = document.getElementById("contactLink");

    if (!link) return;

    const clean = (email || "").trim();

    if (clean) {

        link.setAttribute("href", "mailto:" + clean);
        link.textContent = "Contact";
        link.classList.remove("contact-unset");
        link.removeAttribute("data-unset");
    }
    else {

        link.removeAttribute("href");
        link.textContent = "Contact";
        link.classList.add("contact-unset");
        link.setAttribute("data-unset", "true");
        link.setAttribute("title", "Contact email not configured");
    }
}


// ============================================
// ANIMATION HELPERS
// ============================================

function animateValue(element, start, end, duration) {

    const startTime = performance.now();

    function tick(now) {

        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        element.textContent = Math.round(start + (end - start) * eased);

        if (progress < 1) {
            requestAnimationFrame(tick);
        }
    }

    requestAnimationFrame(tick);
}

function animateRing(element, target, duration) {

    const startTime = performance.now();

    function tick(now) {

        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        element.style.setProperty("--p", (eased * target) + "%");

        if (progress < 1) {
            requestAnimationFrame(tick);
        }
    }

    requestAnimationFrame(tick);
}

function restartAnimations(element) {

    element.classList.remove("play");

    void element.offsetWidth;

    element.classList.add("play");
}


// ============================================
// GENERATE BUTTON LOADING STATE
// ============================================

const generateButton = document.getElementById("generateBtn");

function setButtonLoading(loading) {

    if (!generateButton) return;

    generateButton.disabled = loading;
    generateButton.classList.toggle("loading", loading);
}


// ============================================
// INIT: ERROR CLEARING + SUGGESTIONS
// ============================================

(function initIdeaInteractions() {

    const ideaInput = document.getElementById("projectIdea");

    if (ideaInput) {

        ideaInput.addEventListener("input", function () {

            updateIdeaCount();

            if (ideaInput.getAttribute("aria-invalid")) {
                hideIdeaError();
            }
        });
    }

    updateIdeaCount();

    const chips = document.querySelectorAll(".chip[data-idea]");

    chips.forEach(function (chip) {

        chip.addEventListener("click", function () {

            if (!ideaInput) return;

            ideaInput.value = chip.getAttribute("data-idea");
            hideIdeaError();
            updateIdeaCount();

            generateProject();
        });
    });
})();


// ============================================
// INIT: NAVBAR TOGGLE
// ============================================

(function initNavToggle() {

    const navbar = document.getElementById("navbar");
    const toggle = document.getElementById("navToggle");

    if (!navbar || !toggle) return;

    toggle.addEventListener("click", function () {

        const open = navbar.classList.toggle("open");

        toggle.setAttribute("aria-expanded", String(open));
    });

    navbar.querySelectorAll("a").forEach(function (link) {

        link.addEventListener("click", function () {

            navbar.classList.remove("open");
            toggle.setAttribute("aria-expanded", "false");
        });
    });
})();


// ============================================
// INIT: CARD TILT
// ============================================

(function initTilt() {

    const cards = document.querySelectorAll(".tilt");

    if (!cards.length) return;

    const reduced =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const coarse =
        window.matchMedia &&
        window.matchMedia("(hover: none)").matches;

    if (reduced || coarse) return;

    cards.forEach(function (card) {

        let frame = null;

        card.addEventListener("pointermove", function (event) {

            const rect = card.getBoundingClientRect();

            const x = (event.clientX - rect.left) / rect.width;
            const y = (event.clientY - rect.top) / rect.height;

            cancelAnimationFrame(frame);

            frame = requestAnimationFrame(function () {

                const rotateY = (x - 0.5) * 8;
                const rotateX = (0.5 - y) * 8;

                card.style.transform =
                    "perspective(900px) rotateX(" +
                    rotateX.toFixed(2) +
                    "deg) rotateY(" +
                    rotateY.toFixed(2) +
                    "deg) translateY(-3px)";

                card.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
                card.style.setProperty("--my", (y * 100).toFixed(1) + "%");
            });
        });

        card.addEventListener("pointerleave", function () {

            cancelAnimationFrame(frame);

            card.style.transform = "";
        });
    });
})();


// ============================================
// INIT: SCROLL REVEALS
// ============================================

(function initScrollReveals() {

    const revealElements = document.querySelectorAll(".reveal");

    if (!("IntersectionObserver" in window)) {

        revealElements.forEach(function (el) {
            el.classList.add("in-view");
        });

        return;
    }

    const observer = new IntersectionObserver(

        function (entries) {

            entries.forEach(function (entry) {

                if (entry.isIntersecting) {

                    entry.target.classList.add("in-view");

                    observer.unobserve(entry.target);
                }
            });
        },

        {
            threshold: 0.12,
            rootMargin: "0px 0px -40px 0px"
        }
    );

    revealElements.forEach(function (el) {
        observer.observe(el);
    });
})();


// ============================================
// INIT: NAV SCROLLSPY
// ============================================

(function initScrollSpy() {

    if (!("IntersectionObserver" in window)) return;

    const spySections = document.querySelectorAll("[data-spy]");

    if (!spySections.length) return;

    spySections.forEach(function (link) {

        const target = document.getElementById(link.dataset.spy);

        if (!target) return;

        const spy = new IntersectionObserver(

            function (entries) {

                entries.forEach(function (entry) {

                    if (entry.isIntersecting) {

                        spySections.forEach(function (current) {

                            current.classList.toggle(
                                "active",
                                current === link
                            );
                        });
                    }
                });
            },

            {
                rootMargin: "-45% 0px -50% 0px"
            }
        );

        spy.observe(target);
    });
})();


// ============================================
// INIT: GENERATE SHORTCUT
// ============================================

(function initGenerateShortcut() {

    const ideaInput = document.getElementById("projectIdea");

    if (!ideaInput) return;

    ideaInput.addEventListener("keydown", function (event) {

        if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
            generateProject();
        }
    });
})();


// ============================================
// INIT: DOWNLOAD MODAL INTERACTIONS
// ============================================

(function initDownloadModal() {

    const modal = document.getElementById("downloadModal");

    if (!modal) return;

    const closeBtn = document.getElementById("downloadClose");

    if (closeBtn) {
        closeBtn.addEventListener("click", closeDownloadModal);
    }

    modal.addEventListener("click", function (event) {

        if (event.target === modal) {
            closeDownloadModal();
        }
    });

    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape" && modal.classList.contains("open")) {
            closeDownloadModal();
        }
    });
})();


// ============================================
// INIT: APP BOOT (contact + saved projects)
// ============================================

(function bootApp() {

    fetchContactConfig();
    loadSavedProjects();
})();