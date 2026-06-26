import React from 'react';
import { ExternalLink, Globe, Plane, Cloud } from 'lucide-react';

const links = [
    { name: 'Flightsim.to', url: 'https://flightsim.to', description: 'Add-ons and mods', icon: Plane, color: 'text-accent-blue' },
    { name: 'NatTrak', url: 'https://nattrak.vatsim.net/', description: 'Oceanic clearance system', icon: Globe, color: 'text-accent-green' },
    { name: 'VATSIM Flight Plan', url: 'https://my.vatsim.net/pilots/flightplan', description: 'VATSIM flight plan filing', icon: Cloud, color: 'text-accent-red' },
];

export const LinksModule: React.FC = () => {
    return (
        <div className="w-full h-full p-6 md:p-8 overflow-y-auto flex flex-col font-sans text-text-primary bg-transparent relative">


            <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {links.map((link) => {
                        const Icon = link.icon;
                        return (
                            <button
                                key={link.name}
                                onClick={() => window.open(link.url, '_blank')}
                                className="group flex flex-col items-start gap-3 p-6 rounded-[1.5rem] border border-white/[0.05] bg-white/[0.03] hover:bg-white/[0.08] transition-all duration-200 active:scale-[0.98] text-left"
                            >
                                <div className="flex items-center justify-between w-full mb-3">
                                    <div className="p-3 rounded-xl bg-black/20 flex items-center justify-center">
                                        <Icon className={`w-7 h-7 ${link.color} drop-shadow-md`} strokeWidth={1.5} />
                                    </div>
                                    <ExternalLink className="w-5 h-5 text-text-secondary group-hover:text-text-primary transition-colors" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-text-primary tracking-wide text-lg mb-1 drop-shadow-md">{link.name}</h3>
                                    <p className="text-sm font-medium text-text-secondary drop-shadow-md">{link.description}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
