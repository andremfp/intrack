"use client";

import { motion } from "motion/react";
import { useResolvedTheme } from "@/hooks/theme/use-resolved-theme";
import { FlipWords } from "@/components/ui/flip-words";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function HeroSection() {
  const resolvedTheme = useResolvedTheme();
  const illustrationSrc =
    resolvedTheme === "dark"
      ? "/consultations-dark.png"
      : "/consultations-light.png";
  const heroMetrics = ["métricas", "relatórios"];
  const staticHeroWords = ["Regista", "consultas,", "gera"];
  return (
    <section className="relative w-full py-10 md:py-20">
      <div className="mx-auto flex w-full flex-col items-center justify-center gap-10 px-4 md:px-0">
        <h1 className="relative mx-auto w-full max-w-4xl text-center text-5xl font-bold text-slate-700 sm:text-5xl md:text-5xl lg:text-6xl xl:text-7xl dark:text-slate-300">
          <div className="flex flex-col items-center justify-center gap-2">
            <span className="inline-flex flex-wrap items-center justify-center gap-2">
              {staticHeroWords.map((word, index) => (
                <motion.span
                  key={`${word}-${index}`}
                  initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.1,
                    ease: "easeInOut",
                  }}
                  className="inline-block"
                >
                  {word}
                </motion.span>
              ))}
            </span>
            <motion.div
              initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{
                duration: 0.3,
                delay: 0.3,
                ease: "easeInOut",
              }}
            >
              <FlipWords
                words={heroMetrics}
                duration={3000}
                className="text-slate-700 dark:text-slate-300"
              />
            </motion.div>
          </div>
        </h1>
        <motion.p
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.3,
            delay: 0.8,
          }}
          className="relative z-10 mx-auto w-full max-w-xl py-4 text-center text-lg font-normal text-neutral-600 dark:text-neutral-400"
        >
          <h4 className="text-xl lg:text-2xl lg:leading-tight max-w-5xl mx-auto text-center tracking-tight font-medium text-black dark:text-white">
            Simplifica o teu internato. Aproveita melhor o teu tempo.
          </h4>
        </motion.p>
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.3,
            delay: 1,
          }}
          className="relative z-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Button asChild size="lg" className="text-sm sm:text-lg">
            <Link to="/register">Criar conta</Link>
          </Button>
        </motion.div>
        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.3,
            delay: 1.2,
          }}
          className="relative z-10 mt-2 w-full max-w-6xl px-4 hidden md:block"
        >
          <div className="overflow-hidden rounded-3xl border border-neutral-300 bg-neutral-200 p-4 shadow-md dark:border-neutral-800 dark:bg-neutral-900">
            <div className="relative overflow-hidden rounded-xl bg-neutral-900 max-h-[480px]">
              <img
                src={illustrationSrc}
                alt="InTrack - Consultations"
                className="block w-full"
              />
              <div
                className={`absolute bottom-0 left-0 right-0 h-52 bg-gradient-to-t to-transparent pointer-events-none ${
                  resolvedTheme === "dark"
                    ? "from-neutral-900/95"
                    : "from-neutral-100/95"
                }`}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
