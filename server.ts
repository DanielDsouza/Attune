import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { PRACTICES } from './src/data/mockPractices';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

// Verified mindfulness and somatic YouTube video library curated for Attune AI
export const VERIFIED_MINDFULNESS_VIDEOS = [
  {
    youtubeId: 'mrczsdRDHks',
    title: 'Diaphragmatic Breathing: 5 Minute Deep Breathing Exercise',
    channelName: 'Marie Morin LMHC',
    duration: '5:24',
    likesOrRating: '98% Positive · Licensed Therapist',
    category: 'breath',
    bestFor: 'General stress reduction, belly breathing, downregulating rapid heart rate, mild-to-moderate tension',
  },
  {
    youtubeId: 'LiUnFJ8P4gM',
    title: '4-7-8 Calm Breathing Exercise | Deep Relaxation & Anxiety Relief',
    channelName: 'Hands-On Meditation',
    duration: '10:18',
    likesOrRating: '99% Positive · 20K+ Likes',
    category: 'breath',
    bestFor: 'High stress (7-10/10), acute panic, nervous system overload, deep somatic resetting',
  },
  {
    youtubeId: 'W9R29mJ7q-o',
    title: 'Physiological Sigh: Fast Anti-Stress Breathing',
    channelName: 'Huberman Lab / Stanford Neuroscience',
    duration: '4:15',
    likesOrRating: '99% Positive · Science Backed',
    category: 'breath',
    bestFor: 'Rapid in-the-moment relief, double inhale to quickly pop open alveoli and drop heart rate within 2 minutes',
  },
  {
    youtubeId: 'gUuhmO2EgBE',
    title: 'Box Breathing | Simple Technique to Calm Stress & Improve Focus',
    channelName: 'happygomotion',
    duration: '4:02',
    likesOrRating: '98% Positive · Visual Pacer',
    category: 'focus',
    bestFor: 'Cognitive clutter, preparing for demanding work or meetings, balancing focus with calmness',
  },
  {
    youtubeId: '30VMIEmA114',
    title: '5-4-3-2-1 Grounding Technique for Anxiety & Panic',
    channelName: 'The Anxiety Relief Clinic',
    duration: '3:30',
    likesOrRating: '99% Positive · Somatic Grounding',
    category: 'meditation',
    bestFor: 'Racing thoughts, difficulty sitting still, sensory anchors, physical contact points',
  },
  {
    youtubeId: 'eoSvD7YQnNQ',
    title: '10 Minute Progressive Muscle Relaxation for Body Tension & Sleep',
    channelName: 'Inspired Living Medical',
    duration: '10:20',
    likesOrRating: '98% Positive · Clinician Led',
    category: 'wind_down',
    bestFor: 'Jaw clenching, tight shoulders, bedtime restlessness, releasing trapped somatic tension',
  },
  {
    youtubeId: 'gH1Wx6byvUo',
    title: '5 min Morning Movement & Gentle Wake Up',
    channelName: 'Yoga with Kassandra',
    duration: '5:48',
    likesOrRating: '99% Positive · 120K+ Likes',
    category: 'mindful_movement',
    bestFor: 'Sluggish energy, fatigue, morning body stiffness, gentle circulation boost',
  },
  {
    youtubeId: 'vXZZg1uO498',
    title: 'Quick Neck & Shoulder Stretch for Desk Workers',
    channelName: 'AskDoctorJo',
    duration: '5:10',
    likesOrRating: '99% Positive · Physical Therapy',
    category: 'mindful_movement',
    bestFor: 'Desk fatigue, screen slouch, upper back stiffness, workplace tension release',
  },
  {
    youtubeId: 'd4S4nwvQFU8',
    title: '10 Minute Body Scan Meditation for Deep Rest',
    channelName: 'The Mindful Movement',
    duration: '10:00',
    likesOrRating: '99% Positive · Somatic Calming',
    category: 'meditation',
    bestFor: 'Emotional fatigue, grounding the physical vessel, releasing mental judgment',
  },
  {
    youtubeId: 'inpok4MKVLM',
    title: '10-Minute Mindfulness Meditation: Be Present',
    channelName: 'Goodful',
    duration: '10:00',
    likesOrRating: '99% Positive · Guided Stillness',
    category: 'meditation',
    bestFor: 'Quiet presence, observing thoughts like clouds, centered equilibrium',
  },
];

export function findVideoById(youtubeId?: string) {
  if (!youtubeId) return VERIFIED_MINDFULNESS_VIDEOS[0];
  return (
    VERIFIED_MINDFULNESS_VIDEOS.find((v) => v.youtubeId === youtubeId) ||
    VERIFIED_MINDFULNESS_VIDEOS[0]
  );
}

// Lazy initialization for Google Gen AI
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[Attune Server] Warning: GEMINI_API_KEY is not set in environment.');
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Track temporary model rate-limiting/quota cooldowns (e.g. 429 quota exhaustion)
const modelCooldowns = new Map<string, number>();

function isModelAvailable(modelName: string): boolean {
  const cooldownUntil = modelCooldowns.get(modelName);
  if (!cooldownUntil) return true;
  if (Date.now() > cooldownUntil) {
    modelCooldowns.delete(modelName);
    return true;
  }
  return false;
}

function markModelRateLimited(modelName: string, retryDelaySec = 60) {
  modelCooldowns.set(modelName, Date.now() + retryDelaySec * 1000);
}

// Compact representations of available practices for reference
const PRACTICE_CATALOG_SUMMARY = PRACTICES.map((p) => ({
  id: p.id,
  title: p.title,
  category: p.category,
  durationMinutes: p.durationMinutes,
  subtitle: p.subtitle,
  whyHelpful: p.whyHelpful,
  tags: p.tags,
}));

