"use client";
import React from "react";
import Spline from "@splinetool/react-spline";
import Image from "next/image";
import Link from "next/link";
import { CheckCheck, LucideIcon } from "lucide-react";
import { ReactElement } from "react";
import { useEffect } from "react";

const infoCards = [
  {
    id: 1,
    title: "Card 1",
    icon: CheckCheck,
    bodyText: "This is the body text for card 1"
  },
  {
    id: 2,
    title: "Card 2",
    icon: CheckCheck,
    bodyText: "This is the body text for card 2"
  },
  {
    id: 3,
    title: "Card 3",
    icon: CheckCheck,
    bodyText: "This is the body text for card 3"
  }
];

export default function LandingPage() {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "module";
    script.src =
      "https://unpkg.com/@splinetool/viewer@1.9.20/build/spline-viewer.js";
    document.body.appendChild(script);
  }, []);
  return (
    <main className="relative flex h-fit min-h-screen flex-col items-center justify-center">
      <Navbar />
      <header
        id="home"
        className="relative flex h-screen w-full max-w-7xl flex-col-reverse items-center justify-center overflow-x-hidden p-8 md:flex-row"
      >
        <div className="flex h-2/4 w-full flex-col items-center justify-center gap-8 md:h-full md:w-2/5 md:items-start">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-black md:text-8xl">Avocodos</h1>
            <h2 className="text-md md:text-2xl">Start growing today!</h2>
          </div>
          <p className="max-w-md text-sm text-zinc-500 md:text-base">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Eveniet
            optio aliquid repudiandae eligendi earum hic consectetur!
            Voluptatibus, eum dignissimos ea a
          </p>
          <div className="flex w-full items-center justify-center gap-4 md:justify-start">
            <button className="h-12 w-48 rounded bg-white text-sm text-black transition-colors hover:bg-green-700 hover:text-white sm:text-base">
              Explore!
            </button>
            <button className="h-12 w-48 rounded text-sm transition-colors hover:bg-white hover:bg-opacity-5 hover:text-white sm:text-base">
              Connect
            </button>
          </div>
        </div>

        <div className="relative -z-10 flex h-4/5 w-full items-center justify-center md:h-full md:w-5/6">
          <Spline
            className=""
            scene="https://prod.spline.design/eQKMhU-5qKLyMUMX/scene.splinecode"
          />
        </div>
      </header>

      <section
        id="about"
        className="relative flex h-fit min-h-screen w-full items-center justify-center p-8"
      >
        <div className="absolute -z-10 h-full w-full overflow-hidden">
          <Image
            src="/whirl.svg"
            fill
            className="absolute w-full overflow-visible object-cover sm:rotate-90"
            alt="Background Whirl"
          />
        </div>
        <div className="flex h-full w-full max-w-7xl flex-col items-center justify-center gap-8">
          <h3 className="text-4xl font-bold md:text-5xl">
            {" "}
            Lorem ipsum dolor sit{" "}
          </h3>
          <div className="relative grid w-full grid-cols-1 grid-rows-3 justify-between gap-4 md:grid-cols-2 md:grid-rows-2 lg:grid-cols-3 lg:grid-rows-1">
            {infoCards.map((infoCard) => {
              return (
                <InfoCard
                  key={infoCard.id}
                  Icon={infoCard.icon}
                  title={infoCard.title}
                >
                  <p className="text-center text-sm sm:text-base md:text-left">
                    {infoCard.bodyText}
                  </p>
                </InfoCard>
              );
            })}
          </div>
        </div>
      </section>
      <footer className="relative h-screen w-full overflow-hidden">
        <div className="relative z-10 p-8 text-center text-white">
          <h2 className="mb-4 text-2xl font-bold md:text-4xl">Footer Title</h2>
          <p className="z-10 text-lg md:text-xl">
            Footer content goes here. Add links or any other information.
          </p>
        </div>
      </footer>
    </main>
  );
}

interface IInfoCardProps {
  title: string;
  Icon: LucideIcon;
  children: ReactElement<any, any>;
}

function InfoCard({ title, Icon, children }: IInfoCardProps) {
  return (
    <div className="flex h-80 w-full flex-col items-center justify-around rounded bg-gray-900 bg-opacity-20 bg-clip-padding p-8 backdrop-blur-xl backdrop-filter">
      <div className="rounded-full bg-green-700 p-4">
        <Icon />
      </div>
      <div>
        <h3 className="text-lg font-bold sm:text-xl">{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Navbar() {
  return (
    <div className="fixed top-3 z-50 flex h-16 w-11/12 items-center justify-center rounded-xl border-gray-200 bg-white bg-opacity-20 backdrop-blur-xl backdrop-filter">
      <div className="flex w-full max-w-7xl items-center justify-between p-4">
        <h6 className="font-bold">Avocodos</h6>
        <ul className="flex gap-8">
          <li>
            <Link
              className="text-xs transition-colors hover:text-green-500 sm:text-base"
              href="#home"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              className="text-xs transition-colors hover:text-green-500 sm:text-base"
              href="#about"
            >
              About
            </Link>
          </li>
          <li>
            <Link
              className="text-xs transition-colors hover:text-green-500 sm:text-base"
              href="#signup"
            >
              Sign Up
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
