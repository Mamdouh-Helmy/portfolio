import { GithubLogo, LinkedinLogo, InstagramLogo, DribbbleLogo, BehanceLogo } from "@phosphor-icons/react/dist/ssr";

const map = {
  github: GithubLogo,
  linkedin: LinkedinLogo,
  instagram: InstagramLogo,
  dribbble: DribbbleLogo,
  behance: BehanceLogo,
} as const;

export function SocialIcon({ id, size = 18 }: { id: string; size?: number }) {
  const Icon = map[id as keyof typeof map];
  return Icon ? <Icon size={size} weight="fill" /> : null;
}