import React, { ReactNode } from "react";

interface LinkEmbedProps {
  url: string;
  title: string;
  description: string;
  image: string;
  themeColor: string;
  favicon: string;
}

const LinkEmbed: React.FC<LinkEmbedProps> = ({
  url,
  title,
  description,
  image,
  themeColor,
  favicon
}) => {
  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-muted bg-card p-4 pl-5 lg:p-6 lg:pl-7">
      <div
        className={`absolute left-0 top-0 h-full w-1`}
        style={{ backgroundColor: `${themeColor}` }}
      ></div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 hover:underline"
      >
        {/* {favicon !== "" && (
          <img src={favicon} alt={`Favicon for ${title}`} className="h-6 w-6" />
        )} */}
        <p className="text-base font-bold md:text-lg">{title}</p>
      </a>
      <p className="text-xs text-foreground/80 md:text-sm">{description}</p>
      <img
        src={image}
        alt={`Link Preview Image for ${title}`}
        className="mt-2 h-auto w-full select-none rounded-lg object-cover"
        draggable={false}
      />
    </div>
  );
};

export default LinkEmbed;
