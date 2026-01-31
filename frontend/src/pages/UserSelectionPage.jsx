import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, ArrowRight } from 'lucide-react';

const UserSelectionPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 lg:p-12 overflow-hidden">
            {/* Background blobs for premium feel */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-success/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

            <div className="max-w-5xl w-full relative z-10">
                <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <h1 className="text-6xl lg:text-7xl font-display font-black text-slate-900 mb-6 tracking-tight leading-none">
                        Welcome to <span className="text-primary italic">Abigail</span>
                    </h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
                        A beautiful space for writing, assessment, and growth. <br />
                        Where would you like to go today?
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Student Card */}
                    <button
                        onClick={() => navigate('/login')}
                        className="group relative flex flex-col items-center text-center p-12 bg-white rounded-[2.5rem] border-2 border-transparent hover:border-primary/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer"
                    >
                        <div className="size-24 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                            <GraduationCap size={48} strokeWidth={1.5} />
                        </div>
                        <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">I am a Student</h2>
                        <p className="text-slate-500 font-medium mb-8">
                            Jump into your assessment, explore projects, and show off your writing skills.
                        </p>
                        <div className="flex items-center gap-2 text-primary font-bold text-lg group-hover:gap-4 transition-all">
                            Start Assessment <ArrowRight size={20} />
                        </div>

                        {/* Hover glow */}
                        <div className="absolute inset-0 rounded-[2.5rem] bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    </button>

                    {/* Teacher Card */}
                    <button
                        onClick={() => navigate('/teacher/login')}
                        className="group relative flex flex-col items-center text-center p-12 bg-white rounded-[2.5rem] border-2 border-transparent hover:border-secondary/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer"
                    >
                        <div className="size-24 rounded-3xl bg-secondary/10 text-secondary flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                            <Users size={48} strokeWidth={1.5} />
                        </div>
                        <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">I am a Teacher</h2>
                        <p className="text-slate-500 font-medium mb-8">
                            Manage projects, monitor student progress, and analyze assessment results.
                        </p>
                        <div className="flex items-center gap-2 text-secondary font-bold text-lg group-hover:gap-4 transition-all">
                            Teacher Dashboard <ArrowRight size={20} />
                        </div>

                        {/* Hover glow */}
                        <div className="absolute inset-0 rounded-[2.5rem] bg-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    </button>
                </div>

                <div className="mt-16 text-center text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">
                    Empowering Teachers & Students through Abigail Spelling
                </div>
            </div>
        </div>
    );
};

export default UserSelectionPage;
