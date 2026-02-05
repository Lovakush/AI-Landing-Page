"use client"

// Pure CSS animated gradient - no WebGL required
// White background with subtle purple accents
export function ShaderAnimation() {
  return (
    <div className="w-full h-full absolute inset-0 overflow-hidden bg-white">
      {/* Subtle gradient accents */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(at 80% 20%, #6B4E9B 0px, transparent 50%),
            radial-gradient(at 20% 80%, #E8B84A 0px, transparent 40%)
          `,
          backgroundSize: '150% 150%',
          animation: 'meshMove 20s ease-in-out infinite',
        }}
      />

      {/* Floating orbs - very subtle */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full blur-[150px] opacity-20"
        style={{
          background: 'radial-gradient(circle, #6B4E9B 0%, transparent 70%)',
          top: '0%',
          right: '10%',
          animation: 'float1 15s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full blur-[120px] opacity-15"
        style={{
          background: 'radial-gradient(circle, #E8B84A 0%, transparent 70%)',
          bottom: '10%',
          left: '5%',
          animation: 'float2 18s ease-in-out infinite',
        }}
      />

      <style jsx>{`
        @keyframes meshMove {
          0%, 100% {
            background-position: 0% 0%;
          }
          25% {
            background-position: 100% 0%;
          }
          50% {
            background-position: 100% 100%;
          }
          75% {
            background-position: 0% 100%;
          }
        }

        @keyframes meshMove2 {
          0%, 100% {
            background-position: 100% 100%;
          }
          33% {
            background-position: 0% 100%;
          }
          66% {
            background-position: 0% 0%;
          }
        }

        @keyframes float1 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(50px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-30px, 20px) scale(0.95);
          }
        }

        @keyframes float2 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-60px, -40px) scale(1.15);
          }
        }

        @keyframes float3 {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.30;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  )
}
