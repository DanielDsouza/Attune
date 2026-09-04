import { Practice } from '../types';

export const PRACTICES: Practice[] = [
  {
    id: 'calm-relax-5',
    title: 'Calm & Relax',
    subtitle: '2 min gentle diaphragmatic breath + 3 min soothing body release',
    category: 'breath',
    durationMinutes: 5,
    description: 'A soothing transition practice designed to settle rapid thoughts, slow your heart rate, and bring ease to the nervous system.',
    whyHelpful: 'Short calming breathing activates the parasympathetic response without demanding heavy mental effort.',
    targetEnergy: 'any',
    targetStress: 'high_to_low',
    tags: ['Breathwork', 'Nervous System', 'Quick Reset'],
    themeColor: 'emerald',
    videoGuide: {
      youtubeId: 'mrczsdRDHks',
      title: 'Diaphragmatic Breathing: 5 Minute Deep Breathing Exercise',
      channelName: 'Marie Morin LMHC',
      likesOrRating: '98% Positive · Verified Therapist',
      duration: '5:24',
    },
    guidanceSteps: [
      {
        seconds: 40,
        title: 'Arrive & Settle',
        instruction: 'Find a comfortable seat or recline. Rest your hands gently on your lap or stomach. Soften your shoulders.',
        phase: 'rest'
      },
      {
        seconds: 60,
        title: 'Diaphragmatic Rhythm (Inhale 4s, Exhale 6s)',
        instruction: 'Inhale deeply through your nose for 4 seconds, feeling your belly expand. Exhale slowly through parted lips for 6 seconds.',
        phase: 'inhale'
      },
      {
        seconds: 60,
        title: 'Deepening the Release',
        instruction: 'Keep the long, smooth exhale. With every breath out, let go of any tension in your jaw and temples.',
        phase: 'exhale'
      },
      {
        seconds: 80,
        title: 'Body Scan & Softening',
        instruction: 'Notice the weight of your body supported by the chair or floor. Allow your spine to feel tall yet effortless.',
        phase: 'focus'
      },
      {
        seconds: 60,
        title: 'Silent Quietude',
        instruction: 'Breathe at your natural pace. Enjoy this quiet pocket of stillness before opening your eyes.',
        phase: 'reflect'
      }
    ]
  },
  {
    id: 'stress-reset-10',
    title: 'Stress Reset',
    subtitle: '3 min 4-7-8 balancing breath + 7 min grounding body awareness',
    category: 'meditation',
    durationMinutes: 10,
    description: 'A complete mental unburdening session to lower high cortisol levels, release shoulder tightness, and restore perspective.',
    whyHelpful: 'When stress is high, combining structured breath retentions with guided grounding dissolves acute overwhelm.',
    targetEnergy: 'any',
    targetStress: 'high_to_low',
    tags: ['De-stress', 'Grounding', 'Clarity'],
    themeColor: 'teal',
    videoGuide: {
      youtubeId: 'LiUnFJ8P4gM',
      title: '4-7-8 Calm Breathing Exercise | Deep Relaxation & Anxiety Relief',
      channelName: 'Hands-On Meditation',
      likesOrRating: '99% Positive · 20K+ Likes',
      duration: '10:18',
    },
    guidanceSteps: [
      {
        seconds: 60,
        title: 'Unclench & Arrive',
        instruction: 'Drop your shoulders down away from your ears. Unclench your teeth and allow your forehead to smooth out.',
        phase: 'rest'
      },
      {
        seconds: 120,
        title: '4-7-8 Breath: Inhale 4s, Hold 7s, Exhale 8s',
        instruction: 'Inhale quietly through your nose for 4 seconds. Hold gently for 7 seconds. Release with a gentle whoosh for 8 seconds.',
        phase: 'hold'
      },
      {
        seconds: 180,
        title: 'Releasing Physical Burden',
        instruction: 'Scan down from your neck into your chest and lower back. Imagine each area loosening like warm sand.',
        phase: 'focus'
      },
      {
        seconds: 180,
        title: 'Creating Distance from Stressors',
        instruction: 'Whatever happened earlier today, let it stand outside the room. Right now, there is nothing you need to fix.',
        phase: 'reflect'
      },
      {
        seconds: 60,
        title: 'Gentle Return',
        instruction: 'Place one hand on your chest. Acknowledge yourself for taking this intentional pause.',
        phase: 'rest'
      }
    ]
  },
  {
    id: 'energy-boost-7',
    title: 'Energy Boost',
    subtitle: '2 min vitality breathwork + 5 min somatic posture wake-up',
    category: 'mindful_movement',
    durationMinutes: 7,
    description: 'An uplifting practice that stimulates oxygen circulation, relieves afternoon brain fog, and re-ignites natural stamina.',
    whyHelpful: 'When energy is sluggish, gentle rhythmic breathing coupled with posture alignment revitalizes without caffeine.',
    targetEnergy: 'low_to_high',
    targetStress: 'any',
    tags: ['Vitality', 'Movement', 'Afternoon Refresh'],
    themeColor: 'amber',
    videoGuide: {
      youtubeId: 'gH1Wx6byvUo',
      title: '5 min Morning Movement & Gentle Wake Up',
      channelName: 'Yoga with Kassandra',
      likesOrRating: '99% Positive · 120K+ Likes',
      duration: '5:48',
    },
    guidanceSteps: [
      {
        seconds: 45,
        title: 'Stand or Sit Tall',
        instruction: 'Lengthen your spine as if a gentle thread is drawing the crown of your head upward. Roll your shoulders back.',
        phase: 'rest'
      },
      {
        seconds: 75,
        title: 'Brisk Inhales & Bright Exhales',
        instruction: 'Take two quick inhales through the nose, then one smooth exhale through the mouth. Feel oxygen flooding your chest.',
        phase: 'inhale'
      },
      {
        seconds: 120,
        title: 'Gentle Torso & Neck Rolls',
        instruction: 'Gently tilt your head from right to left, feeling the side of your neck lengthen. Roll your wrists and stretch your fingers wide.',
        phase: 'focus'
      },
      {
        seconds: 120,
        title: 'Expanding Ribcage & Core Strength',
        instruction: 'Inhale while reaching both arms overhead, arching slightly. Exhale and lower hands with steady strength.',
        phase: 'inhale'
      },
      {
        seconds: 60,
        title: 'Focused Vitality',
        instruction: 'Notice the tingling warmth in your fingertips and the clear alertness in your eyes. Carry this forward.',
        phase: 'reflect'
      }
    ]
  },
  {
    id: 'focus-reset-5',
    title: 'Focus Reset',
    subtitle: '1 min box breathing + 4 min single-point awareness',
    category: 'focus',
    durationMinutes: 5,
    description: 'Clear cognitive clutter, tune out distractions, and sharpen your attention before diving into demanding work.',
    whyHelpful: 'Box breathing equalizes the autonomic nervous system to deliver calm, laser-sharp mental clarity.',
    targetEnergy: 'any',
    targetStress: 'any',
    tags: ['Clarity', 'Work Flow', 'Mindfulness'],
    themeColor: 'indigo',
    videoGuide: {
      youtubeId: 'gUuhmO2EgBE',
      title: 'Box Breathing | Simple Technique to Calm Stress & Improve Focus',
      channelName: 'happygomotion by Solene',
      likesOrRating: '98% Positive · Visual Focus Guide',
      duration: '4:02',
    },
    guidanceSteps: [
      {
        seconds: 30,
        title: 'Clear the Mental Desktop',
        instruction: 'Close any extra tabs in your mind. Set an intention: this next block of time is dedicated to one single priority.',
        phase: 'rest'
      },
      {
        seconds: 90,
        title: 'Box Breathing (4-4-4-4)',
        instruction: 'Inhale for 4 seconds. Hold full for 4. Exhale for 4. Hold empty for 4. Maintain a steady, confident rhythm.',
        phase: 'hold'
      },
      {
        seconds: 120,
        title: 'Single-Point Anchoring',
        instruction: 'Rest your awareness on the exact sensation of air entering the tip of your nostrils. When your mind drifts, gently bring it back.',
        phase: 'focus'
      },
      {
        seconds: 60,
        title: 'Prime for Action',
        instruction: 'Take one decisive, deep breath. You are centered, clear-headed, and ready.',
        phase: 'reflect'
      }
    ]
  },
  {
    id: 'wind-down-10',
    title: 'Wind Down',
    subtitle: '3 min 4-4-6 tranquil breath + 7 min progressive muscle ease',
    category: 'wind_down',
    durationMinutes: 10,
    description: 'A deeply relaxing evening ritual to switch off overactive thinking and prepare your body for deep, restorative sleep.',
    whyHelpful: 'Extended exhalations combined with somatic relaxation guide your nervous system into deep rest mode.',
    targetEnergy: 'high_to_balanced',
    targetStress: 'high_to_low',
    tags: ['Sleep', 'Evening', 'Deep Relaxation'],
    themeColor: 'purple',
    videoGuide: {
      youtubeId: 'eoSvD7YQnNQ',
      title: '10 Minute Progressive Muscle Relaxation',
      channelName: 'Inspired Living Medical',
      likesOrRating: '98% Positive · Clinician Led',
      duration: '10:20',
    },
    guidanceSteps: [
      {
        seconds: 60,
        title: 'Dimming the Internal Lights',
        instruction: 'Settle into bed or a soft reclining chair. Dim your room lighting. Give yourself permission to let go of the day.',
        phase: 'rest'
      },
      {
        seconds: 120,
        title: '4-4-6 Tranquil Breath',
        instruction: 'Inhale gently for 4s, pause for 4s, exhale slowly like a sigh for 6s. Feel your heart rate gently decelerating.',
        phase: 'exhale'
      },
      {
        seconds: 240,
        title: 'Progressive Body Softening',
        instruction: 'Notice your feet sinking into the mattress. Relax your calves, thighs, hips, stomach, chest, and face muscles completely.',
        phase: 'focus'
      },
      {
        seconds: 180,
        title: 'Floating Drifting Thoughts',
        instruction: 'Imagine your thoughts as soft clouds drifting across a dark night sky. You don’t need to hold onto any of them.',
        phase: 'reflect'
      }
    ]
  },
  {
    id: 'grounding-3',
    title: '3-Minute Sensory Grounding',
    subtitle: '5-4-3-2-1 sensory connection to break anxiety loops',
    category: 'breath',
    durationMinutes: 3,
    description: 'An emergency pause when thoughts feel scattered or overwhelmed. Brings you immediately back to the physical present.',
    whyHelpful: 'Sensory grounding anchors active cognition to tangible physical inputs, interrupting catastrophic thought loops.',
    targetEnergy: 'any',
    targetStress: 'high_to_low',
    tags: ['Quick Pause', 'Grounding', 'Anxiety Relief'],
    themeColor: 'stone',
    videoGuide: {
      youtubeId: '30VMIEmA114',
      title: 'The 5-4-3-2-1 Method: A Grounding Exercise to Manage Anxiety',
      channelName: 'The Partnership In Education',
      likesOrRating: '99% Positive · 40K+ Likes',
      duration: '3:08',
    },
    guidanceSteps: [
      {
        seconds: 30,
        title: 'Feet on the Floor',
        instruction: 'Feel both soles of your feet firmly planted on the ground. Take a full, deep breath in and let it out.',
        phase: 'rest'
      },
      {
        seconds: 45,
        title: 'Notice 3 Things You See',
        instruction: 'Look around your immediate space. Silently name 3 distinct textures or colors you can see right now.',
        phase: 'focus'
      },
      {
        seconds: 45,
        title: 'Notice 2 Things You Feel',
        instruction: 'Notice 2 physical contact points: the fabric against your skin, or the temperature of the air on your hands.',
        phase: 'focus'
      },
      {
        seconds: 60,
        title: 'Notice 1 Sound & Breathe',
        instruction: 'Listen for the farthest sound you can perceive. Take a long, grounding breath. You are right here, safe and steady.',
        phase: 'reflect'
      }
    ]
  }
];
