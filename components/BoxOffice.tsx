
import React, { useState } from 'react';
import { ReleasedMovie } from '../types';

interface BoxOfficeProps {
  movies: ReleasedMovie[];
}

const BoxOffice: React.FC<BoxOfficeProps> = ({ movies }) => {
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const buyTicket = (id: string) => {
    setPurchasingId(id);
    setTimeout(() => {
      setPurchasingId(null);
      setSuccessMessage("Enjoy the show! Your digital ticket is ready.");
      setTimeout(() => setSuccessMessage(null), 3000);
    }, 1200);
  };

  const totalPlatformRevenue = movies.reduce((acc, m) => acc + (m.totalRevenue * 0.15), 0);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-12">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex justify-between items-end border-b border-slate-200 pb-10">
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Hobbs Box Office</h2>
            <p className="text-slate-500 font-medium">Watch and support independent AI-driven cinema.</p>
          </div>
          <div className="flex items-center space-x-6">
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Royalty Cut (15%)</p>
                <p className="text-2xl font-black text-indigo-600">${totalPlatformRevenue.toFixed(2)}</p>
             </div>
             <div className="w-px h-10 bg-slate-200"></div>
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Global Viewers</p>
                <p className="text-2xl font-black text-slate-900">{movies.reduce((acc, m) => acc + m.ticketsSold, 0)}</p>
             </div>
          </div>
        </div>

        {successMessage && (
          <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl font-black text-sm uppercase tracking-widest animate-in fade-in slide-in-from-top-4">
             ✨ {successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {movies.map(movie => (
            <div key={movie.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-2xl hover:-translate-y-2 transition-all">
               <div className="aspect-[2/3] relative overflow-hidden bg-slate-900">
                  <img src={movie.posterUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={movie.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                  <div className="absolute bottom-6 left-6 right-6 space-y-2">
                     <span className="text-[10px] font-black bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white uppercase tracking-widest">Digital Release</span>
                     <h3 className="text-2xl font-black text-white leading-tight">{movie.title}</h3>
                  </div>
                  <div className="absolute top-6 right-6 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-black shadow-xl border-2 border-white/20">
                     9.8
                  </div>
               </div>
               
               <div className="p-8 space-y-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                     <span>Dir. {movie.author}</span>
                     <span>Rating: TV-MA</span>
                  </div>

                  <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-3">
                    {movie.description}
                  </p>

                  <div className="pt-6 border-t border-slate-100 mt-auto flex justify-between items-center">
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ticket Price</p>
                        <p className="text-xl font-black text-slate-900">${movie.ticketPrice}</p>
                     </div>
                     <button 
                        onClick={() => buyTicket(movie.id)}
                        disabled={purchasingId === movie.id}
                        className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          purchasingId === movie.id 
                          ? 'bg-slate-100 text-slate-400' 
                          : 'bg-slate-900 text-white shadow-xl hover:bg-black active:scale-95'
                        }`}
                     >
                        {purchasingId === movie.id ? 'Processing...' : 'Buy Ticket'}
                     </button>
                  </div>
               </div>
            </div>
          ))}

          {movies.length === 0 && (
            <div className="col-span-full py-40 text-center space-y-6 border-4 border-dashed border-slate-100 rounded-[3rem]">
               <span className="text-8xl opacity-10">🎭</span>
               <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-300 uppercase tracking-widest">No Premieres Scheduled</h3>
                  <p className="text-slate-400 font-medium max-w-sm mx-auto">Be the first to produce and release a cinematic masterpiece using Hobbs Movie Maker.</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoxOffice;
