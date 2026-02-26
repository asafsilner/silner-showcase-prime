// --- VIDEO CONFIGURATION ---
// Video IDs extracted from portfolio PDF
const videoIds = {
  hotWheels: "VH-5zhuq2Sg",
  jimi: "onVtb26c_G8",
  railway: "VsAp6-pCoWA",
  sassoon: "B29zta5f7cQ",
  cityGate: "UFoLT62cD1Q",
  terumot: "yA6MRps2OKs",
  raanana: "BVJcH0Z3xVI",
  hexa: "qBQM4uPF01U",
  solitaireClash: "F8jNC3Ojw1s",
  farmEscape: "Jk_xOoj9m0g",
};

// --- THUMBNAIL CONFIGURATION ---
// Using ArtStation project thumbnails
const projectImages = {
  hotWheels: "/projects/hot-wheels.jpg",
  jimi: "/projects/jimi-hendrix.jpg",
  railway: "/projects/vr-railway.jpg",
  sassoon: "/projects/sassoon-codex.jpg",
  cityGate: "/projects/city-gate.jpg",
  terumot: "/projects/terumot.jpg",
  raanana: "/projects/raanana.jpg",
  hexa: "/projects/hexa-puzzle.jpg",
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
    tagline: "Art Direction, Game & Interface Design for a 16,000 sq ft entertainment complex.",
    role: "Art Director & Lead Game/Interface Designer",
    team: "Creative Labs Israel",
    duration: "12 Months",
    platform: "Physical Interactive Installation",
    tools: ["Unity", "RFID", "Kinect", "LiDAR", "IR Cameras", "Arduino"],
    media: {
      thumbnail: projectImages.hotWheels,
      hero: projectImages.hotWheels,
      video: getEmbedUrl(videoIds.hotWheels),
    },
    responsibilities: [
      "Led the creative vision for a 16,000 sq ft entertainment complex in Virginia.",
      "Designed 12 interactive physical-digital experiences.",
      "Integrated RFID wristbands to track visitor progress across stations.",
      "Built a custom AI+AR system generating personalized souvenir videos for each guest.",
    ],
    content: {
      problem:
        "Translating the high-octane energy of Hot Wheels into a physical space where kids can actively participate across 12 stations.",
      solution:
        "Created a 'Phygital' ecosystem with RFID wristbands tracking progress across digital mini-game stations, using Unity, 100+ local servers, Kinect sensors, LiDAR, IR cameras, and Arduino controllers.",
      coreLoop:
        "Scan Band -> Play Physical/Digital Minigame -> Earn Points -> Unlock Badges -> Personalized AI+AR Souvenir Video.",
      systems:
        "Technology: Over 100 servers, Unity, Kinect, LiDAR, IR cameras, Arduino controllers, and RFID integration.",
      uxFlow:
        "Stadium Welcome -> Challenge Zones (Speed Machines, Smash Champs, Track Builders, etc.) -> RFID Badge Collection Hub -> AI+AR Souvenir Video.",
      outcome:
        "Successfully launched a 16,000 sq ft entertainment complex with 12 interactive experiences and zero technical downtime.",
    },
  },
  {
    id: "jimi-hendrix",
    title: "Jimi Hendrix™ Experience",
    tagline: "Connected TV Slots Game — the first licensed Jimi Hendrix game for Connected TV.",
    role: "Game Designer & Producer",
    team: "PlayWorks Digital",
    duration: "6 Months",
    platform: "Connected TV / Roku",
    tools: ["Slot Math Engines", "Adobe Creative Suite"],
    media: {
      thumbnail: projectImages.jimi,
      hero: projectImages.jimi,
      video: getEmbedUrl(videoIds.jimi),
    },
    responsibilities: [
      "Led development of a Connected TV slots game celebrating Jimi Hendrix.",
      "Designed special symbols, progressive jackpots, and photo collection mechanic.",
      "Oversaw game design and production timelines for Roku release.",
      "Created a purple-dominant 'Purple Haze' visual aesthetic.",
    ],
    content: {
      problem:
        "Creating the first licensed Jimi Hendrix game for Connected TV, reaching over 250 million Roku households.",
      solution:
        "Built a slots game with special symbols, progressive jackpots, and a collector mechanic where players unlock unreleased concert photos as they level up.",
      coreLoop:
        "Spin -> Symbol Match -> Trigger Progressive Jackpot -> Unlock Rare Concert Photos -> Level Up.",
      systems:
        "Collection: Players unlock unreleased concert photos as they level up, adding collector motivation on top of typical slot mechanics.",
      uxFlow: "Bet Selection -> Spin -> Big Win Celebration -> Photo Collection -> Feature Trigger.",
      outcome:
        "Released on Roku to over 250 million households as the first licensed Jimi Hendrix game on a Connected TV platform.",
    },
  },
  {
    id: "vr-railway",
    title: "VR Railway Walk",
    tagline: "VR safety training experience for Israel Railways — portable and immersive.",
    role: "Art Director, Game Designer, Production Manager",
    team: "VR Squad",
    duration: "4 Months",
    platform: "VR Headset",
    tools: ["Unity 3D", "VR SDKs"],
    media: {
      thumbnail: projectImages.railway,
      hero: projectImages.railway,
      video: getEmbedUrl(videoIds.railway),
    },
    responsibilities: [
      "Directed art and designed gameplay for VR safety training simulation.",
      "Replicated railway infrastructure: tracks, stations, platforms, and level crossings.",
      "Built the project in Unity running at 90–120 FPS.",
      "Designed a portable system that can be packed and transported to any location.",
    ],
    content: {
      problem:
        "Safety briefings are boring and often ignored. The goal was to create interactive training for dangerous railway situations without real risk.",
      solution:
        "A VR simulation replicating railway infrastructure — tracks, stations, platforms, and level crossings — allowing employees to learn safety protocols interactively.",
      coreLoop:
        "Enter VR -> Navigate Railway Environment -> Identify Hazards -> Follow Safety Protocol -> Debrief.",
      systems: "Performance: Unity-based, running at 90–120 FPS. Fully portable system.",
      uxFlow:
        "VR Tutorial -> Scenario Start -> Hazard Event -> Safety Protocol -> Success/Fail Screen.",
      outcome:
        "Adopted as a core training module for Israel Railways Safety Week. Portable system deployable to any location.",
    },
  },
  {
    id: "sassoon-codex",
    title: "The Sassoon Codex Bible",
    tagline: "Interactive digital stand for a 10th-century manuscript with 792 parchment pages.",
    role: "Art Director, UX/UI, Studio Manager",
    team: "ANU Museum",
    duration: "3 Months",
    platform: "Touch Kiosk",
    tools: ["Figma", "High-Res Imaging"],
    media: {
      thumbnail: projectImages.sassoon,
      hero: projectImages.sassoon,
      video: getEmbedUrl(videoIds.sassoon),
    },
    responsibilities: [
      "Created an interactive digital display for the Sassoon Codex (~10th century, 792 pages).",
      "Designed a digital magnifying glass and chapter navigation system.",
      "Built bilingual interface supporting Hebrew and English.",
      "Ensured visitors can examine details invisible on the physical manuscript.",
    ],
    content: {
      problem:
        "How to let visitors 'touch' and explore a fragile, priceless 10th-century manuscript without damaging it.",
      solution:
        "A touch screen interface with a digital magnifying glass, chapter navigation, and bilingual support — allowing visitors to examine details they cannot see on the physical manuscript inside the museum case.",
      coreLoop:
        "Select Page -> Flip Through -> Digital Magnifying Glass -> Chapter Navigation -> Switch Language.",
      systems:
        "Navigation: Bible book navigation with bilingual (Hebrew/English) support.",
      uxFlow:
        "Attract Mode -> Language Select -> Book View -> Magnifying Glass Detail -> Reset.",
      outcome:
        "Allowed thousands of visitors to intimately explore the 792-page manuscript during its exhibition at ANU Museum.",
    },
  },
  {
    id: "city-gate-midba",
    title: "City Gate & Midba Map",
    tagline: "Immersive projection mapping on the ancient stone walls of Jerusalem.",
    role: "Art Director",
    team: "Projection & 3D Artists",
    duration: "5 Months",
    platform: "Projection Mapping / Physical Walls",
    tools: ["Multi-Projector Mapping", "After Effects", "Sound Design"],
    media: {
      thumbnail: projectImages.cityGate,
      hero: projectImages.cityGate,
      video: getEmbedUrl(videoIds.cityGate),
    },
    responsibilities: [
      "Directed immersive projection mapping on the ancient stone walls of Jerusalem.",
      "Designed two themes: Jerusalem City Gate (Jaffa Gate excavations) and Madaba Map (6th-century mosaic).",
      "Used precise multi-projector mapping for wall curvature, niches, and towers.",
      "Created a language-independent experience relying on sound and visuals rather than text.",
    ],
    content: {
      problem:
        "Ancient stone walls are static surfaces that fail to convey the rich history of Jerusalem's defense, trade, and culture.",
      solution:
        "Projected two immersive themes onto the walls: the Jerusalem City Gate based on excavations under Jaffa Gate, and the Madaba Map — the oldest mosaic map of the Holy Land from the 6th century.",
      coreLoop:
        "Visitor Arrival -> Audio-Visual Intro -> Animated Mosaic/Gate History -> Cultural Deep Dive -> Full Wall Illumination.",
      systems:
        "Multi-projector mapping accounting for wall curvature, niches, and towers. Language-independent (sound + visuals only).",
      uxFlow:
        "Passive Viewing -> Gate History Animation -> Madaba Map Mosaic -> Byzantine Highlights -> Conclusion.",
      outcome:
        "Brought the history of defense, trade, and culture to life on Jerusalem's ancient stone walls, accessible to visitors regardless of language.",
    },
  },
  {
    id: "terumot-maasrot",
    title: "Terumot and Ma'asrot",
    tagline: "Interactive educational experience teaching children complex Jewish agricultural laws.",
    role: "Game & Art Producer, Creative Manager",
    team: "Educational Staff & Devs",
    duration: "4 Months",
    platform: "Interactive Touch Table",
    tools: ["Unity", "Touch Script"],
    media: {
      thumbnail: projectImages.terumot,
      hero: projectImages.terumot,
      video: getEmbedUrl(videoIds.terumot),
    },
    responsibilities: [
      "Produced an interactive educational project teaching children about agricultural laws.",
      "Translated ancient agricultural texts into accessible game mechanics.",
      "Designed collaborative multi-user interface for touch table.",
      "Balanced difficulty for mixed-age groups (family play).",
    ],
    content: {
      problem:
        "The laws of 'Terumot and Ma'asrot' are abstract and mathematical, making them dry and difficult for children to grasp.",
      solution:
        "Developed a 'Sorting Frenzy' style game where players physically drag and separate crops into the correct bins before time runs out.",
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
    tagline: "AR mobile game combining navigation and educational challenges exploring the city's history.",
    role: "Game Designer & Art Director",
    team: "Quala Group",
    duration: "3 Months",
    platform: "Mobile App / Outdoor AR",
    tools: ["Unity", "ARKit", "ARCore", "GPS API"],
    media: {
      thumbnail: projectImages.raanana,
      hero: projectImages.raanana,
      video: getEmbedUrl(videoIds.raanana),
    },
    responsibilities: [
      "Designed geo-fencing logic and station triggers for AR challenges.",
      "Created AR challenges that activate only at specific city landmarks.",
      "Built as an orientation experience for school students.",
      "Designed logo assembly mechanic — completing challenges unlocks pieces of the city's logo.",
    ],
    content: {
      problem:
        "Getting residents, especially youth, to physically visit and engage with local heritage sites in Ra'anana.",
      solution:
        "An AR mobile game where players use an interactive map to find challenge locations across the city. Each location features AR tasks that test knowledge and problem-solving. Completing a challenge unlocks a piece of the city's logo.",
      coreLoop:
        "Navigate to Map Marker -> Arrive at Location -> Unlock AR Challenge -> Solve -> Earn Logo Piece.",
      systems: "Progression: Logo assembly mechanic with backend for dynamic content updates.",
      uxFlow:
        "Interactive Map -> Proximity Alert -> AR Camera View -> Trivia/Puzzle -> Logo Piece Reward.",
      outcome:
        "High participation rates during the city's events, successfully deployed as an orientation experience for school students.",
    },
  },
  {
    id: "hexa-puzzle",
    title: "Hexa Puzzle",
    tagline: "Geometric puzzle game on a hexagonal grid with honeycomb visual theme.",
    role: "Game Designer & Producer",
    team: "Studio Team",
    duration: "2 Months",
    platform: "Mobile (iOS/Android)",
    tools: ["Unity 2D", "C#"],
    media: {
      thumbnail: projectImages.hexa,
      hero: projectImages.hexa,
      video: getEmbedUrl(videoIds.hexa),
    },
    responsibilities: [
      "Improved gameplay mechanics, feature set, and monetization systems.",
      "Designed hexagonal grid with honeycomb visual theme.",
      "Implemented no-rotation mechanic forcing spatial thinking.",
      "Created a relaxed experience with no time limit.",
    ],
    content: {
      problem:
        "Creating a puzzle game that feels fresh in a saturated market with a unique hexagonal mechanic.",
      solution:
        "A geometric puzzle where players drag hexagonal blocks into the grid to fill frames. Blocks cannot be rotated, forcing spatial thinking. No time limit creates a relaxed experience.",
      coreLoop:
        "Observe Board -> Drag Hexagonal Block -> Fill Frame -> Clear Lines -> Level Up.",
      systems:
        "Difficulty: Organic curve based on available board space and piece complexity. No time pressure.",
      uxFlow: "Level Select -> Hexagonal Game Board -> Win State -> Ad/Reward -> Next Level.",
      outcome:
        "Achieved consistent daily active users and positive store ratings for its relaxing, no-pressure gameplay.",
    },
  },
];

export const getProjectById = (id: string): Project | undefined => {
  return projectsData.find((project) => project.id === id);
};
