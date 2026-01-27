"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface PixelImageProps {
  src: string;
  alt: string;
}

export default function PixelImage({ src, alt }: PixelImageProps) {
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="relative w-full max-w-2xl aspect-video rounded-xl overflow-hidden border-4 border-[#3674B5] shadow-[10px_10px_0px_0px_#3674B5] mb-6 bg-[#A1E3F9]"
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 800px"
        priority
      />
    </motion.div>
  );
}
