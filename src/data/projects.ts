// --- VIDEO CONFIGURATION ---
// Video IDs extracted from portfolio PDF
const videoIds = {
  hotWheels: "AvcFpxiqgYA",
  jimi: "onVtb26c_G8",
  railway: "6gyztnIyBtw",
  sassoon: "w2IEXt6ldvo",
  cityGate: "tbN8tKp_ZBA",
  terumot: "yA6MRps2OKs",
  raanana: "FMUidYlOENc",
  hexa: "ILhKByohHD4",
  solitaireClash: "2NU8ZxMCSrI",
  farmEscape: "xIh4KSvkDik",
  hexaSort: "xIh4KSvkDik",
};

// --- THUMBNAIL CONFIGURATION ---
// Using ArtStation project thumbnails
const artStationThumbnails = {
  hotWheels: "https://cdna.artstation.com/p/assets/images/images/076/574/636/large/asaf-silner-cover-hw.jpg",
  jimi: "https://cdna.artstation.com/p/assets/images/images/076/574/664/large/asaf-silner-jimi-cover.jpg",
  railway: "https://cdna.artstation.com/p/assets/images/images/076/574/688/large/asaf-silner-railway-cover.jpg",
  sassoon: "https://cdna.artstation.com/p/assets/images/images/076/574/712/large/asaf-silner-sassoon-cover.jpg",
  cityGate: "https://cdna.artstation.com/p/assets/images/images/076/574/736/large/asaf-silner-citygate-cover.jpg",
  terumot: "https://cdna.artstation.com/p/assets/images/images/076/574/760/large/asaf-silner-terumot-cover.jpg",
  raanana: "https://cdna.artstation.com/p/assets/images/images/076/574/784/large/asaf-silner-raanana-cover.jpg",
  hexa: "https://cdna.artstation.com/p/assets/images/images/076/574/808/large/asaf-silner-hexa-cover.jpg",
};

const getEmbedUrl = (id: string) => `https://www.youtube.com/embed/${id}`;

export interface ProjectMedia {
  thumbnail: string;
  hero: string;
  video: string;
}

export interface ProjectContent {
  problem: string;
  solution: string;
  coreLoop: string;
  systems: string;
  uxFlow: string;
  outcome: string;
}

export interface Project {
  id: string;
  title: string;
  tagline: string;
  role: string;
  team: string;
  duration: string;
  platform: string;
  tools: string[];
  media: ProjectMedia;
  responsibilities: string[];
  content: ProjectContent;
}

