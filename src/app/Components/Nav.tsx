"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useActiveLink } from "../context/ActiveLinkContext";
import { Search } from 'lucide-react';

const Nav = () => {
  const { activeLink, setActiveLink } = useActiveLink();
  const [isVisible, setIsVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const pathname = usePathname(); // Get the current route
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || typeof window === 'undefined') return;

    const handleScroll = () => {
      const scrollPosition = window?.scrollY;
      setIsVisible(scrollPosition > 300); // Show the navbar after scrolling 300px
    };

    if (pathname === "/") {
      // Add scroll event listener for the home page
      setIsVisible(false); // Initially hide the navbar
      window?.addEventListener("scroll", handleScroll);
      return () => window?.removeEventListener("scroll", handleScroll);
    } else {
      setIsVisible(true); // Show the navbar immediately for other pages
    }

    // Clean up the event listener
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname, isMounted]);

  // Add this useEffect to sync activeLink with current pathname
  useEffect(() => {
    if (pathname === '/shop') {
      setActiveLink('Shop');
    } else if (pathname === '/') {
      setActiveLink('Home');
    }
  }, [pathname, setActiveLink]);

  const scrollToSection = (sectionId: string) => {
    if (!isMounted || typeof window === 'undefined') return;
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavClick = (link: string) => {
    setActiveLink(link);
    setIsMenuOpen(false);

    // Don't interfere with admin routes
    if (pathname && pathname.startsWith('/admin')) {
      console.log('Navigation in admin area - not handling nav clicks');
      return;
    }

    if (pathname === '/') {
      switch (link.toLowerCase()) {
        case 'contact':
          scrollToSection('section7');
          break;
        case 'about':
          scrollToSection('section6');
          break;
        case 'home':
          window.scrollTo({ top: 0, behavior: 'smooth' });
          break;
        case 'shop':
          router.push('/shop');
          break;
      }
    } else {
      if (link.toLowerCase() === 'home') {
        router.push('/');
      } else {
        router.push(`/${link.toLowerCase()}`);
      }
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

  // Updated click handler with better area detection
  useEffect(() => {
    const handleClickAway = (event: MouseEvent) => {
      if (!isMenuOpen) return;

      const target = event.target as HTMLElement;
      const mobileMenu = document.getElementById('mobile-menu-container');
      const hamburgerButton = document.getElementById('hamburger-button');
      const searchForm = document.getElementById('mobile-search-form');

      // Check if click is within any of our menu components
      const isClickInMenu = mobileMenu?.contains(target);
      const isClickOnButton = hamburgerButton?.contains(target);
      const isClickInSearch = searchForm?.contains(target);
      const isClickOnOverlay = target.classList.contains('menu-overlay');

      // Only close if clicking outside all menu components and on overlay
      if ((!isClickInMenu && !isClickOnButton && !isClickInSearch) && isClickOnOverlay) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickAway);
    return () => document.removeEventListener('mousedown', handleClickAway);
  }, [isMenuOpen]);

  return (
    <>
      {/* Updated overlay to match Hero component exactly */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="menu-overlay fixed inset-0 bg-black/50 backdrop-blur-sm z-[90]"
        />
      )}

      <nav className={`fixed top-0 w-full z-[180] bg-gradient-to-l from-[#87878780] to-transparent  backdrop-blur-[15px] text-white p-6 sm:p-8 transition-transform duration-300 border-b border-black/10 ${isVisible ? "translate-y-0" : "-translate-y-full"}`}>
        <div className="container mx-auto relative">
          {/* Main nav content */}
          <div className={`flex justify-between items-center relative z-[200] ${isMenuOpen ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
            {/* Logo and brand name with higher z-index */}
            <Link href={"/"} className="relative z-[200] flex items-center gap-3">
              <div className="bg-transparent p-1 rounded-full">
                <Image src="/logo.png" alt="Logo" width={40} height={50} />
              </div>
              <div className="block">
                <motion.span
                  className="text-[13px] sm:text-xl font-bold bg-clip-text text-transparent inline-block relative"
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

            <div className="flex items-center space-x-8">
              {/* Nav items - adjusted spacing */}
              <motion.ul
                animate={{ opacity: showSearch ? 0 : 1 }}
                transition={{ duration: 0.2 }}
                className={`list-none hidden md:flex items-center space-x-8 font-medium ${showSearch ? 'invisible' : 'visible'}`}
              >
                {["Home", "Shop", "Contact", "About"].map((link) => (
                  <li
                    key={link}
                    className={`relative cursor-pointer flex flex-col items-center ${activeLink === link
                      ? "text-[#1E90FF]"
                      : "text-white/90 hover:text-white transition-colors duration-200"
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

              {/* Search container - adjusted sizing */}
              <div className="relative flex items-center z-[101]">
                <button
                  type="button"
                  className="rounded-full p-3 cursor-pointer hover:bg-white/10 hidden md:flex items-center justify-center relative z-[102]"
                  onClick={() => setShowSearch(!showSearch)}
                >
                  <Search className="w-4 h-4 text-white" />
                </button>

                {/* Inline search bar */}
                {showSearch && (
                  <motion.form
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "240px" }}
                    exit={{ opacity: 0, width: 0 }}
                    onSubmit={handleSearch}
                    className="absolute right-12 top-1/2 -translate-y-1/2"
                  >
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 rounded-full bg-white/10 text-white font-light focus:outline-none text-left placeholder-white/60"
                        placeholder="Search products..."
                        autoFocus
                      />
                    </div>
                  </motion.form>
                )}
              </div>

              {/* Mobile menu button with higher z-index */}
              <div className="md:hidden flex items-center">
                {!isMenuOpen && (
                  <button
                    id="hamburger-button"
                    className="text-white focus:outline-none z-[120] pr-4" // Added padding-right
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(true);
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
            </div>
          </div>

          {/* Updated Mobile Menu with proper container */}
          <motion.div
            id="mobile-menu-container"
            initial="closed"
            animate={isMenuOpen ? "open" : "closed"}
            variants={{
              open: {
                opacity: 1,
                y: 0,
                display: "block",
                transition: {
                  duration: 0.3,
                  ease: [0.4, 0, 0.2, 1],
                  staggerChildren: 0.1
                }
              },
              closed: {
                opacity: 0,
                y: "-100%",
                transitionEnd: {
                  display: "none"
                },
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
              setIsMenuOpen(false);
            }}
          >
            {/* Mobile Header with extended background */}
            <div className="bg-[#11111180] backdrop-blur-[12px] pb-8">
              {/* Header section */}
              <div className="h-[90px] relative">
                <div className="absolute -bottom-10 left-0 w-full h-[1px] bg-black/10 z-[160]"></div>
                <div className="container mx-auto relative">
                  <div className="flex justify-between items-center relative z-[200] pt-6 px-8">
                    <Link href={"/"} className="relative z-[200] flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                      <div className="bg-transparent p-1 rounded-full">
                        <Image src="/logo.png" alt="Logo" width={40} height={50} />
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
                      className="text-white bg-black/30 rounded-full p-2 relative z-[170] cursor-pointer hover:text-gray-300 hover:scale-110 transition-all duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMenuOpen(false);
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

              {/* Mobile Menu Content - now inside the same background container */}
              <div
                className="pt-16 pb-8 px-8 flex flex-col items-center gap-8"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Updated Mobile Search Form */}
                <motion.form
                  id="mobile-search-form"
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

                {/* Navigation Links */}
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
            </div>
          </motion.div>
        </div>
      </nav>
    </>
  );
};

export default Nav;
