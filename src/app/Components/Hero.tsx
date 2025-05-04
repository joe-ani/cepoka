"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRef, useState, useEffect, useCallback } from "react";
import { useActiveLink } from "../context/ActiveLinkContext";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, ChevronDown } from 'lucide-react';

const Hero = () => {
    const { activeLink, setActiveLink } = useActiveLink();
    const [menuOpen, setMenuOpen] = useState(false);

    // Function to handle menu toggle
    const handleMenuToggle = (isOpen: boolean) => {
        setMenuOpen(isOpen);
    };
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const dropIconRef = useRef<HTMLDivElement>(null);
    const actionsRef = useRef<HTMLDivElement>(null);
    const [isOverlapping, setIsOverlapping] = useState(false);
    const [currentModelIndex, setCurrentModelIndex] = useState(0);

    // Array of model images
    const modelImages = [
        "hero-graphis/hero1.png",
        "hero-graphis/facemask model5.png",
        "images/chair2.png"
        // Add more model image paths as needed
    ];

    // Image rotation effect
    useEffect(() => {
        if (!isMounted) return;

        const interval = setInterval(() => {
            setCurrentModelIndex((prevIndex) =>
                prevIndex === modelImages.length - 1 ? 0 : prevIndex + 1
            );
        }, 4000); // Changed to 4 seconds for each image display

        return () => clearInterval(interval);
    }, [isMounted, modelImages.length]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const scrollToSection = (sectionId: string) => {
        if (!isMounted || typeof window === 'undefined') return;
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleNavClick = (link: string) => {
        setActiveLink(link);
        setMenuOpen(false);

        if (!isMounted || typeof window === 'undefined') return;

        switch (link.toLowerCase()) {
            case 'contact':
                scrollToSection('section7');
                break;
            case 'about':
                scrollToSection('section6');
                break;
            case 'home':
                window?.scrollTo({ top: 0, behavior: 'smooth' });
                break;
            case 'shop':
                router.push('/shop');
                break;
        }
    };

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
        }
        setShowSearch(false);

        setSearchQuery("");
    };

    const checkOverlap = useCallback(() => {
        if (!isMounted || typeof window === 'undefined') return;

        const dropIcon = dropIconRef.current;
        const actions = actionsRef.current;

        if (dropIcon && actions && window.innerWidth < 768) { // Only check on mobile
            const dropRect = dropIcon.getBoundingClientRect();
            const actionsRect = actions.getBoundingClientRect();

            // Check if the drop icon overlaps with the actions section
            const isOverlapping = !(
                dropRect.top > actionsRect.bottom ||
                dropRect.bottom < actionsRect.top
            );

            setIsOverlapping(isOverlapping);
        }
    }, [isMounted]);

    useEffect(() => {
        if (!isMounted || typeof window === 'undefined') return;

        checkOverlap();
        window.addEventListener('resize', checkOverlap);
        window.addEventListener('scroll', checkOverlap);

        return () => {
            window.removeEventListener('resize', checkOverlap);
            window.removeEventListener('scroll', checkOverlap);
        };
    }, [checkOverlap, isMounted]);

    // framer motion variants --------
    const heroTextVariants = {
        hidden: { opacity: 0, x: -100 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 1, ease: "easeOut" },
        },
    };

    const highlightVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 1,
                ease: "easeOut",
                delay: 0.3, // Delay for smoother stagger
            },
        },
    };

    const modelImageVariants = {
        hidden: { y: 50, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 1, ease: "easeOut" },
        },
    };

    const cardVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 1, ease: "easeOut", delay: 0.6 },
        },
    };

    // Mobile menu variants are now defined inline

    const menuItemVariants = {
        closed: { opacity: 0, y: -20 },
        open: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.4,
                ease: [0.4, 0, 0.2, 1],
            }
        })
    };

    // Animation variants for the model image
    const slideUpVariants = {
        enter: {
            // y: 100,
            opacity: 0
        },
        center: {
            y: 0,
            opacity: 1,
            transition: {
                y: { duration: 1.5, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 1.5, ease: [0.16, 1, 0.3, 1] }
            }
        },
        exit: {
            // y: -100,
            opacity: 0,
            transition: {
                y: { duration: 1.5, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 1.5, ease: [0.16, 1, 0.3, 1] }
            }
        }
    };

    return (
        <div className="hero bg-[#ffffff] h-screen w-screen flex flex-col justify-center items-center relative">
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent z-20"></div>

            {menuOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="menu-overlay fixed inset-0 bg-black/50 backdrop-blur-sm z-[90]"
                    onClick={() => handleMenuToggle(false)}
                />
            )}

            <div className="container mx-auto max-w-[1536px] flex flex-col md:flex-row justify-around items-center px-8 md:px-20 lg:px-40 pb-8 pt-0 md:pt-20">
                <div className={`logo md:mb-0 flex pt-14 justify-between w-full md:w-auto items-center relative z-[200] ${menuOpen ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
                    <Link href={"/"} className="relative z-[200] bg-transparent p-1 rounded-full">
                        <Image
                            className="w-10 h-auto md:w-30"
                            width={70}
                            height={70}
                            priority
                            alt="Dfugo logo"
                            src="/logo.png"
                        />
                    </Link>

                    {/* Nav-style Hamburger Button */}
                    {!menuOpen && (
                        <button
                            id="hero-hamburger-button"
                            className="text-black md:hidden focus:outline-none z-[120] p-2"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleMenuToggle(true);
                            }}
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6h16M4 12h16m-7 6h7"
                                />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Updated Mobile Menu with centered items and dots */}
                <motion.div
                    id="hero-mobile-menu-container"
                    initial="closed"
                    animate={menuOpen ? "open" : "closed"}
                    variants={{
                        open: {
                            opacity: 1,
                            y: 0,
                            transition: {
                                duration: 0.3,
                                ease: [0.4, 0, 0.2, 1],
                                staggerChildren: 0.1
                            }
                        },
                        closed: {
                            opacity: 0,
                            y: "-100%",
                            transition: {
                                duration: 0.3,
                                ease: [0.4, 0, 0.2, 1],
                                staggerChildren: 0.05,
                                staggerDirection: -1
                            }
                        }
                    }}
                    className="fixed top-0 left-0 w-full bg-[#11111180] backdrop-blur-[12px] z-[150] md:hidden h-full"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleMenuToggle(false);
                    }}
                >
                    {/* Mobile Header - positioned exactly like the main hero header */}
                    <div className="h-[90px] relative">
                        <div className="absolute -bottom-10 left-0 w-full h-[1px] bg-black/10 z-[160]"></div>
                        <div className="container mx-auto max-w-[1536px] relative">
                            <div className="flex justify-between items-center relative z-[200] pt-6 px-8">
                                <Link href={"/"} className="relative z-[200] flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                                    <div className="bg-transparent p-1 rounded-full">
                                        <Image
                                            className="w-10 h-auto md:w-30"
                                            width={70}
                                            height={70}
                                            priority
                                            alt="Dfugo logo"
                                            src="/logo.png"
                                        />
                                    </div>
                                    <div>
                                        <motion.span
                                            className="text-base font-bold bg-clip-text text-transparent inline-block relative"
                                            style={{
                                                backgroundImage: "linear-gradient(90deg, #1E90FF, #FF69B4)",
                                                backgroundSize: "200% 100%",
                                            }}
                                            animate={{
                                                backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"],
                                            }}
                                            transition={{
                                                duration: 5,
                                                ease: "linear",
                                                repeat: Infinity,
                                            }}
                                        >
                                            CEPOKA BEAUTY HUB
                                            <motion.div
                                                className="absolute -bottom-1 left-0 h-[2px] rounded-full"
                                                style={{
                                                    backgroundImage: "linear-gradient(90deg, #1E90FF, #FF69B4)",
                                                    backgroundSize: "200% 100%",
                                                }}
                                                animate={{
                                                    backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"],
                                                    width: ["0%", "100%"],
                                                }}
                                                transition={{
                                                    backgroundPosition: {
                                                        duration: 5,
                                                        ease: "linear",
                                                        repeat: Infinity,
                                                    },
                                                    width: {
                                                        duration: 1,
                                                        delay: 0.5,
                                                        ease: "easeOut",
                                                    },
                                                }}
                                            />
                                        </motion.span>
                                    </div>
                                </Link>

                                <motion.button
                                    className="text-white focus:outline-none p-2 relative z-[170] cursor-pointer hover:text-gray-300 hover:scale-110 transition-all duration-200"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleMenuToggle(false);
                                    }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    aria-label="Close menu"
                                >
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </motion.button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-16 pb-8 px-8 flex flex-col items-center gap-8" onClick={(e) => e.stopPropagation()}>
                        {/* Mobile Search - Centered */}
                        <motion.form
                            variants={menuItemVariants}
                            custom={0}
                            className="relative w-full max-w-[280px]"
                            onSubmit={handleSearch}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-6 py-3 rounded-full bg-white/10 text-white font-light focus:outline-none focus:ring-2 focus:ring-[#1E90FF] transition-all text-left placeholder-white/60"
                                placeholder="Search products..."
                            />
                            <button
                                type="submit"
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2"
                            >
                                <Search className="w-4 h-4 text-white" />
                            </button>
                        </motion.form>

                        {/* Navigation Links - Centered with dots */}
                        <div className="flex flex-col items-center gap-8 w-full">
                            {["Home", "Shop", "Contact", "About"].map((link, i) => (
                                <motion.div
                                    key={link}
                                    variants={menuItemVariants}
                                    custom={i + 1}
                                    className="relative flex flex-col items-center"
                                >
                                    <motion.button
                                        onClick={() => handleNavClick(link)}
                                        className={`text-center text-lg font-medium py-2 px-4 ${activeLink === link ? "text-[#FF69B4]" : "text-white"}`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {link}
                                    </motion.button>
                                    {activeLink === link && (
                                        <div className="absolute -bottom-2 flex space-x-1">
                                            <motion.div
                                                className="bg-[#1E90FF] w-[4px] h-[4px] rounded-full"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ duration: 0.2 }}
                                            />
                                            <motion.div
                                                className="bg-[#FF69B4] w-[4px] h-[4px] rounded-full"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ duration: 0.2, delay: 0.1 }}
                                            />
                                            <motion.div
                                                className="bg-[#1E90FF] w-[4px] h-[4px] rounded-full"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ duration: 0.2, delay: 0.2 }}
                                            />
                                            <motion.div
                                                className="bg-[#FF69B4] w-[4px] h-[4px] rounded-full"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ duration: 0.2, delay: 0.3 }}
                                            />
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex">
                    <div className="flex flex-col items-center">
                        {/* Nav items and search container */}
                        <div className="flex items-center space-x-8 relative">
                            <motion.ul
                                animate={{ opacity: showSearch ? 0 : 1 }}
                                transition={{ duration: 0.2 }}
                                className={`list-none flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8 font-medium ${showSearch ? 'invisible' : 'visible'
                                    }`}
                            >
                                {["Home", "Shop", "Contact", "About"].map((link) => (
                                    <li
                                        key={link}
                                        className={`relative cursor-pointer flex flex-col items-center ${activeLink === link ? "text-[#1E90FF]" : "text-[#333333]"
                                            }`}
                                        onClick={() => handleNavClick(link)}
                                    >
                                        <div>{link}</div>
                                        {activeLink === link && (
                                            <div className="absolute top-8 flex space-x-1">
                                                <motion.div
                                                    className="bg-[#1E90FF] w-[4px] h-[4px] rounded-full"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ duration: 0.2 }}
                                                />
                                                <motion.div
                                                    className="bg-[#FF69B4] w-[4px] h-[4px] rounded-full"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ duration: 0.2, delay: 0.1 }}
                                                />
                                                <motion.div
                                                    className="bg-[#1E90FF] w-[4px] h-[4px] rounded-full"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ duration: 0.2, delay: 0.2 }}
                                                />
                                                <motion.div
                                                    className="bg-[#FF69B4] w-[4px] h-[4px] rounded-full"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ duration: 0.2, delay: 0.3 }}
                                                />
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </motion.ul>

                            {/* Search container */}
                            <div className="relative flex items-center">
                                <div
                                    className="rounded-full p-3 cursor-pointer hover:bg-black/5 hidden md:block"
                                    onClick={() => setShowSearch(!showSearch)}
                                >
                                    <Search className="w-4 h-4 text-[#333333]" />
                                </div>

                                {/* Inline search bar */}
                                {showSearch && (
                                    <motion.form
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: "240px" }}
                                        exit={{ opacity: 0, width: 0 }}
                                        onSubmit={handleSearch}
                                        className="absolute right-12"
                                    >
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full px-4 py-2 rounded-full bg-black/5 text-[#333333] font-light focus:outline-none text-left placeholder-[#666666]"
                                                placeholder="Search products..."
                                                autoFocus
                                                onBlur={() => !searchQuery && setShowSearch(false)}
                                            />
                                        </div>
                                    </motion.form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Section - Updated colors */}
            <div className="cont2 w-full flex flex-col-reverse md:flex-row justify-around items-center px-8 md:px-20 lg:px-40 pb-10 mb-11 pt-28 mb:pt-0">
                {/* Hero Text Section - Updated colors */}
                <div className="hero-text text-left pt-40 md:pt-0">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="py-3 mb-2"
                    >
                        <motion.span
                            className="text-ls md:text-2xl font-bold bg-clip-text text-transparent inline-block relative"
                            style={{
                                backgroundImage: "linear-gradient(90deg, #1E90FF, #FF69B4)",
                                backgroundSize: "200% 100%",
                            }}
                            animate={{
                                backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"],
                            }}
                            transition={{
                                duration: 5,
                                ease: "linear",
                                repeat: Infinity,
                            }}
                        >
                            CEPOKA BEAUTY HUB
                            <motion.div
                                className="absolute -top-1 left-0 h-[2px] rounded-full"
                                style={{
                                    backgroundImage: "linear-gradient(90deg, #1E90FF, #FF69B4)",
                                    backgroundSize: "200% 100%",
                                }}
                                animate={{
                                    backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"],
                                    width: ["0%", "100%"],
                                }}
                                transition={{
                                    backgroundPosition: {
                                        duration: 5,
                                        ease: "linear",
                                        repeat: Infinity,
                                    },
                                    width: {
                                        duration: 1,
                                        delay: 0.5,
                                        ease: "easeOut",
                                    },
                                }}
                            />
                        </motion.span>
                    </motion.div>
                    <div className="w-[60%] h-[1.5px] bg-gradient-to-r from-[#9a9a9a] to-transparent rounded-full mx-0"></div>

                    <motion.div
                        variants={heroTextVariants}
                        initial="hidden"
                        animate="visible"
                        className="text-3xl md:text-5xl py-5 font-[900] text-[#333333]">
                        {/* imlement modern text by text animation using framer */}
                        <p>Where innovation</p>
                        <div className="flex gap-2">
                            <span className="bg-gradient-to-r from-[#1E90FF] to-[#FF69B4] bg-clip-text text-transparent">meets Beauty.</span>
                        </div>
                    </motion.div>
                    <div className="w-[60%] h-[1.5px] bg-gradient-to-r from-[#9a9a9a] to-transparent rounded-full mx-0"></div>
                    <p className="pt-8 text-[14px] md:text-[20px] w-[80%] mx-0 font-normal text-[#333333]">
                        we offer all types of high quality salon, spa, and beauty equipments.
                    </p>
                    <div ref={actionsRef} className="quickact flex space-x-5 md:flex-row space-y-3 md:space-y-0 md:space-x-3 py-10 items-start md:items-center">
                        <Link href={"/shop"} onClick={() => setActiveLink("Shop")}>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="font-medium bg-gradient-to-tr from-[#1E90FF] to-[#FF69B4] text-white text-[14px] md:text-[20px] rounded-full p-2 px-8 gap-3 flex items-center">
                                Shop
                                <ArrowRight size={20} />
                            </motion.button>
                        </Link>
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="flex flex-col relative cursor-pointer"
                            onClick={() => scrollToSection('section3')}>
                            <div className="font-medium text-sm md:text-base text-[#333333]">Locate Us</div>
                            <div className="bg-gradient-to-r from-transparent via-[#c8c8c8] to-transparent h-[2px] w-full rounded-full"></div>
                        </motion.div>
                    </div>
                </div>

                {/* Highlight Section - Original position */}
                <motion.div
                    variants={highlightVariants}
                    initial="hidden"
                    animate="visible"
                    className="highlight absolute top-[200px] md:relative md:top-0 w-48 md:w-80 flex items-center justify-center mt-9 md:mt-0">
                    {/* Model */}
                    <motion.div variants={modelImageVariants} className="absolute w-52 md:w-auto top-[-30px] right-[20px] md:top-[-190px] md:right-[30px]">
                        <AnimatePresence mode="popLayout">
                            <motion.div
                                key={currentModelIndex}
                                variants={slideUpVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                className="relative z-10"
                            >
                                <Image
                                    width={280}
                                    height={160}
                                    alt={`Model ${currentModelIndex + 1}`}
                                    src={modelImages[currentModelIndex]}
                                    className="w-52 md:w-80 z-10 relative"
                                    priority
                                />
                            </motion.div>
                        </AnimatePresence>
                        <div className="fade-boundary"></div>
                    </motion.div>

                    {/* Highlight container */}
                    <motion.div
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                        className="w-[170px] md:w-[200px] highlight-box border-[1.5px] border-[#b2b2b2] rounded-[20px] p-[14px] md:p-[20px] md:rounded-[30px] z-10 space-y-2 md:space-y-4 absolute flex flex-col top-[-120px] md:top-[-15px]"
                        style={{
                            transformStyle: "preserve-3d",
                            perspective: "1000px"
                        }}
                    >
                        <div className="flex justify-between items-center relative">
                            <div className="bg-[#d1d1d171] text-[8px] md:text-[12px] text-[#333333] font-semibold rounded-full p-1 px-3 md:px-5">Featured</div>
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-1.5 md:p-4 rounded-full relative flex items-center justify-center cursor-pointer hover:bg-[#cccccc28]"
                            >
                                <Image className="absolute w-3 md:w-4" width={16} height={16} src={"/icons/arrowwhite.png"} alt="" />
                            </motion.div>
                        </div>
                        <motion.div
                            className="flex justify-between space-y-1.5 md:space-y-3"
                            variants={{
                                hidden: { y: 20, opacity: 0 },
                                visible: {
                                    y: 0,
                                    opacity: 1,
                                    transition: {
                                        delay: 0.2,
                                        duration: 0.5
                                    }
                                }
                            }}
                        >
                            <h1 className="text-[14px] w-[5%] md:text[19px] text-[#333333] font-bold">LED Facial Mask</h1>
                            <div className="flex w-[60%] h-[60px] border-1 border-gray-500 bg-[#cccccc39] p-[6px] md:p-[10px] rounded-[8px]">
                                {/* <Image width={24} height={16} src={"/images/wig1.png"} alt="" className="w-4 md:w-6" /> */}
                            </div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Updated Scroll Button with visibility control */}
            <div className={`absolute z-30 cursor-pointer bottom-10 transition-opacity duration-300 ${isOverlapping ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <motion.div
                    ref={dropIconRef}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="relative w-10 h-10 md:w-14 md:h-14 flex items-center justify-center"
                    onClick={() => scrollToSection('section1')}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1E90FF] to-[#FF69B4] rounded-full"></div>
                    <div className="absolute inset-0.5 bg-white rounded-full flex items-center justify-center">
                        <ChevronDown className="w-6 h-6 text-[#1E90FF]" />
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Hero;
