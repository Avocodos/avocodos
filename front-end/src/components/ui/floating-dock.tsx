/**
 * Note: Use position fixed according to your needs
 * Desktop navbar is better positioned at the bottom
 * Mobile navbar is better positioned at bottom right.
 **/
import React from "react";
import { cn } from "../../lib/utils";
import { MenuIcon } from "lucide-react";

import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform
} from "framer-motion";
import Link from "next/link";
import { useRef, useState } from "react";

export const FloatingDock = ({
  items,
  desktopClassName,
  mobileClassName,
  onSelect
}: {
  items: { title: string; icon: string }[];
  desktopClassName?: string;
  mobileClassName?: string;
  onSelect: (title: string) => void;
}) => {
  return (
    <>
      <FloatingDockDesktop
        items={items}
        className={desktopClassName}
        onSelect={onSelect}
      />
    </>
  );
};

const FloatingDockMobile = ({
  items,
  className,
  onSelect
}: {
  items: { title: string; icon: string }[];
  className?: string;
  onSelect: (title: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("relative block md:hidden", className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav"
            className="absolute inset-x-0 bottom-full mb-2 flex flex-col gap-2"
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  transition: {
                    delay: idx * 0.05
                  }
                }}
                transition={{ delay: (items.length - 1 - idx) * 0.05 }}
              >
                <div
                  key={item.title}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 dark:bg-neutral-900"
                >
                  <div className="h-4 w-4">{item.icon}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        className="flex size-6 items-center justify-center rounded-full bg-gray-50 dark:bg-neutral-800"
      >
        <MenuIcon className="size-3 text-neutral-500 dark:text-neutral-400" />
      </button>
    </div>
  );
};

const FloatingDockDesktop = ({
  items,
  className,
  onSelect
}: {
  items: { title: string; icon: string }[];
  className?: string;
  onSelect: (title: string) => void;
}) => {
  let mouseX = useMotionValue(Infinity);
  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto flex h-12 items-end gap-4 rounded-2xl bg-gray-50 px-4 pb-3 dark:bg-neutral-900 z-[199]",
        className
      )}
    >
      {items.map((item) => (
        <IconContainer
          onSelect={onSelect}
          mouseX={mouseX}
          key={item.title}
          {...item}
        />
      ))}
    </motion.div>
  );
};

function IconContainer({
  mouseX,
  title,
  icon,
  onSelect
}: {
  mouseX: MotionValue;
  title: string;
  icon: string;
  onSelect: (title: string) => void;
}) {
  let ref = useRef<HTMLDivElement>(null);

  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };

    return val - bounds.x - bounds.width / 2;
  });

  let widthTransform = useTransform(distance, [-60, 0, 60], [20, 40, 20]);
  let heightTransform = useTransform(distance, [-60, 0, 60], [20, 40, 20]);

  let widthTransformIcon = useTransform(distance, [-60, 0, 60], [10, 20, 10]);
  let heightTransformIcon = useTransform(distance, [-60, 0, 60], [10, 20, 10]);

  let width = useSpring(widthTransform, {
    mass: 0.05,
    stiffness: 100,
    damping: 12
  });
  let height = useSpring(heightTransform, {
    mass: 0.05,
    stiffness: 100,
    damping: 12
  });

  let widthIcon = useSpring(widthTransformIcon, {
    mass: 0.05,
    stiffness: 100,
    damping: 12
  });
  let heightIcon = useSpring(heightTransformIcon, {
    mass: 0.05,
    stiffness: 100,
    damping: 12
  });

  const [hovered, setHovered] = useState(false);

  return (
    <div onClick={() => onSelect(icon)} className="cursor-pointer z-[198]">
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex aspect-square items-center justify-center rounded-full bg-gray-200 dark:bg-neutral-800 z-[197]"
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="absolute -top-8 left-1/2 w-fit -translate-x-1/2 whitespace-pre rounded-md border border-gray-200 bg-gray-100 px-0.5 py-0 text-xs text-neutral-700 dark:border-neutral-900 dark:bg-neutral-800 dark:text-white z-[196]"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center z-[195]"
        >
          {icon}
        </motion.div>
      </motion.div>
    </div>
  );
}
