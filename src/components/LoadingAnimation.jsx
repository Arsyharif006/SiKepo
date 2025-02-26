import React from 'react';
import { motion } from 'framer-motion';

const LoadingAnimation = ({ isLoading }) => {
  if (!isLoading) return null;
  
  return (
    <div className="loading-overlay">
      <div className="loading-container">
        <div className="wallet-container">
          {/* Wallet base */}
          <motion.div 
            className="wallet"
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Coins animation - adjusted for symmetry */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={`coin-${i}`}
                className="coin"
                initial={{ y: -20, x: (i * 10) - 20, opacity: 0 }}
                animate={{ 
                  y: [null, -40, 20],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1.2,
                  delay: i * 0.2,
                  repeat: Infinity,
                  repeatDelay: 0.8
                }}
                style={{ left: `${30 + (i - 2) * 10}px` }} // Centering coins
              />
            ))}
            
            {/* Bills animation - adjusted for symmetry */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`bill-${i}`}
                className="bill"
                initial={{ y: -10, opacity: 0 }}
                animate={{ 
                  y: [null, -30, 15],
                  opacity: [0, 1, 0],
                  rotate: [0, i % 2 === 0 ? 10 : -10]
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.3 + 0.2,
                  repeat: Infinity,
                  repeatDelay: 0.6
                }}
                style={{ left: `${25 + (i - 1) * 15}px` }} // Centering bills
              />
            ))}
          </motion.div>
        </div>
        
        {/* Centered text with improved styling */}
        <motion.p 
          className="loading-text"
          animate={{ 
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            textAlign: 'center',
            width: '100%',
            margin: '20px auto 0',
            padding: '0 10px'
          }}
        >
          Memuat Keuangan Anda...
        </motion.p>
      </div>
    </div>
  );
};

export default LoadingAnimation;