import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { 
  Scale, Calendar, Clock, MapPin, Phone, Mail, ChevronRight, 
  CheckCircle2, Menu, X, Briefcase, Users, PartyPopper, 
  Info, ArrowRight, Send, User, FileText, ChevronLeft, Database 
} from 'lucide-react';

// Configuration Firebase Réelle
const firebaseConfig = {
  apiKey: "AIzaSyAt0CoERw0whhebynAcNe9SO_VkdZqcmyM",
  authDomain: "cabinet-labbe-app.firebaseapp.com",
  projectId: "cabinet-labbe-app",
  storageBucket: "cabinet-labbe-app.firebasestorage.app",
  messagingSenderId: "44920288369",
  appId: "1:44920288369:web:1bd4fef9b66f3c5ed197d0",
  measurementId: "G-H1HZ1T1V28"
};

// Initialisation
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const App = () => {
  const [user, setUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingStatus, setBookingStatus] = useState('idle'); 
  const [bookedSlots, setBookedSlots] = useState({});
  const [activeService, setActiveService] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', reason: 'Consultation Générale', notes: '' });

  const lawyerEmail = "Felix.ciboulette.labbe@gmail.com";

  useEffect(() => {
    signInAnonymously(auth).catch(err => console.error("Auth error:", err));
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

  const timeSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

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
        userId: user.uid
      });
      setBookingStatus('success');
    } catch (error) {
      alert("Erreur Cloud : Vérifiez vos règles Firestore.");
      setBookingStatus('idle');
    }
  };

  const services = [
    { id: 1, title: "Droit de la Famille", desc: "Médiation, divorce et garde d'enfants.", longDesc: "Approche humaine pour vos dossiers les plus sensibles.", points: ["Divorce", "Garde", "Médiation"], icon: <Users className="w-8 h-8" /> },
    { id: 2, title: "Droit Immobilier", desc: "Transactions et litiges de propriété.", longDesc: "Sécurisation de vos actifs immobiliers à Otterburn Park.", points: ["Achat/Vente", "Baux", "Vices cachés"], icon: <MapPin className="w-8 h-8" /> },
    { id: 3, title: "Litige Civil", desc: "Défense de vos intérêts en cour.", longDesc: "Représentation rigoureuse et stratégique.", points: ["Contrats", "Responsabilité", "Assurances"], icon: <Scale className="w-8 h-8" /> },
    { id: 4, title: "Droit des Affaires", desc: "Conseils pour entrepreneurs et PME.", longDesc: "Partenaire de croissance pour votre entreprise.", points: ["Incorporation", "Contrats", "Fusions"], icon: <Briefcase className="w-8 h-8" /> }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100">
      {/* Modal Service */}
      {activeService && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setActiveService(null)}>
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in" onClick={(e) => e.stopPropagation()}>
            <div className="bg-emerald-800 p-8 text-white relative">
              <button onClick={() => setActiveService(null)} className="absolute top-6 right-6 p-3 hover:bg-white/20 rounded-full"><X /></button>
              <h3 className="text-4xl font-black uppercase italic tracking-tighter">{activeService.title}</h3>
            </div>
            <div className="p-10">
              <p className="text-slate-600 text-xl mb-10 font-medium">{activeService.longDesc}</p>
              <div className="grid sm:grid-cols-2 gap-4 mb-10">
                {activeService.points.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-emerald-900"><CheckCircle2 className="w-5 h-5" />{p}</div>
                ))}
              </div>
              <button onClick={() => {setActiveService(null); document.getElementById('agenda').scrollIntoView({behavior:'smooth'})}} className="w-full py-5 bg-emerald-800 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-900/20 active:scale-95 transition-all">Prendre rendez-vous</button>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 h-20 flex items-center px-6">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-800 p-2 rounded-xl shadow-lg"><Scale className="text-white w-6 h-6" /></div>
            <span className="text-xl font-black uppercase tracking-tighter italic">Cabinet L'Abbé</span>
          </div>
          <div className="hidden md:flex gap-8 font-bold text-slate-500 text-sm">
            <a href="#accueil" className="hover:text-emerald-800 uppercase">Accueil</a>
            <a href="#services" className="hover:text-emerald-800 uppercase">Services</a>
            <a href="#agenda" className="bg-emerald-800 text-white px-8 py-3 rounded-full shadow-xl shadow-emerald-100 transition-all uppercase">Rendez-vous</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header id="accueil" className="pt-48 pb-24 text-center px-6">
        <span className="bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 inline-block">Persistance Cloud Activée</span>
        <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-8 tracking-tighter italic leading-none uppercase">Droit. <span className="text-emerald-800">Équité.</span> Résultats.</h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12 font-medium">Le premier cabinet d'Otterburn Park utilisant la technologie pour mieux vous servir. Disponibilités étendues jusqu'à 20h00.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a href="#agenda" className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-black text-lg shadow-2xl active:scale-95 transition-all">Consulter l'agenda</a>
          <a href="#services" className="bg-white text-slate-900 border-2 border-slate-100 px-12 py-5 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all">Expertises Juridiques</a>
        </div>
      </header>

      {/* Services */}
      <section id="services" className="py-24 px-6 max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {services.map(s => (
          <div key={s.id} onClick={() => setActiveService(s)} className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-sm hover:shadow-2xl hover:border-emerald-200 cursor-pointer transition-all group">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-emerald-800 group-hover:text-white transition-all text-emerald-800">{s.icon}</div>
            <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter italic">{s.title}</h3>
            <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed line-clamp-2">{s.desc}</p>
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">Détails complets <ChevronRight className="w-4 h-4" /></div>
          </div>
        ))}
      </section>

      {/* Agenda */}
      <section id="agenda" className="py-24 px-6 bg-slate-900 text-white overflow-hidden">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-8 text-emerald-400">Agenda Connecté</h2>
            <p className="text-slate-400 text-lg mb-12 font-medium">Consultez nos disponibilités en temps réel. Nous offrons désormais des consultations en soirée jusqu'à 20h00.</p>
            <div className="space-y-6">
              <div className="flex items-center gap-6 p-6 rounded-3xl bg-white/5 border border-white/10"><Database className="text-emerald-400 w-8 h-8" /><div><h4 className="font-bold">Données Persistantes</h4><p class="text-xs text-slate-500">Sauvegardé dans le Cloud Firebase</p></div></div>
              <div className="flex items-center gap-6 p-6 rounded-3xl bg-white/5 border border-white/10"><Send className="text-emerald-400 w-8 h-8" /><div><h4 className="font-bold">Alerte Me L'Abbé</h4><p class="text-xs text-slate-500">Notification instantanée à {lawyerEmail}</p></div></div>
            </div>
          </div>

          <div className="bg-white text-slate-900 p-10 rounded-[3.5rem] shadow-2xl">
            {bookingStatus === 'success' ? (
              <div className="text-center py-20 animate-in zoom-in">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8"><PartyPopper className="text-emerald-600 w-12 h-12" /></div>
                <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter">Confirmé !</h3>
                <p className="text-slate-500 font-medium mb-10">Rendez-vous enregistré pour le {selectedDate} à {selectedSlot}.</p>
                <button onClick={() => {setBookingStatus('idle'); setSelectedSlot(null);}} className="w-full py-5 bg-emerald-800 text-white rounded-2xl font-black shadow-xl active:scale-95 transition-all">Nouveau rendez-vous</button>
              </div>
            ) : (
              <form onSubmit={handleBooking} className="space-y-6">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2 italic"><Calendar className="text-emerald-800"/> Choisir Date</h3>
                  <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="p-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold" />
                </div>
                <div class="grid grid-cols-3 gap-2 mb-10">
                  {timeSlots.map(time => {
                    const booked = bookedSlots[selectedDate]?.includes(time);
                    return (
                      <button key={time} type="button" disabled={booked} onClick={() => setSelectedSlot(time)} className={`py-4 rounded-xl font-black border-2 transition-all text-xs ${booked ? 'bg-slate-50 text-slate-200 border-transparent cursor-not-allowed line-through' : selectedSlot === time ? 'bg-emerald-800 border-emerald-800 text-white shadow-lg' : 'bg-white border-slate-50 hover:border-emerald-200'}`}>
                        {time}
                      </button>
                    );
                  })}
                </div>
                <input required placeholder="Votre Nom" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-emerald-800" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <button disabled={!selectedSlot} type="submit" className={`w-full py-5 rounded-2xl font-black text-lg transition-all shadow-xl ${!selectedSlot ? 'bg-slate-100 text-slate-300' : 'bg-emerald-800 text-white hover:bg-emerald-900 shadow-emerald-900/20 active:scale-95'}`}>
                  {bookingStatus === 'confirming' ? 'Enregistrement...' : 'Confirmer à Me L\'Abbé'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer className="py-20 text-center border-t border-slate-200">
        <span className="text-emerald-800 font-black text-2xl uppercase tracking-tighter italic">Cabinet L'Abbé</span>
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em] mt-4">Otterburn Park, Québec • &copy; 2026</p>
      </footer>
    </div>
  );
};

export default App;
