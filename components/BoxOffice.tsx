
import React, { useState } from 'react';
import { ReleasedMovie } from '../types';

interface BoxOfficeProps {
  movies: ReleasedMovie[];
}

const BoxOffice: React.FC<BoxOfficeProps> = ({ movies }) => {
  const [activeView, setActiveView] = useState<'gallery' | 'premiere' | 'manager'>('gallery');
  const [selectedMovie, setSelectedMovie] = useState<ReleasedMovie | null>(null);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [hasBought, setHasBought] = useState<Record<string, boolean>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Ticket Architect State
  const [isArchitectOpen, setIsArchitectOpen] = useState(false);
  const [ticketPrice, setTicketPrice] = useState(12.50);
  const [isLive, setIsLive] = useState(true);

  const buyTicket = (id: string) => {
    setPurchasingId(id);
    setTimeout(() => {
      setPurchasingId(null);
      setHasBought(prev => ({ ...prev, [id]: true }));
      setSuccessMessage("Digital Premiere Ticket Verified! Access Granted.");
      setTimeout(() => setSuccessMessage(null), 3000);
    }, 1200);
  };

  const openPremierePage = (movie: ReleasedMovie) => {
    setSelectedMovie(movie);
    setActiveView('premiere');
  };

  const openManager = (movie: ReleasedMovie) => {
    setSelectedMovie(movie);
    setActiveView('manager');
  };

  const copyLandingPageLink = (movie: ReleasedMovie) => {
    const url = `https://omniportal.app/premiere/${movie.slug || movie.id}`;
    navigator.clipboard.writeText(url);
    setSuccessMessage("Premiere Link Copied! Ready for Campaign Injection.");
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  const totalPlatformRevenue = movies.reduce((acc, m) => acc + (m.totalRevenue * 0.15), 0);

  // --- PREMIERE LANDING PAGE VIEW ---
  if (activeView === 'premiere' && selectedMovie) {
    const bought = hasBought[selectedMovie.id];
    return (
      <div className="flex-1 h-full bg-black overflow-y-auto animate-in fade-in duration-700">
        <div className="relative w-full min-h-screen flex flex-col">
          {/* Backdrop Header */}
          <div className="absolute top-0 left-0 right-0 h-[80vh] overflow-hidden">
             <img src={selectedMovie.posterUrl} className="w-full h-full object-cover opacity-40 blur-xl scale-110" alt="bg" />
             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
          </div>

          {/* Top Nav HUD */}
          <div className="relative z-10 p-10 flex justify-between items-center">
             <button onClick={() => setActiveView('gallery')} className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-widest transition-all">← Back to Hub</button>
             <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black shadow-2xl">9.8</div>
          </div>

          {/* Main Hero Container */}
          <div className="relative z-10 max-w-7xl mx-auto w-full px-10 grid grid-cols-12 gap-16 mt-12 pb-32">
             {/* Left: Poster */}
             <div className="col-span-12 lg:col-span-5">
                <div className="aspect-[2/3] w-full bg-slate-900 rounded-[3rem] overflow-hidden shadow-[0_60px_120px_rgba(0,0,0,0.8)] border border-white/10 group">
                   <img src={selectedMovie.posterUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="poster" />
                </div>
             </div>

             {/* Right: Info & CTA */}
             <div className="col-span-12 lg:col-span-7 flex flex-col justify-center space-y-12">
                <div className="space-y-6">
                   <div className="flex items-center space-x-3">
                      <span className="bg-indigo-600 text-white px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest">Global Premiere</span>
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Released by {selectedMovie.author}</span>
                   </div>
                   <h1 className="text-8xl font-black text-white tracking-tighter uppercase leading-none">{selectedMovie.title}</h1>
                   <p className="text-2xl text-slate-400 font-medium leading-relaxed max-w-2xl italic">
                      "{selectedMovie.description}"
                   </p>
                </div>

                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[4rem] p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
                   <div className="text-center md:text-left space-y-2">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Access Type</p>
                      <h4 className="text-3xl font-black text-white uppercase">{bought ? 'Ticket Active' : 'Neural Admission'}</h4>
                   </div>
                   <div className="h-16 w-px bg-white/10 hidden md:block"></div>
                   <div className="text-center space-y-1">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Direct Pricing</p>
                      <p className="text-4xl font-black text-white">${selectedMovie.ticketPrice}</p>
                   </div>
                   <div className="h-16 w-px bg-white/10 hidden md:block"></div>
                   <button 
                      onClick={() => bought ? alert("Opening stream...") : buyTicket(selectedMovie.id)}
                      disabled={purchasingId === selectedMovie.id}
                      className={`px-16 py-6 rounded-[2rem] font-black text-lg uppercase tracking-[0.1em] shadow-2xl transition-all transform active:scale-95 flex items-center space-x-4 ${
                         bought 
                         ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                         : purchasingId === selectedMovie.id ? 'bg-slate-800 text-slate-500 cursor-wait' : 'bg-white text-black hover:bg-indigo-500 hover:text-white'
                      }`}
                   >
                      {purchasingId === selectedMovie.id ? (
                        <>
                           <div className="w-5 h-5 border-3 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                           <span>Verifying...</span>
                        </>
                      ) : bought ? (
                        <>
                           <span>Watch Now</span>
                           <span className="text-2xl">🎬</span>
                        </>
                      ) : (
                        <>
                           <span>Buy Ticket</span>
                           <span className="text-2xl">🎟️</span>
                        </>
                      )}
                   </button>
                </div>

                <div className="grid grid-cols-3 gap-6 opacity-40">
                   <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase text-slate-500">Quality</p>
                      <p className="text-sm font-bold text-white uppercase">4K Ultra HD</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase text-slate-500">Audio</p>
                      <p className="text-sm font-bold text-white uppercase">Neural Surround</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase text-slate-500">Subtitles</p>
                      <p className="text-sm font-bold text-white uppercase">Multi-Lang AI</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // --- MANAGEMENT DASHBOARD VIEW ---
  if (activeView === 'manager' && selectedMovie) {
    return (
      <div className="flex-1 h-full bg-slate-50 overflow-y-auto animate-in slide-in-from-right-10 duration-500 p-12">
         <div className="max-w-5xl mx-auto space-y-10 pb-32">
            <div className="flex justify-between items-center border-b border-slate-200 pb-8">
               <div className="flex items-center space-x-6">
                  <button onClick={() => setActiveView('gallery')} className="p-3 bg-white border border-slate-200 rounded-full hover:bg-slate-100 transition-all text-slate-400 uppercase text-[10px]">←</button>
                  <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{selectedMovie.title}</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Management Portal</p>
                  </div>
               </div>
               <div className="flex space-x-3">
                  <button 
                    onClick={() => copyLandingPageLink(selectedMovie)}
                    className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center"
                  >
                    🚀 Copy Landing Link
                  </button>
                  <button onClick={() => setActiveView('premiere')} className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">View Landing Page</button>
               </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
               {/* Left: Stats & Poster */}
               <div className="col-span-4 space-y-8">
                  <div className="aspect-[2/3] w-full rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
                     <img src={selectedMovie.posterUrl} className="w-full h-full object-cover" alt="p" />
                  </div>
                  <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white space-y-6 shadow-xl shadow-indigo-900/20">
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase text-indigo-200">Total Revenue</span>
                        <span className="text-[10px] font-black uppercase bg-white/20 px-2 py-0.5 rounded">Real-time</span>
                     </div>
                     <p className="text-5xl font-black">${(selectedMovie.ticketsSold * selectedMovie.ticketPrice).toLocaleString()}</p>
                     <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                        <div>
                           <p className="text-[9px] font-black text-indigo-200 uppercase">Tickets Sold</p>
                           <p className="text-2xl font-black">{selectedMovie.ticketsSold.toLocaleString()}</p>
                        </div>
                        <span className="text-[9px] font-black text-indigo-300">Target: 5,000</span>
                     </div>
                  </div>
               </div>

               {/* Right: Ticket Architect */}
               <div className="col-span-8 space-y-8">
                  <div className="bg-white rounded-[3rem] border border-slate-200 p-10 shadow-sm space-y-10">
                     <div className="flex justify-between items-center px-2">
                        <div className="flex items-center space-x-4">
                           <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner">🎟️</div>
                           <div>
                              <h4 className="text-xl font-black text-slate-900 uppercase">Ticket Architect</h4>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Configure admission logic</p>
                           </div>
                        </div>
                        <div className="flex items-center space-x-3">
                           <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${isLive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                              {isLive ? 'Sales Active' : 'Draft Mode'}
                           </span>
                           <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" checked={isLive} onChange={() => setIsLive(!isLive)} />
                              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                           </label>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">Unit Price (USD)</label>
                           <div className="flex">
                              <div className="bg-slate-100 px-5 flex items-center rounded-l-2xl text-lg font-black text-slate-500 border-r border-white/10">$</div>
                              <input 
                                 type="number" 
                                 className="flex-1 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 p-5 rounded-r-2xl font-black text-2xl outline-none transition-all shadow-inner"
                                 value={ticketPrice}
                                 onChange={e => setTicketPrice(Number(e.target.value))}
                              />
                           </div>
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">Access Protocol</label>
                           <select className="w-full bg-slate-50 border-2 border-transparent p-6 rounded-[1.5rem] font-black text-xs uppercase tracking-widest outline-none shadow-inner cursor-pointer hover:bg-slate-100">
                              <option>Digital Premiere Stream</option>
                              <option>Unlimited Vault Download</option>
                              <option>Interactive Multi-User Experience</option>
                           </select>
                        </div>
                     </div>

                     <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white space-y-4">
                        <div className="flex items-center space-x-3">
                           <span className="text-xl">📢</span>
                           <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Campaign Integration</h5>
                        </div>
                        <p className="text-xs font-medium text-slate-400 leading-relaxed italic">"Link this ticket to your 'Email Broadcast' campaign. OmniPortal will automatically embed high-res movie thumbnails with a 'Reserve Seat' trigger for every contact in your segment."</p>
                        <button onClick={() => alert("Injecting into Campaign Matrix...")} className="px-6 py-2.5 bg-indigo-600 rounded-xl text-[9px] font-black uppercase hover:bg-indigo-700 transition-all">Link to Campaigns Hub</button>
                     </div>

                     <button onClick={() => { setActiveView('gallery'); setSuccessMessage("Ticket Configuration Synced."); setTimeout(() => setSuccessMessage(null), 3000); }} className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-black transition-all">Commit Architect Changes</button>
                  </div>
               </div>
            </div>
         </div>
      </div>
    );
  }

  // --- MAIN GALLERY VIEW ---
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-12 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex justify-between items-end border-b border-slate-200 pb-10">
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Hobbs Box Office</h2>
            <p className="text-slate-500 font-medium">Global Distribution Hub & Ticket Architecture Studio.</p>
          </div>
          <div className="flex items-center space-x-6">
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Royalty Cut (15%)</p>
                <p className="text-2xl font-black text-indigo-600">${totalPlatformRevenue.toFixed(2)}</p>
             </div>
             <div className="w-px h-10 bg-slate-200"></div>
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Audience Size</p>
                <p className="text-2xl font-black text-slate-900">{movies.reduce((acc, m) => acc + m.ticketsSold, 0).toLocaleString()}</p>
             </div>
          </div>
        </div>

        {successMessage && (
          <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[2000] bg-emerald-600 text-white px-10 py-5 rounded-[2.5rem] shadow-[0_30px_60px_rgba(16,185,129,0.3)] font-black text-sm uppercase tracking-widest animate-in slide-in-from-top-10 duration-500 flex items-center space-x-4">
             <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-lg">✨</div>
             <span>{successMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {movies.map(movie => (
            <div key={movie.id} className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all">
               <div className="aspect-[2/3] relative overflow-hidden bg-slate-900">
                  <img src={movie.posterUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={movie.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                  
                  {/* Overlay Menu */}
                  <div className="absolute top-6 right-6 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                     <button 
                        onClick={() => copyLandingPageLink(movie)}
                        className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black shadow-xl transition-all"
                        title="Copy Shareable Premiere Link"
                     >
                        🚀
                     </button>
                     <button 
                        onClick={() => openManager(movie)}
                        className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl hover:bg-indigo-700 transition-all"
                        title="Manage Sales & Tickets"
                     >
                        ⚙️
                     </button>
                  </div>

                  <div className="absolute bottom-8 left-8 right-8 space-y-2">
                     <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-black bg-indigo-600 px-3 py-1 rounded-full text-white uppercase tracking-widest shadow-xl">Creator Node</span>
                        <span className="text-[10px] font-black bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white uppercase tracking-widest">Released</span>
                     </div>
                     <h3 className="text-3xl font-black text-white leading-tight uppercase tracking-tighter">{movie.title}</h3>
                  </div>
               </div>
               
               <div className="p-10 space-y-8 flex-1 flex flex-col">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                     <span>Dir. {movie.author}</span>
                     <span>Rating: TV-MA</span>
                  </div>

                  <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-3 italic">
                    "{movie.description}"
                  </p>

                  <div className="pt-8 border-t border-slate-100 mt-auto flex justify-between items-center">
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admission</p>
                        <p className="text-2xl font-black text-slate-900">${movie.ticketPrice}</p>
                     </div>
                     <div className="flex space-x-2">
                        <button 
                           onClick={() => openPremierePage(movie)}
                           className="px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all bg-slate-900 text-white shadow-xl hover:bg-indigo-600 active:scale-95"
                        >
                           Premiere Page
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          ))}

          <button onClick={() => alert("Redirecting to Movie Maker...")} className="bg-slate-50 border-4 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center space-y-6 text-slate-300 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/20 transition-all p-12">
             <div className="w-20 h-20 rounded-full border-4 border-slate-200 flex items-center justify-center text-4xl group hover:border-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-md">
                +
             </div>
             <div className="text-center">
                <h3 className="text-xl font-black uppercase tracking-widest text-slate-400">Release New Film</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-2">Neural Production Pipeline</p>
             </div>
          </button>

          {movies.length === 0 && (
            <div className="col-span-full py-40 text-center space-y-6 border-4 border-dashed border-slate-100 rounded-[3rem] opacity-20">
               <span className="text-[120px]">🎭</span>
               <div className="space-y-2">
                  <h3 className="text-4xl font-black uppercase tracking-[0.4em]">Empty Registry</h3>
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Initialize a production cycle to debut your first cinematic asset</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoxOffice;
