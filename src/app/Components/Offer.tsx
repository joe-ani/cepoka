"use client";
import Image from "next/image";
import { useInView } from "react-intersection-observer";
import { motion, Variants } from "framer-motion";

interface CardProps {
  imgSrc: string;
  text: string;
  cardVariants: Variants;
  delay?: number;
}

const Offer: React.FC = () => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  const cardVariants: Variants = {
    hidden: {
      opacity: 0,
      x: isMobile ? -50 : 0,  // Increased offset on mobile for more visible slide
      y: !isMobile ? 100 : 0
    },
    visible: (delay: number = 0) => ({
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        type: "spring", // Using spring for smoother animation
        stiffness: 50, // Lower stiffness for smoother movement
        damping: 15,   // Adjusted damping for better bounce
        duration: isMobile ? 0.7 : 0.8, // Slightly longer duration on mobile
        delay: isMobile ? delay * 0.2 : delay // Adjusted delay between items
      }
    })
  };

  return (
    <div className="offer flex flex-col items-center w-full">
      <div className="w-full md:max-w-5xl flex flex-col md:flex-row justify-center items-center space-y-10 md:space-y-0 text-[#333] md:bg-[#ededed] md:px-16 md:py-12 md:rounded-[30px]">
        <Card
          imgSrc="/icons/diamond.png"
          text="Fast and Safe delivery."
          cardVariants={cardVariants}
          delay={0}
        />
        <div className="hidden md:block w-[1px] h-32 bg-gradient-to-b from-transparent via-gray-400 to-transparent mx-16" />
        <Card
          imgSrc="/icons/call.png"
          text="24/7 Customer Support."
          cardVariants={cardVariants}
          delay={0.2}
        />
        <div className="hidden md:block w-[1px] h-32 bg-gradient-to-b from-transparent via-gray-400 to-transparent mx-16" />
        <Card
          imgSrc="/icons/package.png"
          text="Secure Packaging."
          cardVariants={cardVariants}
          delay={0.4}
        />
      </div>
    </div>
  );
};

const Card: React.FC<CardProps> = ({ imgSrc, text, cardVariants, delay = 0 }) => {
  const [ref, inView] = useInView({ 
    triggerOnce: true, 
    threshold: 0.2,
    rootMargin: "10px 50px -10px 50px"
  });

  return (
    <motion.div
      ref={ref}
      className="card w-full px-4 md:px-0 md:w-52 h-40 md:h-52 p-3 bg-gradient-to-r from-[#ededed] to-transparent md:bg-transparent flex items-center justify-center"
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={cardVariants}
      custom={delay}
    >
      <div className="flex flex-row md:flex-col items-center space-x-4 md:space-x-0 md:space-y-4">
        <div className="relative w-24 h-24 flex items-center justify-center overflow-visible">
          <Image
            width={40}
            height={40}
            alt=""
            src={imgSrc}
            className="transition-transform duration-300 ease-in-out"
          />
        </div>
        <p className="font-medium text-left md:text-center">{text}</p>
      </div>
    </motion.div>
  );
};

export default Offer;
