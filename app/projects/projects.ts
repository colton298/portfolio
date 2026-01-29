//Embed iframe or link to page
export type ProjectAction =
  | {
      type: "iframe";
      src: string;
      height?: number;
    }
  | {
      type: "link";
      label: string;
      href: string;
      external?: boolean;
    };


export type Project = {
  title: string;
  role: string;
  date: string;
  description: string;
  technologies: string;
  action?: ProjectAction;
};

export const projects: Project[] = [
    {
        title: "Senior Design - LabScity", role: "Project Manager", date: "Fall 2025, Spring 2026", technologies: "Next.js, Supabase, Vercel",
        description: "Developing a social media website designed to help scientists and researchers collaborate." 
    },
    {
        title: "AI for Game Programming - Star Survivors", role: "Developer", date: "Fall 2025", technologies: "Unity, C#",
        description: "Worked with a team of 4 to develop a roguelike with special AI elements. (Need to add game page)",
        action : {
            type: "link",
            label: "Play or download it here",
            href: "/projects/StarSurvivors"
        }  
    },
    {
        title: "Database Systems - Waste Not Kitchen", role: "Developer", date: "Fall 2025", technologies: "SQL, PHP",
        description: "Worked with a team of 3 to develop a prototype charity website for food donations.",
        action: {
            type: "iframe",
            src: "https://docs.google.com/presentation/d/e/2PACX-1vRtlBKVdT2DLwQInIM2wCcGUQ5wLGlKEVd1X3yA_yvMoxAVgAokm5mw6KnFKY0fEU0sZSkx1NZao6az/pubembed?start=false&loop=false&delayms=3000",
            height: 300,
        }
    },
    {
        title: "Processes for Object Oriented Software Development - Jungle Contact Book", role: "Project Manager", date: "Summer 2025", technologies: "LAMP",
        description: "Our team developed a website that allows users to sign up, add contacts to a list with a variety of information, delete contacts, and edit them. I personally created the presentation for this project, setup the domain and initial website, developed meeting talking points, and created all the diagrams present in our presentation.",
        action: {
            type: "iframe",
            src: "https://docs.google.com/presentation/d/e/2PACX-1vQe-FPUfPq9du39R5POld1k7CDgKZ5SFg8W5DStlLoMts1FjHIUoVKhvgfBmtWToJZg402KCC6qkSOh/pubembed?start=false&loop=false&delayms=3000",
            height: 300,
        }
    },
    {
        title: "Processes for Object Oriented Software Development - Digital Wellness", role: "Project Manager", date: "Summer 2025", technologies: "MERN",
        description: "In this larger project, we developed a website and app where users can track their days by adding activities/timing them, rank themselves against other users with leaderboard/point systems, utilize email verification and forgot password security features.",
        action: {
            type: "iframe",
            src: "https://docs.google.com/presentation/d/e/2PACX-1vRc2JH0IYydreVK3HXYpAHFeJZrLzo-68lQkv5ctTzlgc4mf8ot4S6wKLjNESam4EWK9ZxEhiFRu8Wy/pubembed?start=false&loop=false&delayms=3000",
            height: 300,
        }
    },
    {
        title: "Wordle Solver", role: "Developer", date: "Summer 2025", technologies: "Typescript",
        description: "I play Wordle almost every day with my family, so I decided to make a solver hosted on this website. Unlike other solvers, this takes into account the placement of yellow letters to determine possible answers.",
        action : {
            type: "link",
            label: "Try it here",
            href: "/projects/wordle"
        } 
    },
    {
        title: "This Website!", role: "Developer", date: "Active", technologies: "React, Next.js, Typescript",
        description: "Coded this website from scratch. Source code is available on my github:",
        action : {
            type: "link",
            label: "Github",
            href: "https://www.github.com/colton298/portfolio",
            external: true
        }  
    }

    
];
