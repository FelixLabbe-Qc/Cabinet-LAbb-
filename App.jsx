import React, { useState, useEffect } from 'react';
import { 
  Scale, Calendar, Clock, MapPin, Phone, Mail, ChevronRight, 
  CheckCircle2, Menu, X, Briefcase, Users, PartyPopper, 
  Info, ArrowRight, Send, User, FileText, ChevronLeft, Database
} from 'lucide-react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, onSnapshot, query, addDoc } from 'firebase/firestore';

// Configuration Firebase (Injectée par l'environnement)
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'cabinet-labbe-2025';

const App = () => {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingStatus, setBookingStatus] = useState('idle'); 
  const [nextDays, setNextDays] = useState([]);
  const [activeService, setActiveService] = useState(null);
  
  // Données de l'agenda provenant de Firestore
  const [bookedSlots, setBookedSlots] = useState({});

  // Formulaire
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceType: 'Consultation Générale',
    notes: ''
  });

  const lawyerEmail = "Felix.ciboulette.labbe@gmail.com";
  const lawyerPhone = "514 758 6930";

  // 1. Authentification
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // 2. Écoute des rendez-vous en temps réel
  useEffect(() => {
    if (!user) return;

    const appointmentsCol = collection(db, 'artifacts', appId, 'public', 'data', 'appointments');
    
    const unsubscribe = onSnapshot(appointmentsCol, (snapshot) => {
      const newBookedSlots = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.date && data.slot) {
          if (!newBookedSlots[data.date]) {
            newBookedSlots[data.date] = [];
          }
          newBookedSlots[data.date].push(data.slot);
        }
      });
      setBookedSlots(newBookedSlots);
    }, (error) => {
      console.error("Erreur Firestore:", error);
    });

    return () => unsubscribe();
  }, [user]);

  // 3. Préparation des dates
  useEffect(() => {
    const days = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayName = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' }).format(date);
      const dayNum = date.getDate();
      const fullDate = date.toISOString().split('T')[0];
      days.push({
        name: dayName.charAt(0).toUpperCase() + dayName.slice(1).replace('.', ''),
        num: dayNum,
        full: fullDate,
        display: new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
      });
    }
    setNextDays(days);
    if (!selectedDate) setSelectedDate(days[0].full);
  }, []);

  // Heures mises à jour jusqu'à 20h00
  const timeSlots = [
    '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  // 4. Sauvegarde réelle dans Firestore
  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedSlot || !selectedDate || !user) return;
    
    setBookingStatus('confirming');
    
    try {
      const appointmentsCol = collection(db, 'artifacts', appId, 'public', 'data', 'appointments');
      
      await addDoc(appointmentsCol, {
        ...formData,
        date: selectedDate,
        slot: selectedSlot,
        createdAt: new Date().toISOString(),
        userId: user.uid
      });

      setBookingStatus('success');
    } catch (error) {
      console.error("Erreur lors de la réservation:", error);
      setBookingStatus('details');
    }
  };

  const scrollToAgenda = () => {
    setActiveService(null);
    document.getElementById('agenda')?.scrollIntoView({ behavior: 'smooth' });
  };

  const getDisplayDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T12:00:00");
    return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
  };

  const isSlotBooked = (date, time) => {
    return bookedSlots[date] && bookedSlots[date].includes(time);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const services = [
    { id: 1, title: "Droit de la Famille", desc: "Médiation, divorce et garde d'enfants.", longDesc: "Approche humaine pour vos dossiers les plus sensibles.", subServices: ["Divorce", "Garde", "Médiation"], icon: <Users className="w-8 h-8" /> },
    { id: 2, title: "Droit Immobilier", desc: "Transactions et litiges de propriété.", longDesc: "Sécurisation de vos actifs immobiliers.", subServices: ["Achat/Vente", "Baux", "Vices cachés"], icon: <MapPin className="w-8 h-8" /> },
    { id: 3, title: "Litige Civil", desc: "Défense de vos intérêts en cour.", longDesc: "Représentation rigoureuse et stratégique.", subServices: ["Contrats", "Responsabilité", "Assurances"], icon: <Scale className="w-8 h-8" /> },
    { id: 4, title: "Droit des Affaires", desc: "Conseils pour entrepreneurs et PME.", longDesc: "Partenaire de croissance pour votre entreprise.", subServices: ["Incorporation", "Contrats", "Fusions"], icon: <Briefcase className="w-8 h-8" /> }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Modal Service */}
      {activeService && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setActiveService(null)}>
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in" onClick={(e) => e.stopPropagation()}>
            <div className="bg-emerald-800 p-8 text-white relative">
              <button onClick={() => setActiveService(null)} className="absolute top-6 right-6 p-3 hover:bg-white/20 rounded-full"><X className="w-7 h-7" /></button>
              <div className="bg-white/10 w-20 h-20 rounded-3xl flex items-center justify-center mb-6">{activeService.icon}</div>
              <h3 className="text-4xl font-black">{activeService.title}</h3>
            </div>
            <div className="p-8 sm:p-10">
              <p className="text-slate-600 text-xl mb-10">{activeService.longDesc}</p>
              <div className="grid sm:grid-cols-2 gap-4 mb-10">
                {activeService.subServices.map((sub, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold"><CheckCircle2 className="text-emerald-700 w-5 h-5" />{sub}</div>
                ))}
              </div>
              <button onClick={scrollToAgenda} className="w-full py-5 bg-emerald-800 text-white rounded-2xl font-bold text-lg shadow-lg active:scale-95 flex items-center justify-center gap-2">Prendre rendez-vous <ArrowRight /></button>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 h-20 flex items-center">
        <div className="max-w-7xl mx-auto px-4 w-full flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-800 p-2 rounded-lg"><Scale className="text-white w-6 h-6" /></div>
            <span className="text-xl font-bold text-emerald-900 uppercase">Cabinet L'Abbé</span>
          </div>
          <div className="hidden md:flex space-x-8 font-medium text-slate-600">
            <a href="#accueil" className="hover:text-emerald-700 transition">Accueil</a>
            <a href="#services" className="hover:text-emerald-700 transition">Services</a>
            <a href="#agenda" className="hover:text-emerald-700 transition font-bold">Agenda</a>
            <a href="#contact" className="bg-emerald-800 text-white px-6 py-2 rounded-full font-bold">Contact</a>
          </div>
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}><Menu /></button>
        </div>
      </nav>

      {/* Hero */}
      <header id="accueil" className="pt-40 pb-24 text-center px-4">
        <div className="max-w-4xl mx-auto">
          <span className="bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full text-sm font-bold uppercase mb-8 inline-block">Persistance Cloud Activée</span>
          <h1 className="text-5xl lg:text-7xl font-black text-slate-900 mb-6 tracking-tight">Droit. <span className="text-emerald-800">Équité.</span> Résultats.</h1>
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">Le premier cabinet d'Otterburn Park utilisant la technologie pour mieux vous servir. Disponibilités étendues jusqu'à 20h00.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="#agenda" className="bg-emerald-800 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl shadow-emerald-900/20 active:scale-95 transition-all">Réserver ma plage horaire</a>
            <a href="#services" className="bg-white border-2 border-slate-100 px-10 py-5 rounded-2xl font-bold text-lg">Voir nos expertises</a>
          </div>
        </div>
      </header>

      {/* Services */}
      <section id="services" className="py-24 bg-white px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-16">Expertises Juridiques</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map(s => (
              <div key={s.id} onClick={() => setActiveService(s)} className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-all cursor-pointer group">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-800 transition-all">
                  <div className="group-hover:text-white text-emerald-700 transition-colors">{s.icon}</div>
                </div>
                <h3 className="text-2xl font-black mb-3">{s.title}</h3>
                <p className="text-slate-600 font-medium mb-6 line-clamp-2">{s.desc}</p>
                <div className="flex items-center gap-2 text-emerald-700 font-bold">Détails <ChevronRight className="w-5 h-5" /></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agenda Section avec Cloud Storage */}
      <section id="agenda" className="py-24 bg-slate-900 text-white px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-start">
          <div>
            <h2 className="text-4xl font-black mb-8">Agenda Connecté</h2>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed">
              Consultez nos disponibilités en temps réel. Nous offrons désormais des consultations en soirée jusqu'à 20h00.
            </p>
            <div className="space-y-6">
              <div className="flex items-center gap-5 p-6 rounded-3xl bg-slate-800/50 border border-slate-700">
                <Database className="text-emerald-400 w-8 h-8" />
                <div>
                  <h4 className="font-bold">Données Persistantes</h4>
                  <p className="text-slate-400 text-sm">Vos rendez-vous sont sauvegardés même si vous fermez votre navigateur.</p>
                </div>
              </div>
              <div className="flex items-center gap-5 p-6 rounded-3xl bg-slate-800/50 border border-slate-700">
                <Send className="text-emerald-400 w-8 h-8" />
                <div>
                  <h4 className="font-bold">Notification Me L'Abbé</h4>
                  <p className="text-slate-400 text-sm">Une alerte est envoyée à <span className="underline">{lawyerEmail}</span>.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white text-slate-900 p-8 sm:p-12 rounded-[3.5rem] shadow-2xl min-h-[550px]">
            {!user ? (
              <div className="flex flex-col items-center justify-center h-[400px]">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-emerald-800 rounded-full animate-spin"></div>
                <p className="mt-4 font-bold text-slate-400">Connexion sécurisée...</p>
              </div>
            ) : bookingStatus === 'success' ? (
              <div className="text-center animate-in zoom-in py-10">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8"><PartyPopper className="text-emerald-600 w-12 h-12" /></div>
                <h3 className="text-3xl font-black mb-4">Confirmé !</h3>
                <p className="text-slate-600 mb-8">Rendez-vous pour le <span className="font-bold text-emerald-800">{getDisplayDate(selectedDate)}</span> à <span className="font-bold text-emerald-800">{selectedSlot}</span> bien enregistré.</p>
                <button onClick={() => { setBookingStatus('idle'); setSelectedSlot(null); }} className="w-full py-5 bg-emerald-800 text-white rounded-2xl font-black text-lg active:scale-95 transition-all">Faire une autre demande</button>
              </div>
            ) : bookingStatus === 'details' ? (
              <div className="animate-in slide-in-from-right-10">
                <button onClick={() => setBookingStatus('idle')} className="flex items-center gap-2 text-slate-400 font-bold mb-8 hover:text-emerald-800 transition-colors"><ChevronLeft /> Retour à l'horaire</button>
                <h3 className="text-2xl font-black mb-8 tracking-tight">Vos Coordonnées</h3>
                <form onSubmit={handleBooking} className="space-y-5">
                  <input required name="name" value={formData.name} onChange={handleInputChange} placeholder="Nom Complet" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:border-emerald-500 outline-none font-bold" />
                  <input required name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Téléphone" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:border-emerald-500 outline-none font-bold" />
                  <input required name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:border-emerald-500 outline-none font-bold" />
                  <select name="serviceType" value={formData.serviceType} onChange={handleInputChange} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 outline-none font-bold">
                    <option>Consultation Générale</option>
                    <option>Droit de la Famille</option>
                    <option>Droit Immobilier</option>
                    <option>Droit des Affaires</option>
                  </select>
                  <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows="3" placeholder="Résumé de l'affaire..." className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 outline-none font-bold"></textarea>
                  <button type="submit" className="w-full py-5 bg-emerald-800 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-900/20 active:scale-[0.98] transition-all">Confirmer la réservation</button>
                </form>
              </div>
            ) : bookingStatus === 'confirming' ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-800 rounded-full animate-spin mb-6"></div>
                <h3 className="text-2xl font-bold">Enregistrement Cloud...</h3>
                <p className="text-slate-500">Nous sécurisons votre créneau dans la base de données.</p>
              </div>
            ) : (
              <div className="animate-in fade-in">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold flex items-center gap-2"><Calendar className="text-emerald-700" /> Choisir une date</h3>
                  <input type="date" min={new Date().toISOString().split('T')[0]} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="px-4 py-2 border-2 border-slate-100 rounded-xl font-bold text-slate-700 bg-slate-50" />
                </div>
                <div className="flex gap-3 overflow-x-auto pb-6 mb-8 scrollbar-hide">
                  {nextDays.map(d => (
                    <button key={d.full} onClick={() => setSelectedDate(d.full)} className={`flex-shrink-0 w-16 h-20 rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${selectedDate === d.full ? 'bg-emerald-800 border-emerald-800 text-white scale-105 shadow-lg' : 'bg-slate-50 border-slate-50 text-slate-500 hover:border-emerald-200'}`}>
                      <span className="text-[10px] font-bold uppercase opacity-60 mb-1">{d.name}</span>
                      <span className="text-xl font-black">{d.num}</span>
                    </button>
                  ))}
                </div>
                <div className="mb-10">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Heures Disponibles</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {timeSlots.map((time, i) => {
                      const isBooked = isSlotBooked(selectedDate, time);
                      return (
                        <button key={i} disabled={!selectedDate || isBooked} onClick={() => setSelectedSlot(time)} className={`flex items-center justify-center p-4 rounded-2xl border-2 transition-all font-bold ${isBooked ? 'bg-red-50 border-red-50 text-red-200 cursor-not-allowed line-through' : selectedSlot === time ? 'border-emerald-600 bg-emerald-600 text-white scale-105 shadow-md' : 'bg-slate-50 border-slate-50 text-slate-700 hover:border-emerald-200'}`}>
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <button disabled={!selectedSlot} onClick={() => setBookingStatus('details')} className={`w-full py-5 rounded-2xl font-black text-lg transition-all shadow-xl ${!selectedSlot ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-emerald-800 text-white hover:bg-emerald-900 active:scale-95 shadow-emerald-900/20'}`}>Suivant</button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-slate-950 text-slate-500 text-center px-4">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-800 p-2 rounded-xl"><Scale className="text-white w-5 h-5" /></div>
            <span className="text-2xl font-black text-white uppercase">Cabinet L'Abbé</span>
          </div>
          <p className="text-sm font-medium">Expertise juridique à Otterburn Park. Fondé en 2025.</p>
          <div className="flex gap-8 text-sm font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-white transition">Légal</a>
            <a href="#" className="hover:text-white transition">Confidentialité</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
