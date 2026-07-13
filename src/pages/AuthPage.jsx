import React, { useState } from 'react';
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, doc, setDoc, db, getDoc } from '../config/firebase';
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react'; // Added Chrome for Google icon below if needed, or we can use custom SVG
import Modal from '../components/Modal';
import { useNavigate } from 'react-router-dom';
import {useContext} from 'react';
import { StoreContext } from '../context/Store';

function AuthPage() {
    const { user, setUser, isAdmin, setIsAdmin } = useContext(StoreContext);
    console.log("Current User from Context:", user);

    const provider = new GoogleAuthProvider();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authMode, setAuthMode] = useState('signin');
    const [isModalOpen, setIsModalOpen] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();
        if (authMode === 'signup') {
            handleSignUp();
            console.log('signup', email, password);
        }
        if (authMode === 'signin') {
            handleSignIn();
            console.log('signin', email, password);
        }
    }

    function handleAuthMode() {
        setAuthMode(authMode === 'signup' ? 'signin' : 'signup');
    }

    const handleSignUp = async () => {
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log("User Registered Successfully:", user);
                setUser(user);
                setIsModalOpen(true);
            })
            .catch((error) => {
                console.error("Signup Error:", error.code, error.message);
            });
    };

    const handleSignIn = async () => {
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log("User Signed In Successfully:", user);
                setUser(user);
                setIsModalOpen(true);
            })
            .catch((error) => {
                console.error("Signin Error:", error.code, error.message);
            });
    };

    // Placeholder function for visual button trigger
    const handleGoogleSignIn = async () => {
        signInWithPopup(auth, provider)
            .then((result) => {
                // This gives you a Google Access Token. You can use it to access the Google API.
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const token = credential.accessToken;
                // The signed-in user info.
                const user = result.user;
                addToDatabase(user);
                console.log("Google Sign-In Successful:", user);
                setUser(user);
                handleDbCheck(user);
                // IdP data available using getAdditionalUserInfo(result)
                // ...
            }).catch((error) => {
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                // The email of the user's account used.
                const email = error.customData.email;
                // The AuthCredential type that was used.
                const credential = GoogleAuthProvider.credentialFromError(error);
                // ...
            });
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
        if (docSnap.data()) {
            console.log("User data:", docSnap.data().name);
            setIsModalOpen(true);
        } else {
            console.log("No such document!");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B132B] px-4 font-sans text-slate-100">
            {/* Glassmorphic Card Container */}
            <div className="w-full max-w-md bg-[#1C2541]/60 backdrop-blur-md border border-[#3A506B]/40 p-8 rounded-2xl shadow-2xl">

                {/* Brand Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold tracking-wider bg-linear-to-r from-[#4CC9F0] to-[#5F5AA2] bg-clip-text text-transparent">
                        MaintainIQ
                    </h1>
                    <p className="text-sm text-slate-400 mt-2">
                        {authMode === 'signup' ? 'Create an account to manage assets' : 'Sign in to access technician dashboard'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Input Field */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block" htmlFor="email">
                            Email Address
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                                <Mail size={18} />
                            </span>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                className="w-full pl-10 pr-4 py-3 bg-[#0B132B]/80 border border-[#3A506B]/60 rounded-xl focus:outline-none focus:border-[#4CC9F0] transition-colors text-slate-200 placeholder-slate-600 text-sm"
                                required
                            />
                        </div>
                    </div>

                    {/* Password Input Field */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block" htmlFor="password">
                            Password
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                                <Lock size={18} />
                            </span>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-4 py-3 bg-[#0B132B]/80 border border-[#3A506B]/60 rounded-xl focus:outline-none focus:border-[#4CC9F0] transition-colors text-slate-200 placeholder-slate-600 text-sm"
                                required
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full py-3 mt-4 bg-linear-to-r from-[#4CC9F0] to-[#4361EE] text-white font-semibold rounded-xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                        {authMode === 'signup' ? (
                            <>
                                <UserPlus size={18} /> Register Account
                            </>
                        ) : (
                            <>
                                <LogIn size={18} /> Secure Sign In
                            </>
                        )}
                    </button>

                    {/* Visual Divider */}
                    <div className="relative flex items-center justify-center my-4">
                        <div className="border-t border-[#3A506B]/40 w-full"></div>
                        <span className="absolute px-3 bg-[#1C2541] text-xs text-slate-500 uppercase tracking-wider">
                            Or continue with
                        </span>
                    </div>

                    {/* Google Sign-In Button */}
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        className="w-full py-3 bg-[#0B132B]/60 border border-[#3A506B]/60 text-slate-200 font-medium rounded-xl hover:bg-[#1C2541] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span>Google Workspace</span>
                    </button>
                </form>

                {/* Switch Auth Mode Trigger */}
                <div className="mt-6 text-center">
                    <button
                        onClick={handleAuthMode}
                        className="text-sm text-slate-400 hover:text-[#4CC9F0] transition-colors underline underline-offset-4 cursor-pointer"
                    >
                        {authMode === 'signup' ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                    </button>
                </div>

            </div>

            {/* Modal stays exactly as is */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Select Workspace Access"
            >
                <div className="space-y-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Choose your current organizational role:
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={() => {
                                console.log("Admin Selected");
                                setIsModalOpen(false);
                                navigate('/admin/dashboard');
                                setIsAdmin(true);
                            }}
                            className="w-full text-left p-4 bg-[#0B132B]/80 border border-[#3A506B]/40 hover:border-[#4CC9F0]/70 rounded-xl transition-all active:scale-[0.99] group cursor-pointer"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="block font-bold text-slate-100 group-hover:text-[#4CC9F0] transition-colors">
                                        Administrative Terminal
                                    </span>
                                    <span className="block text-xs text-slate-400 mt-0.5">
                                        Manage asset registries, review incoming tickets, and assign operations.
                                    </span>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={() => {
                                console.log("User Selected");
                                navigate('/tech/dashboard');
                                setIsModalOpen(false);
                                setIsAdmin(false);
                            }}
                            className="w-full text-left p-4 bg-[#0B132B]/80 border border-[#3A506B]/40 hover:border-[#4361EE]/70 rounded-xl transition-all active:scale-[0.99] group cursor-pointer"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="block font-bold text-slate-100 group-hover:text-[#4361EE] transition-colors">
                                        Public Portal View
                                    </span>
                                    <span className="block text-xs text-slate-400 mt-0.5">
                                        Scan asset tags, verify logs, or file immediate breakdown reports.
                                    </span>
                                </div>
                            </div>
                        </button>
                    </div>

                    <div className="text-[11px] text-slate-500 text-center mt-2">
                        Access levels will be validated using secure encryption protocols.
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default AuthPage;