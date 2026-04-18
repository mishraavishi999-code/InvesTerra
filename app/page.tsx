'use client'
import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useScroll } from 'framer-motion'
import { Search, Wallet, TrendingUp, Globe2, ArrowRight, ShieldCheck, MapPin } from 'lucide-react'
import Link from 'next/link'

// Advanced 3D Hover Card Component
function TiltCard({ children, delay }: { children: React.ReactNode, delay: number }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 })
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [12, -12])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-12, 12])

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const clientX = e.clientX - rect.left
    const clientY = e.clientY - rect.top
    const xPct = clientX / width - 0.5
    const yPct = clientY / height - 0.5
    x.set(xPct)
    y.set(yPct)
  }

  function handleMouseLeave() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        backgroundColor: '#132213',
        border: '1px solid rgba(200, 169, 110, 0.2)',
        borderRadius: '24px',
        maxWidth: '340px',
        flex: '1 1 300px',
        cursor: 'crosshair',
        position: 'relative'
      }}
    >
      <div 
        style={{
          padding: '3rem 2rem',
          transform: "translateZ(60px)",
          transformStyle: "preserve-3d",
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start'
        }}
      >
        {children}
      </div>
      
        {/* Dynamic Glow Layer */}
      <motion.div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(circle at 50% 0%, rgba(200,169,110,0.1) 0%, transparent 70%)',
          borderRadius: '24px',
          pointerEvents: 'none',
          transform: "translateZ(10px)",
      }}/>
    </motion.div>
  )
}

function FloatingShape({ size, top, left, delay, shapeType }: { size: number, top: string, left: string, delay: number, shapeType: 'circle' | 'square' | 'ring' }) {
  const getShapeStyle = () => {
    switch (shapeType) {
      case 'circle':
        return { borderRadius: '50%', background: 'linear-gradient(135deg, rgba(200,169,110,0.2), rgba(200,169,110,0.05))' }
      case 'square':
        return { borderRadius: '20px', background: 'linear-gradient(135deg, rgba(168,197,160,0.15), rgba(168,197,160,0.02))' }
      case 'ring':
        return { borderRadius: '50%', border: '2px solid rgba(200,169,110,0.3)', background: 'transparent' }
    }
  }

  return (
    <motion.div
      initial={{ y: 0, rotateX: 0, rotateY: 0 }}
      animate={{ 
        y: [0, -30, 0], 
        rotateX: [0, 20, 0], 
        rotateY: [0, 30, 0]
      }}
      transition={{ duration: 6, repeat: Infinity, delay, ease: "easeInOut" }}
      whileHover={{ 
        scale: 1.4, 
        rotateZ: 90, 
        rotateX: 180,
        backgroundColor: 'rgba(200,169,110,0.4)',
        boxShadow: '0 0 40px rgba(200,169,110,0.6)'
      }}
      style={{
        position: 'absolute',
        top,
        left,
        width: size,
        height: size,
        backdropFilter: 'blur(5px)',
        transformStyle: 'preserve-3d',
        zIndex: 5,
        cursor: 'crosshair',
        ...getShapeStyle()
      }}
    />
  )
}

