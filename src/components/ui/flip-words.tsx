"use client";
import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/utils/utils";

export const FlipWords = ({
  words,
  duration = 3000,
  className,
}: {
  words: string[];
  duration?: number;
  className?: string;
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState(words[0]); // Start with first word already typed
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasStartedLooping, setHasStartedLooping] = useState(false); // Track if looping has begun

  const currentWord = words[currentWordIndex];

  const typeSpeed = 100; // ms per character when typing
  const deleteSpeed = 50; // ms per character when deleting
  const pauseDuration = duration; // pause before starting to delete
  const initialDelay = 2000; // 2 second delay before starting the loop

  // Start the looping animation after initial delay
  useEffect(() => {
    const startLooping = setTimeout(() => {
      setHasStartedLooping(true);
      setIsDeleting(true); // Start by deleting the current word
    }, initialDelay);

    return () => clearTimeout(startLooping);
  }, [initialDelay]);

  const typeWriter = useCallback(() => {
    if (!hasStartedLooping) return; // Don't run until looping has started

    if (!isDeleting) {
      // Typing phase
      if (currentText.length < currentWord.length) {
        setCurrentText(currentWord.slice(0, currentText.length + 1));
      } else {
        // Finished typing, pause before deleting
        setTimeout(() => setIsDeleting(true), pauseDuration);
      }
    } else {
      // Deleting phase
      if (currentText.length > 0) {
        setCurrentText(currentText.slice(0, -1));
      } else {
        // Finished deleting, move to next word
        setIsDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
      }
    }
  }, [
    currentText,
    currentWord,
    isDeleting,
    pauseDuration,
    words.length,
    hasStartedLooping,
  ]);

  useEffect(() => {
    if (!hasStartedLooping) return; // Don't start the typewriter effect until looping begins

    const timeout = setTimeout(
      typeWriter,
      isDeleting ? deleteSpeed : typeSpeed
    );
    return () => clearTimeout(timeout);
  }, [typeWriter, isDeleting, hasStartedLooping]);

  return (
    <motion.span
      className={cn(
        "inline-block relative text-neutral-900 dark:text-neutral-100 px-2",
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {currentText}
      <motion.span
        className="inline-block w-0.5 h-[1em] bg-current ml-1 translate-y-2.5"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
    </motion.span>
  );
};
