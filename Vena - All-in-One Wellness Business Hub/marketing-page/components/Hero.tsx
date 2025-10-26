import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-gray-50 via-white to-purple-50/20 pt-20 pb-32 md:pt-32 md:pb-40 overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 -z-10">
          {/* Main gradient blob */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-200/40 via-indigo-200/30 to-purple-300/40 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-gradient-to-tr from-indigo-100/50 to-purple-200/40 rounded-full blur-2xl opacity-50"></div>
          
          {/* Subtle decorative dots */}
          <div className="absolute top-1/4 left-20 w-2 h-2 bg-purple-300 rounded-full opacity-30"></div>
          <div className="absolute top-1/3 right-32 w-1.5 h-1.5 bg-indigo-400 rounded-full opacity-40"></div>
          <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-purple-400 rounded-full opacity-20"></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-50/10 to-transparent opacity-30"
               style={{
                 backgroundImage: `radial-gradient(circle at 1px 1px, rgba(147, 51, 234, 0.1) 1px, transparent 0)`,
                 backgroundSize: '50px 50px'
               }}>
          </div>
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
            {/* Enhanced Content Section */}
            <div className="max-w-4xl mx-auto space-y-8">
            {/* New Badge Design */}
            <div className="inline-block relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 blur-md rounded-lg transform -rotate-1"></div>
                <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M7.5 12.5L10.5 15.5L16.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-sm font-medium tracking-wide">Made For Professionals</span>
                </div>
                </div>
            </div>

                {/* Enhanced Heading */}
                <div className="space-y-6">
                    <h1 className="text-5xl md:text-7xl font-light text-slate-800 leading-[1.1] tracking-wide">
                        The All-in-One
                        <span className="block font-extralight text-slate-600 relative">
                            Wellness Business Hub
                            {/* Decorative underline */}
                            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400 rounded-full opacity-60"></div>
                        </span>
                    </h1>
                    
                    <p className="text-xl md:text-2xl text-slate-600 font-light leading-relaxed max-w-3xl mx-auto">
                        Vena gives you a single interactive hub to connect with clients, manage your schedule, and grow your boutique business effortlessly.
                    </p>
                </div>

                {/* Enhanced CTA Button */}
                <div className="pt-4">
                    <a href="#cta" className="inline-flex items-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium px-10 py-4 rounded-2xl hover:from-purple-500 hover:to-indigo-500 transition-all duration-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:scale-105 border border-white/20 backdrop-blur-sm">
                        <span>Get Early Access</span>
                        <div className="ml-3 w-5 h-5 border-2 border-white rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full transform translate-x-0.5"></div>
                        </div>
                    </a>
                </div>
            </div>

            {/* Enhanced Phone Mockup */}
            <div className="mt-20 md:mt-28 max-w-5xl mx-auto relative">
                {/* Ambient glow behind phone */}
                <div className="absolute inset-0 bg-gradient-to-t from-purple-200/30 via-transparent to-transparent rounded-full blur-3xl scale-110 opacity-60"></div>
                
                <div className="relative mx-auto">
                    {/* Enhanced phone frame with gradient */}
                    <div className="relative mx-auto bg-gradient-to-b from-gray-800 to-gray-900 border-[12px] border-gray-800 rounded-[2.8rem] h-[620px] w-[320px] shadow-2xl">
                        
                        {/* Phone details */}
                        <div className="h-[32px] w-[3px] bg-gray-700 absolute -left-[15px] top-[72px] rounded-l-lg"></div>
                        <div className="h-[46px] w-[3px] bg-gray-700 absolute -left-[15px] top-[124px] rounded-l-lg"></div>
                        <div className="h-[46px] w-[3px] bg-gray-700 absolute -left-[15px] top-[178px] rounded-l-lg"></div>
                        <div className="h-[64px] w-[3px] bg-gray-700 absolute -right-[15px] top-[142px] rounded-r-lg"></div>
                        
                        {/* Screen with enhanced border */}
                        <div className="rounded-[2rem] overflow-hidden w-full h-full bg-white border-2 border-gray-100 relative">
                            <img 
                                src="https://images.pexels.com/photos/3822668/pexels-photo-3822668.jpeg?_gl=1*1mw5c5p*_ga*Mzg0NjEzNzU0LjE3NTc4Mzk5NTA.*_ga_8JE65Q40S6*czE3NTc4Mzk5NTAkbzEkZzEkdDE3NTc4NDAwNDckajU5JGwwJGgw" 
                                alt="Vena app interface" 
                                className="w-full h-full object-cover object-bottom scale-110"
                                /* 
                                Adjust the image display options:
                                1. object-position: controls which part of the image is visible
                                   Examples: object-left, object-right, object-top, object-bottom
                                   Or custom positioning: object-position: 70% 30%
                                
                                2. scale: makes the image larger or smaller within the container
                                   Increase to zoom in (e.g., scale-110, scale-125)
                                   Decrease to zoom out (e.g., scale-90, scale-75)
                                
                                3. object-fit: controls how the image fills the container
                                   object-cover: fills while maintaining aspect ratio (crops if needed)
                                   object-contain: shows the entire image (may leave empty space)
                                   object-fill: stretches to fill the container
                                */
                            />
                            {/* Screen reflection effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none"></div>
                        </div>
                        
                        {/* Floating UI elements around phone */}
                        <div className="absolute -top-12 -left-8 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200/50">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                <div className="w-16 h-2 bg-gray-200 rounded-full"></div>
                            </div>
                        </div>
                        
                        <div className="absolute -bottom-10 -right-12 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-200/50">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                                    <div className="w-3 h-3 bg-white rounded-sm"></div>
                                </div>
                                <div className="space-y-1">
                                    <div className="w-12 h-2 bg-gray-300 rounded-full"></div>
                                    <div className="w-8 h-1.5 bg-gray-200 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="absolute top-20 -right-16 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg border border-gray-200/50">
                            <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                        </div>
                        
                        <div className="absolute bottom-32 -left-14 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-gray-200/50 transform rotate-12">
                            <div className="space-y-1">
                                <div className="flex space-x-1">
                                    <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                                    <div className="w-1 h-1 bg-indigo-400 rounded-full"></div>
                                    <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                                </div>
                                <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
};

export default Hero;