import { CHATBOT_NAME } from "../constants/brand";
import { CHECK_IN_QUESTION_COUNT } from "../data/questions";
import { UK_EMERGENCY } from "../constants/company";
import { getWeightGuidance, type WeightGoal } from "./bmi";
import { getDietitianSignpost } from "./dietitianSignpost";

export interface ChatUserContext {
  city?: string;
  postcode?: string;
}

function dietitianChatBlock(ctx: ChatUserContext | null | undefined): string {
  if (!ctx?.postcode?.trim()) {
    return `• **GP** — ask for NHS dietitian referral\n• **BDA Find a dietitian** — https://www.bda.uk.com/food-health/find-a-freelance-dietitian.html\n• **NHS find services** — https://www.nhs.uk/nhs-services/find-services/`;
  }
  const signpost = getDietitianSignpost(ctx.postcode, ctx.city ?? "");
  return signpost.services
    .slice(0, 4)
    .map((s) => {
      const link = s.href ? ` (${s.href})` : "";
      return `• **${s.name}** — ${s.contact}${link}`;
    })
    .join("\n");
}

function weightTipsBlock(goal: WeightGoal): string {
  const g = getWeightGuidance(
    goal === "gain" ? "underweight" : goal === "lose" ? "obese" : "healthy",
    goal
  );
  const foods = g.foods.slice(0, 4).map((f) => `• ${f}`).join("\n");
  const exercise = g.exercises.slice(0, 3).map((e) => `• ${e}`).join("\n");
  return `${g.summary}\n\n**Foods:**\n${foods}\n\n**Exercise:**\n${exercise}\n\n**How often:** ${g.frequency.replace(/\*\*/g, "")}`;
}

export interface ChatMessage {
  id: string;
  role: "user" | "bot";
  text: string;
  createdAt: string;
}

const CRISIS_KEYWORDS =
  /suicid|kill myself|end my life|self[- ]?harm|want to die|can't go on|cannot go on|hurt myself/i;

const GREETINGS =
  /^(hi|hiya|hey|hello|helo|howdy|good morning|good afternoon|good evening|morning|afternoon|evening|sup|yo)\b|^(hi|hey|hello)\s*[!.,?]*$/i;

const HOW_ARE_YOU =
  /how are you|how r u|how're you|how do you do|you ok|are you ok|how's it going|how is it going|what's up|whats up/i;

const GOODBYE =
  /^(bye|goodbye|good bye|see you|see ya|later|gtg|gotta go|night|goodnight|good night)\b/i;

const THANKS =
  /thank you|thanks|cheers|ta\b|much appreciated|appreciate it/i;

const NAME_ASK = /your name|who are you|what are you called|what's your name|whats your name/i;

function crisisReply(): string {
  return `I'm really sorry you're feeling this way. I'm **${CHATBOT_NAME}**, a wellbeing assistant — not a counsellor or emergency service.

Please reach out now:
• **Samaritans** — **116 123** (free, 24/7)
• **Shout** — text **SHOUT** to **85258**
• **999** — if you or someone else is in immediate danger

You deserve real human support right now.`;
}

function ukServicesReply(): string {
  const lines = UK_EMERGENCY.map(
    (s) => `• **${s.name}** — ${s.contact}`
  );
  return `Here are trusted UK support services:\n\n${lines.join("\n")}\n\nIf you are in immediate danger, call **999**.`;
}

