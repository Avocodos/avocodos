"use client";
import React from "react";
import reactElementToJSXString from "react-element-to-jsx-string";

export const buttons = [
  {
    name: "Sketch",
    description: "Sketch button for your website",

    component: (
      <button className="rounded-md border border-black bg-white px-4 py-2 text-sm text-black transition duration-200 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)]">
        Sketch
      </button>
    )
  },
  {
    name: "Simple",
    description: "Elegant button for your website",
    component: (
      <button className="transform rounded-md border border-neutral-300 bg-neutral-100 px-4 py-2 text-sm text-neutral-500 transition duration-200 hover:-translate-y-1 hover:shadow-md">
        Simple
      </button>
    )
  },
  {
    name: "Invert",
    description: "Simple button that inverts on hover",
    component: (
      <button className="rounded-md border-2 border-transparent bg-teal-500 px-8 py-2 font-bold text-white transition duration-200 hover:border-teal-500 hover:bg-white hover:text-black">
        Invert it
      </button>
    )
  },
  {
    name: "Tailwindcss Connect",
    description: "Button featured on Tailwindcss Connect website",
    showDot: false,
    component: (
      <button className="group relative inline-block cursor-pointer rounded-full bg-slate-800 p-px text-xs font-semibold leading-6 text-white no-underline shadow-2xl shadow-zinc-900">
        <span className="absolute inset-0 overflow-hidden rounded-full">
          <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>
        </span>
        <div className="relative z-10 flex items-center space-x-2 rounded-full bg-zinc-950 px-4 py-0.5 ring-1 ring-white/10">
          <span>{`Tailwind Connect`}</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M10.75 8.75L14.25 12L10.75 15.25"
            ></path>
          </svg>
        </div>
        <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40"></span>
      </button>
    )
  },
  {
    name: "Gradient",
    description: "Simple Gradient button with rounded corners",
    component: (
      <button className="rounded-full bg-gradient-to-b from-blue-500 to-blue-600 px-8 py-2 text-white transition duration-200 hover:shadow-xl focus:ring-2 focus:ring-blue-400">
        Gradient
      </button>
    )
  },
  {
    name: "Unapologetic",
    description: "Unapologetic button with perfect corners",
    component: (
      <button className="group relative border border-black bg-transparent px-8 py-2 text-black transition duration-200 dark:border-white">
        <div className="absolute -bottom-2 -right-2 -z-10 h-full w-full bg-yellow-300 transition-all duration-200 group-hover:bottom-0 group-hover:right-0" />
        <span className="relative">Unapologetic</span>
      </button>
    )
  },
  {
    name: "Lit up borders",
    description: "Gradient button with perfect corners",
    component: (
      <button className="relative p-[3px]">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500" />
        <div className="group relative rounded-[6px] bg-black px-8 py-2 text-white transition duration-200 hover:bg-transparent">
          Lit up borders
        </div>
      </button>
    )
  },
  {
    name: "Border Magic",
    description: "Border Magic button for your website",
    showDot: false,
    component: (
      <button className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
          Border Magic
        </span>
      </button>
    )
  },

  {
    name: "Brutal",
    description: "Brutal button for your website",
    component: (
      <button className="border-2 border-black bg-white px-8 py-0.5 text-sm uppercase text-black shadow-[1px_1px_rgba(0,0,0),2px_2px_rgba(0,0,0),3px_3px_rgba(0,0,0),4px_4px_rgba(0,0,0),5px_5px_0px_0px_rgba(0,0,0)] transition duration-200 dark:border-white dark:shadow-[1px_1px_rgba(255,255,255),2px_2px_rgba(255,255,255),3px_3px_rgba(255,255,255),4px_4px_rgba(255,255,255),5px_5px_0px_0px_rgba(255,255,255)]">
        Brutal
      </button>
    )
  },
  {
    name: "Favourite",
    description: "Favourite button for your website",
    component: (
      <button className="rounded-md bg-black px-8 py-2 text-sm font-semibold text-white hover:bg-black/[0.8] hover:shadow-lg">
        Favourite
      </button>
    )
  },
  {
    name: "Outline",
    description: "Outline button for your website",
    component: (
      <button className="rounded-xl border border-neutral-600 bg-white px-4 py-2 text-black transition duration-200 hover:bg-gray-100">
        Outline
      </button>
    )
  },
  {
    name: "Shimmer",
    description: "Shimmer button for your website",
    showDot: false,
    component: (
      <button className="animate-shimmer inline-flex h-12 items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
        Shimmer
      </button>
    ),
    code: `
        // Button code
        <button className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
          Shimmer
        </button>
  
        // tailwind.config.js code
        {
          "animation": {
            shimmer: "shimmer 2s linear infinite"
          },
          "keyframes": {
            shimmer: {
              from: {
                "backgroundPosition": "0 0"
              },
              to: {
                "backgroundPosition": "-200% 0"
              }
            }
          }
        }
      `
  },
  {
    name: "Next.js Blue",
    description: "Next.js Blue button for your website",
    component: (
      <button className="rounded-md bg-[#0070f3] px-8 py-2 font-light text-white shadow-[0_4px_14px_0_rgb(0,118,255,39%)] transition duration-200 ease-linear hover:bg-[rgba(0,118,255,0.9)] hover:shadow-[0_6px_20px_rgba(0,118,255,23%)]">
        Next.js Blue
      </button>
    )
  },
  {
    name: "Next.js White",
    description: "Next.js White button for your website",
    component: (
      <button className="rounded-md bg-[#fff] px-8 py-2 font-light text-[#696969] shadow-[0_4px_14px_0_rgb(0,0,0,10%)] transition duration-200 ease-linear hover:shadow-[0_6px_20px_rgba(93,93,93,23%)]">
        Next White
      </button>
    )
  },
  {
    name: "Spotify",
    description: "Spotify button for your website",
    component: (
      <button className="transform rounded-full bg-[#1ED760] px-12 py-4 font-bold uppercase tracking-widest text-white transition-colors duration-200 hover:scale-105 hover:bg-[#21e065]">
        Spotify
      </button>
    )
  },
  {
    name: "Backdrop Blur",
    description: "Outline button for your website",
    showDot: false,
    component: (
      <button className="rounded-md border border-black bg-white/[0.2] px-4 py-2 text-sm text-black backdrop-blur-sm transition duration-200 hover:shadow-[0px_0px_4px_4px_rgba(0,0,0,0.1)]">
        Backdrop blur
      </button>
    )
  },
  {
    name: "Playlist",
    description: "Playlist button for your website",
    component: (
      <button className="rounded-full bg-transparent px-12 py-4 font-bold uppercase tracking-widest text-black shadow-[inset_0_0_0_2px_#616467] transition duration-200 hover:bg-[#616467] hover:text-white dark:text-neutral-200">
        Playlist
      </button>
    )
  },
  {
    name: "Figma",
    description: "Figma button for your website",
    component: (
      <button className="duration-400 transform rounded-lg bg-black px-6 py-2 font-bold text-white transition hover:-translate-y-1">
        Figma
      </button>
    )
  },
  {
    name: "Figma Outline",
    description: "Figma Outline button for your website",
    component: (
      <button className="duration-400 transform rounded-lg border border-black bg-transparent px-6 py-2 font-bold text-black shadow-[0_0_0_3px_#000000_inset] transition hover:-translate-y-1 dark:border-white dark:text-white">
        Figma Outline
      </button>
    )
  },
  {
    name: "Top Gradient",
    description: "Top Gradient button for your website",
    showDot: false,
    component: (
      <button className="relative rounded-full border border-slate-600 bg-slate-700 px-8 py-2 text-sm text-white transition duration-200 hover:shadow-2xl hover:shadow-white/[0.1]">
        <div className="absolute inset-x-0 -top-px mx-auto h-px w-1/2 bg-gradient-to-r from-transparent via-teal-500 to-transparent shadow-2xl" />
        <span className="relative z-20">Top gradient</span>
      </button>
    )
  }
];
