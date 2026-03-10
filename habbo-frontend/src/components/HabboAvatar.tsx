interface HabboAvatarProps {
  look: string;
  size?: "small" | "medium" | "large";
  direction?: number;
  className?: string;
}

export function HabboAvatar({ look, size = "medium", direction = 2, className = "" }: HabboAvatarProps) {
  const sizeMap = { small: "s", medium: "m", large: "l" };
  const pixelSize = { small: 36, medium: 64, large: 110 };
  const s = sizeMap[size];
  const url = `https://www.habbo.com/habbo-imaging/avatarimage?figure=${look}&direction=${direction}&head_direction=${direction}&size=${s}&gesture=sml`;

  return (
    <img
      src={url}
      alt="Habbo Avatar"
      width={pixelSize[size]}
      height={pixelSize[size]}
      className={`pixelated ${className}`}
      style={{ imageRendering: "pixelated" }}
      onError={(e) => {
        (e.target as HTMLImageElement).src = `https://www.habbo.com/habbo-imaging/avatarimage?figure=hr-115-42.hd-195-19.ch-3030-82.lg-275-1408&direction=${direction}&head_direction=${direction}&size=${s}&gesture=sml`;
      }}
    />
  );
}
