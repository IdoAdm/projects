import React from 'react';

const CheckIcon: React.FC = () => (
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
    </svg>
);


const ValueProposition: React.FC = () => {
  const benefits = [
    'Elevate your professional image online.',
    'Simplify client bookings and payments.',
    'Save valuable administrative hours.',
    'Share personalized content effortlessly.',
    'Grow your practice with powerful tools.',
  ];

  return (
    <section id="value" className="bg-gradient-to-br from-gray-50 via-white to-purple-50/30 py-24 md:py-36 relative overflow-hidden">
      {/* Enhanced background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(124,58,237,0.03)_1px,transparent_0)] bg-[size:40px_40px] opacity-30"></div>
      <div className="absolute top-20 right-10 w-56 h-56 bg-gradient-to-br from-purple-100/30 via-indigo-100/20 to-purple-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-48 h-48 bg-gradient-to-tr from-indigo-100/40 to-purple-100/30 rounded-full blur-2xl"></div>
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-300 rounded-full opacity-60 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-1.5 h-1.5 bg-indigo-400 rounded-full opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* Enhanced Image Section */}
          <div className="lg:w-1/2 relative">
            {/* Subtle layered glow effects */}
            <div className="absolute -inset-6 bg-gradient-to-r from-purple-200/40 to-indigo-200/40 rounded-[2.5rem] blur-2xl opacity-70"></div>
            <div className="absolute -inset-1 bg-gradient-to-br from-white/80 to-white/40 rounded-[2.5rem] blur-sm"></div>
            
            <div className="relative">
              {/* Image with enhanced frame and hover effects */}
              <div className="overflow-hidden rounded-3xl shadow-2xl border border-white/70 group/image transition-all duration-700 hover:shadow-[0_25px_45px_-12px_rgba(124,58,237,0.15)]">
                <img 
                  src="https://images.pexels.com/photos/5038872/pexels-photo-5038872.jpeg?_gl=1*1n7eoid*_ga*Mzg0NjEzNzU0LjE3NTc4Mzk5NTA.*_ga_8JE65Q40S6*czE3NTc4Mzk5NTAkbzEkZzEkdDE3NTc4NDAwNDckajU5JGwwJGgw" 
                  alt="Modern Wellness Professional" 
                  className="w-full h-auto object-cover scale-105 transition-all duration-[2.5s] ease-out group-hover/image:scale-110 group-hover/image:filter group-hover/image:brightness-105"
                />
                
                {/* Gradient overlay with hover effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/10 via-transparent to-transparent transition-opacity duration-700 ease-out group-hover/image:opacity-0"></div>
                
                {/* Additional hover effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 opacity-0 group-hover/image:opacity-100 transition-opacity duration-700"></div>
                <div className="absolute inset-0 shadow-[inset_0_0_0_0_rgba(255,255,255,0.2)] group-hover/image:shadow-[inset_0_0_20px_5px_rgba(255,255,255,0.3)] transition-all duration-700 rounded-3xl"></div>
              </div>
              
              {/* Enhanced decorative elements */}
              <div className="absolute -top-5 -left-5 w-10 h-10 border-l-2 border-t-2 border-purple-400/60 rounded-tl-xl group-hover/image:border-purple-500/80 transition-colors duration-700"></div>
              <div className="absolute -bottom-5 -right-5 w-10 h-10 border-r-2 border-b-2 border-indigo-400/60 rounded-br-xl group-hover/image:border-indigo-500/80 transition-colors duration-700"></div>
              <div className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2 w-2 h-16 bg-gradient-to-b from-purple-300/50 to-indigo-300/50 rounded-full blur-sm group-hover/image:h-24 transition-all duration-700"></div>
              <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-2 h-16 bg-gradient-to-b from-indigo-300/50 to-purple-300/50 rounded-full blur-sm group-hover/image:h-24 transition-all duration-700"></div>
            </div>
          </div>
          
          {/* Enhanced Content Section */}
          <div className="lg:w-1/2 space-y-10">
            {/* Improved badge with subtle animation */}
            <div className="inline-flex items-center group">
              <div className="w-10 h-0.5 bg-gradient-to-r from-purple-400 to-indigo-400 mr-4 group-hover:w-16 transition-all duration-700 ease-out"></div>
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50/50 backdrop-blur-sm px-5 py-2.5 rounded-full border border-purple-200/50 shadow-sm">
                <span className="font-medium text-purple-700 tracking-wider text-sm uppercase">
                  Why Vena?
                </span>
              </div>
            </div>
            
            {/* Enhanced heading with animations */}
            <div className="space-y-6 max-w-lg">
              <h2 className="text-4xl md:text-5xl font-light text-slate-800 leading-tight tracking-wide">
                Designed for the
                <span className="block font-extralight text-slate-600 relative mt-2">
                  Modern Wellness Professional
                  <div className="absolute -bottom-3 left-0 w-32 h-0.5 bg-gradient-to-r from-purple-400 to-transparent"></div>
                </span>
              </h2>
              
              <p className="text-xl text-slate-600 font-light leading-relaxed">
                Stop juggling multiple apps and complex websites. Vena brings everything together in one elegant, easy-to-use platform, so you can focus on what you do best.
              </p>
            </div>
            
            {/* Enhanced Benefits List */}
            <div className="space-y-5 pt-4 relative">
              {/* Subtle vertical connecting line */}
              <div className="absolute left-6 top-2 bottom-2 w-px bg-gradient-to-b from-purple-200/40 via-indigo-200/30 to-purple-200/40"></div>
              
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center group pl-2 relative">
                  {/* Enhanced icon styling */}
                  <div className="flex-shrink-0 relative mr-6 z-10">
                    {/* Outer glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-indigo-500/20 rounded-full blur-md scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    
                    {/* Icon background with subtle pulse on hover */}
                    <div className="relative bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full p-2.5 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                      <CheckIcon />
                    </div>
                  </div>
                  
                  {/* Enhanced text with reveal animation */}
                  <div className="relative overflow-hidden">
                    <span className="text-slate-700 font-light text-lg leading-relaxed inline-block transform group-hover:translate-x-1 transition-transform duration-500 ease-out">
                      {benefit}
                    </span>
                    
                    {/* Subtle highlight on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-50/0 via-purple-50/30 to-purple-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md"></div>
                  </div>
                </div>
              ))}
              
              {/* Bottom decorative element */}
              <div className="absolute bottom-0 left-6 transform translate-x-[-50%] translate-y-[100%] w-2 h-2 bg-purple-300/40 rounded-full"></div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default ValueProposition;