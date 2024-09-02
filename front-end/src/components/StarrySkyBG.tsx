import React from "react";
import Image from "next/image";

export default function StarrySkyBG() {
  return (
    <React.Fragment>
      <Image
        src="/bg-dark.png"
        alt="background image avocodos"
        width={1920}
        height={1080}
        className="fixed inset-0 -z-10 h-full w-full object-cover mix-blend-screen [mask-image:linear-gradient(to_bottom,transparent_20%,black_100%)]"
      />
      <Image
        src="/bg-light.png"
        alt="background image avocodos"
        width={1920}
        height={1080}
        className="fixed inset-0 -z-10 h-full w-full object-cover mix-blend-multiply [mask-image:linear-gradient(to_bottom,transparent_20%,black_100%)]"
      />
    </React.Fragment>
  );
}
