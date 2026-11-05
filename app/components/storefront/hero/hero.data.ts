export interface HeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  isActive?: boolean;
  sortOrder?: number;
}

const defaultHeroSlidesByLocale: Record<
  string,
  Omit<HeroSlide, "image" | "buttonLink" | "isActive" | "sortOrder">[]
> = {
  en: [
    {
      id: "01",
      eyebrow: "NEW COLLECTION 2026",
      title: "Discover Your Own Style.",
      description:
        "Explore our latest collection and find something that feels uniquely yours.",
      buttonText: "Shop Collection",
    },
    {
      id: "02",
      eyebrow: "EVERYDAY ESSENTIALS",
      title: "Simple Looks. Big Impact.",
      description:
        "Upgrade your everyday wardrobe with timeless pieces.",
      buttonText: "Explore Now",
    },
    {
      id: "03",
      eyebrow: "SPECIAL SELECTION",
      title: "Make Every Moment Count.",
      description:
        "Discover products selected to make your lifestyle better.",
      buttonText: "Discover More",
    },
  ],
  km: [
    {
      id: "01",
      eyebrow: "សុស្តធម្មនុញ្ញ 2026",
      title: "លើកស្រឡាញ់របស់អ្នកដោយផ្តាច់ផ្តាច់របស់អ្នក។",
      description:
        "រីករាយកសាងថ្មីបច្ចុប្បន្ននឹងរក្សាទុកមុខសម័យដែលមានអាចភ័ព្វរបស់អ្នក។",
      buttonText: "ទិញកសាងថ្មី",
    },
    {
      id: "02",
      eyebrow: "ឧបករណ៍ចូលរួមច្រើន",
      title: "របស់អ្នកឯងសម្រាប់អ្នករវល់ប៉ារ៉ាស់។",
      description:
        "ធ្វើឱ្យកសាងចម្រុះចូលរួមរបស់អ្នកដោយផលិតផលដើម្បីរហ័សដែលមានរយៈពេល។",
      buttonText: "រីករាយឥឡូវនេះ",
    },
    {
      id: "03",
      eyebrow: "ការជ្រើសរើសពិសេស",
      title: "ធ្វើឱ្យរបស់អ្នកមានអារម្មណ៍នៅពេលទាំងអស់។",
      description:
        "លើកស្រឡាញ់ផលិតផលដែលបានជ្រើសរើសដើម្បីធ្វើឱ្យមុខសម័យរបស់អ្នកល្អណាស់ឡើង។",
      buttonText: "លើកស្រឡាញ់ទាំងអស់",
    },
  ],
};

const defaultImages = [
  "https://res.cloudinary.com/dyojlvfew/image/upload/v1792589211/H62f4dd2d390b42879899e70c36652dbdQ-removebg-preview.png",
  "https://res.cloudinary.com/dyojlvfew/image/upload/v1792589246/light01-removebg-preview.png",
  "https://res.cloudinary.com/dyojlvfew/image/upload/v1792589242/3584d3647ffb296f35eaf354e1f2b980-removebg-preview.png",
];

export async function fetchHeroSlides(locale = "en"): Promise<HeroSlide[]> {
  try {
    const { api } = await import("@/app/lib/api");
    const response = await api.get("/hero-slides/active");
    const data = (await response) as { slides?: HeroSlide[] } | HeroSlide[];

    const slides = Array.isArray(data) ? data : data.slides ?? [];

    return slides.map((slide, index) => ({
      id: String(slide.id ?? index + 1),
      eyebrow: slide.eyebrow ?? "",
      title: slide.title ?? "",
      description: slide.description ?? "",
      image: slide.image ?? "",
      buttonText: slide.buttonText ?? "Shop Now",
      buttonLink: slide.buttonLink ?? "/products",
      isActive: slide.isActive ?? true,
      sortOrder: slide.sortOrder ?? index,
    }));
  } catch (error) {
    console.warn("Failed to fetch hero slides from API, using defaults:", error);

    const defaults = defaultHeroSlidesByLocale[locale] ?? defaultHeroSlidesByLocale["en"];

    return defaults.map((slide, index) => ({
      id: slide.id,
      eyebrow: slide.eyebrow,
      title: slide.title,
      description: slide.description,
      image: defaultImages[index] ?? defaultImages[0],
      buttonText: slide.buttonText,
      buttonLink: "/products",
      isActive: true,
      sortOrder: index,
    }));
  }
}
