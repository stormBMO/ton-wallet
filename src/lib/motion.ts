export const fadeIn = { 
    hidden: { opacity: 0, y: 20 }, 
    show: { 
        opacity: 1, 
        y: 0, 
        transition: { duration: 0.4 } 
    } 
};

export const slideUp = {
    hidden: { opacity: 0, y: 30 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" }
    }
};

export const staggerContainer = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

export const pulse = {
    hidden: { scale: 1 },
    show: {
        scale: [1, 1.03, 1],
        transition: { repeat: Infinity, repeatType: "reverse", duration: 1.5 }
    }
};

export const tap = {
    scale: 0.95,
    transition: { duration: 0.1 }
}; 