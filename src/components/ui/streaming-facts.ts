/**
 * Fact pool for the "Did you know" streaming indicator.
 *
 * Facts are organised by category so they can be curated, filtered, or
 * surfaced contextually in the future. Each category is a `FactCategory`
 * object with a stable `id`, a human `label`, and a long list of short
 * one-line `facts`.
 *
 * Keep facts:
 *  - short (ideally one line so they fit inline while streaming),
 *  - genuinely interesting and broadly accurate,
 *  - free of trailing whitespace and self-contained (no external context).
 */

export interface FactCategory {
  /** Stable identifier, e.g. used for filtering or analytics. */
  id: string
  /** Human-readable category name. */
  label: string
  /** One-line facts belonging to this category. */
  facts: string[]
}

export const FACT_CATEGORIES: FactCategory[] = [
  {
    id: 'computing-history',
    label: 'Computing History',
    facts: [
      'The first computer bug was a real moth, found in 1947.',
      "'Debugging' was coined after that moth was taped into a logbook.",
      'The first gigabyte hard drive (1980) weighed over 500 pounds.',
      'Ada Lovelace wrote the first algorithm back in the 1840s.',
      'The first email was sent by Ray Tomlinson in 1971.',
      'The first registered domain was symbolics.com, in 1985.',
      'The first computer virus, in 1971, was completely harmless.',
      'Email existed years before the World Wide Web did.',
      'The first 1MB of RAM cost over $400,000 in the 1950s.',
      'ENIAC, an early computer, weighed about 30 tons.',
      'The term "bug" for a flaw predates computers by decades.',
      'The first laptop, the Osborne 1, weighed about 24 pounds.',
      'The first programmable computer, the Z3, was built in 1941.',
      'The first transistor was built at Bell Labs in 1947.',
      'The first hard drive (1956) stored about 5MB and was huge.',
      'The first computer programmer was a woman, Ada Lovelace.',
      'The first computer password system was at MIT in the 1960s.',
      'The first computer worm spread across ARPANET in 1988.',
      'The first ARPANET message crashed after just two letters: "LO".',
      'The first programming language, Plankalkül, was designed in the 1940s.',
      'The first computer with a GUI you could buy was the Xerox Star.',
      'The first computer to use a mouse was the Xerox Alto.',
      'The first commercially successful microprocessor was the Intel 4004.',
      'The first 64-bit consumer CPU arrived in the early 2000s.',
      'The Apollo Guidance Computer had less power than a modern calculator.',
      'A modern smartphone has more computing power than 1969\u2019s NASA.',
      'NASA still runs some software first written in the 1970s.',
      'The first hyperlink demo was part of the 1968 "Mother of All Demos".',
    ],
  },
  {
    id: 'programming',
    label: 'Programming',
    facts: [
      'Python is named after Monty Python, not the snake.',
      'There are over 700 programming languages in use today.',
      "'Bit' is simply short for 'binary digit'.",
      'C was created in 1972 and still underpins modern operating systems.',
      'JavaScript was written in just 10 days in 1995.',
      'JavaScript and Java are about as related as car and carpet.',
      'A byte is 8 bits; a nibble is 4 bits \u2014 yes, really.',
      'Git was created by Linus Torvalds in about two weeks.',
      'Tabs vs spaces debates are nearly as old as code itself.',
      'Null references were called a "billion-dollar mistake" by their creator.',
      'Vim and Emacs have fueled a friendly editor war for decades.',
      'A "daemon" is a background process, not a spooky one.',
      'The term "patch" comes from literal paper tape patches on programs.',
      'The word "algorithm" comes from a 9th-century mathematician\u2019s name.',
      'Binary uses only two digits, yet can represent any number.',
      'Stack Overflow launched in 2008 and changed how devs work.',
      'The "K" in "kB" once meant 1024, not 1000.',
      'The term "open source" was coined in 1998.',
      'ASCII was first published as a standard in 1963.',
      'Unicode now defines code points for over 140,000 characters.',
    ],
  },
  {
    id: 'web-internet',
    label: 'Web & Internet',
    facts: [
      "Wi-Fi doesn't actually stand for anything.",
      'The first banner ad appeared online in 1994.',
      'More than half of all web traffic comes from bots.',
      'HTTP 418 is a real status code: "I\u2019m a teapot".',
      'Around 90% of the world\u2019s data was created in just a few years.',
      'The term "cookie" comes from "magic cookie", an old Unix concept.',
      'Linux powers the vast majority of the world\u2019s web servers.',
      'HTML was first proposed by Tim Berners-Lee in 1989.',
      "CSS wasn't added to the web until 1996.",
      'The "http://" prefix Tim Berners-Lee later called unnecessary.',
      'The world\u2019s first website is still online today.',
      'The first webpage explained what the World Wide Web was.',
      'The first graphical web browser was called Mosaic.',
      'The "www" prefix is technically optional for most sites.',
      'The first webmail service launched in the mid-1990s.',
      'The "blink" HTML tag is one of the web\u2019s most hated features.',
      'The first wiki was created by Ward Cunningham in 1995.',
      'The "cloud" is really just someone else\u2019s computer.',
      'The first ARPANET-based computer-to-computer chat used early protocols.',
      'Most of the internet\u2019s undersea cables are surprisingly thin.',
    ],
  },
  {
    id: 'hardware',
    label: 'Hardware',
    facts: [
      'The first computer mouse was carved out of wood.',
      'The first webcam was built to watch a coffee pot at Cambridge.',
      'The mouse was originally called an "X-Y position indicator".',
      'USB was introduced in 1996 to simplify a mess of connectors.',
      'RAM loses its contents the moment power is cut.',
      'Solid-state drives have no moving parts at all.',
      'The first computer monitors were repurposed oscilloscopes.',
      'Floppy disks came in 8-inch, 5.25-inch, and 3.5-inch sizes.',
      'The first megapixel camera arrived in the mid-1980s.',
      'The first digital camera (1975) took 23 seconds per photo.',
      'GPS satellites carry atomic clocks accurate to billionths of a second.',
      'A teraflop is a trillion floating-point operations per second.',
      'Most modern CPUs can do billions of operations per second.',
      'The first laptop with a trackpad shipped in the early 1990s.',
      'The first webcam image was "the Trojan Room coffee pot".',
      'The "escape" key dates back to early teletype machines.',
      'The first 3D-printed object dates back to 1983.',
      'The "pixel" is short for "picture element".',
      'Moore\u2019s Law is an observation, not a law of physics.',
      'The "ping" command is named after sonar.',
    ],
  },
  {
    id: 'naming-trivia',
    label: 'Naming & Trivia',
    facts: [
      "The word 'robot' comes from a Czech word for 'forced labour'.",
      'The Firefox logo is actually a red panda, not a fox.',
      'Bluetooth is named after a 10th-century Viking king.',
      "Google was originally called 'BackRub'.",
      "A 'jiffy' is a real unit of time \u2014 about 1/100th of a second.",
      'The "@" symbol was used in commerce long before email.',
      '"Spam" as junk mail is named after a Monty Python sketch.',
      'The hashtag symbol is formally called an "octothorpe".',
      'A "googol" is 1 followed by 100 zeros \u2014 Google\u2019s name is a play on it.',

      'Captcha stands for a test telling humans and computers apart.',
      'Most CAPTCHAs you solve help train AI systems.',
      'The lowercase "i" in iPhone originally stood for "internet".',
      'The "save" icon is a floppy disk many people have never held.',
      'The term "firewall" was borrowed from physical fire barriers.',
      'The term "byte" was coined to avoid confusion with "bit".',
      'The recycling bin idea came from the original Macintosh trash can.',
      'The "Ctrl-Alt-Delete" combo was meant only for engineers.',
    ],
  },
  {
    id: 'gaming',
    label: 'Gaming',
    facts: [
      'The first video game, "Spacewar!", dates back to 1962.',
      'The original Space Invaders sped up due to a hardware limitation.',
      'Pac-Man\u2019s design was inspired by a pizza with a slice removed.',
      'The Konami Code is up, up, down, down, left, right, left, right, B, A.',
      'The original Tetris was created in the Soviet Union in 1984.',
      'The first computer chess program dates to the early 1950s.',
      'Deep Blue beat world champion Garry Kasparov in 1997.',
      'The first computer game with a high-score table was Sea Wolf.',
      'The original Game Boy could survive a bombing \u2014 one famously did.',
      'The first text-based adventure game was "Colossal Cave Adventure".',
      'The first computer-animated feature film was Toy Story (1995).',
      'The first computer animation dates back to the early 1960s.',
      'The original Nintendo Entertainment System launched in 1983 in Japan.',
    ],
  },
  {
    id: 'modern-tech',
    label: 'Modern Tech',
    facts: [
      'The original iPhone had no copy-and-paste feature.',
      'The first text message ever sent just said "Merry Christmas".',
      'The first tweet was posted by Jack Dorsey in 2006.',
      'The first YouTube video was uploaded at a zoo in 2005.',
      'The first SMS was sent from a computer, not a phone.',
      'The first email attachment was sent in the early 1990s.',
      'QR codes were invented in 1994 to track car parts.',
      'RSA encryption relies on the difficulty of factoring large numbers.',
      'Most passwords are still cracked because they\u2019re too common.',
      'The first emoji set was created in Japan in 1999.',
      'The QWERTY layout was designed partly to slow typists down.',
    ],
  },
]