export default function Home() {
  const [visible, setVisible] = useState(false)
  const { scrollYProgress } = useScroll()
  
  // Parallax mappings
  const backgroundY1 = useTransform(scrollYProgress, [0, 1], ['0%', '200%'])
  const backgroundY2 = useTransform(scrollYProgress, [0, 1], ['0%', '-150%'])
  const rotate3D = useTransform(scrollYProgress, [0, 1], [0, 120])
  const opacityFade = useTransform(scrollYProgress, [0, 0.5], [1, 0.1])

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

  return (
    <main style={{ margin: 0, padding: 0, position: 'relative', overflow: 'hidden', perspective: '1000px' }}>

      {/* 3D Dynamic Scroll Background */}
      <motion.div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity: opacityFade,
        transformStyle: 'preserve-3d'
      }}>
        {/* Floating 3D Orb 1 */}
        <motion.div 
          style={{
            position: 'absolute',
            width: '120vw', height: '120vw',
            maxWidth: '1200px', maxHeight: '1200px',
            top: '-20%', left: '-20%',
            background: 'radial-gradient(ellipse, rgba(200, 169, 110, 0.08) 0%, transparent 60%)',
            y: backgroundY1,
            rotateX: 45,
            rotateY: rotate3D,
            borderRadius: '50%',
            border: '1px solid rgba(200,169,110, 0.03)'
          }} 
        />
        {/* Floating 3D Orb 2 */}
        <motion.div 
          style={{
            position: 'absolute',
            width: '90vw', height: '90vw',
            maxWidth: '900px', maxHeight: '900px',
            bottom: '-10%', right: '-10%',
            background: 'radial-gradient(ellipse, rgba(168, 197, 160, 0.05) 0%, transparent 50%)',
            y: backgroundY2,
            rotateX: -30,
            rotateZ: rotate3D,
            borderRadius: '50%',
            border: '1px dashed rgba(200,169,110, 0.05)'
          }} 
        />
        
        {/* Interactive Floating 3D Elements */}
        <FloatingShape size={80} top="15%" left="10%" delay={0} shapeType="circle" />
        <FloatingShape size={120} top="65%" left="85%" delay={1.2} shapeType="square" />
        <FloatingShape size={60} top="75%" left="20%" delay={2.5} shapeType="ring" />
        <FloatingShape size={100} top="35%" left="75%" delay={0.8} shapeType="circle" />
        <FloatingShape size={70} top="8%" left="60%" delay={3.1} shapeType="square" />
        <FloatingShape size={150} top="45%" left="5%" delay={1.8} shapeType="ring" />
        <FloatingShape size={50} top="85%" left="65%" delay={0.4} shapeType="circle" />
      </motion.div>

      {/* Content wrapper */}
      <div style={{ position: 'relative', zIndex: 1 }}>

      {/* HERO SECTION */}
      <section style={{
        minHeight: '100vh',
        backgroundColor: '#0f1e0f',
        backgroundImage: 'radial-gradient(ellipse at 20% 50%, #1a3a1a 0%, #0f1e0f 60%), radial-gradient(ellipse at 80% 20%, #2a4a1a 0%, transparent 50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>

        {/* Decorative Animated Rings */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute', width: '700px', height: '700px',
            borderRadius: '50%', border: '1px solid rgba(200, 169, 110, 0.05)',
            borderTopColor: 'rgba(200, 169, 110, 0.2)',
            top: '50%', left: '50%', marginTop: '-350px', marginLeft: '-350px'
          }}/>
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute', width: '500px', height: '500px',
            borderRadius: '50%', border: '1px solid rgba(200, 169, 110, 0.1)',
            borderBottomColor: 'rgba(200, 169, 110, 0.3)',
            top: '50%', left: '50%', marginTop: '-250px', marginLeft: '-250px'
          }}/>

        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            backgroundColor: 'rgba(200, 169, 110, 0.15)',
            border: '1px solid rgba(200, 169, 110, 0.3)',
            color: '#c8a96e',
            padding: '0.5rem 1.4rem',
            borderRadius: '30px',
            fontSize: '0.85rem',
            marginBottom: '2rem',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            zIndex: 10
          }}
        >
          <Globe2 size={16} /> Land Ownership, Reimagined
        </motion.div>

        {/* Main heading */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            fontSize: 'clamp(3rem, 7vw, 6rem)',
            color: '#ffffff',
            margin: '0 0 1.5rem 0',
            lineHeight: 1.1,
            maxWidth: '900px',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            zIndex: 10
          }}
        >
          Own the Earth,<br />
          <span style={{ 
            color: '#c8a96e',
            backgroundImage: 'linear-gradient(45deg, #c8a96e, #e8d0a0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>One Share at a Time</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.35rem)',
            color: '#a8c5a0',
            maxWidth: '650px',
            lineHeight: 1.8,
            marginBottom: '3.5rem',
            zIndex: 10
          }}
        >
          InvesTerra allows you to co-own verified real estate and agricultural land with a network of premium investors. Start building your portfolio today.
        </motion.p>

        {/* Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          style={{
            display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center', zIndex: 10
          }}
        >
          <a href="/parcels" style={{ textDecoration: 'none' }}>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                backgroundColor: '#c8a96e',
                color: '#0f1e0f',
                padding: '1.1rem 2.8rem',
                borderRadius: '40px',
                fontWeight: 'bold',
                fontSize: '1.05rem',
                letterSpacing: '0.5px',
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                boxShadow: '0 10px 30px rgba(200, 169, 110, 0.2)'
              }}
            >
              Explore Parcels <ArrowRight size={20} />
            </motion.div>
          </a>
          <motion.button 
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
            whileTap={{ scale: 0.95 }}
            style={{
              backgroundColor: 'transparent',
              color: '#f5f0e8',
              border: '1px solid rgba(245, 240, 232, 0.3)',
              padding: '1.1rem 2.8rem',
              borderRadius: '40px',
              cursor: 'pointer',
              fontSize: '1.05rem',
              fontWeight: 500
            }}
          >
            How It Works
          </motion.button>
        </motion.div>
      </section>

      {/* STATS SECTION */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8 }}
        style={{
          background: 'linear-gradient(to right, #0f1e0f, #132213, #0f1e0f)',
          borderTop: '1px solid rgba(200,169,110,0.1)',
          borderBottom: '1px solid rgba(200,169,110,0.1)',
          padding: '5rem 2rem',
          display: 'flex',
          justifyContent: 'center',
          gap: '5rem',
          flexWrap: 'wrap'
        }}
      >
        {[
          { number: '2,400+', label: 'Acres Secured', icon: <MapPin size={28} color="#c8a96e" opacity={0.6} /> },
          { number: '1,200+', label: 'Co-owners', icon: <ShieldCheck size={28} color="#c8a96e" opacity={0.6} /> },
          { number: '48', label: 'Land Parcels', icon: <Globe2 size={28} color="#c8a96e" opacity={0.6} /> },
          { number: '₹0', label: 'Onboarding Fee', icon: <Wallet size={28} color="#c8a96e" opacity={0.6} /> },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label} 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
          >
            <div style={{ marginBottom: '1rem' }}>{stat.icon}</div>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: '#f5f0e8', letterSpacing: '-0.03em' }}>
              {stat.number}
            </div>
            <div style={{ color: '#c8a96e', fontSize: '1rem', marginTop: '0.5rem', fontWeight: 500, letterSpacing: '1px', textTransform: 'uppercase' }}>
              {stat.label}
            </div>
          </motion.div>
        ))}
      </motion.section>

      {/* HOW IT WORKS SECTION */}
      <section style={{
        backgroundColor: '#0a140a',
        padding: '8rem 2rem',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Background ambient glow */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '80%', height: '80%', background: 'radial-gradient(ellipse, rgba(200, 169, 110, 0.05) 0%, transparent 60%)',
          pointerEvents: 'none'
        }}/>

        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ color: '#ffffff', fontSize: '3.5rem', marginBottom: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', position: 'relative' }}
        >
          How It Works
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          style={{ color: '#a8c5a0', marginBottom: '6rem', fontSize: '1.25rem', position: 'relative' }}
        >
          The simplest path to institutional-grade land ownership
        </motion.p>
        
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2.5rem',
          flexWrap: 'wrap',
          maxWidth: '1100px',
          margin: '0 auto'
        }}>
          <TiltCard delay={0}>
            <div style={{ width: '60px', height: '60px', borderRadius: '16px', backgroundColor: 'rgba(200,169,110,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Search size={30} color="#c8a96e" />
            </div>
            <h3 style={{ color: '#f5f0e8', marginBottom: '1rem', fontSize: '1.8rem', fontWeight: 700 }}>Browse Parcels</h3>
            <p style={{ color: '#a8c5a0', lineHeight: 1.7, fontSize: '1.1rem', textAlign: 'left' }}>
              Explore rigorously verified land parcels across India with detailed satellite maps, legal documents, and projected yields.
            </p>
          </TiltCard>

          <TiltCard delay={0.2}>
            <div style={{ width: '60px', height: '60px', borderRadius: '16px', backgroundColor: 'rgba(200,169,110,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
               <Wallet size={30} color="#c8a96e" />
            </div>
            <h3 style={{ color: '#f5f0e8', marginBottom: '1rem', fontSize: '1.8rem', fontWeight: 700 }}>Buy Shares</h3>
            <p style={{ color: '#a8c5a0', lineHeight: 1.7, fontSize: '1.1rem', textAlign: 'left' }}>
              Purchase fractional shares starting from just ₹999. Own a legal piece of premium real estate instantaneously via smart contracts.
            </p>
          </TiltCard>

          <TiltCard delay={0.4}>
             <div style={{ width: '60px', height: '60px', borderRadius: '16px', backgroundColor: 'rgba(200,169,110,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
               <TrendingUp size={30} color="#c8a96e" />
            </div>
            <h3 style={{ color: '#f5f0e8', marginBottom: '1rem', fontSize: '1.8rem', fontWeight: 700 }}>Earn Together</h3>
            <p style={{ color: '#a8c5a0', lineHeight: 1.7, fontSize: '1.1rem', textAlign: 'left' }}>
              Secure automated dividend returns from land appreciation and agricultural income directly into your digital wallet.
            </p>
          </TiltCard>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        backgroundColor: '#080f08',
        color: '#a8c5a0',
        padding: '3rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderTop: '1px solid rgba(200,169,110,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
          <Globe2 size={24} color="#c8a96e" opacity={0.6}/>
          <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f5f0e8', letterSpacing: '2px', textTransform: 'uppercase' }}>InvesTerra</span>
        </div>
        <div style={{ fontSize: '0.95rem', opacity: 0.7 }}>
          © 2026 InvesTerra Global. Own the Earth, Together.
        </div>
      </footer>

      </div>
    </main>
  )
}