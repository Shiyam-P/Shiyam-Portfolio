import type { CSSProperties, ImgHTMLAttributes } from "react";

/**
 * Official technology icon filenames under /public/icons/technologies/
 * (served as /icons/technologies/* in Next.js).
 */
export const TECH_ICON_MAP = {
  javascript: { file: "javascript.svg", label: "JavaScript" },
  typescript: { file: "typescript.svg", label: "TypeScript" },
  react: { file: "react.svg", label: "React.js" },
  nextjs: { file: "nextjs.svg", label: "Next.js" },
  nodejs: { file: "nodejs.svg", label: "Node.js" },
  express: { file: "express.svg", label: "Express.js" },
  html5: { file: "html5.svg", label: "HTML5" },
  css3: { file: "css3.svg", label: "CSS3" },
  tailwindcss: { file: "tailwindcss.svg", label: "Tailwind CSS" },
  postgresql: { file: "postgresql.svg", label: "PostgreSQL" },
  mysql: { file: "mysql.svg", label: "MySQL" },
  mongodb: { file: "mongodb.svg", label: "MongoDB" },
  prisma: { file: "prisma.svg", label: "Prisma" },
  git: { file: "git.svg", label: "Git" },
  github: { file: "github.svg", label: "GitHub" },
  docker: { file: "docker.svg", label: "Docker" },
} as const;

export type TechIconName = keyof typeof TECH_ICON_MAP;

const ALIASES: Record<string, TechIconName> = {
  js: "javascript",
  ts: "typescript",
  "react.js": "react",
  reactjs: "react",
  "next.js": "nextjs",
  next: "nextjs",
  "node.js": "nodejs",
  node: "nodejs",
  "express.js": "express",
  html: "html5",
  css: "css3",
  tailwind: "tailwindcss",
  "tailwind css": "tailwindcss",
  postgres: "postgresql",
  mongo: "mongodb",
  "mongo db": "mongodb",
};

export function resolveTechName(name: string): TechIconName | null {
  const key = name.trim().toLowerCase();
  if (key in TECH_ICON_MAP) return key as TechIconName;
  if (key in ALIASES) return ALIASES[key];
  const compact = key.replace(/[\s._-]+/g, "");
  for (const [alias, slug] of Object.entries(ALIASES)) {
    if (alias.replace(/[\s._-]+/g, "") === compact) return slug;
  }
  return null;
}

export type TechIconProps = {
  /** Technology key or friendly name (e.g. "react", "React.js", "next.js") */
  name: TechIconName | string;
  /** Accessible label; defaults to the official technology name */
  label?: string;
  /** Icon size in px (number) or any CSS size string. Default: 32 */
  size?: number | string;
  className?: string;
  /** When true, hides from assistive tech (use when a visible text label exists nearby) */
  decorative?: boolean;
  /**
   * Public icon base path.
   * Next.js: "/icons/technologies"
   * Static HTML from repo root: "public/icons/technologies"
   */
  basePath?: string;
} & Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt" | "children" | "width" | "height">;

/**
 * Reusable technology logo for dark UIs.
 * Loads official SVG marks as images (transparent bg, no frames/borders).
 */
export function TechIcon({
  name,
  label,
  size = 32,
  className = "",
  decorative = false,
  basePath = "/icons/technologies",
  style,
  ...rest
}: TechIconProps) {
  const slug = resolveTechName(String(name));
  const meta = slug ? TECH_ICON_MAP[slug] : null;
  const file =
    meta?.file ??
    `${String(name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")}.svg`;
  const ariaLabel = label ?? meta?.label ?? String(name);
  const src = `${basePath.replace(/\/$/, "")}/${file}`;

  const dimension = typeof size === "number" ? size : undefined;
  const iconStyle: CSSProperties = {
    display: "inline-block",
    flexShrink: 0,
    width: typeof size === "number" ? `${size}px` : size,
    height: typeof size === "number" ? `${size}px` : size,
    objectFit: "contain",
    ...style,
  };

  return (
    <img
      src={src}
      alt={decorative ? "" : ariaLabel}
      aria-hidden={decorative ? true : undefined}
      width={dimension}
      height={dimension}
      className={["tech-icon", className].filter(Boolean).join(" ")}
      style={iconStyle}
      decoding="async"
      {...rest}
    />
  );
}

export default TechIcon;
