import React, { useState } from 'react';

interface FamilyCodeModalProps {
    onSubmit: (code: string) => void;
}

export const FamilyCodeModal: React.FC<FamilyCodeModalProps> = ({ onSubmit }) => {
    const [code, setCode] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (code.trim()) {
            onSubmit(code.trim().toUpperCase());
        }
    };

    const generateCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCode(result);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-8 font-sans">
            <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                        KDM Family Hub
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Enter your family code to sync tasks across devices
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Family Code
                        </label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="Enter or generate a code"
                            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/50"
                            maxLength={10}
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={generateCode}
                            className="flex-1 px-4 py-3 rounded-lg border border-border bg-muted/50 text-foreground hover:bg-muted transition-colors font-medium"
                        >
                            Generate New
                        </button>
                        <button
                            type="submit"
                            disabled={!code.trim()}
                            className="flex-1 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Continue
                        </button>
                    </div>
                </form>

                <p className="text-center text-xs text-muted-foreground mt-6">
                    Share this code with your family to access the same tasks on any device.
                </p>
            </div>
        </div>
    );
};