export function getBotReply(
  userText: string,
  ctx?: ChatUserContext | null
): string {
  const text = userText.trim().toLowerCase();
  const raw = userText.trim();
  const area =
    ctx?.city && ctx?.postcode
      ? `**${ctx.city} (${ctx.postcode})**`
      : ctx?.postcode
        ? `**${ctx.postcode}**`
        : "your area";

  if (!text) {
    return `I'm **${CHATBOT_NAME}**. Type a message whenever you're ready — I'm here to listen and help.`;
  }

  if (CRISIS_KEYWORDS.test(raw)) return crisisReply();

  if (GREETINGS.test(text)) {
    const hour = new Date().getHours();
    const timeGreet =
      hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    return `${timeGreet}! I'm **${CHATBOT_NAME}**, your wellbeing assistant on this platform.\n\nI can chat about stress, sleep, weight & nutrition, wellness tests, or UK support. What's on your mind today?`;
  }

  if (HOW_ARE_YOU.test(text)) {
    return `I'm **${CHATBOT_NAME}** — I'm here and ready to help you. More importantly, how are *you* feeling today? If things feel heavy, I'm glad you're reaching out.`;
  }

  if (GOODBYE.test(text)) {
    return `Take care of yourself. I'm **${CHATBOT_NAME}** — open the chat any time you need a listening ear. Remember: Samaritans are on **116 123** if you need someone to talk to.`;
  }

  if (THANKS.test(text)) {
    return "You're very welcome. It takes courage to check in with yourself. I'm glad I could help — I'm **Mind Scope**, here whenever you need me.";
  }

  if (NAME_ASK.test(text)) {
    return `I'm **${CHATBOT_NAME}** — your dedicated wellbeing assistant built into this platform. I offer supportive conversation and guidance, but I'm not a replacement for a GP or therapist.`;
  }

  if (/^(yes|yeah|yep|ok|okay|sure|alright)\b/.test(text)) {
    return "Great — what would you like to talk about? I can help with wellbeing tips, explain our check-in, or share UK support resources.";
  }

  if (/^(no|nope|not really|nah)\b/.test(text)) {
    return "That's completely fine. I'm here if you change your mind. Is there anything small I can help with — even just explaining how the wellness check-in works?";
  }

  if (/help|support|assist|what can you do/.test(text)) {
    return `I'm **${CHATBOT_NAME}**. I can:\n• Chat about stress, sleep, mood, and daily balance\n• **Weight & BMI** — tips to lose or gain weight safely\n• **Dietitian signposting** near ${area}\n• Explain our **${CHECK_IN_QUESTION_COUNT}-question** wellness test\n• Point you to **UK crisis services**\n\nOpen **BMI & nutrition** in the menu for your calculator. What would help most right now?`;
  }

  if (
    /dietitian|dietician|nutritionist|see a diet|find a diet|food specialist|nearest diet/.test(
      text
    )
  ) {
    return `Here is how to find a **registered dietitian** near ${area}:\n\n${dietitianChatBlock(ctx)}\n\nFor a full list on the app, open **BMI & nutrition** in the menu. NHS dietitians usually need a **GP referral** first.`;
  }

  if (
    /gaining weight too fast|gain weight too fast|putting on weight too fast|weight going up too fast|getting heavier too fast/.test(
      text
    )
  ) {
    return `Gaining weight quickly can have many causes — stress, medications, thyroid issues, or changes in eating and activity. It's worth speaking to your **GP** if this is new or worrying.\n\n**While you arrange support:**\n• Keep a simple food diary for a week\n• Notice liquid calories (alcohol, sugary drinks)\n• Aim for regular walks — 20–30 minutes daily\n• Prioritise sleep — poor sleep can affect appetite hormones\n\n${weightTipsBlock("lose")}\n\n**Dietitian near ${area}:**\n${dietitianChatBlock(ctx)}\n\nUse **BMI & nutrition** in the menu to calculate your BMI.`;
  }

  if (
    /lose weight|losing weight|want to lose|need to lose|slim down|go on a diet|dieting|overweight|obese|too fat|belly fat/.test(
      text
    )
  ) {
    return `Wanting to lose weight is common — the safest approach is **steady change**, not crash diets.\n\n${weightTipsBlock("lose")}\n\n**Professional support near ${area}:**\n${dietitianChatBlock(ctx)}\n\nOpen **BMI & nutrition** to check your BMI and get a personalised plan. If you have diabetes, are pregnant, or take regular medication, check with your GP first.`;
  }

  if (
    /gain weight|gaining weight|underweight|too thin|too skinny|put on weight|bulk up|eat more/.test(
      text
    )
  ) {
    return `Healthy weight gain is usually **slow and steady** with nutrient-dense meals, not just sugary snacks.\n\n${weightTipsBlock("gain")}\n\n**Dietitian near ${area}:**\n${dietitianChatBlock(ctx)}\n\nUse **BMI & nutrition** in the menu for your BMI result and full guidance. If you are losing weight without trying, see your GP.`;
  }

  if (/bmi|body mass index|calculate my weight|am i overweight/.test(text)) {
    return `You can check your BMI on the **BMI & nutrition** page (in the menu when signed in).\n\nEnter height (cm) and weight (kg) — we'll show your category and, if you want, food and exercise tips for losing, gaining, or maintaining weight.\n\nFor a dietitian near ${area}:\n${dietitianChatBlock(ctx)}`;
  }

  if (
    /eat(ing)? too much|overeating|binge|can't stop eating|cravings|junk food|snack too much/.test(
      text
    )
  ) {
    return `Eating more than you intend can link to stress, boredom, tiredness, or strict dieting earlier in the day.\n\n**Ideas that help many people:**\n• Regular meals — don't skip lunch then overeat at night\n• Protein at each meal (eggs, fish, beans, yoghurt)\n• Keep fruit and nuts visible; move treats out of sight\n• Walk 10 minutes after meals if you can\n• Track stress in your **wellness test** — it often links to eating\n\n${weightTipsBlock("lose")}\n\n**Support near ${area}:**\n${dietitianChatBlock(ctx)}`;
  }

  if (/stress|stressed|overwhelm|pressure|burnout/.test(text)) {
    return "Stress can build quietly. Try naming what's within your control today, take short breaks, and step outside if you can. Our check-in includes a **stress level** question so you can track it over time. If stress feels unmanageable, speak to your GP or call **NHS 111**.";
  }

  if (/anxious|anxiety|worried|worry|panic|nervous/.test(text)) {
    return "Anxiety is very common. Slow breathing helps many people: breathe in for 4, hold for 4, out for 6. Ground yourself by naming 5 things you can see. If anxiety is severe or persistent, please contact your GP. Samaritans (**116 123**) are also there to listen.";
  }

  if (/sad|depress|low|unhappy|down|hopeless|empty/.test(text)) {
    return "I'm sorry you're going through this. Low periods happen, but you don't have to face them alone. Talking to someone you trust, your GP, or Samaritans on **116 123** can make a real difference. Our check-in tracks **life satisfaction** and **optimism** to help you notice patterns.";
  }

  if (/sleep|tired|exhausted|insomnia|can't sleep|cannot sleep/.test(text)) {
    return "Sleep quality strongly affects energy and mood. A regular bedtime, less screen time before bed, and a cool dark room often help. We ask about **sleep quality** in every check-in so you can see trends. If sleep problems continue, your GP can advise further.";
  }

  if (/energy|fatigue|drained/.test(text)) {
    return "Low energy can link to sleep, stress, or burnout. Gentle movement, hydration, and balanced meals may help. Our check-in measures **energy level** alongside sleep and stress — useful for spotting what affects you most.";
  }

  if (/focus|concentrat|distract|attention/.test(text)) {
    return "Focus often dips when we're stressed or tired. Try one task at a time, short work blocks (e.g. 25 minutes), and removing phone distractions. We track **focus level** in your wellness check-in.";
  }

  if (/lonely|loneliness|isolat|alone|social|connection|friends/.test(text)) {
    return "Feeling disconnected is hard. Even a brief message to someone you trust can help. Our check-in includes **social connection** — small steps add up. If loneliness feels overwhelming, organisations like Samaritans (**116 123**) offer non-judgemental listening.";
  }

  if (/purpose|meaning|motivat/.test(text)) {
    return "A sense of purpose can shift day to day — that's normal. Reflect on what matters to you, even in small ways. We measure **sense of purpose** and **life satisfaction** in your check-in to help you notice what lifts you.";
  }

  if (/confidence|self[- ]?esteem|doubt/.test(text)) {
    return "Confidence grows through small wins. Note one thing you did well today, however small. Our check-in tracks **confidence level** over time so you can see progress you might otherwise miss.";
  }

  if (/work|school|balance|study/.test(text)) {
    return "Work–life balance is a common challenge. Try clear boundaries for rest time, and schedule hobbies deliberately. We ask about **work/school balance** and **time on hobbies** in each check-in.";
  }

  if (/hobby|hobbies|interest|fun/.test(text)) {
    return "Time for hobbies protects wellbeing. Even 15 minutes on something you enjoy counts. Our check-in asks about **time spent on hobbies** — it's a helpful signal of balance.";
  }

  if (/setback|recover|resilien|bounce back/.test(text)) {
    return "Recovering from setbacks is a skill that strengthens with practice. Be kind to yourself, reflect on what you've overcome before, and consider what support you need now. We track **ability to recover from setbacks** in your wellness profile.";
  }

  if (/optimis|future|hope/.test(text)) {
    return "Hope about the future can fluctuate. Journaling small positive moments and speaking with someone supportive can help. Our check-in includes **optimism about the future** alongside other wellbeing markers.";
  }

  if (/control|helpless|stuck/.test(text)) {
    return "When life feels out of control, focus on small actions you *can* take today — one step at a time. We measure **feeling of control** in your check-in to help you spot when things improve.";
  }

  if (/engag|motivat|interest in activ/.test(text)) {
    return "Low engagement can signal burnout or low mood. Start with one small activity you used to enjoy. Our check-in tracks **engagement level** to help you and your care team see patterns.";
  }

  if (/check[- ]?in|test|questionnaire|assessment|score|risk/.test(text)) {
    return `Sign in and tap **Take check-in** to answer **${CHECK_IN_QUESTION_COUNT} questions** covering sleep, energy, stress, focus, social connection, purpose, confidence, and more. You'll receive a wellness score and risk level, plus charts in your private history.`;
  }

  if (/sign up|register|create account|new account/.test(text)) {
    return "Tap **Sign up** to create your account with your name, email, date of birth, and UK mobile number. You must be signed in to complete a check-in. Your data stays on this device in this demo version.";
  }

  if (/log in|login|sign in|password|locked|attempt/.test(text)) {
    return "Use **Sign in** with your email and password. You have **3 login attempts** — if these are used up, enter your registered **email and telephone number** to reset your password securely.";
  }

  if (/contact|email us|phone|speak to (the )?team/.test(text)) {
    return "Visit **Contact** on the menu or email **support@mindscope.co.uk**. For urgent mental health support, call **Samaritans on 116 123** or **999** in an emergency.";
  }

  if (/emergency|crisis|urgent|999|samaritan|116/.test(text)) {
    return ukServicesReply();
  }

  if (/feel(ing)? (fine|good|great|okay|ok|better)|i'm ok|im ok|doing (fine|well|good)/.test(text)) {
    return "I'm glad to hear you're doing reasonably well today. Regular check-ins help you stay aware of changes early. Would you like tips on any specific area — sleep, stress, or balance?";
  }

  if (/feel(ing)? (bad|awful|terrible|rough|rubbish|horrible)/.test(text)) {
    return "I'm sorry today feels difficult. Your feelings are valid. Would it help to talk through what's weighing on you, or would you like UK support numbers? I'm here either way.";
  }

  if (/mind scope|mindful/.test(text)) {
    return `**${CHATBOT_NAME}** is this platform's wellbeing assistant — here for supportive chat, check-in guidance, and UK resource signposting. How can I support you right now?`;
  }

  return `I'm **${CHATBOT_NAME}** — I may not have caught that fully. Try asking about **weight**, **diet tips**, **finding a dietitian**, stress, sleep, or your wellness test. Open **BMI & nutrition** in the menu for your calculator. If you're in distress, please call **116 123** (Samaritans).`;
}

export function createMessage(role: "user" | "bot", text: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    text,
    createdAt: new Date().toISOString(),
  };
}

export const WELCOME_MESSAGE = createMessage(
  "bot",
  `Hello — I'm **Mind Scope**, your wellbeing assistant. I can help with stress, sleep, **weight & nutrition**, and finding UK support including dietitians near you. I'm not a therapist or emergency service. How are you today?`
);
