import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiClock } from 'react-icons/fi';

const AnimatedClock = () => {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  
  return (
    <motion.div 
      className="inline-flex items-center justify-center font-mono text-lg bg-white bg-opacity-20 rounded-lg px-3 py-1"
      animate={{ scale: [1, 1.02, 1] }}
      transition={{ duration: 1, repeat: Infinity }}
    >
      <FiClock className="mr-2" />
      <div className="flex">
        <motion.span 
          className="w-7 text-center"
          key={`hr-${hours}`}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {hours}
        </motion.span>
        <span>:</span>
        <motion.span 
          className="w-7 text-center"
          key={`min-${minutes}`}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {minutes}
        </motion.span>
        <span>:</span>
        <motion.span 
          className="w-7 text-center"
          key={`sec-${seconds}`}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {seconds}
        </motion.span>
      </div>
    </motion.div>
  );
};

export default AnimatedClock;