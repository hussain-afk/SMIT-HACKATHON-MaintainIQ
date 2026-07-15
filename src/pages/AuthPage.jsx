import React, { useState, useContext } from 'react';
import {
  auth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  GoogleAuthProvider, signInWithPopup, doc, setDoc, db, getDoc
} from '../config/firebase';
import { Mail, Lock, LogIn, UserPlus, AlertCircle, Loader2, Wrench, Shield, Activity } from 'lucide-react';
import Modal from '../components/Modal';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../context/Store';

function AuthPage() {
    const { setUser, setIsAdmin, setPhotoURL } = useContext(StoreContext);

    const provider = new GoogleAuthProvider();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authMode, setAuthMode] = useState('signin');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const friendlyError = (error) => {
        switch (error.code) {
            case 'auth/invalid-email':
                return 'That email address does not look valid.';
            case 'auth/user-not-found':
            case 'auth/invalid-credential':
                return 'Incorrect email or password. Please try again.';
            case 'auth/wrong-password':
                return 'Incorrect password. Please try again.';
            case 'auth/email-already-in-use':
                return 'An account with this email already exists.';
            case 'auth/weak-password':
                return 'Your password should be at least 6 characters long.';
            default:
                return 'Something went wrong. Please try again.';
        }
    };

    async function handleSubmit(e) {
        e.preventDefault();
        setErrorMessage('');
        setIsSubmitting(true);
        try {
            if (authMode === 'signup') {
                await handleSignUp();
            } else {
                await handleSignIn();
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleAuthMode() {
        setErrorMessage('');
        setAuthMode(authMode === 'signup' ? 'signin' : 'signup');
    }

    const handleSignUp = async () => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            setUser(userCredential.user);
            setIsModalOpen(true);
        } catch (error) {
            setErrorMessage(friendlyError(error));
        }
    };

    const handleSignIn = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            setUser(userCredential.user);
            setIsModalOpen(true);
        } catch (error) {
            setErrorMessage(friendlyError(error));
        }
    };

    const handleGoogleSignIn = async () => {
        setErrorMessage('');
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            await addToDatabase(user);
            setUser(user);
            console.log("Google Sign-In successful:", user);
            setPhotoURL(user.photoURL);
            await handleDbCheck(user);
        } catch (error) {
            setErrorMessage(friendlyError(error));
        }
    };

    const addToDatabase = async (user) => {
        await setDoc(doc(db, "users", user.uid), {
            name: user.displayName,
            photo: user.photoURL,
            email: user.email,
            uid: user.uid,
            lastLogin: new Date().toISOString()
        });
    }

    const handleDbCheck = async (user) => {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            setIsModalOpen(true);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0F172A] p-4 lg:p-6 font-sans text-slate-100 antialiased">
            
            {/* --- Outer Wrapper (Ab thoda compact aur clean responsive dimensions ke sath hai) --- */}
            <div className="w-full max-w-4xl bg-slate-900/40 border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[550px]">
                
                {/* 1. LEFT SIDE: Info Panel */}
                <div className="hidden md:flex md:col-span-5 bg-gradient-to-br from-slate-950 via-[#1E293B] to-[#0B132B] p-8 flex-col justify-between border-r border-slate-800/50 relative overflow-hidden">
                    <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-[#4CC9F0]/5 blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] rounded-full bg-[#4361EE]/5 blur-[120px]" />

                    {/* Brand Icon & Name */}
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="p-2 bg-[#4CC9F0]/10 border border-[#4CC9F0]/20 text-[#4CC9F0] rounded-xl">
                            <Activity size={18} className="animate-pulse" />
                        </div>
                        <span className="text-lg font-black tracking-wider bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                            MaintainIQ
                        </span>
                    </div>

                    {/* Features List */}
                    <div className="space-y-5 my-auto relative z-10">
                        <h2 className="text-xl font-black text-slate-200 leading-snug">
                            Smart Asset & Workorder Management.
                        </h2>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Optimize hardware deployments, schedule rapid diagnostic pipelines, and authorize operational handovers in real time.
                        </p>

                        <div className="space-y-3.5 pt-4 border-t border-slate-800/60">
                            <div className="flex items-center gap-3">
                                <Shield size={14} className="text-[#4CC9F0]" />
                                <span className="text-xs text-slate-300 font-semibold">Role-Based Access Controls</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Wrench size={14} className="text-amber-400" />
                                <span className="text-xs text-slate-300 font-semibold">Technician Diagnostics Logs</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-[9px] text-slate-600 relative z-10">
                        &copy; 2026 MaintainIQ Inc. All rights reserved.
                    </p>
                </div>

                {/* 2. RIGHT SIDE: Form Panel (Chota size aur Bada text) */}
                <div className="col-span-12 md:col-span-7 p-8 lg:p-10 flex flex-col justify-center bg-slate-900/20 relative">
                    
                    {/* Mobile Brand Header */}
                    <div className="block md:hidden text-center mb-6">
                        <h1 className="text-2xl font-black text-[#4CC9F0]">MaintainIQ</h1>
                        <p className="text-xs text-slate-500 mt-1">Enterprise Asset Operations Terminal</p>
                    </div>

                    {/* 🌟 Form Container is now max-w-sm (Compact & Premium) */}
                    <div className="max-w-sm w-full mx-auto space-y-5">
                        
                        {/* Title Header */}
                        <div className="hidden md:block">
                            <h2 className="text-2xl font-black text-slate-100 tracking-tight">
                                {authMode === 'signup' ? 'Create Account' : 'Welcome Back'}
                            </h2>
                            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                                {authMode === 'signup' ? 'Register to start managing organization assets.' : 'Sign in to access your tech dashboard.'}
                            </p>
                        </div>

                        {/* Error Banner */}
                        {errorMessage && (
                            <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs p-3 rounded-xl animate-shake">
                                <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-400" />
                                <span>{errorMessage}</span>
                            </div>
                        )}

                        {/* Form Inputs */}
                        <form onSubmit={handleSubmit} className="space-y-4.5">
                            {/* Email */}
                            <div className="space-y-2">
                                {/* Font label size increased to text-xs with medium weight */}
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block" htmlFor="email">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                                        <Mail size={18} />
                                    </span>
                                    {/* Inputs have slightly larger padding and clean text-sm/text-base look */}
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@company.com"
                                        className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-[14px] font-medium focus:border-[#4CC9F0] focus:ring-1 focus:ring-[#4CC9F0] outline-none placeholder-slate-600 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block" htmlFor="password">
                                    Password
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                                        <Lock size={18} />
                                    </span>
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-[14px] font-medium focus:border-[#4CC9F0] focus:ring-1 focus:ring-[#4CC9F0] outline-none placeholder-slate-600 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3.5 mt-2 bg-gradient-to-r from-[#4CC9F0] to-[#4361EE] text-white font-extrabold rounded-xl shadow-lg hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-[14px] tracking-wide"
                            >
                                {isSubmitting ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : authMode === 'signup' ? (
                                    <UserPlus size={18} />
                                ) : (
                                    <LogIn size={18} />
                                )}
                                {isSubmitting ? 'Verifying Credentials...' : authMode === 'signup' ? 'Create Free Account' : 'Authenticate Security'}
                            </button>

                            {/* Divider */}
                            <div className="relative flex items-center justify-center py-1">
                                <div className="border-t border-slate-800 w-full"></div>
                                <span className="absolute px-3 bg-slate-900/10 backdrop-blur-md text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                                    Or
                                </span>
                            </div>

                            {/* Google Sign-In */}
                            <button
                                type="button"
                                onClick={handleGoogleSignIn}
                                className="w-full py-3 bg-slate-950 border border-slate-800 text-slate-300 font-extrabold rounded-xl hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-3 cursor-pointer text-xs"
                            >
                                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span>Continue with Google Workspace</span>
                            </button>
                        </form>

                        {/* Switch Mode Footer */}
                        <div className="text-center pt-1.5">
                            <button
                                onClick={handleAuthMode}
                                className="text-xs text-slate-400 hover:text-[#4CC9F0] transition-colors underline underline-offset-4 cursor-pointer font-bold"
                            >
                                {authMode === 'signup' ? 'Already registered? Sign In' : "Don't have an account? Register here"}
                            </button>
                        </div>

                    </div>
                </div>

            </div>

            {/* --- Workspace Role Selection Modal --- */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Select Workspace Access"
            >
                <div className="space-y-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Choose your current organizational role to navigate:
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={() => {
                                setIsModalOpen(false);
                                setIsAdmin(true);
                                navigate('/admin/dashboard');
                            }}
                            className="w-full text-left p-4.5 bg-slate-950 border border-slate-800 hover:border-[#4CC9F0]/60 rounded-xl transition-all active:scale-[0.99] group cursor-pointer"
                        >
                            <span className="block font-black text-slate-200 group-hover:text-[#4CC9F0] transition-colors text-sm">
                                Administrative Terminal
                            </span>
                            <span className="block text-xs text-slate-500 mt-1 leading-relaxed font-medium">
                                Manage asset registries, review incoming tickets, and assign operations.
                            </span>
                        </button>

                        <button
                            onClick={() => {
                                setIsModalOpen(false);
                                setIsAdmin(false);
                                navigate('/tech/dashboard');
                            }}
                            className="w-full text-left p-4.5 bg-slate-950 border border-slate-800 hover:border-[#4361EE]/60 rounded-xl transition-all active:scale-[0.99] group cursor-pointer"
                        >
                            <span className="block font-black text-slate-200 group-hover:text-[#4361EE] transition-colors text-sm">
                                Public Portal View (Technician)
                            </span>
                            <span className="block text-xs text-slate-500 mt-1 leading-relaxed font-medium">
                                Scan asset tags, verify logs, or file immediate breakdown reports.
                            </span>
                        </button>
                    </div>

                    <p className="text-[10px] text-slate-600 text-center font-semibold">
                        Access authorization levels will be verified dynamically.
                    </p>
                </div>
            </Modal>
        </div>
    );
}

export default AuthPage;