export const projectsData: Project[] = [
  {
    id: "hot-wheels",
    title: "Hot Wheels Champion Experience",
    tagline: "Interactive immersive exhibition for a global brand.",
    role: "Art Director / Game Designer",
    team: "Multidisciplinary (3D, Dev, Production)",
    duration: "12 Months",
    platform: "Physical Interactive Installation",
    tools: ["Unity", "Figma", "RFID Tech"],
    media: {
      thumbnail: "https://cdnb.artstation.com/p/assets/covers/images/080/869/261/medium/asaf-silner-asaf-silner-cover-hw.jpg",
      hero: "https://cdnb.artstation.com/p/assets/covers/images/080/869/261/large/asaf-silner-asaf-silner-cover-hw.jpg",
      video: getEmbedUrl(videoIds.hotWheels),
    },
    responsibilities: [
      "Directed the visual language and user interface for physical stations.",
      "Designed gamified interactions for physical toy integration.",
      "Managed the flow of large visitor groups through stations.",
      "Collaborated with Mattel on brand compliance and asset usage.",
    ],
    content: {
      problem:
        "Translating the high-octane energy of Hot Wheels into a physical space where kids can actively participate, not just watch.",
      solution:
        "Created a 'Phygital' loop where physical RFID bands track progress across digital mini-game stations, culminating in a personalized champion ceremony.",
      coreLoop:
        "Scan Band -> Play Physical/Digital Minigame -> Earn Points -> Unlock Virtual Car Parts.",
      systems:
        "Progression: Session-based economy where performance unlocks visual rewards on the main leaderboard.",
      uxFlow:
        "Onboarding Station -> Challenge Zones (Speed, Power, Crashing) -> Final Leaderboard Reveal.",
      outcome:
        "Successfully launched widely attended touring exhibition with high replay value per station.",
    },
  },
  {
    id: "jimi-hendrix",
    title: "Jimi Hendrix™ Experience",
    tagline: "Connected TV Slots Game blending music and math.",
    role: "Game Designer",
    team: "Studio Team",
    duration: "6 Months",
    platform: "Connected TV / Smart TV",
    tools: ["Slot Math Engines", "Adobe Creative Suite"],
    media: {
      thumbnail: "https://cdna.artstation.com/p/assets/covers/images/080/869/334/medium/asaf-silner-asaf-silner-jimi-cover.jpg",
      hero: "https://cdna.artstation.com/p/assets/covers/images/080/869/334/large/asaf-silner-asaf-silner-jimi-cover.jpg",
      video: getEmbedUrl(videoIds.jimi),
    },
    responsibilities: [
      "Designed the core slot mechanics and bonus features.",
      "Integrated musical cues with gameplay wins (Audio-Reactive Design).",
      "Optimized UI for '10-foot experience' (TV Remote navigation).",
      "Balanced the Volatility Index for extended play sessions.",
    ],
    content: {
      problem:
        "Creating a slot game that respects the legendary IP while delivering modern engagement metrics on limited TV hardware.",
      solution:
        "Built the 'Psychedelic Spin' feature where game states trigger famous guitar riffs, making the audio a reward in itself.",
      coreLoop:
        "Spin -> Symbol Match (Audio Feedback) -> Trigger Bonus Stage (Guitar Solo Mode) -> Win.",
      systems:
        "Math: High volatility model to match the energetic nature of the music.",
      uxFlow: "Bet Selection -> Spin -> Big Win Celebration -> Feature Trigger.",
      outcome:
        "Delivered a high-retention game that stands out in the crowded social casino market.",
    },
  },
  {
    id: "vr-railway",
    title: "Israel Railway VR Safety",
    tagline: "Virtual Reality simulation for safety training.",
    role: "Lead Designer",
    team: "Small VR Squad",
    duration: "4 Months",
    platform: "Oculus / VR Headset",
    tools: ["Unity 3D", "VR SDKs"],
    media: {
      thumbnail: "https://cdnb.artstation.com/p/assets/covers/images/080/869/291/medium/asaf-silner-asaf-silner-railway-cover.jpg",
      hero: "https://cdnb.artstation.com/p/assets/covers/images/080/869/291/large/asaf-silner-asaf-silner-railway-cover.jpg",
      video: getEmbedUrl(videoIds.railway),
    },
    responsibilities: [
      "Designed realistic scenarios for safety hazards.",
      "Implemented 'Fail States' that teach without traumatizing.",
      "Created intuitive VR controls for non-gamer employees.",
      "Mapped spatial audio for hazard awareness.",
    ],
    content: {
      problem:
        "Safety briefings are boring and often ignored. The goal was to create visceral 'muscle memory' for dangerous situations without real risk.",
      solution:
        "A 'Walk the Line' simulator where users must identify defects and dodge oncoming trains in a hyper-realistic environment.",
      coreLoop:
        "Inspect Track -> Spot Hazard -> Mark/Report -> Avoid Danger -> Debrief.",
      systems: "Scoring: Penalties for missed checks vs. speed of completion.",
      uxFlow:
        "Gear Up (VR Tutorial) -> Scenario Start -> Hazard Event -> Success/Fail Screen.",
      outcome:
        "Adopted as a core training module for safety week, significantly increasing engagement compared to PowerPoint presentations.",
    },
  },
  {
    id: "sassoon-codex",
    title: "Sassoon Codex Interactive",
    tagline: "Digital stand for one of the world's oldest bibles.",
    role: "UX/UI Designer",
    team: "Curators & Devs",
    duration: "3 Months",
    platform: "Touch Kiosk",
    tools: ["Figma", "High-Res Imaging"],
    media: {
      thumbnail: "https://cdna.artstation.com/p/assets/covers/images/080/869/308/medium/asaf-silner-asaf-silner-sassoon-cover.jpg",
      hero: "https://cdna.artstation.com/p/assets/covers/images/080/869/308/large/asaf-silner-asaf-silner-sassoon-cover.jpg",
      video: getEmbedUrl(videoIds.sassoon),
    },
    responsibilities: [
      "Created a zoomable interface for ultra-high-res manuscripts.",
      "Designed accessible navigation for diverse museum visitors.",
      "Structured the information architecture for historical context.",
      "Ensured zero-latency interactions on large touch screens.",
    ],
    content: {
      problem:
        "How to let visitors 'touch' and explore a fragile, priceless artifact without damaging it.",
      solution:
        "A deep-zoom interface that allows users to see texture details invisible to the naked eye, overlaid with translated commentary.",
      coreLoop:
        "Select Page -> Deep Zoom -> Toggle Translation Overlay -> Discover Fact.",
      systems:
        "Navigation: Breadcrumb system to prevent users from getting lost in deep zoom levels.",
      uxFlow:
        "Attract Mode -> Language Select -> Book View -> Detail View -> Reset.",
      outcome:
        "Allowed thousands of visitors to intimately explore the text during its limited exhibition window.",
    },
  },
  {
    id: "city-gate-midba",
    title: "City Gate & Midba Map",
    tagline: "Immersive projection mapping experience for tourism.",
    role: "Creative Technologist",
    team: "Architects & 3D Artists",
    duration: "5 Months",
    platform: "Projection Mapping / Physical Model",
    tools: ["MadMapper", "After Effects", "Projectors"],
    media: {
      thumbnail: "https://cdnb.artstation.com/p/assets/covers/images/080/869/325/medium/asaf-silner-asaf-silner-citygate-cover.jpg",
      hero: "https://cdnb.artstation.com/p/assets/covers/images/080/869/325/large/asaf-silner-asaf-silner-citygate-cover.jpg",
      video: getEmbedUrl(videoIds.cityGate),
    },
    responsibilities: [
      "Mapped digital content onto a complex 3D physical city model.",
      "Synchronized audio-visual storytelling with lighting cues.",
      "Designed the visitor attention flow across the large exhibit.",
      "Solved technical constraints of projector placement and shadows.",
    ],
    content: {
      problem:
        "Static city models are impressive but fail to tell the dynamic history and future of the urban landscape.",
      solution:
        "Created a 'Living Model' where the physical surface becomes a canvas for historical data, traffic flows, and future plans.",
      coreLoop:
        "Visitor Arrival -> Audio Intro -> Model Highlights Areas -> Deep Dive Animation -> Full City Illumination.",
      systems:
        "Sync: Timecode-based trigger system integrating lighting, sound, and video.",
      uxFlow:
        "Passive Viewing -> Focused Highlight (Spotlight) -> Broad Context (Full Map) -> Conclusion.",
      outcome:
        "Transformed a static waiting room model into a flagship attraction for the visitors' center.",
    },
  },
  {
    id: "terumot-maasrot",
    title: "Terumot and Ma'asrot",
    tagline: "Gamifying complex agricultural laws for a museum audience.",
    role: "Game Designer",
    team: "Educational Staff & Devs",
    duration: "4 Months",
    platform: "Interactive Touch Table",
    tools: ["Unity", "Touch Script"],
    media: {
      thumbnail: "https://cdna.artstation.com/p/assets/covers/images/080/869/346/medium/asaf-silner-asaf-silner-terumot-cover.jpg",
      hero: "https://cdna.artstation.com/p/assets/covers/images/080/869/346/large/asaf-silner-asaf-silner-terumot-cover.jpg",
      video: getEmbedUrl(videoIds.terumot),
    },
    responsibilities: [
      "Translated ancient agricultural texts into simple game rules.",
      "Designed a collaborative multi-user interface for the table.",
      "Balanced the difficulty for mixed-age groups (family play).",
      "Created visual metaphors for separating crops (Tithes).",
    ],
    content: {
      problem:
        "The laws of 'Terumot and Ma'asrot' are abstract and mathematical, making them dry and difficult for kids to grasp.",
      solution:
        "Developed a 'Sorting Frenzy' style game where players must physically drag and separate crops into the correct bins before time runs out.",
      coreLoop:
        "Crops Appear -> Identify Type -> Drag to Correct Bin -> Score Points -> Speed Increase.",
      systems:
        "Feedback: Immediate visual cues for correct/incorrect halachic separation.",
      uxFlow:
        "Player Registration -> Tutorial Round -> Main Game (Timed) -> Score Summary.",
      outcome:
        "Turned a complex study topic into the most popular active station in the exhibition.",
    },
  },
  {
    id: "raanana-city",
    title: "The Ra'anana City Challenge",
    tagline: "Location-based urban gaming experience.",
    role: "Lead Designer",
    team: "Mobile Dev Team",
    duration: "3 Months",
    platform: "Mobile App / Outdoor",
    tools: ["GPS API", "Unity Mobile"],
    media: {
      thumbnail: "https://cdnb.artstation.com/p/assets/covers/images/080/869/355/medium/asaf-silner-asaf-silner-raanana-cover.jpg",
      hero: "https://cdnb.artstation.com/p/assets/covers/images/080/869/355/large/asaf-silner-asaf-silner-raanana-cover.jpg",
      video: getEmbedUrl(videoIds.raanana),
    },
    responsibilities: [
      "Designed the geo-fencing logic and station triggers.",
      "Created AR challenges that activate only at specific landmarks.",
      "Balanced walking time vs. playing time to maintain engagement.",
      "Wrote the narrative connecting the city's historical sites.",
    ],
    content: {
      problem:
        "Getting residents, especially youth, to physically visit and engage with local heritage sites.",
      solution:
        "A 'Pokemon GO' style scavenger hunt where historical locations unlock digital puzzles and rewards.",
      coreLoop:
        "Navigate to Map Marker -> Arrive at Location -> Unlock AR Puzzle -> Solve -> Earn Badge.",
      systems: "Progression: Collection book filling up with local achievements.",
      uxFlow:
        "Map View -> Proximity Alert -> Camera View (AR) -> Puzzle Interface -> Reward.",
      outcome:
        "High participation rates during the city's centennial celebration events.",
    },
  },
  {
    id: "hexa-puzzle",
    title: "Hexa Puzzle",
    tagline: "Addictive logic puzzle for mobile platforms.",
    role: "Solo Game Designer",
    team: "Self",
    duration: "2 Months",
    platform: "Mobile (iOS/Android)",
    tools: ["Unity 2D", "C#"],
    media: {
      thumbnail: "https://cdna.artstation.com/p/assets/covers/images/080/869/366/medium/asaf-silner-asaf-silner-hexa-cover.jpg",
      hero: "https://cdna.artstation.com/p/assets/covers/images/080/869/366/large/asaf-silner-asaf-silner-hexa-cover.jpg",
      video: getEmbedUrl(videoIds.hexa),
    },
    responsibilities: [
      "Designed hundreds of levels with increasing difficulty curves.",
      "Implemented the hint system and monetization logic.",
      "Polished the 'juiciness' (visual feedback) of piece placement.",
      "Analyzed player drop-off points to refine level ordering.",
    ],
    content: {
      problem:
        "Creating a puzzle game that feels fresh in a saturated market while keeping the scope manageable for a solo dev.",
      solution:
        "Focused on a 'Zen' aesthetic with satisfying snap-mechanics and no time pressure, differentiating from frantic match-3s.",
      coreLoop:
        "Observe Board -> Drag Piece -> Check Fit -> Clear Lines -> Level Up.",
      systems:
        "Difficulty: Organic curve based on available board space and piece complexity.",
      uxFlow: "Level Select -> Game Board -> Win State -> Ad/Reward -> Next Level.",
      outcome:
        "Achieved consistent daily active users (DAU) and positive store ratings for its relaxing gameplay.",
    },
  },
];

export const getProjectById = (id: string): Project | undefined => {
  return projectsData.find((project) => project.id === id);
};
