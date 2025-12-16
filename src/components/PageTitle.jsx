import React from 'react';

const PageTitle = ({ title, subtitle, icon: Icon }) => {
    return (
        <div className="mb-6 relative z-10">
            <h1 className="text-3xl font-black text-white font-tech uppercase tracking-tight flex items-center gap-3">
                {Icon && <Icon className="text-amber-500" size={32} />}
                <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    {title}
                </span>
            </h1>
            {subtitle && <p className="text-slate-400 mt-1 font-mono text-sm max-w-2xl">{subtitle}</p>}
        </div>
    );
};

export default PageTitle;

