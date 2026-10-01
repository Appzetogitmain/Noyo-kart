import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

const SlideToPay = ({
    onSuccess,
    amount,
    isLoading = false,
    disabled = false,
    text = "Slide to Pay"
}) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleClick = async () => {
        if (disabled || isLoading || isProcessing) return;
        
        setIsProcessing(true);
        try {
            if (onSuccess) {
                await onSuccess();
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const isButtonDisabled = disabled || isLoading || isProcessing;
    
    // Convert "Slide to Pay" to "Pay Now" or use the provided text if different
    const displayText = text.toLowerCase().includes("slide to pay") ? "Pay Now" : text;

    return (
        <button
            onClick={handleClick}
            disabled={isButtonDisabled}
            className={`w-full h-16 rounded-2xl flex items-center justify-center font-black text-lg tracking-wide uppercase transition-all shadow-[0_18px_45px_rgba(2,132,199,0.35)] border border-white/10 active:scale-[0.98] ${
                isButtonDisabled 
                ? "bg-gray-400 cursor-not-allowed opacity-80" 
                : "bg-[#0284c7] hover:brightness-110"
            } text-white`}
        >
            {isButtonDisabled ? (
                <div className="flex items-center gap-3">
                    <Loader2 className="animate-spin" size={24} />
                    <span>Processing...</span>
                </div>
            ) : (
                <span className="flex items-center gap-2">
                    {displayText} <span className="text-white/40">|</span> <span className="text-brand-50 font-extrabold">₹{amount}</span>
                </span>
            )}
        </button>
    );
};

export default SlideToPay;