/** Flat list of every fact across all categories (deduplicated by text). */
export const ALL_FACTS: string[] = Array.from(
  new Set(FACT_CATEGORIES.flatMap((category) => category.facts)),
)

/* ──────────────────────────────────────────────────────────────────────────
 * AI-generated facts
 *
 * On every app restart we ask the AI for a fresh batch of facts and append
 * them (deduplicated) to a persisted pool in localStorage. These accumulate
 * over time and are merged with the built-in `ALL_FACTS` so the rotation pool
 * keeps growing. Failure is always silent — the static facts remain the
 * source of truth if the AI is unavailable.
 * ──────────────────────────────────────────────────────────────────────── */

const DYNAMIC_FACTS_KEY = "genisys:streaming-facts-dynamic:v1"
/** Cap the persisted AI pool so it can't grow without bound. */
const MAX_DYNAMIC_FACTS = 500
/** How many fresh facts to request per restart. */
const FETCH_BATCH_SIZE = 12

/** Normalise a fact for dedupe comparison (case/space/quote-insensitive). */
function normalizeFact(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019\u201c\u201d'"]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

/** Read the persisted AI-generated facts. Returns [] on any failure. */
export function readDynamicFacts(): string[] {
  try {
    const raw = localStorage.getItem(DYNAMIC_FACTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((f): f is string => typeof f === "string")
  } catch {
    return []
  }
}

function writeDynamicFacts(facts: string[]): void {
  try {
    localStorage.setItem(DYNAMIC_FACTS_KEY, JSON.stringify(facts))
  } catch {
    /* storage unavailable / quota — degrade gracefully */
  }
}

/** Built-in facts plus any AI-generated facts accumulated across restarts. */
export function getAllFacts(): string[] {
  const dynamic = readDynamicFacts()
  if (dynamic.length === 0) return ALL_FACTS
  return [...ALL_FACTS, ...dynamic]
}

// Module-level guard so the network call fires at most once per app session
// (i.e. once per restart), no matter how many indicators mount.
let refreshStarted = false

type LlmJsonCompletion = (params: {
  systemPrompt: string
  userPrompt: string
  model?: string
}) => Promise<{ success: boolean; content?: string; error?: string }>

/**
 * Ask the AI for a fresh batch of "Did you know" facts and append the unique
 * ones to the persisted dynamic pool. Safe to call repeatedly — only the
 * first call per session performs work. Never throws.
 */
export async function refreshFactsFromAI(): Promise<void> {
  if (refreshStarted) return
  refreshStarted = true

  try {
    const api = (window as unknown as {
      api?: { llmJsonCompletion?: LlmJsonCompletion }
    }).api
    if (!api?.llmJsonCompletion) return

    const existing = getAllFacts()
    // Give the model a small sample so it avoids obvious overlaps.
    const sample = existing.slice(-40).join("\n")

    const systemPrompt =
      "You generate short, genuinely interesting 'Did you know' facts about " +
      "technology, computing, programming, the internet, hardware, and " +
      "computing history. Each fact must be a single concise sentence (under " +
      "120 characters), factually accurate, self-contained, and free of " +
      "markdown or numbering. Respond ONLY with a JSON array of strings."

    const userPrompt =
      `Give me ${FETCH_BATCH_SIZE} new, surprising tech facts as a JSON array ` +
      `of strings. Avoid anything similar to these existing facts:\n${sample}`

    const result = await api.llmJsonCompletion({ systemPrompt, userPrompt })
    if (!result?.success || !result.content) return

    const facts = parseFactArray(result.content)
    if (facts.length === 0) return

    const seen = new Set(existing.map(normalizeFact))
    const dynamic = readDynamicFacts()
    const fresh: string[] = []
    for (const fact of facts) {
      const key = normalizeFact(fact)
      if (!key || seen.has(key)) continue
      seen.add(key)
      fresh.push(fact)
    }
    if (fresh.length === 0) return

    // Append, then trim oldest if we exceed the cap.
    let merged = [...dynamic, ...fresh]
    if (merged.length > MAX_DYNAMIC_FACTS) {
      merged = merged.slice(merged.length - MAX_DYNAMIC_FACTS)
    }
    writeDynamicFacts(merged)
  } catch {
    /* AI unavailable / malformed response — keep the static pool */
  }
}

/** Extract a clean string[] of facts from a possibly-messy LLM JSON response. */
function parseFactArray(content: string): string[] {
  let raw = content.trim()
  // Strip ```json fences if the model wrapped the array.
  raw = raw.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim()
  // Fall back to the first [...] block if there's surrounding prose.
  if (!raw.startsWith("[")) {
    const start = raw.indexOf("[")
    const end = raw.lastIndexOf("]")
    if (start !== -1 && end > start) raw = raw.slice(start, end + 1)
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }

  const list = Array.isArray(parsed)
    ? parsed
    : Array.isArray((parsed as { facts?: unknown })?.facts)
      ? (parsed as { facts: unknown[] }).facts
      : []

  return list
    .filter((f): f is string => typeof f === "string")
    .map((f) => f.replace(/\s+/g, " ").trim())
    .filter((f) => f.length > 0 && f.length <= 160)
}
