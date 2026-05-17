export type ExperienceMedia =
  | {
      type: "image";
      src: string;
      alt: string;
    }
  | {
      type: "link";
      label: string;
      href: string;
      external?: boolean;
    }
  | {
      type: "iframe";
      src: string;
      title: string;
      height?: number;
    }
  | {
      type: "credly";
      shareBadgeId: string;
      host: string;
      title: string;
      width?: number;
      height?: number;
    };

export type ExperienceItem = {
  title: string;
  completed: string;
  description: string;
  tags: string[];
  media?: ExperienceMedia;
};

export const experienceItems: ExperienceItem[] = [
  {
    title: "Senior Design - LabScity",
    completed: "Fall 2025 - Spring 2026",
    description:
      "Project-managed a senior design team building a collaboration platform for scientists and researchers.",
    tags: ["Next.js", "Supabase", "Vercel", "Project Management"],
    media: {
      type: "iframe",
      src: "https://docs.google.com/presentation/d/e/2PACX-1vTLy6bh4Ag_aVAentpLrba7Hlni0oAtC_LLTqM2FdjhPQptgMg4Pqg3MsXxZjkm1L3I68tWkenJqLaX/pubembed?start=false&loop=false&delayms=3000",
      title: "LabScity presentation",
      height: 260,
    },
  },
  {
    title: "Topics in CyberSecurity - AWS Certification",
    completed: "Spring 2026",
    description:
      "Gained experience in AWS through a course at UCF and earned a badge: AWS Academy Graduate - Cloud Security Foundations - Training.",
    tags: ["AWS"],
    media: {
      type: "credly",
      shareBadgeId: "11e05f73-0b6e-48e4-9ddf-b8fe6d4c8cfb",
      host: "https://www.credly.com",
      title: "AWS Academy Graduate - Cloud Security Foundations - Training",
      width: 400,
      height: 275,
    },
  },
  {
    title: "Programming Languages",
    completed: "Spring 2026",
    description:
      "Gained experience in multiple programming languages, earning an A in the course.",
    tags: ["C++", "JavaScript", "Python", "Haskell"],
  },
  {
    title: "AI for Game Programming - Star Survivors",
    completed: "Fall 2025",
    description:
      "Built a Unity roguelike with a four-person team, including AI-driven gameplay systems and a playable web build.",
    tags: ["Unity", "C#", "Game AI", "Team Project"],
    media: {
      type: "link",
      label: "Play or download here",
      href: "/projects/StarSurvivors",
      external: false,
    },
  },
  {
    title: "Database Systems - Waste Not Kitchen",
    completed: "Fall 2025",
    description:
      "Developed a prototype charity platform for food donations with a small team for a database systems course.",
    tags: ["SQL", "PHP", "Databases", ],
  },
  {
    title: "Wordle Solver",
    completed: "Summer 2025",
    description:
      "Created a TypeScript solver that filters possible answers while accounting for exact placement rules and yellow-letter constraints.",
    tags: ["TypeScript", "Algorithms", "Next.js", "Word Games"],
    media: {
      type: "link",
      label: "Use it here",
      href: "/projects/wordle",
      external: false,
    },
  },
  {
    title: "Processes for Object Oriented Programming - Jungle Contact Book",
    completed: "Summer 2025",
    description:
      "Led setup, planning, and presentation work for a contact-management website with sign-up, edit, delete, and contact-list workflows.",
    tags: ["LAMP Stack - Linux, Apache, MySQL, PHP", "Leadership Position"],
    media: {
      type: "iframe",
      src: "https://docs.google.com/presentation/d/e/2PACX-1vQe-FPUfPq9du39R5POld1k7CDgKZ5SFg8W5DStlLoMts1FjHIUoVKhvgfBmtWToJZg402KCC6qkSOh/pubembed?start=false&loop=false&delayms=3000",
      title: "Jungle Contact Book Slides",
      height: 260,
    },
  },
  {
    title: "Processes for Object Oriented Programming - Digital Wellness",
    completed: "Summer 2025",
    description:
      "Helped lead a larger MERN project with activity tracking, timers, leaderboards, email verification, and password recovery.",
    tags: ["MERN Stack - MongoDB, Express.js, React, Node.js", "Leadership Position"],
    media: {
      type: "iframe",
      src: "https://docs.google.com/presentation/d/e/2PACX-1vRc2JH0IYydreVK3HXYpAHFeJZrLzo-68lQkv5ctTzlgc4mf8ot4S6wKLjNESam4EWK9ZxEhiFRu8Wy/pubembed?start=false&loop=false&delayms=3000",
      title: "Digital Wellness Slides",
      height: 260,
    },
  },
  {
    title: "UCF Computer Science Foundation Exam",
    completed: "August 2024",
    description:
      "Scored 80% on the August 2024 exam, proving my core fundamentals in algorithms and data structures",
    tags: ["Algorithms", "Data Structures", "C", "UCF"],
  },
  {
    title: "Codecraft Foundation Fundraiser",
    completed: "2022",
    description:
      "My high school senior project. A fundraiser focused on helping others discover computer science and programming.",
    tags: ["Programming Education", "Fundraising"],
  },
  {
    title: "Portfolio Website",
    completed: "Active",
    description:
      "This website!",
    tags: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
    media: {
      type: "link",
      label: "View source code",
      href: "https://www.github.com/colton298/portfolio",
      external: true,
    },
  },
];
