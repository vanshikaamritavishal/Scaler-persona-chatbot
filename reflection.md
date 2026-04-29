# Reflection

## What worked

The single biggest unlock was **few-shot examples**. Early prototypes used only a description of the persona ("blunt, ex-Facebook, motivating") and the model produced generic, interchangeable answers — the three personas felt like the same chatbot wearing three name tags. The moment I added 3 concrete input/output pairs to each prompt, voices diverged sharply: Anshuman became punchy and challenging, Abhimanyu became framework-driven, Kshitij became slow and analogy-rich. The model is much better at imitation than at following abstract style rules, and few-shot examples gave it something to imitate.

The second thing that worked was **constrained output format** (`4–5 sentences, end with one question, no bullets, no emojis`). Without it, the model would default to its house style — bullet-pointed, motivational, ChatGPT-flavoured. Forcing a tight conversational shape instantly made the chat feel like talking to a person, not a help center.

Choosing **Groq with Llama 3.3 70B** was the third quiet win. Free, fast (sub-second time-to-first-token), and large enough to track nuanced few-shot examples. Earlier attempts with smaller free models (8B-class) collapsed the personas back into one another; the 70B model held them apart.

On the UI side, committing to a **Swiss high-contrast aesthetic** — sharp corners, 1px borders, pure black/white, a single electric-blue accent reserved for active states — kept me from drifting into the generic “purple-gradient AI assistant” look. The typing indicator is three blinking square dots instead of bouncing balls, the message bubbles have 4px corners instead of pill-shaped, and the persona switcher uses a black left-border accent instead of a filled active state. Small, deliberate choices that compound into something that doesn't look like every other LLM demo.

## What GIGO taught

Garbage In, Garbage Out hit me twice during this build. First, when I asked the model to "be authentic" without giving it any actual examples of what authentic _means_ for these specific people. Second, when I forgot to add the explicit `do NOT show this internal reasoning to the user` clause — the model started leaking "Step 1 of my reasoning..." into replies. Specificity is everything. Vague instructions produce vague outputs; the model fills in ambiguity with its own defaults, and its defaults are the average of the internet, which is exactly what I was trying to avoid.

The other lesson was that **constraints are as important as instructions**. Telling the model what to do is half the work; telling it what _not_ to do (no fake stats, no fluff, no breaking character) is the half that prevents the failure modes you'd otherwise spend hours debugging.

## What I'd improve

1. **Streaming responses.** Right now the user waits for the full reply, then it appears. Token streaming would make the chat feel noticeably more alive, especially on slower mobile connections.
2. **Persistent chat history per persona** stored in the browser (localStorage) so refresh doesn't wipe the conversation, while still respecting the “reset on persona switch” rule.
3. **A small evaluator harness** — run a fixed set of 10 test prompts through all 3 personas after any prompt change, diff the outputs, and flag drift. The current loop (manual eyeballing) is fine for a 1-hour build but won't scale beyond a single iteration.
4. **Prompt-shrinking pass.** The current prompts are ~1.2k tokens each — not huge, but trimmable by 25% without quality loss. On Groq's free RPM tier that's real headroom for higher concurrency.
5. **Voice mode** for Kshitij specifically — his calm explanatory style is uniquely well-suited to TTS, and ElevenLabs / OpenAI TTS would pair beautifully with his persona.

Net: 1-hour scope, three distinguishable personas, a clean UI, and a deployable architecture. The hard part wasn't the code — it was getting the prompts honest.