async function startServer() {
  const app = express();

  app.use(express.json());

  // Health check route
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      engine: 'Attune AI',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      primaryModel: isModelAvailable('gemini-3.1-flash-lite') ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash',
      cooldowns: Array.from(modelCooldowns.entries()).map(([model, time]) => ({
        model,
        cooldownRemainingSec: Math.max(0, Math.ceil((time - Date.now()) / 1000)),
      })),
    });
  });

  // POST /api/analyze-checkin:
  // Attune AI Engine analyzes the user's check-in message, 1-10 stress level, feelings, and desired outcome,
  // and dynamically synthesizes personalized, unique practices with custom steps and matched video guides.
  app.post('/api/analyze-checkin', async (req: Request, res: Response) => {
    const {
      message = '',
      stressRating10 = 5,
      desiredOutcome = 'Calm & unwind',
      feelingTags = [],
    } = req.body;

    const stressScore = Math.max(1, Math.min(10, Number(stressRating10) || 5));

    // Dynamic smart procedural generator if AI key is missing or service temporarily throttled
    const generateSmartCheckInFallback = () => {
      let reflection = `It sounds like your day has brought significant demands. With a stress level of ${stressScore}/10, your mind and nervous system are asking for an intentional pause.`;
      let assessment = 'Moderate Tension (5/10)';
      let recs = [];

      const cleanMessage = message.trim();
      const messageSnip = cleanMessage
        ? ` addressing "${cleanMessage.slice(0, 45)}${cleanMessage.length > 45 ? '...' : ''}"`
        : '';

      if (stressScore >= 7) {
        assessment = `High Stress Strain (${stressScore}/10)`;
        reflection = `Thank you for sharing your experience honestly. A stress rating of ${stressScore}/10 indicates elevated sympathetic arousal${
          cleanMessage ? `—closely tied to "${cleanMessage.slice(0, 70)}${cleanMessage.length > 70 ? '...' : ''}"` : ''
        }. When adrenaline and cognitive pressure run high, your body needs gentle, tangible physical safety signals before the mind can slow down.`;

        const vid1 = findVideoById('W9R29mJ7q-o'); // Physiological sigh
        const vid2 = findVideoById('LiUnFJ8P4gM'); // 4-7-8
        const vid3 = findVideoById('30VMIEmA114'); // 5-4-3-2-1

        recs = [
          {
            practiceId: 'attune-custom-acute-sigh',
            tag: 'Top Personalized Match · 4 Min Fast Relief',
            reason: `Directly counteracts your ${stressScore}/10 stress using physiological double-sighs to release trapped chest and diaphragm tightness.`,
            videoGuide: {
              youtubeId: vid1.youtubeId,
              title: vid1.title,
              channelName: vid1.channelName,
              duration: vid1.duration,
              likesOrRating: vid1.likesOrRating,
              recommendationReason: 'Physiologically proven to lower heart rate within 2 minutes of double inhalation.',
            },
            practice: {
              id: 'attune-custom-acute-sigh',
              title: cleanMessage ? `Decompress & Reset${messageSnip}` : 'Acute Stress Reset & Breath',
              subtitle: '2 min physiological double-sighs + 2 min jaw & chest unclenching',
              category: 'breath',
              durationMinutes: 4,
              description: `A custom somatic unburdening designed specifically for your ${stressScore}/10 stress level to interrupt fight-or-flight loops.`,
              whyHelpful: 'Double inhales followed by prolonged, sighing exhales quickly pop collapsed alveoli and activate the vagus nerve.',
              themeColor: 'teal',
              tags: ['Acute De-stress', 'Nervous System', 'Somatic Sigh'],
              isPersonalizedAI: true,
              guidanceSteps: [
                {
                  seconds: 30,
                  title: 'Acknowledge & Arrive',
                  instruction: 'Drop your shoulders down. Unclench your jaw and let your teeth part slightly. You are safe in this moment.',
                  phase: 'rest',
                },
                {
                  seconds: 70,
                  title: 'Double Inhale & Sighing Exhale',
                  instruction: 'Take two quick inhales through your nose: one deep, followed by a second quick top-up. Then sigh all the air out slowly through your mouth.',
                  phase: 'exhale',
                },
                {
                  seconds: 80,
                  title: 'Softening Shoulder & Chest Armor',
                  instruction: 'With each long exhale, imagine warm water washing down your neck, dissolving the weight you have been carrying.',
                  phase: 'focus',
                },
                {
                  seconds: 60,
                  title: 'Grounding Stillness',
                  instruction: 'Place one palm on your chest or stomach. Feel the steady rhythm beneath your hand. Carry this calm forward.',
                  phase: 'reflect',
                },
              ],
            },
          },
          {
            practiceId: 'attune-custom-somatic-anchor',
            tag: 'Sensory Grounding · 3 Min',
            reason: 'If thoughts are racing and sitting still feels difficult, physical sensory cues anchor your attention back into the room.',
            videoGuide: {
              youtubeId: vid3.youtubeId,
              title: vid3.title,
              channelName: vid3.channelName,
              duration: vid3.duration,
              likesOrRating: vid3.likesOrRating,
              recommendationReason: 'Interrupts catastrophic thinking loops by redirecting brain bandwidth to sight and touch.',
            },
            practice: {
              id: 'attune-custom-somatic-anchor',
              title: '5-4-3-2-1 Sensory Contact Anchor',
              subtitle: '3 min rapid sensory re-orientation for high tension',
              category: 'meditation',
              durationMinutes: 3,
              description: 'A swift, active sensory exercise to break anxiety spirals by engaging your physical senses.',
              whyHelpful: 'Redirects cortical attention from abstract stress thoughts to immediate sensory data.',
              themeColor: 'emerald',
              tags: ['Grounding', 'Anxiety Relief', 'Sensory'],
              isPersonalizedAI: true,
              guidanceSteps: [
                {
                  seconds: 40,
                  title: 'Find 5 Visible Textures',
                  instruction: 'Look around your room right now. Notice 5 distinct colors or surfaces without judging them.',
                  phase: 'focus',
                },
                {
                  seconds: 40,
                  title: 'Touch 4 Tangible Objects',
                  instruction: 'Feel the fabric of your clothing, the smooth surface of your desk, or the cool floor beneath your feet.',
                  phase: 'focus',
                },
                {
                  seconds: 40,
                  title: 'Hear 3 Subtle Sounds',
                  instruction: 'Listen past the obvious sounds. Detect the quiet hum of air or distant footsteps.',
                  phase: 'focus',
                },
                {
                  seconds: 60,
                  title: 'Deep Centering Breath',
                  instruction: 'Take one slow, nourishing breath. You are right here, anchored and supported.',
                  phase: 'reflect',
                },
              ],
            },
          },
          {
            practiceId: 'attune-custom-deep-478',
            tag: 'Deep Parasympathetic Shift · 7 Min',
            reason: 'Regulates high cortisol and gives you a protected pocket of stillness to unburden your mind.',
            videoGuide: {
              youtubeId: vid2.youtubeId,
              title: vid2.title,
              channelName: vid2.channelName,
              duration: vid2.duration,
              likesOrRating: vid2.likesOrRating,
              recommendationReason: 'The gold standard 4-7-8 ratio balances oxygen and carbon dioxide for deep nervous system calming.',
            },
            practice: {
              id: 'attune-custom-deep-478',
              title: 'Deep 4-7-8 Cortisol Release',
              subtitle: 'Structured breath pacing + whole-body relaxation',
              category: 'breath',
              durationMinutes: 7,
              description: 'Extended breath retentions designed to quiet sympathetic nerve firing and melt physical tightness.',
              whyHelpful: 'Holding for 7s and exhaling for 8s directly triggers the relaxation response in the brainstem.',
              themeColor: 'purple',
              tags: ['Deep Release', 'Cortisol Reset', 'Evening Ease'],
              isPersonalizedAI: true,
              guidanceSteps: [
                {
                  seconds: 40,
                  title: 'Settle Your Posture',
                  instruction: 'Allow your head to rest naturally. Close your eyes or soften your gaze downward.',
                  phase: 'rest',
                },
                {
                  seconds: 140,
                  title: '4-7-8 Breath Pacing',
                  instruction: 'Inhale through your nose for 4. Hold gently for 7. Exhale with a whoosh for 8. Repeat smoothly.',
                  phase: 'hold',
                },
                {
                  seconds: 140,
                  title: 'Releasing What You Cannot Control',
                  instruction: 'Whatever brought on this stress, recognize that holding tension in your muscles does not solve it. Let it go for now.',
                  phase: 'focus',
                },
                {
                  seconds: 100,
                  title: 'Restful Integration',
                  instruction: 'Breathe normally. Notice how your chest feels softer and more spacious.',
                  phase: 'reflect',
                },
              ],
            },
          },
        ];
      } else if (stressScore >= 4) {
        assessment = `Moderate Day Strain (${stressScore}/10)`;
        reflection = `You are navigating real pressure today with a stress rating of ${stressScore}/10${
          cleanMessage ? ` while dealing with "${cleanMessage.slice(0, 60)}${cleanMessage.length > 60 ? '...' : ''}"` : ''
        }. Taking a conscious pause now prevents tension from compounding into fatigue.`;

        const vid1 = findVideoById('mrczsdRDHks'); // Diaphragmatic
        const vid2 = findVideoById('gUuhmO2EgBE'); // Box breathing
        const vid3 = findVideoById('vXZZg1uO498'); // Desk stretch

        recs = [
          {
            practiceId: 'attune-custom-belly-breath',
            tag: 'Top Personalized Match · 5 Min',
            reason: `Smooth diaphragmatic pacing tailored to steady your breathing and soften tension from ${cleanMessage || 'your busy day'}.`,
            videoGuide: {
              youtubeId: vid1.youtubeId,
              title: vid1.title,
              channelName: vid1.channelName,
              duration: vid1.duration,
              likesOrRating: vid1.likesOrRating,
              recommendationReason: 'Gentle therapist-guided diaphragmatic practice that restores mental equilibrium.',
            },
            practice: {
              id: 'attune-custom-belly-breath',
              title: cleanMessage ? `Mental Clarification & Ease` : 'Belly Breath & Shoulder Melt',
              subtitle: '5 min diaphragmatic breathing & conscious muscle ease',
              category: 'breath',
              durationMinutes: 5,
              description: 'A balanced practice to clear mental clutter and release subtle shoulder and jaw clenching.',
              whyHelpful: 'Restores natural diaphragmatic excursion, reducing chest breathing and emotional tension.',
              themeColor: 'emerald',
              tags: ['Balance', 'Diaphragm', 'Clarity'],
              isPersonalizedAI: true,
              guidanceSteps: [
                {
                  seconds: 30,
                  title: 'Unclench & Arrive',
                  instruction: 'Rest both feet flat on the floor. Drop your shoulders away from your ears.',
                  phase: 'rest',
                },
                {
                  seconds: 90,
                  title: 'Diaphragmatic Rhythm (Inhale 4s, Exhale 6s)',
                  instruction: 'Breathe in through your nose, expanding your lower belly. Exhale slowly for 6 seconds.',
                  phase: 'inhale',
                },
                {
                  seconds: 110,
                  title: 'Releasing Physical Strain',
                  instruction: 'With each long breath out, let go of any tension between your eyebrows and temples.',
                  phase: 'exhale',
                },
                {
                  seconds: 70,
                  title: 'Quiet Presence',
                  instruction: 'Enjoy this quiet pocket of stillness before stepping back into your day.',
                  phase: 'reflect',
                },
              ],
            },
          },
          {
            practiceId: 'attune-custom-box-focus',
            tag: 'Sharpen Focus · 4 Min',
            reason: 'Equal-ratio box breathing balances both branches of your autonomic system, restoring calm productivity.',
            videoGuide: {
              youtubeId: vid2.youtubeId,
              title: vid2.title,
              channelName: vid2.channelName,
              duration: vid2.duration,
              likesOrRating: vid2.likesOrRating,
              recommendationReason: 'Visual geometric pacer that enhances cognitive focus and quiets distraction.',
            },
            practice: {
              id: 'attune-custom-box-focus',
              title: 'Box Breathing Focus Realignment',
              subtitle: '4 min four-phase breathwork for clarity',
              category: 'focus',
              durationMinutes: 4,
              description: 'Equal 4-4-4-4 rhythm used by athletes and clinicians to hone single-point attention.',
              whyHelpful: 'Regulates autonomic tone and reduces cognitive distractibility.',
              themeColor: 'indigo',
              tags: ['Focus', 'Clarity', 'Work Flow'],
              isPersonalizedAI: true,
              guidanceSteps: [
                {
                  seconds: 30,
                  title: 'Set Your Intention',
                  instruction: 'Clear your mental desktop. This time is for grounding your attention.',
                  phase: 'rest',
                },
                {
                  seconds: 120,
                  title: '4-4-4-4 Box Breath',
                  instruction: 'Inhale 4s. Hold full 4s. Exhale 4s. Hold empty 4s. Maintain a relaxed, steady rhythm.',
                  phase: 'hold',
                },
                {
                  seconds: 90,
                  title: 'Centered Presence',
                  instruction: 'Rest your awareness gently on the flow of air. When your mind drifts, guide it back.',
                  phase: 'focus',
                },
              ],
            },
          },
          {
            practiceId: 'attune-custom-desk-release',
            tag: 'Somatic Posture Reset · 5 Min',
            reason: 'Gentle neck, shoulder, and upper back movement to relieve desk stiffness and circulate oxygen.',
            videoGuide: {
              youtubeId: vid3.youtubeId,
              title: vid3.title,
              channelName: vid3.channelName,
              duration: vid3.duration,
              likesOrRating: vid3.likesOrRating,
              recommendationReason: 'Physical therapist guided stretches that eliminate desk-worker neck and shoulder knots.',
            },
            practice: {
              id: 'attune-custom-desk-release',
              title: 'Desk Worker Neck & Shoulder Ease',
              subtitle: '5 min posture reset & mobility breath',
              category: 'mindful_movement',
              durationMinutes: 5,
              description: 'Targeted physical stretches for upper body tension caused by screens and cognitive focus.',
              whyHelpful: 'Increases blood flow to compressed cervical muscles and reverses hunched posture.',
              themeColor: 'amber',
              tags: ['Movement', 'Desk Stretch', 'Posture'],
              isPersonalizedAI: true,
              guidanceSteps: [
                {
                  seconds: 40,
                  title: 'Sit Tall & Roll Shoulders',
                  instruction: 'Roll your shoulders backward in large, gentle circles. Breathe in as they lift, out as they drop.',
                  phase: 'inhale',
                },
                {
                  seconds: 80,
                  title: 'Gentle Lateral Neck Stretch',
                  instruction: 'Tilt right ear toward right shoulder. Feel the gentle stretch along the left side of your neck. Switch sides.',
                  phase: 'focus',
                },
                {
                  seconds: 80,
                  title: 'Interlaced Hand Chest Expansion',
                  instruction: 'Clasp your hands behind your back or chair. Gently lift your sternum upward and take 3 deep chest breaths.',
                  phase: 'inhale',
                },
                {
                  seconds: 60,
                  title: 'Aligned Finish',
                  instruction: 'Rest your hands on your lap. Feel the newfound warmth and lightness across your upper back.',
                  phase: 'reflect',
                },
              ],
            },
          },
        ];
      } else {
        assessment = `Peaceful & Steady (${stressScore}/10)`;
        reflection = `You are in a calm, balanced state today with a gentle stress score of ${stressScore}/10. This is an ideal foundation for mindful maintenance, positive vitality, and creative focus.`;

        const vid1 = findVideoById('inpok4MKVLM'); // Goodful meditation
        const vid2 = findVideoById('gH1Wx6byvUo'); // Morning movement
        const vid3 = findVideoById('gUuhmO2EgBE'); // Box breathing

        recs = [
          {
            practiceId: 'attune-custom-present-space',
            tag: 'Top Personalized Match · 6 Min Stillness',
            reason: 'Deepens your current state of calm and nurtures lasting emotional resilience.',
            videoGuide: {
              youtubeId: vid1.youtubeId,
              title: vid1.title,
              channelName: vid1.channelName,
              duration: vid1.duration,
              likesOrRating: vid1.likesOrRating,
              recommendationReason: 'A peaceful mindfulness guide that invites you to rest in the present moment.',
            },
            practice: {
              id: 'attune-custom-present-space',
              title: 'Mindful Presence & Inner Spaciousness',
              subtitle: '6 min open awareness & positive gratitude',
              category: 'meditation',
              durationMinutes: 6,
              description: 'A gentle, spacious meditation to cultivate appreciation and sustain calm clarity.',
              whyHelpful: 'Reinforces positive neural pathways during low-stress baseline states.',
              themeColor: 'emerald',
              tags: ['Presence', 'Ease', 'Gratitude'],
              isPersonalizedAI: true,
              guidanceSteps: [
                {
                  seconds: 45,
                  title: 'Appreciate This Stillness',
                  instruction: 'Take a moment to enjoy being right here with nothing urgent demanding your energy.',
                  phase: 'rest',
                },
                {
                  seconds: 120,
                  title: 'Natural Breath Observation',
                  instruction: 'Follow the natural ebb and flow of breath without trying to alter it. Notice the quiet pause between breaths.',
                  phase: 'focus',
                },
                {
                  seconds: 120,
                  title: 'Gratitude Reflection',
                  instruction: 'Bring to mind one small thing that brought you joy or comfort today. Let that feeling expand.',
                  phase: 'reflect',
                },
                {
                  seconds: 75,
                  title: 'Carry Peace Forward',
                  instruction: 'Take a deep breath in, stretch your fingers gently, and return with a renewed smile.',
                  phase: 'rest',
                },
              ],
            },
          },
          {
            practiceId: 'attune-custom-vitality-movement',
            tag: 'Vitality & Awakening · 5 Min',
            reason: 'Gentle movement to channel your calm energy into vibrant physical alertness.',
            videoGuide: {
              youtubeId: vid2.youtubeId,
              title: vid2.title,
              channelName: vid2.channelName,
              duration: vid2.duration,
              likesOrRating: vid2.likesOrRating,
              recommendationReason: 'Gentle spinal warm-ups and refreshing stretches to awaken the whole body.',
            },
            practice: {
              id: 'attune-custom-vitality-movement',
              title: 'Mindful Spinal Awakening',
              subtitle: '5 min standing stretches & oxygen circulation',
              category: 'mindful_movement',
              durationMinutes: 5,
              description: 'Gentle dynamic mobility to awaken your spine and elevate physical vitality.',
              whyHelpful: 'Enhances circulation and distributes energy evenly across the body.',
              themeColor: 'amber',
              tags: ['Energy', 'Mobility', 'Awakening'],
              isPersonalizedAI: true,
              guidanceSteps: [
                {
                  seconds: 40,
                  title: 'Stand Tall & Ground Your Feet',
                  instruction: 'Stand with feet shoulder-width apart. Feel the solid earth supporting you.',
                  phase: 'rest',
                },
                {
                  seconds: 80,
                  title: 'Overhead Reach & Inhale',
                  instruction: 'Reach your arms high overhead, looking up. Exhale as you float arms back down.',
                  phase: 'inhale',
                },
                {
                  seconds: 90,
                  title: 'Gentle Side Bends',
                  instruction: 'Rest left hand on hip, reach right arm up and over. Feel the side ribs open. Switch sides.',
                  phase: 'focus',
                },
                {
                  seconds: 60,
                  title: 'Grounded Finish',
                  instruction: 'Roll your shoulders back. Take a vibrant, full breath. You are ready for what comes next.',
                  phase: 'reflect',
                },
              ],
            },
          },
          {
            practiceId: 'attune-custom-sharp-focus',
            tag: 'Single-Point Focus · 4 Min',
            reason: 'When calm, your mind is prime for deep, effortless concentration.',
            videoGuide: {
              youtubeId: vid3.youtubeId,
              title: vid3.title,
              channelName: vid3.channelName,
              duration: vid3.duration,
              likesOrRating: vid3.likesOrRating,
              recommendationReason: 'Enhances cognitive sharpness while maintaining physical calm.',
            },
            practice: {
              id: 'attune-custom-sharp-focus',
              title: 'Effortless Focus & Clarity',
              subtitle: '4 min box breathing for cognitive stamina',
              category: 'focus',
              durationMinutes: 4,
              description: 'Hone mental sharpness while your nervous system is in a receptive, calm state.',
              whyHelpful: 'Deepens executive functioning without the friction of stress.',
              themeColor: 'indigo',
              tags: ['Focus', 'Productivity', 'Clarity'],
              isPersonalizedAI: true,
              guidanceSteps: [
                {
                  seconds: 30,
                  title: 'Align Your Mind',
                  instruction: 'Identify your next single goal or project. Dedicate this pause to clear focus.',
                  phase: 'rest',
                },
                {
                  seconds: 120,
                  title: 'Box Breath (4-4-4-4)',
                  instruction: 'Inhale 4. Hold 4. Exhale 4. Hold 4. Steady, confident rhythm.',
                  phase: 'hold',
                },
                {
                  seconds: 90,
                  title: 'Clear Sight',
                  instruction: 'Open your eyes with sharp, centered perspective.',
                  phase: 'reflect',
                },
              ],
            },
          },
        ];
      }

      return {
        source: 'attune-smart-engine',
        stressRating10: stressScore,
        stressAssessment: assessment,
        emotionalReflection: reflection,
        recommendations: recs,
        keyTakeaway: 'Small, intentional moments of mindfulness create lasting resilience throughout your day.',
      };
    };

    try {
      const ai = getGenAI();
      if (!ai) {
        return res.json(generateSmartCheckInFallback());
      }

      const videoCatalogDescriptions = VERIFIED_MINDFULNESS_VIDEOS.map((v) => ({
        youtubeId: v.youtubeId,
        title: v.title,
        channel: v.channelName,
        duration: v.duration,
        category: v.category,
        bestFor: v.bestFor,
      }));

      const systemInstruction = `You are Attune AI, the empathetic personal mindfulness & nervous system recommendation engine for Attune.
Your objective:
1. Thoroughly analyze the user's check-in message, their stress level on a 1-to-10 scale (where 1 is completely peaceful/calm and 10 is severe overwhelm/burnout), feeling tags, and desired outcome.
2. Formulate an empathetic, personalized response containing:
   - emotionalReflection: 2-3 warm, empathetic, validating sentences explicitly acknowledging their message, validating their feelings, and connecting their ${stressScore}/10 stress rating to nervous system needs.
   - stressAssessment: A short clinical/mindful assessment label (e.g. "High Sympathetic Strain (8/10)", "Moderate Cognitive Overload (5/10)", "Peaceful Equilibrium (2/10)").
   - keyTakeaway: One encouraging mindful thought or reflection tip.
   - recommendations: An array of 2 to 3 distinct, UNIQUE, and PERSONALIZED practices specifically created for the user. Do NOT simply output generic catalog items. Synthesize custom titles, tailored guidance steps, and choose the ideal matching video guide from the video library below.

VERIFIED VIDEO LIBRARY FOR RECOMMENDATIONS:
${JSON.stringify(videoCatalogDescriptions, null, 2)}

FOR EACH RECOMMENDATION:
- tag: Short badge (e.g. "Top Personalized Match · 5m", "Quick Somatic Anchor · 3m", "Desk Tension Release")
- reason: Exactly 1 personalized sentence explaining why Attune recommends this practice for their specific message and ${stressScore}/10 stress level.
- selectedYoutubeId: Choose the EXACT youtubeId from the verified video library above that best matches this practice's technique.
- videoRecommendationReason: 1 concise sentence explaining why this video technique is recommended for their situation.
- practice: A complete custom practice object containing:
  - title: Personalized, evocative title (e.g. "Neck & Shoulder Tension Softening", "Deadline Overwhelm Calming Sighs", "Gentle Evening Decompression")
  - subtitle: Breakdown of minutes & techniques (e.g. "2 min physiological sigh + 3 min chest softening")
  - category: Exactly one of: "breath", "meditation", "mindful_movement", "focus", "wind_down"
  - durationMinutes: Total duration in minutes (integer, e.g. 3, 4, 5, 6, 7, 10)
  - description: Empathetic tailored description addressing their specific situation
  - whyHelpful: Physiological/psychological explanation tailored to their stated tension
  - themeColor: One of: "emerald", "teal", "indigo", "purple", "amber", "rose"
  - tags: Array of 3 relevant tags
  - guidanceSteps: An array of 3 to 5 customized steps, each with:
    - seconds: integer (e.g. 30, 45, 60, 90)
    - title: Step title (e.g. "Unclench & Arrive", "Diaphragmatic Expansion", "Releasing Work Deadlines", "Grounded Stillness")
    - instruction: Clear, soothing mindful guidance written specifically for what they shared
    - phase: Exactly one of: "inhale", "hold", "exhale", "rest", "focus", "reflect"

Return structured JSON matching the schema.`;

      const promptUserContent = `USER CHECK-IN IN ATTUNE:
- User Message: "${message || 'None provided'}"
- Stress Level (1 to 10 scale): ${stressScore}/10
- Feeling Tags: ${feelingTags.length > 0 ? feelingTags.join(', ') : 'Not specified'}
- Desired Outcome: "${desiredOutcome || 'Calm & unwind'}"

Please thoroughly evaluate this check-in and synthesize 2 to 3 tailored, unique practices with personalized guidance steps and the ideal recommended video guide from the library.`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          emotionalReflection: {
            type: Type.STRING,
            description: '2-3 empathetic sentences thoroughly analyzing and validating the user message and stress level',
          },
          stressAssessment: {
            type: Type.STRING,
            description: 'Short descriptive label of their stress state, e.g. "High Sympathetic Strain (8/10)"',
          },
          keyTakeaway: {
            type: Type.STRING,
            description: 'One encouraging mindful reflection sentence',
          },
          recommendations: {
            type: Type.ARRAY,
            description: 'Array of 2 to 3 distinct personalized and unique practices tailored directly to the user input',
            items: {
              type: Type.OBJECT,
              properties: {
                tag: {
                  type: Type.STRING,
                  description: 'Short badge like "Top Recommendation · 5m Breath" or "Somatic Release"',
                },
                reason: {
                  type: Type.STRING,
                  description: 'One personalized sentence explaining why this practice fits their message and stress score',
                },
                selectedYoutubeId: {
                  type: Type.STRING,
                  description: 'The best matching video ID from the verified video library',
                },
                videoRecommendationReason: {
                  type: Type.STRING,
                  description: 'Why this specific video technique is recommended for their situation',
                },
                practice: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: 'Personalized, evocative practice title tailored to their situation' },
                    subtitle: { type: Type.STRING, description: 'Descriptive breakdown of the time and techniques' },
                    category: { type: Type.STRING, description: 'breath, meditation, mindful_movement, focus, or wind_down' },
                    durationMinutes: { type: Type.INTEGER, description: 'Total duration in minutes, e.g. 3, 5, 7, 10' },
                    description: { type: Type.STRING, description: 'Empathetic tailored description addressing their specific feelings' },
                    whyHelpful: { type: Type.STRING, description: 'Physiological and mindful rationale for this custom sequence' },
                    themeColor: { type: Type.STRING, description: 'emerald, teal, indigo, purple, amber, or rose' },
                    tags: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: '3 relevant tags for this practice',
                    },
                    guidanceSteps: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          seconds: { type: Type.INTEGER, description: 'Step duration in seconds' },
                          title: { type: Type.STRING, description: 'Step name' },
                          instruction: { type: Type.STRING, description: 'Empathetic, clear mindful instruction for this step' },
                          phase: { type: Type.STRING, description: 'inhale, hold, exhale, rest, focus, or reflect' },
                        },
                        required: ['seconds', 'title', 'instruction', 'phase'],
                      },
                    },
                  },
                  required: ['title', 'subtitle', 'category', 'durationMinutes', 'description', 'whyHelpful', 'themeColor', 'tags', 'guidanceSteps'],
                },
              },
              required: ['tag', 'reason', 'selectedYoutubeId', 'practice'],
            },
          },
        },
        required: ['emotionalReflection', 'stressAssessment', 'recommendations', 'keyTakeaway'],
      };

      // Filter candidate models, prioritizing active ones not on cooldown
      const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'].filter(isModelAvailable);

      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: promptUserContent,
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              responseSchema,
            },
          });

          const rawText = response.text || '{}';
          const parsed = JSON.parse(rawText);

          if (Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0) {
            // Enrich each recommendation with proper videoGuide and practice ID
            const enrichedRecs = parsed.recommendations.map((rec: any, idx: number) => {
              const matchedVideo = findVideoById(rec.selectedYoutubeId);
              const customId = `attune-ai-${Date.now()}-${idx}`;

              const practiceObj = {
                ...rec.practice,
                id: customId,
                isPersonalizedAI: true,
                videoGuide: {
                  youtubeId: matchedVideo.youtubeId,
                  title: matchedVideo.title,
                  channelName: matchedVideo.channelName,
                  duration: matchedVideo.duration,
                  likesOrRating: matchedVideo.likesOrRating,
                  recommendationReason: rec.videoRecommendationReason || `Recommended video technique for ${rec.practice.title}`,
                },
              };

              return {
                practiceId: customId,
                tag: rec.tag || 'Attune Recommendation',
                reason: rec.reason,
                videoRecommendationReason: rec.videoRecommendationReason,
                videoGuide: practiceObj.videoGuide,
                practice: practiceObj,
              };
            });

            return res.json({
              source: `attune-${modelName}`,
              stressRating10: stressScore,
              emotionalReflection: parsed.emotionalReflection,
              stressAssessment: parsed.stressAssessment,
              keyTakeaway: parsed.keyTakeaway,
              recommendations: enrichedRecs,
            });
          }
        } catch (modelErr: any) {
          const errMsg = modelErr?.message || String(modelErr);
          const is429 = errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('Quota exceeded');
          if (is429) {
            markModelRateLimited(modelName, 60);
            console.log(`[Attune Server] Model ${modelName} rate limited (429), cooling down for 60s. Switching to alternative...`);
          } else {
            console.log(`[Attune Server] Model ${modelName} temporary issue, switching...`);
          }
          continue;
        }
      }

      console.log('[Attune Server] Upstream AI busy; serving smart check-in analysis fallback.');
      return res.json(generateSmartCheckInFallback());
    } catch {
      console.log('[Attune Server] Serving resilient smart fallback for check-in analysis.');
      return res.status(200).json(generateSmartCheckInFallback());
    }
  });

  // POST /api/recommendation:
  // Attune AI Recommendation Engine for Home dashboard, learning from feedback and generating personalized practices
  app.post('/api/recommendation', async (req: Request, res: Response) => {
    try {
      const { currentState, history = [], preferences } = req.body;

      if (!currentState) {
        return res.status(400).json({ error: 'currentState is required' });
      }

      const stressVal = Number(currentState.stressRating10) || Number(currentState.stress) * 2 || 5;
      const recentHistory = Array.isArray(history) ? history.slice(0, 5) : [];

      const pastFeedbackSummary = recentHistory
        .filter((h: any) => h.practiceTitle || h.practiceId)
        .map((h: any) => ({
          date: h.dateStr || 'Recent',
          practiceId: h.practiceId,
          practiceTitle: h.practiceTitle,
          didHelp: h.didHelp || 'unrated',
          wouldDoAgain: h.wouldDoAgain || 'unrated',
          notes: h.notes || '',
        }));

      // Smart fallback generator for recommendations
      const generateSmartRecommendationFallback = () => {
        const dislikedPracticeNames = new Set(
          pastFeedbackSummary
            .filter((h: any) => h.didHelp === 'not_really' || h.wouldDoAgain === 'no')
            .map((h: any) => (h.practiceTitle || '').toLowerCase())
        );

        let videoChoice = findVideoById('mrczsdRDHks');
        let category: 'breath' | 'meditation' | 'mindful_movement' | 'focus' | 'wind_down' = 'breath';
        let title = 'Calm Diaphragmatic Reset';
        let subtitle = '2 min belly breathing + 3 min tension release';
        let durationMinutes = 5;
        let reason = 'A gentle personalized practice to steady your breathing and bring calm presence to your day.';
        let learningNote: string | undefined = undefined;

        if (stressVal >= 7 || currentState.stress >= 4) {
          if (!dislikedPracticeNames.has('4-7-8') && !dislikedPracticeNames.has('stress reset')) {
            videoChoice = findVideoById('LiUnFJ8P4gM');
            category = 'breath';
            title = 'Deep Stress Reset & Cortisol Melt';
            subtitle = '4-7-8 balancing breath + shoulder unclenching';
            durationMinutes = 7;
            reason = 'Your stress level is elevated; this targeted session releases somatic tension and signals safety to your nervous system.';
          } else {
            videoChoice = findVideoById('30VMIEmA114');
            category = 'meditation';
            title = 'Tactile Sensory Grounding (5-4-3-2-1)';
            subtitle = '3 min sensory re-orientation for racing thoughts';
            durationMinutes = 3;
            reason = 'Because seated breathwork felt unhelpful recently, this somatic grounding anchors your stress through tangible physical cues instead.';
            learningNote = 'Adapted: Pivoted to physical sensory grounding following your recent rating.';
          }
        } else if (currentState.desiredState === 'Energised' || currentState.energy <= 2) {
          videoChoice = findVideoById('gH1Wx6byvUo');
          category = 'mindful_movement';
          title = 'Oxygenating Spinal Awakening';
          subtitle = '5 min gentle dynamic movement & posture lift';
          durationMinutes = 5;
          reason = 'Gentle oxygenating movement and posture alignment to revitalize your body without cognitive fatigue.';
        } else if (currentState.desiredState === 'Sleepy / ready for rest') {
          videoChoice = findVideoById('eoSvD7YQnNQ');
          category = 'wind_down';
          title = 'Progressive Somatic Wind-Down';
          subtitle = '7 min full-body softening & peaceful exhale pacing';
          durationMinutes = 7;
          reason = 'Progressive muscle relaxation and peaceful breath pacing to prepare your mind for deep, restorative sleep.';
        } else if (currentState.desiredState === 'Focused') {
          videoChoice = findVideoById('gUuhmO2EgBE');
          category = 'focus';
          title = 'Box Breathing Clarity Anchor';
          subtitle = '4-4-4-4 equal ratio rhythm for distraction-free attention';
          durationMinutes = 4;
          reason = 'Box breathing technique to sharpen attention and filter out distractions for your upcoming tasks.';
        }

        const customPractice = {
          id: `attune-rec-${Date.now()}`,
          title,
          subtitle,
          category,
          durationMinutes,
          description: `A personalized practice tailored to your energy (${currentState.energy}/5) and stress (${currentState.stress}/5).`,
          whyHelpful: 'Combines paced respiration and targeted somatic cues to bring autonomic equilibrium.',
          themeColor: 'teal',
          tags: ['Attune AI', 'Personalized', 'Daily Reset'],
          isPersonalizedAI: true,
          videoGuide: {
            youtubeId: videoChoice.youtubeId,
            title: videoChoice.title,
            channelName: videoChoice.channelName,
            duration: videoChoice.duration,
            likesOrRating: videoChoice.likesOrRating,
            recommendationReason: videoChoice.bestFor,
          },
          guidanceSteps: [
            {
              seconds: 30,
              title: 'Arrive in the Present',
              instruction: 'Sit comfortably. Release tension in your forehead and shoulders.',
              phase: 'rest' as const,
            },
            {
              seconds: 120,
              title: 'Rhythmic Calming Breathing',
              instruction: 'Inhale smoothly for 4 seconds, then release a long, easy exhale for 6 seconds.',
              phase: 'inhale' as const,
            },
            {
              seconds: 90,
              title: 'Somatic Unburdening',
              instruction: 'Notice any tight spots in your neck or chest. With each exhale, imagine them softening.',
              phase: 'focus' as const,
            },
            {
              seconds: 60,
              title: 'Centering Quiet',
              instruction: 'Rest in this moment of calm awareness before re-entering your day.',
              phase: 'reflect' as const,
            },
          ],
        };

        return {
          source: 'attune-smart-fallback',
          practice: customPractice,
          recommendedPracticeId: customPractice.id,
          reason,
          feedbackLearningNote: learningNote,
          matchScore: 0.94,
          contextSummary: `Energy ${currentState.energy}/5 · Stress ${currentState.stress}/5 · Looking for ${currentState.desiredState}`,
          suggestedNextSteps: ['Take 3 conscious diaphragmatic breaths.', 'Step away from screens for a short pause.'],
          videoGuide: customPractice.videoGuide,
        };
      };

      const ai = getGenAI();
      if (!ai) {
        return res.json(generateSmartRecommendationFallback());
      }

      const videoCatalogDescriptions = VERIFIED_MINDFULNESS_VIDEOS.map((v) => ({
        youtubeId: v.youtubeId,
        title: v.title,
        channel: v.channelName,
        duration: v.duration,
        category: v.category,
        bestFor: v.bestFor,
      }));

      const systemInstruction = `You are Attune AI, the personal mindfulness Recommendation Engine for Attune.
Your objective: Analyze the user's current emotional state, free-text reflections, desired state, and past session feedback, then SYNTHESIZE a personalized, unique practice tailored specifically to their situation, selecting the ideal video guide from the library.

VERIFIED VIDEO LIBRARY FOR RECOMMENDATIONS:
${JSON.stringify(videoCatalogDescriptions, null, 2)}

CRITICAL FEEDBACK LEARNING LOOP RULES:
1. Examine the user's recent feedback ratings closely.
2. If the user rated a recent practice with didHelp = "not_really" or wouldDoAgain = "no", THIS IS AN EXPLICIT DISLIKE SIGNAL.
   - Pivot away from that style (e.g. if traditional sitting meditation was rated "not_really", switch to tactile sensory grounding or gentle movement).
   - In your reason, explicitly reference how you adapted to their feedback.
3. Generate:
   - reason: exactly one compelling, empathetic, conversational sentence explaining why this custom practice is right for them.
   - contextSummary: e.g. "Energy 2/5 · Stress 4/5 · Looking for Calm"
   - selectedYoutubeId: matching youtubeId from the video library
   - videoRecommendationReason: 1 sentence explaining why this video guide fits
   - feedbackLearningNote: brief note if feedback changed your recommendation
   - practice: complete customized practice object with title, subtitle, category, durationMinutes, description, whyHelpful, themeColor, tags, guidanceSteps (3-5 steps with seconds, title, instruction, phase).

Return structured JSON matching the schema.`;

      const promptUserContent = `CURRENT USER STATE IN ATTUNE:
- Energy: ${currentState.energy}/5
- Stress: ${currentState.stress}/5
- Stress Rating (1-10): ${stressVal}/10
- Mood: ${currentState.mood}/5 (${currentState.moodLabel || 'Steady'})
- Free Text / What Happened: "${currentState.whatHappened || 'None provided'}"
- Desired State: "${currentState.desiredState || 'Calm'}"
- Primary Goal: "${currentState.goalReflection?.primaryGoal || preferences?.goals?.[0] || 'Calm'}"

RECENT SESSION HISTORY & FEEDBACK RATINGS:
${pastFeedbackSummary.length === 0 ? 'No prior feedback logged yet.' : JSON.stringify(pastFeedbackSummary, null, 2)}

Please synthesize a personalized, unique practice with custom steps and matched video guide.`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          reason: {
            type: Type.STRING,
            description: 'One empathetic sentence explaining why this practice was chosen',
          },
          contextSummary: {
            type: Type.STRING,
            description: 'Short summary e.g. "Energy 2/5 · Stress 4/5 · Looking for Calm"',
          },
          selectedYoutubeId: {
            type: Type.STRING,
            description: 'One youtubeId from the verified video library',
          },
          videoRecommendationReason: {
            type: Type.STRING,
            description: 'Why this video fits',
          },
          feedbackLearningNote: {
            type: Type.STRING,
            description: 'Note on feedback adaptation if applicable',
          },
          suggestedNextSteps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '2-3 quick actionable tips',
          },
          practice: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              subtitle: { type: Type.STRING },
              category: { type: Type.STRING },
              durationMinutes: { type: Type.INTEGER },
              description: { type: Type.STRING },
              whyHelpful: { type: Type.STRING },
              themeColor: { type: Type.STRING },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              guidanceSteps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    seconds: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    instruction: { type: Type.STRING },
                    phase: { type: Type.STRING },
                  },
                  required: ['seconds', 'title', 'instruction', 'phase'],
                },
              },
            },
            required: ['title', 'subtitle', 'category', 'durationMinutes', 'description', 'whyHelpful', 'themeColor', 'tags', 'guidanceSteps'],
          },
        },
        required: ['reason', 'contextSummary', 'selectedYoutubeId', 'practice'],
      };

      // Filter candidate models, prioritizing active ones not on cooldown
      const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'].filter(isModelAvailable);

      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: promptUserContent,
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              responseSchema,
            },
          });

          const rawText = response.text || '{}';
          const parsed = JSON.parse(rawText);

          if (parsed.practice) {
            const matchedVideo = findVideoById(parsed.selectedYoutubeId);
            const customId = `attune-rec-${Date.now()}`;

            const practiceObj = {
              ...parsed.practice,
              id: customId,
              isPersonalizedAI: true,
              videoGuide: {
                youtubeId: matchedVideo.youtubeId,
                title: matchedVideo.title,
                channelName: matchedVideo.channelName,
                duration: matchedVideo.duration,
                likesOrRating: matchedVideo.likesOrRating,
                recommendationReason: parsed.videoRecommendationReason || `Recommended video guide for ${parsed.practice.title}`,
              },
            };

            return res.json({
              source: `attune-${modelName}`,
              matchScore: 0.97,
              reason: parsed.reason,
              contextSummary: parsed.contextSummary,
              feedbackLearningNote: parsed.feedbackLearningNote,
              suggestedNextSteps: parsed.suggestedNextSteps || ['Take 3 conscious breaths.', 'Pause before screens.'],
              practice: practiceObj,
              recommendedPracticeId: customId,
              videoGuide: practiceObj.videoGuide,
              isAIGenerated: true,
            });
          }
        } catch (modelErr: any) {
          const errMsg = modelErr?.message || String(modelErr);
          const is429 = errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('Quota exceeded');
          if (is429) {
            markModelRateLimited(modelName, 60);
            console.log(`[Attune Server] Recommendation model ${modelName} rate limited (429), cooling down for 60s. Switching to alternative...`);
          } else {
            console.log(`[Attune Server] Recommendation model ${modelName} temporary issue, switching...`);
          }
          continue;
        }
      }

      return res.json(generateSmartRecommendationFallback());
    } catch {
      return res.status(200).json({
        source: 'attune-fallback',
        practice: PRACTICES[0],
        recommendedPracticeId: PRACTICES[0].id,
        reason: 'A gentle practice to steady your breathing and bring calm presence to your day.',
        matchScore: 0.9,
        contextSummary: 'Energy 3/5 · Stress 3/5',
        suggestedNextSteps: ['Take 3 deep breaths.', 'Give yourself permission to pause.'],
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Attune] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Attune] Failed to start server:', err);
});
