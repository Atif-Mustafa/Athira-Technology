"use client";

import { motion, type HTMLMotionProps, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

interface StaggerContainerProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  delayChildren?: number;
  staggerChildren?: number;
}

export function StaggerContainer({ children, className, delayChildren = 0, staggerChildren = 0.1, ...props }: StaggerContainerProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={false}
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: prefersReducedMotion ? 0 : staggerChildren,
            delayChildren: prefersReducedMotion ? 0 : delayChildren,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, ...props }: HTMLMotionProps<"div">) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: prefersReducedMotion ? 0 : 0.5 } },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
