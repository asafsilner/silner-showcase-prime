// --- VIDEO CONFIGURATION ---
const videoIds = {
  hotWheels: ["VH-5zhuq2Sg", "mJu_KE3-S58", "Q4c-WBZGtD8", "A37r3bsftKQ", "XPJfcIwU-4c", "sEDSdMfwF7Q", "NKXsIXXrKvA", "ILhKByohHD4", "FMUidYlOENc", "3fG86gipBq8", "tbN8tKp_ZBA", "w2IEXt6ldvo", "xEfCrOfvP8g"],
  jimi: ["onVtb26c_G8"],
  railway: ["VsAp6-pCoWA"],
  sassoon: ["B29zta5f7cQ"],
  cityGate: ["UFoLT62cD1Q", "6gyztnIyBtw"],
  terumot: ["yA6MRps2OKs"],
  raanana: ["BVJcH0Z3xVI"],
  hexa: ["qBQM4uPF01U"],
  solitaireClash: ["F8jNC3Ojw1s"],
  farmEscape: ["Jk_xOoj9m0g"],
  runnerGames: ["AvcFpxiqgYA"],
  bubbleShooter: ["xIh4KSvkDik"],
  slots3x3: ["dLIfnAfX4x4"],
  slots5x3: ["20UBniuHYG0"],
  multigames: ["NKgFmhoa43Y"],
};

// --- THUMBNAIL CONFIGURATION ---
const projectImages = {
  hotWheels: "/projects/hot-wheels.jpg",
  jimi: "/projects/jimi-hendrix.jpg",
  railway: "/projects/vr-railway.jpg",
  sassoon: "/projects/sassoon-codex.jpg",
  cityGate: "/projects/city-gate.jpg",
  terumot: "/projects/terumot.jpg",
  raanana: "/projects/raanana.jpg",
  hexa: "/projects/hexa-puzzle.jpg",
  solitaireClash: "/projects/solitaire-clash.jpg",
  farmEscape: "/projects/farm-escape.jpg",
  runnerGames: "/projects/runner-games.jpg",
  bubbleShooter: "/projects/bubble-shooter.jpg",
  slots3x3: "/projects/slots-3x3.jpg",
  slots5x3: "/projects/slots-5x3.jpg",
  multigames: "/projects/multigames.jpg",
};

const getEmbedUrl = (id: string) => `https://www.youtube.com/embed/${id}`;

export interface VideoItem {
  id: string;
  title: string;
}

