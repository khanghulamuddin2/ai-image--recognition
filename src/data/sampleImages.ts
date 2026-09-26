import { SampleImage } from "../types/vision";

export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: "sample_traffic",
    title: "Urban Traffic & Vehicles",
    category: "Vehicles / Urban",
    url: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80",
    description: "Multi-vehicle road junction with cars, street infrastructure, and asphalt roadway.",
  },
  {
    id: "sample_pedestrians",
    title: "Busy City Plaza",
    category: "People / Crowd",
    url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80",
    description: "Pedestrians walking across a modern cityscape with backpacks and urban architecture.",
  },
  {
    id: "sample_wildlife",
    title: "Wildlife Animals",
    category: "Animals / Nature",
    url: "https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=1200&q=80",
    description: "Lion in wild savanna grass habitat with high visual detail and natural lighting.",
  },
  {
    id: "sample_office",
    title: "Tech Office Workspace",
    category: "Indoor / Tech",
    url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    description: "Corporate workspace with office chairs, computers, tables, and architectural interior.",
  },
  {
    id: "sample_pets",
    title: "Golden Retriever Dog",
    category: "Animals / Domestic",
    url: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1200&q=80",
    description: "Golden retriever dog outdoors in green grass with natural lighting and clear posture.",
  },
  {
    id: "sample_food",
    title: "Culinary Dining Table",
    category: "Food / Objects",
    url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
    description: "Restaurant dining setting with assorted gourmet dishes, glassware, plates, and utensils.",
  },
];

export const CATEGORY_COLORS: Record<string, { border: string; bg: string; text: string; hex: string }> = {
  Person: {
    border: "border-emerald-400",
    bg: "bg-emerald-500/20",
    text: "text-emerald-400",
    hex: "#10b981",
  },
  Vehicle: {
    border: "border-cyan-400",
    bg: "bg-cyan-500/20",
    text: "text-cyan-400",
    hex: "#06b6d4",
  },
  Animal: {
    border: "border-amber-400",
    bg: "bg-amber-500/20",
    text: "text-amber-400",
    hex: "#f59e0b",
  },
  Electronics: {
    border: "border-purple-400",
    bg: "bg-purple-500/20",
    text: "text-purple-400",
    hex: "#a855f7",
  },
  Furniture: {
    border: "border-blue-400",
    bg: "bg-blue-500/20",
    text: "text-blue-400",
    hex: "#3b82f6",
  },
  Clothing: {
    border: "border-pink-400",
    bg: "bg-pink-500/20",
    text: "text-pink-400",
    hex: "#ec4899",
  },
  "Outdoor/Nature": {
    border: "border-lime-400",
    bg: "bg-lime-500/20",
    text: "text-lime-400",
    hex: "#84cc16",
  },
  "Food & Drink": {
    border: "border-orange-400",
    bg: "bg-orange-500/20",
    text: "text-orange-400",
    hex: "#f97316",
  },
  Architecture: {
    border: "border-indigo-400",
    bg: "bg-indigo-500/20",
    text: "text-indigo-400",
    hex: "#6366f1",
  },
  Item: {
    border: "border-teal-400",
    bg: "bg-teal-500/20",
    text: "text-teal-400",
    hex: "#14b8a6",
  },
};

export function getCategoryStyle(category: string) {
  return (
    CATEGORY_COLORS[category] || {
      border: "border-cyan-400",
      bg: "bg-cyan-500/20",
      text: "text-cyan-400",
      hex: "#06b6d4",
    }
  );
}
