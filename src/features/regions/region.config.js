import { toTitle } from "../../lib/formatters";

const regionProfiles = {
  africa: {
    title: "Africa",
    headline: "Continental-scale discovery with warm belts, coasts, and fast-shifting urban centers.",
    description:
      "Africa works well as a high-contrast region hub because it combines large population centers, broad climate variety, and strong neighboring-country context.",
    tags: ["Continental scale", "Warm-season edge", "Capital diversity"],
  },
  americas: {
    title: "Americas",
    headline: "A north-to-south desk spanning megacities, tropical corridors, and coastal climates.",
    description:
      "The Americas hub lets the product show very different travel signals inside one regional surface, from cold-air systems to tropical windows.",
    tags: ["North-south span", "Coastal signal", "Climate range"],
  },
  asia: {
    title: "Asia",
    headline: "Dense population, broad geography, and one of the richest climate mixes in the atlas.",
    description:
      "Asia is ideal for a deep regional route because the scale, density, and climate variation make rankings and collections feel meaningful very quickly.",
    tags: ["Mega-population", "Weather variety", "High-density capitals"],
  },
  europe: {
    title: "Europe",
    headline: "Compact distances, strong capital network effects, and highly comparable city signals.",
    description:
      "Europe makes the regional desk feel precise and readable, with many destinations close enough that climate and air conditions matter immediately.",
    tags: ["Compact network", "Capital-rich", "Fast compare"],
  },
  oceania: {
    title: "Oceania",
    headline: "Island-heavy discovery with marine relevance, coastal planning, and long-distance travel context.",
    description:
      "Oceania gives the product a more atmospheric regional surface, where distance, coastlines, and seasonality shape the narrative.",
    tags: ["Marine relevance", "Island spread", "Coastal planning"],
  },
  antarctic: {
    title: "Antarctic",
    headline: "A sparse, extreme region where climate context matters more than city-scale comparison.",
    description:
      "Antarctic behaves differently from the rest of the atlas, so the regional desk should focus on environmental context and scarcity.",
    tags: ["Extreme conditions", "Sparse network", "Environmental focus"],
  },
};

export function getRegionProfile(regionKey) {
  return (
    regionProfiles[regionKey] || {
      title: toTitle(regionKey),
      headline: `${toTitle(regionKey)} discovery hub`,
      description:
        "A regional desk that blends country context, climate signals, and editorial framing.",
      tags: ["Regional hub", "Live data", "Discovery surface"],
    }
  );
}
