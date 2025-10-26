import React from 'react';

const CTA: React.FC = () => {
  return (
    <section id="cta" className="bg-[#fcfaf7]">
      <div className="container mx-auto px-6 py-20 md:py-28">
        <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden shadow-2xl hover:shadow-3xl hover:from-purple-500 hover:via-purple-600 hover:to-indigo-700 transition-all duration-500 ease-out transform hover:-translate-y-1 hover:scale-[1.02] group cursor-pointer">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-10 group-hover:opacity-15 transition-opacity duration-500">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/3 group-hover:scale-110 transition-transform duration-700"></div>
          </div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-light text-white tracking-wide mb-6 leading-tight group-hover:text-purple-50 transition-colors duration-300">
              Ready to Transform
              <span className="block font-extralight text-purple-100 group-hover:text-white transition-colors duration-300">Your Practice?</span>
            </h2>
            <p className="text-lg md:text-xl text-purple-50 mb-12 font-light leading-relaxed max-w-lg mx-auto group-hover:text-purple-100 transition-colors duration-300">
              Join thousands of wellness professionals who are already growing their business with Vena.
            </p>
            
            <div className="flex justify-center">
              <a
                href="https://app.vena.software/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-purple-700 font-medium px-8 py-4 rounded-2xl hover:bg-purple-50 hover:text-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 border border-white/20 inline-block text-center"
              >
                Sign Up Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;