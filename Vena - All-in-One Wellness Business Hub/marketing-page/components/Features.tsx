import React from 'react';
import { FeatureIcons } from '../constants';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
    <div className="group relative h-full">
      {/* Background card with gradient border effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-200 via-indigo-200 to-purple-300 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out transform group-hover:scale-105 blur-sm"></div>
      
      <div className="relative bg-white/90 backdrop-blur-sm p-10 rounded-3xl border border-gray-100/50 transition-all duration-700 ease-out group-hover:bg-white group-hover:shadow-xl group-hover:shadow-purple-100/50 group-hover:-translate-y-1 h-full flex flex-col">
        
        {/* Icon container with unique positioning */}
        <div className="relative mb-8">
          <div className="absolute -top-2 -left-2 w-14 h-14 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl opacity-60 group-hover:opacity-100 transition-all duration-500 group-hover:rotate-6"></div>
          <div className="relative flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-700 to-indigo-700 group-hover:from-purple-600 group-hover:to-indigo-600 transition-all duration-500 group-hover:rotate-3 group-hover:scale-110 shadow-lg">
            <div className="text-white scale-90 drop-shadow-sm">
              {icon}
            </div>
          </div>
        </div>

        {/* Content with improved typography - flex-grow to fill remaining space */}
        <div className="space-y-4 flex-grow flex flex-col">
          <h3 className="text-xl font-semibold text-slate-800 leading-tight group-hover:text-slate-900 transition-colors duration-300 min-h-[3rem] flex items-center">
            {title}
          </h3>
          <div className="w-12 h-0.5 bg-gradient-to-r from-purple-400 to-indigo-400 group-hover:w-16 transition-all duration-500"></div>
          <p className="text-slate-600 leading-relaxed font-light group-hover:text-slate-700 transition-colors duration-300 flex-grow">
            {description}
          </p>
        </div>

        {/* Subtle corner accent */}
        <div className="absolute top-4 right-4 w-2 h-2 bg-purple-200 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200"></div>
      </div>
    </div>
);


const Features: React.FC = () => {
  const features = [
    {
      icon: <FeatureIcons.Hub />,
      title: 'Intelligent Time Management',
      description: 'Our advanced AI optimizes your schedule, maximizing productivity and client focus.',
    },
    {
      icon: <FeatureIcons.Connector />,
      title: 'Automated Workflow Generation',
      description: 'Automatically generate post-appointment tasks and workflows for seamless client follow-up.',
    },
    {
      icon: <FeatureIcons.Builder />,
      title: 'Dynamic Personal Landing Page',
      description: 'Showcase your brand with a customizable landing page to attract and retain clients.',
    },
  ];

  return (
    <section id="features" className="bg-[#fcfaf7] py-20 md:py-28 relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-100/40 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center justify-center w-16 h-1 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full mb-8"></div>
          <h2 className="text-4xl md:text-5xl font-light text-slate-800 tracking-wide leading-tight mb-6">
            Everything You Need,
            <span className="block font-extralight text-slate-600">All in One Place</span>
          </h2>
          <p className="text-xl text-slate-600 font-light leading-relaxed max-w-2xl mx-auto">
            Vena is designed from the ground up to empower independent wellness professionals with intelligent, seamless solutions.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="opacity-0 animate-fadeInUp h-full"
              style={{ 
                animationDelay: `${index * 200}ms`,
                animationFillMode: 'forwards'
              }}
            >
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            </div>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out;
        }
      `}</style>
    </section>
  );
};

export default Features;