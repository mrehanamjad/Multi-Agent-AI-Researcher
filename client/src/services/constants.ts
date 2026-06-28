import type { ResearchStage } from "@/types";

export const STAGES: Pick<ResearchStage, "key" | "label">[] = [
  { key: "validating", label: "Validating topic" },
  { key: "clarification", label: "Checking clarifications" },
  { key: "planning", label: "Planning research" },
  { key: "searching", label: "Searching web" },
  { key: "synthesizing", label: "Writing report" },
  { key: "critic", label: "Evaluating report" },
];

export const ALL_SUGGESTIONS = [
  // Science & Environment
  "Advances in solid-state battery technology for EVs",
  "The role of CRISPR in treating genetic disorders",
  "Impact of microplastics on deep-sea ecosystems",
  "Current progress in nuclear fusion ignition",
  "The efficacy of carbon capture and storage (CCS) methods",
  "How AI is accelerating drug discovery pipelines",
  "The potential of vertical farming in urban areas",
  "Recent discoveries in exoplanet atmospheric composition",
  "Challenges of long-duration space travel for human health",
  "The role of mycelium in sustainable material science",

  // Technology & AI
  "The evolution of transformer architectures in LLMs",
  "Security risks in autonomous multi-agent systems",
  "Developments in quantum cryptography and post-quantum security",
  "How 6G networks will differ from current 5G standards",
  "The current state of humanoid robotics in manufacturing",
  "Ethical implications of AI-driven deepfakes",
  "The integration of edge computing in smart cities",
  "Advancements in brain-computer interface (BCI) technology",
  "How decentralized finance (DeFi) protocols impact traditional banking",
  "The role of digital twins in industrial infrastructure management",

  // History & Society
  "The influence of the Silk Road on cultural exchange",
  "Key socioeconomic factors behind the Industrial Revolution",
  "The impact of the Printing Press on the Reformation",
  "Comparative analysis of the fall of the Roman and Mayan empires",
  "The development of early maritime trade routes in the Indian Ocean",
  "Lessons from the 1918 pandemic for modern public health",
  "The history of architectural innovation in the Islamic Golden Age",
  "Socio-political consequences of the invention of the steam engine",
  "The role of ancient irrigation systems in Mesopotamian agriculture",
  "Origins and evolution of democratic systems in ancient Greece",

  // Business & Economics
  "The impact of remote work on commercial real estate trends",
  "How supply chain automation affects global trade margins",
  "Strategies for scaling startups in volatile economic climates",
  "The rise of the creator economy and its impact on traditional media",
  "The effectiveness of circular economy business models",
  "How behavioral economics influences modern consumer marketing",
  "Global trends in renewable energy investment by private equity",
  "The challenges of regulatory frameworks for emerging AI startups",
  "Impact of demographic shifts on pension systems in developed nations",
  "How hyper-personalization is reshaping e-commerce loyalty",

  // Philosophy & Future Trends
  "The ethics of human enhancement and transhumanism",
  "Impact of universal basic income (UBI) on workforce productivity",
  "The role of human-AI collaboration in creative arts",
  "Philosophical implications of machine consciousness",
  "The future of privacy in an era of ubiquitous surveillance",
  "How to design AI agents that align with human values",
  "The impact of space mining on international law and economy",
  "Sustainable development goals for a population of 10 billion",
  "The potential for AI to resolve complex social dilemmas",
  "Comparing Eastern and Western philosophical approaches to technology"
];

export const SUGGESTIONS = [...ALL_SUGGESTIONS].sort(() => Math.random() - 0.5).slice(0, 2);
//  [
//   "New advances in nuclear fusion",
//   "History of the Ottoman Empire",
//   "Latest updates in React 19",
// ];
