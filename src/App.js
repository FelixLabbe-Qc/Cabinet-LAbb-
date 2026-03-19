import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { 
  getFirestore, collection, addDoc, onSnapshot, 
  query, orderBy, limit 
} from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { 
  Scale, Calendar, Clock, MapPin, Phone, Mail, ChevronRight, 
  CheckCircle2, Menu, X, Briefcase, Users, PartyPopper, 
  Info, ArrowRight, Send, User, FileText, ChevronLeft, Database,
  ShieldCheck, Globe, Zap, MessageSquare
} from 'lucide-react';

// Configuration Firebase Réelle (Tes accès Otterburn Park)
const firebaseConfig = {
  apiKey: "AIzaSyAt0CoERw0whhebynAcNe9SO_VkdZqcmyM",
  authDomain: "cabinet-labbe-app.firebaseapp.com",
  projectId: "cabinet-labbe-app",
  storageBucket: "cabinet-labbe-app.firebasestorage.app",
  messagingSenderId: "44920288369",
  appId: "1:44920288369:web:1bd4fef9b66f3c5ed197d0",
  measurementId: "G-H1HZ1T1V28"
};

// Initialisation des services Cloud
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const App = () => {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingStatus, setBookingStatus] = useState('idle'); 
  const [bookedSlots, setBookedSlots] = useState({});
  const [activeService, setActiveService] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    phone: '', 
    email: '',
    reason: 'Consultation Générale', 
    notes: '' 
  });

  const lawyerEmail = "Felix.ciboulette.labbe@gmail.com";
  const lawyerPhone = "514 758 6930";

  // 1. Connexion et Surveillance Firestore
  useEffect(() => {
    signInAnonymously(auth).catch(err => console.error("Firebase Auth Error:", err));
    onAuthStateChanged(auth, setUser);

    const q = query(collection(db, "rendezvous"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const slots = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (!slots[data.date]) slots[data.date] = [];
        slots[data.date].push(data.slot);
      });
      setBookedSlots(slots);
    });
    return () => unsubscribe();
  }, []);

  // 2. Gestion de la réservation
  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedSlot || !user) return;
    setBookingStatus('confirming');
    
    try {
      await addDoc(collection(db, "rendezvous"), {
        ...formData,
        date: selectedDate,
        slot: selectedSlot,
        createdAt: new Date().toISOString(),
        status: 'pending',
        location: 'Otterburn Park'
      });
      setBookingStatus('success');
    } catch (error) {
      console.error("Booking Error:", error);
      alert("Erreur de connexion au Cloud. Réessayez.");
      setBookingStatus('idle');
    }
  };

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  const services = [
    { 
      id: 1, 
      title: "Droit de la Famille", 
      desc: "Médiation, divorce et garde d'enfants.", 
      longDesc: "Nous comprenons que les enjeux familiaux sont les plus sensibles. Me L'Abbé vous accompagne avec empathie pour protéger vos droits et l'intérêt de vos enfants dans les moments difficiles.",
      points: ["Divorce & Séparation", "Garde d'enfants", "Médiation familiale", "Pensions alimentaires"],
      icon: <Users className="w-8 h-8" />,
      color: "bg-blue-50 text-blue-600"
    },
    { 
      id: 2, 
      title: "Droit Immobilier", 
      desc: "Transactions et litiges de propriété.", 
      longDesc: "Que ce soit pour l'achat de votre première propriété à Otterburn Park ou pour un litige complexe de vices cachés, nous sécurisons vos actifs immobiliers avec rigueur.",
      points: ["Vices cachés", "Baux résidentiels", "Copropriété", "Transactions"],
      icon: <MapPin className="w-8 h-8" />,
      color: "bg-emerald-50 text-emerald-600"
    },
    { 
      id: 3, 
      title: "Litige Civil", 
      desc: "Défense de vos intérêts en cour.", 
      longDesc: "Une représentation stratégique et musclée devant les tribunaux civils. Nous ne laissons rien au hasard pour faire valoir vos droits contractuels ou personnels.",
      points: ["Responsabilité civile", "Droit des contrats", "Recouvrement", "Assurances"],
      icon: <Scale className="w-8 h-8" />,
      color: "bg-amber-50 text-amber-600"
    },
    { 
      id: 4, 
      title: "Droit des Affaires", 
      desc: "Conseils pour entrepreneurs et PME.", 
      longDesc: "De l'incorporation à la vente d'entreprise, nous sommes le partenaire juridique des entrepreneurs de la Rive-Sud pour assurer une croissance sécurisée.",
      points: ["Incorporation", "Contrats commerciaux", "Fusions", "Marques"],
      icon: <Briefcase className="w-8 h-8" />,
      color: "bg-indigo-50 text-indigo-600"
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-emerald-100">
      
      {/* --- MODAL SERVICE --- */}
      {activeService && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all" onClick={() => setActiveService(null)}>
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="bg-emerald-800 p-10 text-white relative">
              <button onClick={() => setActiveService(null)} className="absolute top-8 right-8 p-3 hover:bg-white/20 rounded-full transition-all"><X /></button>
              <div className="bg-white/10 w-20 h-20 rounded-3xl flex items-center justify-center mb-8">{activeService.icon}</div>
              <h3 className="text-4xl font-black uppercase italic tracking-tighter">{activeService.title}</h3>
            </div>
            <div className="p-10">
              <p className="text-slate-600 text-xl mb-10 font-medium leading-relaxed">{activeService.longDesc}</p>
              <div className="grid sm:grid-cols-2 gap-4 mb-10">
                {activeService.points.map((p, i) => (
                  <div key={i} className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-emerald-900 shadow-sm transition-hover hover:border-emerald-200">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    {p}
                  </div>
                ))}
              </div>
              <button onClick={() => {setActiveService(null); document.getElementById('agenda').scrollIntoView({behavior:'smooth'})}} className="w-full py-6 bg-emerald-800 text-white rounded-2xl font-black text-xl shadow-xl shadow-emerald-900/20 active:scale-95 transition-all flex items-center justify-center gap-3">
                Réserver ce service <ArrowRight />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- NAVIGATION --- */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 h-20 flex items-center px-6">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-800 p-2.5 rounded-xl shadow-lg shadow-emerald-200"><Scale className="text-white w-6 h-6" /></div>
            <div className="flex flex-col">
              <span className="text-xl font-black uppercase tracking-tighter italic text-slate-800 leading-none">Cabinet L'Abbé</span>
              <span className="text-[10px] font-bold text-emerald-700 tracking-[0.3em] uppercase mt-1">Droit & Équité</span>
            </div>
          </div>
          <div className="hidden md:flex gap-10 font-bold text-slate-500 text-sm tracking-widest">
            <a href="#accueil" className="hover:text-emerald-800 transition">ACCUEIL</a>
            <a href="#services" className="hover:text-emerald-800 transition">EXPERTISES</a>
            <a href="#agenda" className="bg-emerald-800 text-white px-10 py-3 rounded-full shadow-xl shadow-emerald-100 transition-all hover:bg-emerald-900">RENDEZ-VOUS</a>
          </div>
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}><Menu /></button>
        </div>
      </nav>
{/* --- BANDEAU NON-OFFICIEL (PROJET FICTIF) --- */}
      <div className="fixed top-20 w-full z-40 bg-amber-50 border-b border-amber-100 py-2 px-6 text-center shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-700 flex items-center justify-center gap-2">
          <Info className="w-3 h-3" /> Projet fictif / non-officiel • Pour le divertissement uniquement
        </p>
      </div>

      {/* --- HERO SECTION (Ajusté à pt-64 pour laisser de la place au bandeau) --- */}
      <header id="accueil" className="pt-64 pb-24 text-center px-6 bg-gradient-to-b from-emerald-50/50 to-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white border border-emerald-100 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.2em] text-emerald-800 mb-10 shadow-sm">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Persistance Cloud Activée • Otterburn Park
          </div>
          <h1 className="text-6xl md:text-9xl font-black text-slate-900 mb-8 tracking-tighter italic leading-none uppercase">
            Droit. <span className="text-emerald-800">Équité.</span><br/>Résultats.
          </h1>
      {/* --- HERO SECTION --- */}
      <header id="accueil" className="pt-48 pb-24 text-center px-6 bg-gradient-to-b from-emerald-50/50 to-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white border border-emerald-100 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.2em] text-emerald-800 mb-10 shadow-sm">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Persistance Cloud Activée • Otterburn Park
          </div>
          <h1 className="text-6xl md:text-9xl font-black text-slate-900 mb-8 tracking-tighter italic leading-none uppercase">
            Droit. <span className="text-emerald-800">Équité.</span><br/>Résultats.
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto mb-16 font-medium leading-relaxed">
            Le premier cabinet d'Otterburn Park utilisant la technologie de pointe pour mieux vous servir. Disponibilités étendues jusqu'à <span className="text-slate-900 font-black">20h00</span>.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <a href="#agenda" className="bg-slate-900 text-white px-14 py-6 rounded-[2rem] font-black text-xl shadow-2xl hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-3">
              Consulter l'agenda <Calendar className="w-6 h-6" />
            </a>
            <a href="tel:5147586930" className="bg-white text-emerald-800 border-2 border-emerald-50 px-14 py-6 rounded-[2rem] font-black text-xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-3">
              <Phone /> 514 758 6930
            </a>
          </div>
        </div>
      </header>

      {/* --- SERVICES GRID --- */}
      <section id="services" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-black tracking-tighter uppercase italic mb-4">Nos Expertises</h2>
          <div className="w-24 h-2 bg-emerald-800 mx-auto rounded-full"></div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map(s => (
            <div key={s.id} onClick={() => setActiveService(s)} className="group p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-2xl hover:border-emerald-200 cursor-pointer transition-all duration-500 relative overflow-hidden">
              <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500 ${s.color}`}>
                {s.icon}
              </div>
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter italic group-hover:text-emerald-800 transition-colors">{s.title}</h3>
              <p className="text-slate-500 text-sm font-medium mb-10 leading-relaxed line-clamp-3">{s.desc}</p>
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm uppercase tracking-widest">
                Détails complets <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- AGENDA SECTION --- */}
      <section id="agenda" className="py-32 px-6 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full"></div>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <div>
            <h2 className="text-6xl font-black italic uppercase tracking-tighter mb-10 text-emerald-400">Agenda<br/>Connecté</h2>
            <p className="text-slate-400 text-xl mb-14 font-medium leading-relaxed">
              Consultez nos disponibilités en temps réel. Notre système Cloud garantit qu'aucune plage horaire n'est réservée deux fois. Nous offrons désormais des consultations en soirée jusqu'à <span className="text-white font-bold underline decoration-emerald-500">20h00</span>.
            </p>
            <div className="grid gap-6">
              <div className="flex items-center gap-8 p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                <Database className="text-emerald-400 w-10 h-10 group-hover:scale-110 transition-transform" />
                <div>
                  <h4 className="text-xl font-bold mb-1">Données Persistantes</h4>
                  <p className="text-slate-500 font-medium">Sauvegardé instantanément dans le Cloud Firebase</p>
                </div>
              </div>
              <div className="flex items-center gap-8 p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                <Send className="text-emerald-400 w-10 h-10 group-hover:scale-110 transition-transform" />
                <div>
                  <h4 className="text-xl font-bold mb-1">Alerte Me L'Abbé</h4>
                  <p className="text-slate-500 font-medium">Notification sécurisée à {lawyerEmail}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white text-slate-900 p-12 md:p-16 rounded-[4rem] shadow-2xl relative">
            {bookingStatus === 'success' ? (
              <div className="text-center py-24 animate-in zoom-in duration-500">
                <div className="w-32 h-32 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-10">
                  <PartyPopper className="text-emerald-600 w-16 h-16" />
                </div>
                <h3 className="text-5xl font-black mb-6 uppercase tracking-tighter italic">Confirmé !</h3>
                <p className="text-slate-500 text-xl font-bold mb-12 leading-relaxed">
                  Me L'Abbé a bien reçu votre demande pour le <span className="text-emerald-800">{selectedDate}</span> à <span className="text-emerald-800">{selectedSlot}</span>.
                </p>
                <button onClick={() => {setBookingStatus('idle'); setSelectedSlot(null);}} className="w-full py-6 bg-emerald-800 text-white rounded-3xl font-black text-xl shadow-2xl hover:bg-emerald-900 active:scale-95 transition-all">
                  Faire une autre demande
                </button>
              </div>
            ) : (
              <form onSubmit={handleBooking} className="space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-8">
                  <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3 italic"><Calendar className="text-emerald-800 w-8 h-8"/> Date de Consultation</h3>
                  <input type="date" min={new Date().toISOString().split('T')[0]} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-bold outline-none focus:border-emerald-500 w-full sm:w-auto text-lg transition-all" />
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-12">
                  {timeSlots.map(time => {
                    const booked = bookedSlots[selectedDate]?.includes(time);
                    return (
                      <button 
                        key={time} 
                        type="button" 
                        disabled={booked} 
                        onClick={() => setSelectedSlot(time)} 
                        className={`py-5 rounded-2xl font-black border-2 transition-all text-sm relative ${
                          booked 
                            ? 'bg-slate-50 text-slate-200 border-transparent cursor-not-allowed line-through' 
                            : selectedSlot === time 
                              ? 'bg-emerald-800 border-emerald-800 text-white shadow-xl scale-105 z-10' 
                              : 'bg-white border-slate-100 text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/30'
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-4 mb-12">
                  <div className="relative">
                    <User className="absolute left-5 top-5 text-slate-400 w-5 h-5" />
                    <input required placeholder="Votre Nom Complet" className="w-full p-5 pl-14 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-bold outline-none focus:border-emerald-800 transition-all text-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-5 top-5 text-slate-400 w-5 h-5" />
                    <input required placeholder="Téléphone de contact" className="w-full p-5 pl-14 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-bold outline-none focus:border-emerald-800 transition-all text-lg" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>

                <button 
                  disabled={!selectedSlot} 
                  type="submit" 
                  className={`w-full py-7 rounded-[2rem] font-black text-2xl shadow-2xl transition-all flex items-center justify-center gap-4 ${
                    !selectedSlot 
                      ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                      : 'bg-emerald-800 text-white hover:bg-emerald-900 shadow-emerald-900/20 active:scale-95'
                  }`}
                >
                  {bookingStatus === 'confirming' ? 'Traitement Cloud...' : 'Confirmer à Me L\'Abbé'}
                  <Send className={!selectedSlot ? 'hidden' : 'w-6 h-6'} />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-24 bg-slate-50 text-center border-t border-slate-200 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-10">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-800 p-3 rounded-2xl shadow-lg shadow-emerald-200"><Scale className="text-white w-8 h-8" /></div>
            <span className="text-3xl font-black text-emerald-950 uppercase italic tracking-tighter">Cabinet L'Abbé</span>
          </div>
          <p className="text-slate-500 font-bold text-lg max-w-xl">
            Cabinet juridique de premier plan à Otterburn Park. Engagement total et intégrité inébranlable.
          </p>
          <div className="flex flex-wrap justify-center gap-10 text-slate-400 font-black text-xs uppercase tracking-[0.4em]">
            <a href="#" className="hover:text-emerald-800 transition">Légal</a>
            <a href="#" className="hover:text-emerald-800 transition">Confidentialité</a>
            <a href="#" className="hover:text-emerald-800 transition">Déontologie</a>
          </div>
          <div className="text-slate-300 font-bold text-[10px] uppercase tracking-[0.8em] mt-10">
            Otterburn Park, Québec • &copy; 2026
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