export interface ProjectMedia {
  thumbnail: string;
  hero: string;
  video: string; // primary video embed
  videos: VideoItem[];
  gallery: string[];
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
      video: getEmbedUrl(videoIds.hotWheels[0]),
      videos: [
        { id: videoIds.hotWheels[0], title: "Hot Wheels Champion - Overview Trailer" },
        { id: videoIds.hotWheels[1], title: "Speed Machines - Motion-Controlled Racing" },
        { id: videoIds.hotWheels[2], title: "Smash Champs - Trampoline Monster Trucks" },
        { id: videoIds.hotWheels[3], title: "Hot Wheels Designers - Custom Car AR Scan" },
        { id: videoIds.hotWheels[4], title: "Track Builders - Pillow AR Track System" },
        { id: videoIds.hotWheels[5], title: "Ultimate Heroes - LiDAR Ball Throw vs. Monsters" },
        { id: videoIds.hotWheels[6], title: "Virtual Drivers - AR City Driving Experience" },
        { id: videoIds.hotWheels[7], title: "Hot Wheels Central - RFID Badge Collection Hub" },
        { id: videoIds.hotWheels[8], title: "Stadium Welcome - Personalized Guest Entry" },
        { id: videoIds.hotWheels[9], title: "Made to Race Racing Simulator" },
        { id: videoIds.hotWheels[10], title: "Monster Truck Obstacle Course" },
        { id: videoIds.hotWheels[11], title: "AI+AR Personalized Video Souvenir System" },
        { id: videoIds.hotWheels[12], title: "Hot Wheels Champion - Behind the Technology" },
      ],
      gallery: [
        "/gallery/hot-wheels/landing-page.jpg",
        "/gallery/hot-wheels/ar1.jpg",
        "/gallery/hot-wheels/ar2.jpg",
        "/gallery/hot-wheels/coloring.jpg",
        "/gallery/hot-wheels/img-6272.jpg",
        "/gallery/hot-wheels/img-6273.jpg",
        "/gallery/hot-wheels/img-6274.jpg",
        "/gallery/hot-wheels/img-6275.jpg",
        "/gallery/hot-wheels/img-6276.jpg",
        "/gallery/hot-wheels/img-6277.jpg",
        "/gallery/hot-wheels/img-6279.jpg",
        "/gallery/hot-wheels/img-6281.jpg",
        "/gallery/hot-wheels/img-6288.jpg",
        "/gallery/hot-wheels/img-6289.jpg",
        "/gallery/hot-wheels/img-6293.jpg",
        "/gallery/hot-wheels/img-6309.jpg",
        "/gallery/hot-wheels/img-6312.jpg",
        "/gallery/hot-wheels/img-6321.jpg",
        "/gallery/hot-wheels/img-6323.jpg",
        "/gallery/hot-wheels/img-6373.jpg",
      ],
    },
    responsibilities: [
      "Led the creative vision for a 16,000 sq ft entertainment complex in Virginia.",
      "Designed 12 interactive physical-digital experiences.",
      "Integrated RFID wristbands to track visitor progress across stations.",
      "Built a custom AI+AR system generating personalized souvenir videos for each guest.",
    ],
    content: {
      problem: "Translating the high-octane energy of Hot Wheels into a physical space where kids can actively participate across 12 stations.",
      solution: "Created a 'Phygital' ecosystem with RFID wristbands tracking progress across digital mini-game stations, using Unity, 100+ local servers, Kinect sensors, LiDAR, IR cameras, and Arduino controllers.",
      coreLoop: "Scan Band -> Play Physical/Digital Minigame -> Earn Points -> Unlock Badges -> Personalized AI+AR Souvenir Video",
      systems: "Technology: Over 100 servers, Unity, Kinect, LiDAR, IR cameras, Arduino controllers, and RFID integration.",
      uxFlow: "Stadium Welcome -> Challenge Zones (Speed Machines, Smash Champs, Track Builders, etc.) -> RFID Badge Collection Hub -> AI+AR Souvenir Video.",
      outcome: "Successfully launched a 16,000 sq ft entertainment complex with 12 interactive experiences and zero technical downtime.",
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
      video: getEmbedUrl(videoIds.jimi[0]),
      videos: [
        { id: videoIds.jimi[0], title: "Jimi Hendrix Experience - Full Gameplay Trailer" },
      ],
      gallery: [
        "/gallery/jimi-hendrix/downlox.jpg",
        "/gallery/jimi-hendrix/downlox-1.jpg",
        "/gallery/jimi-hendrix/downlox-2.jpg",
        "/gallery/jimi-hendrix/downlox-4.jpg",
        "/gallery/jimi-hendrix/downlox-5.jpg",
      ],
    },
    responsibilities: [
      "Led development of a Connected TV slots game celebrating Jimi Hendrix.",
      "Designed special symbols, progressive jackpots, and photo collection mechanic.",
      "Oversaw game design and production timelines for Roku release.",
      "Created a purple-dominant 'Purple Haze' visual aesthetic.",
    ],
    content: {
      problem: "Creating the first licensed Jimi Hendrix game for Connected TV, reaching over 250 million Roku households.",
      solution: "Built a slots game with special symbols, progressive jackpots, and a collector mechanic where players unlock unreleased concert photos as they level up.",
      coreLoop: "Spin -> Symbol Match -> Trigger Progressive Jackpot -> Unlock Rare Concert Photos -> Level Up",
      systems: "Collection: Players unlock unreleased concert photos as they level up, adding collector motivation on top of typical slot mechanics.",
      uxFlow: "Bet Selection -> Spin -> Big Win Celebration -> Photo Collection -> Feature Trigger.",
      outcome: "Released on Roku to over 250 million households as the first licensed Jimi Hendrix game on a Connected TV platform.",
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
      video: getEmbedUrl(videoIds.railway[0]),
      videos: [
        { id: videoIds.railway[0], title: "VR Railway Walk - Safety Training Demo" },
      ],
      gallery: [
        "/gallery/vr-railway/1.jpg",
        "/gallery/vr-railway/2.jpg",
        "/gallery/vr-railway/3.jpg",
        "/gallery/vr-railway/4.jpg",
        "/gallery/vr-railway/5.jpg",
      ],
    },
    responsibilities: [
      "Directed art and designed gameplay for VR safety training simulation.",
      "Replicated railway infrastructure: tracks, stations, platforms, and level crossings.",
      "Built the project in Unity running at 90–120 FPS.",
      "Designed a portable system that can be packed and transported to any location.",
    ],
    content: {
      problem: "Safety briefings are boring and often ignored. The goal was to create interactive training for dangerous railway situations without real risk.",
      solution: "A VR simulation replicating railway infrastructure — tracks, stations, platforms, and level crossings — allowing employees to learn safety protocols interactively.",
      coreLoop: "Enter VR -> Navigate Railway Environment -> Identify Hazards -> Follow Safety Protocol -> Debrief",
      systems: "Performance: Unity-based, running at 90–120 FPS. Fully portable system.",
      uxFlow: "VR Tutorial -> Scenario Start -> Hazard Event -> Safety Protocol -> Success/Fail Screen.",
      outcome: "Adopted as a core training module for Israel Railways Safety Week. Portable system deployable to any location.",
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
      video: getEmbedUrl(videoIds.sassoon[0]),
      videos: [
        { id: videoIds.sassoon[0], title: "Sassoon Codex - Interactive Digital Stand" },
      ],
      gallery: [
        "/gallery/sassoon-codex/1.jpg",
        "/gallery/sassoon-codex/2.jpg",
        "/gallery/sassoon-codex/3.jpg",
        "/gallery/sassoon-codex/4.jpg",
      ],
    },
    responsibilities: [
      "Created an interactive digital display for the Sassoon Codex (~10th century, 792 pages).",
      "Designed a digital magnifying glass and chapter navigation system.",
      "Built bilingual interface supporting Hebrew and English.",
      "Ensured visitors can examine details invisible on the physical manuscript.",
    ],
    content: {
      problem: "How to let visitors 'touch' and explore a fragile, priceless 10th-century manuscript without damaging it.",
      solution: "A touch screen interface with a digital magnifying glass, chapter navigation, and bilingual support — allowing visitors to examine details they cannot see on the physical manuscript inside the museum case.",
      coreLoop: "Select Page -> Flip Through -> Digital Magnifying Glass -> Chapter Navigation -> Switch Language",
      systems: "Navigation: Bible book navigation with bilingual (Hebrew/English) support.",
      uxFlow: "Attract Mode -> Language Select -> Book View -> Magnifying Glass Detail -> Reset.",
      outcome: "Allowed thousands of visitors to intimately explore the 792-page manuscript during its exhibition at ANU Museum.",
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
      video: getEmbedUrl(videoIds.cityGate[0]),
      videos: [
        { id: videoIds.cityGate[0], title: "City Gate Projection on Jerusalem Walls" },
        { id: videoIds.cityGate[1], title: "Midba Map - Ancient Mosaic Comes to Life" },
      ],
      gallery: [
        "/gallery/city-gate/1.jpg",
        "/gallery/city-gate/3.jpg",
        "/gallery/city-gate/5.jpg",
        "/gallery/city-gate/n-008.jpg",
        "/gallery/city-gate/n-27.jpg",
        "/gallery/city-gate/n-55.jpg",
        "/gallery/city-gate/animations.jpg",
        "/gallery/city-gate/gate-uv.jpg",
        "/gallery/city-gate/midba-scenes.jpg",
        "/gallery/city-gate/plans-gate.jpg",
        "/gallery/city-gate/plans-midba.jpg",
      ],
    },
    responsibilities: [
      "Directed immersive projection mapping on the ancient stone walls of Jerusalem.",
      "Designed two themes: Jerusalem City Gate (Jaffa Gate excavations) and Madaba Map (6th-century mosaic).",
      "Used precise multi-projector mapping for wall curvature, niches, and towers.",
      "Created a language-independent experience relying on sound and visuals rather than text.",
    ],
    content: {
      problem: "Ancient stone walls are static surfaces that fail to convey the rich history of Jerusalem's defense, trade, and culture.",
      solution: "Projected two immersive themes onto the walls: the Jerusalem City Gate based on excavations under Jaffa Gate, and the Madaba Map — the oldest mosaic map of the Holy Land from the 6th century.",
      coreLoop: "Visitor Arrival -> Audio-Visual Intro -> Animated Mosaic/Gate History -> Cultural Deep Dive -> Full Wall Illumination",
      systems: "Multi-projector mapping accounting for wall curvature, niches, and towers. Language-independent (sound + visuals only).",
      uxFlow: "Passive Viewing -> Gate History Animation -> Madaba Map Mosaic -> Byzantine Highlights -> Conclusion.",
      outcome: "Brought the history of defense, trade, and culture to life on Jerusalem's ancient stone walls, accessible to visitors regardless of language.",
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
      video: getEmbedUrl(videoIds.terumot[0]),
      videos: [
        { id: videoIds.terumot[0], title: "Terumot and Ma'asrot - Educational Game" },
      ],
      gallery: [
        "/gallery/terumot/main.jpg",
        "/gallery/terumot/bait-full-frame.jpg",
        "/gallery/terumot/troma-gdola.jpg",
        "/gallery/terumot/troma-maasser-pop.jpg",
        "/gallery/terumot/troma-maasser.jpg",
        "/gallery/terumot/maasser-sheni.jpg",
        "/gallery/terumot/sikum-maasser.jpg",
        "/gallery/terumot/final-tablet.jpg",
        "/gallery/terumot/high-score.jpg",
        "/gallery/terumot/trivia.jpg",
      ],
    },
    responsibilities: [
      "Produced an interactive educational project teaching children about agricultural laws.",
      "Translated ancient agricultural texts into accessible game mechanics.",
      "Designed collaborative multi-user interface for touch table.",
      "Balanced difficulty for mixed-age groups (family play).",
    ],
    content: {
      problem: "The laws of 'Terumot and Ma'asrot' are abstract and mathematical, making them dry and difficult for children to grasp.",
      solution: "Developed a 'Sorting Frenzy' style game where players physically drag and separate crops into the correct bins before time runs out.",
      coreLoop: "Crops Appear -> Identify Type -> Drag to Correct Bin -> Score Points -> Speed Increase",
      systems: "Feedback: Immediate visual cues for correct/incorrect halachic separation.",
      uxFlow: "Player Registration -> Tutorial Round -> Main Game (Timed) -> Score Summary.",
      outcome: "Turned a complex study topic into the most popular active station in the exhibition.",
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
      video: getEmbedUrl(videoIds.raanana[0]),
      videos: [
        { id: videoIds.raanana[0], title: "Ra'anana City Challenge - AR Gameplay Demo" },
      ],
      gallery: [
        "/gallery/raanana/1.jpg",
        "/gallery/raanana/2.jpg",
        "/gallery/raanana/3.jpg",
        "/gallery/raanana/4.jpg",
      ],
    },
    responsibilities: [
      "Designed geo-fencing logic and station triggers for AR challenges.",
      "Created AR challenges that activate only at specific city landmarks.",
      "Built as an orientation experience for school students.",
      "Designed logo assembly mechanic — completing challenges unlocks pieces of the city's logo.",
    ],
    content: {
      problem: "Getting residents, especially youth, to physically visit and engage with local heritage sites in Ra'anana.",
      solution: "An AR mobile game where players use an interactive map to find challenge locations across the city. Each location features AR tasks that test knowledge and problem-solving. Completing a challenge unlocks a piece of the city's logo.",
      coreLoop: "Navigate to Map Marker -> Arrive at Location -> Unlock AR Challenge -> Solve -> Earn Logo Piece",
      systems: "Progression: Logo assembly mechanic with backend for dynamic content updates.",
      uxFlow: "Interactive Map -> Proximity Alert -> AR Camera View -> Trivia/Puzzle -> Logo Piece Reward.",
      outcome: "High participation rates during the city's events, successfully deployed as an orientation experience for school students.",
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
      video: getEmbedUrl(videoIds.hexa[0]),
      videos: [
        { id: videoIds.hexa[0], title: "Hexa Puzzle - Gameplay Demo" },
      ],
      gallery: [
        "/gallery/hexa-puzzle/banner.jpg",
        "/gallery/hexa-puzzle/1.jpg",
        "/gallery/hexa-puzzle/2.jpg",
        "/gallery/hexa-puzzle/3.jpg",
        "/gallery/hexa-puzzle/4.jpg",
      ],
    },
    responsibilities: [
      "Improved gameplay mechanics, feature set, and monetization systems.",
      "Designed hexagonal grid with honeycomb visual theme.",
      "Implemented no-rotation mechanic forcing spatial thinking.",
      "Created a relaxed experience with no time limit.",
    ],
    content: {
      problem: "Creating a puzzle game that feels fresh in a saturated market with a unique hexagonal mechanic.",
      solution: "A geometric puzzle where players drag hexagonal blocks into the grid to fill frames. Blocks cannot be rotated, forcing spatial thinking. No time limit creates a relaxed experience.",
      coreLoop: "Observe Board -> Drag Hexagonal Block -> Fill Frame -> Clear Lines -> Level Up",
      systems: "Difficulty: Organic curve based on available board space and piece complexity. No time pressure.",
      uxFlow: "Level Select -> Hexagonal Game Board -> Win State -> Ad/Reward -> Next Level.",
      outcome: "Achieved consistent daily active users and positive store ratings for its relaxing, no-pressure gameplay.",
    },
  },
  {
    id: "solitaire-clash",
    title: "Solitaire Clash",
    tagline: "Competitive Klondike Solitaire with multiplayer tournaments on Connected TV.",
    role: "Game Designer & UI/UX Designer",
    team: "PlayWorks Digital",
    duration: "6 Months",
    platform: "Connected TV / Roku",
    tools: ["Unity", "Roku SDK"],
    media: {
      thumbnail: projectImages.solitaireClash,
      hero: projectImages.solitaireClash,
      video: getEmbedUrl(videoIds.solitaireClash[0]),
      videos: [
        { id: videoIds.solitaireClash[0], title: "Solitaire Clash - Multiplayer Tournament Gameplay" },
      ],
      gallery: [
        "/gallery/solitaire-clash/1.jpg",
        "/gallery/solitaire-clash/2.jpg",
        "/gallery/solitaire-clash/3.jpg",
        "/gallery/solitaire-clash/4.jpg",
        "/gallery/solitaire-clash/5.jpg",
        "/gallery/solitaire-clash/6.jpg",
      ],
    },
    responsibilities: [
      "Developed core game design documentation and initial prototypes.",
      "Created a Universal UI system adopted across the company's games.",
      "Designed entry-fee tournaments, speed-based scoring, and seasonal events.",
      "Optimized for Roku remote control navigation.",
    ],
    content: {
      problem: "Building a competitive multiplayer solitaire experience that ensures fair play on Connected TV.",
      solution: "A competitive variant of Klondike Solitaire with multiplayer tournaments set in various global locations. All tournament players get the exact same card layout for fair play.",
      coreLoop: "Enter Tournament -> Play Klondike -> Speed-Based Scoring -> Leaderboard -> Win Rewards",
      systems: "Fair play: Identical card layouts for all players. Entry-fee tournaments with speed-based scoring and seasonal events.",
      uxFlow: "Lobby -> Tournament Select -> Card Game -> Leaderboard -> Reward Screen.",
      outcome: "Successfully launched on Roku with a Universal UI system that was later adopted across the company's entire game portfolio.",
    },
  },
  {
    id: "farm-escape",
    title: "Farm Escape",
    tagline: "Turn-based strategy puzzle on a hexagonal grid — trap the sheep before it escapes.",
    role: "Game Designer & Producer",
    team: "PlayWorks Digital",
    duration: "3 Months",
    platform: "Connected TV / Roku",
    tools: ["Unity", "Roku SDK"],
    media: {
      thumbnail: projectImages.farmEscape,
      hero: projectImages.farmEscape,
      video: getEmbedUrl(videoIds.farmEscape[0]),
      videos: [
        { id: videoIds.farmEscape[0], title: "Farm Escape - Gameplay" },
      ],
      gallery: [
        "/gallery/farm-escape/1.jpg",
        "/gallery/farm-escape/2.jpg",
        "/gallery/farm-escape/3.jpg",
        "/gallery/farm-escape/4.jpg",
        "/gallery/farm-escape/5.jpg",
        "/gallery/farm-escape/6.jpg",
      ],
    },
    responsibilities: [
      "Designed turn-based strategy puzzle with pure strategy mechanics.",
      "Created hexagonal grid with barrier placement system.",
      "Implemented randomized starting positions for replay value.",
      "Optimized for Roku remote control input.",
    ],
    content: {
      problem: "Creating a compelling strategy puzzle for Connected TV with simple controls but deep gameplay.",
      solution: "A turn-based strategy puzzle on a hexagonal grid. The player must trap a sheep by placing barrier blocks. Every turn, the sheep moves one cell toward the edge. Three bonus barriers are placed before each round.",
      coreLoop: "Place Barrier -> Sheep Moves -> Evaluate Path -> Place Next Barrier -> Trap or Escape",
      systems: "Pure strategy: No randomness during active game. Randomized starting positions add replay value.",
      uxFlow: "Level Select -> Hexagonal Grid -> Place Barriers -> Win/Lose -> Next Level.",
      outcome: "Available on the Roku Channel Store with positive reception for its simple-yet-deep strategy mechanics.",
    },
  },
  {
    id: "runner-games",
    title: "Runner Games: Arctic Adventure",
    tagline: "Endless runner with three distinct mechanics — run, dive, and fly.",
    role: "Game Designer & Graphic/Animation Designer",
    team: "PlayWorks Digital",
    duration: "4 Months",
    platform: "Mobile (iOS/Android)",
    tools: ["Unity", "Adobe Creative Suite"],
    media: {
      thumbnail: projectImages.runnerGames,
      hero: projectImages.runnerGames,
      video: getEmbedUrl(videoIds.runnerGames[0]),
      videos: [
        { id: videoIds.runnerGames[0], title: "Arctic Adventure - Runner Game Gameplay Demo" },
      ],
      gallery: [
        "/gallery/runner-games/1.jpg",
        "/gallery/runner-games/2.jpg",
        "/gallery/runner-games/3.jpg",
        "/gallery/runner-games/4.jpg",
        "/gallery/runner-games/5.jpg",
        "/gallery/runner-games/6.jpg",
        "/gallery/runner-games/7.jpg",
      ],
    },
    responsibilities: [
      "Designed and produced an endless runner game from concept to completion.",
      "Created all visual assets: characters, costumes, animations, UI, backgrounds, logos.",
      "Developed a modular asset system for easy reskinning of future titles.",
      "Designed three distinct gameplay mechanics: ice running, underwater diving, jetpack flying.",
    ],
    content: {
      problem: "Creating a visually rich endless runner with varied mechanics and a modular system for future reskins.",
      solution: "An endless runner featuring three distinct mechanics — players run on ice, dive underwater, and fly with a jetpack. A modular asset system allows developers to easily swap graphics for future titles.",
      coreLoop: "Run -> Collect Coins -> Switch Mechanic (Dive/Fly) -> Avoid Obstacles -> Score",
      systems: "Modular asset system allowing easy graphic swaps. Three distinct gameplay modes with unique mechanics.",
      uxFlow: "Lobby -> Character Select -> Run/Dive/Fly -> Game Over -> Store/Retry.",
      outcome: "Successfully shipped with a modular system that enabled rapid production of reskinned runner titles.",
    },
  },
  {
    id: "bubble-shooter",
    title: "Bubble Shooter: Pearls of Atlantis",
    tagline: "Physics-based bubble shooter with realistic pearl physics across 1,500+ levels.",
    role: "Game Designer & Art Director",
    team: "GETPLAY",
    duration: "8 Months",
    platform: "Mobile / PC / Console (PS5, Switch, Xbox)",
    tools: ["Unity", "Physics Engines", "Adobe Creative Suite"],
    media: {
      thumbnail: projectImages.bubbleShooter,
      hero: projectImages.bubbleShooter,
      video: getEmbedUrl(videoIds.bubbleShooter[0]),
      videos: [
        { id: videoIds.bubbleShooter[0], title: "Physics Bubble Shooter Gameplay" },
      ],
      gallery: [
        "/gallery/bubble-shooter/1.jpg",
        "/gallery/bubble-shooter/2.jpg",
        "/gallery/bubble-shooter/3.jpg",
        "/gallery/bubble-shooter/lobby.jpg",
        "/gallery/bubble-shooter/target.jpg",
        "/gallery/bubble-shooter/map1.jpg",
        "/gallery/bubble-shooter/map2.jpg",
        "/gallery/bubble-shooter/mystic1.jpg",
        "/gallery/bubble-shooter/mystic2.jpg",
      ],
    },
    responsibilities: [
      "Managed design and production for a physics-based bubble shooter game.",
      "Merged two existing codebases into a single improved system.",
      "Designed narrative elements and power-ups (explosive hammer, magic jellyfish).",
      "Created 5 game modes: Story, Daily Puzzle, Zen Mode, Treasure Run, Score Challenge.",
    ],
    content: {
      problem: "Building a bubble shooter that stands out with unique physics rather than typical grid-snapping mechanics.",
      solution: "A physics-based bubble shooter where pearls bounce, roll, and collide realistically. The game includes narrative elements, power-ups, and 5 distinct game modes spanning over 1,500 levels with 10 new levels added weekly.",
      coreLoop: "Aim -> Shoot Pearl -> Physics Collision -> Clear Cluster -> Trigger Power-Up -> Progress",
      systems: "Realistic pearl physics (bounce, roll, collide). 5 game modes. 1,500+ levels with weekly additions.",
      uxFlow: "Mode Select -> Level Map -> Aim & Shoot -> Win/Lose -> Reward -> Next Level.",
      outcome: "Live on Android, iOS, Steam, HTML5, PS5, Nintendo Switch, and Xbox with continuous weekly content updates.",
    },
  },
  {
    id: "slots-3x3",
    title: "Slots Games 3x3",
    tagline: "Flexible 3x3 slots engine enabling rapid game reskinning — up to 2 games per day.",
    role: "Game Director & Producer",
    team: "GETPLAY",
    duration: "4 Months",
    platform: "Mobile (iOS/Android)",
    tools: ["Unity", "C#", "Photoshop Automation"],
    media: {
      thumbnail: projectImages.slots3x3,
      hero: projectImages.slots3x3,
      video: getEmbedUrl(videoIds.slots3x3[0]),
      videos: [
        { id: videoIds.slots3x3[0], title: "Slots 3x3 - Gameplay & Reskin System" },
      ],
      gallery: [
        "/gallery/slots-3x3/1.jpg",
        "/gallery/slots-3x3/2.jpg",
        "/gallery/slots-3x3/3.jpg",
        "/gallery/slots-3x3/4.jpg",
        "/gallery/slots-3x3/5.jpg",
      ],
    },
    responsibilities: [
      "Created a 3x3 slots game engine in Unity.",
      "Built a flexible UI architecture where graphic design changes auto-update UI code.",
      "Enabled production of up to two reskinned games per day.",
      "Expanded core mechanics to include mini-games and win statistics.",
    ],
    content: {
      problem: "Creating a slots engine that allows rapid production of themed variants without code changes.",
      solution: "Built a flexible UI architecture where a change in graphic design automatically updates the UI code, allowing an artist to produce up to two reskinned games per day.",
      coreLoop: "Spin -> Match Symbols -> Win -> Mini-Game Trigger -> Collect",
      systems: "Flexible UI: Graphic design changes auto-propagate to code. Mini-games and win statistics built into core.",
      uxFlow: "Theme Select -> Bet -> Spin -> Win Celebration -> Mini-Game -> Continue.",
      outcome: "Enabled rapid production pipeline producing multiple themed slot games daily.",
    },
  },
  {
    id: "slots-5x3",
    title: "Slots Games 5x3",
    tagline: "Production pipeline for 5x3 slots with automated graphic generation across genres.",
    role: "Game & Art Director",
    team: "GETPLAY",
    duration: "6 Months",
    platform: "Mobile (iOS/Android)",
    tools: ["Unity", "Photoshop Scripts", "After Effects Automation"],
    media: {
      thumbnail: projectImages.slots5x3,
      hero: projectImages.slots5x3,
      video: getEmbedUrl(videoIds.slots5x3[0]),
      videos: [
        { id: videoIds.slots5x3[0], title: "Flexible UI Production System" },
      ],
      gallery: [
        "/gallery/slots-5x3/1.jpg",
        "/gallery/slots-5x3/2.jpg",
        "/gallery/slots-5x3/3.jpg",
        "/gallery/slots-5x3/4.jpg",
        "/gallery/slots-5x3/5.jpg",
        "/gallery/slots-5x3/6.jpg",
      ],
    },
    responsibilities: [
      "Managed production of multiple graphic packages for 5x3 slots.",
      "Developed automation scripts in Photoshop and After Effects.",
      "Accelerated production to 1-2 games per day.",
      "Added icon animations, big win celebrations, mini-games, and dynamic messages.",
    ],
    content: {
      problem: "Scaling slots game production across multiple genres while maintaining visual quality.",
      solution: "Developed automation scripts in Photoshop and After Effects to accelerate production. Added new features: icon animations, big win celebrations, mini-games, and dynamic encouragement messages across fantasy, sci-fi, and classic casino genres.",
      coreLoop: "Spin -> Animated Symbol Match -> Big Win Celebration -> Mini-Game -> Encouragement Message",
      systems: "Automated Photoshop/After Effects pipeline. Icon animations, big win celebrations, dynamic encouragement messages.",
      uxFlow: "Genre Select -> Bet -> Spin -> Win Animation -> Mini-Game -> Continue.",
      outcome: "Produced full graphic packages across different genres at a rate of 1-2 games per day.",
    },
  },
  {
    id: "multigames",
    title: "Multigames 5x3",
    tagline: "Multi-game platform containing four slot games with distinct mechanics and daily bonuses.",
    role: "Art Director",
    team: "GETPLAY",
    duration: "4 Months",
    platform: "Mobile (iOS/Android)",
    tools: ["Unity", "Adobe Creative Suite"],
    media: {
      thumbnail: projectImages.multigames,
      hero: projectImages.multigames,
      video: getEmbedUrl(videoIds.multigames[0]),
      videos: [
        { id: videoIds.multigames[0], title: "Full Platform Demo" },
      ],
      gallery: [
        "/gallery/multigames/1.jpg",
        "/gallery/multigames/2.jpg",
        "/gallery/multigames/3.jpg",
        "/gallery/multigames/4.jpg",
        "/gallery/multigames/5.jpg",
        "/gallery/multigames/6.jpg",
      ],
    },
    responsibilities: [
      "Built two multi-game platforms with four slot games each.",
      "Designed unified UI with modern aesthetics and daily bonus system.",
      "Created high-quality promotional video assets.",
      "Consolidated flexible UI, linked assets, animation presets, and semi-automated marketing.",
    ],
    content: {
      problem: "Consolidating multiple slot games into a single cohesive platform with shared systems.",
      solution: "Built two multi-game platforms, each containing four slot games with distinct mechanics. Features a modern UI, daily bonus system, and high-quality promotional video assets.",
      coreLoop: "Open Platform -> Select Game -> Play Slots -> Earn Daily Bonus -> Switch Game",
      systems: "Flexible UI, linked asset files, animation presets, and semi-automated marketing material generation.",
      uxFlow: "Lobby -> Game Select -> Bet & Spin -> Daily Bonus -> Promo Video -> Switch Game.",
      outcome: "Successfully consolidated pipeline innovations into a polished multi-game platform with unified UX.",
    },
  },
];

export const getProjectById = (id: string): Project | undefined => {
  return projectsData.find((project) => project.id === id);
};
