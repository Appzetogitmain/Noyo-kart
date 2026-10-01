import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { deliveryApi } from "../services/deliveryApi";

/**
 * DeliverySlideButton - A regular button that replaces the old slide-to-confirm button
 * 
 * @param {Object} props
 * @param {string} props.orderId - The order ID for OTP generation
 * @param {Function} props.onSuccess - Callback when OTP is successfully generated
 * @param {Function} props.onError - Callback when an error occurs
 * @param {string} props.label - Label text for the button (default: "GENERATE OTP")
 * @param {string} props.bgColor - Background color class (default: "bg-indigo-600")
 * @param {string} props.bgColorLight - Light background color class (unused but kept for compatibility)
 */
const DeliverySlideButton = ({
  orderId,
  onSuccess,
  onError,
  isReturn = false,
  isReturnDrop = false,
  label = "GENERATE OTP",
  bgColor = "bg-indigo-600",
  bgColorLight = "bg-indigo-50",
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      // Call appropriate endpoint based on flow type
      const response = isReturnDrop
        ? await deliveryApi.requestReturnDropOtp(orderId, {})
        : isReturn 
        ? await deliveryApi.requestReturnOtp(orderId, {})
        : await deliveryApi.generateDeliveryOtp(orderId);

      // Handle success
      toast.success(response.data?.message || "OTP generated and sent to customer");
      
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error) {
      // Handle different error types
      const resData = error.response?.data;
      const errorMessage = resData?.message || error.message || "Failed to generate OTP";
      const errorCode = resData?.result?.error?.code || resData?.result?.code;
      const errorDetails = resData?.result?.error?.details || resData?.result;

      // Display user-friendly error messages
      if (errorCode === "PROXIMITY_OUT_OF_RANGE") {
        const distance = errorDetails?.currentDistance;
        const range = errorDetails?.requiredRange || "0-500m";
        const distanceText = distance > 1000 
          ? `${(distance / 1000).toFixed(2)}km` 
          : `${Math.round(distance)}m`;
        
        toast.error(
          `Proximity check failed. You are currently ${distanceText} away. You must be within ${range} of the delivery location.`,
          { duration: 8000 }
        );
      } else if (errorCode === "LOCATION_REQUIRED" || errorCode === "LOCATION_STALE") {
        toast.error(errorMessage || "Location data is not available. Please ensure location tracking is enabled.");
      } else if (errorCode === "ORDER_NOT_FOUND") {
        toast.error("Order not found. Please refresh and try again.");
      } else if (errorCode === "UNAUTHORIZED_DELIVERY") {
        toast.error("This order is not assigned to you.");
      } else {
        toast.error(errorMessage);
      }

      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Adjust label string if it still contains "SLIDE TO"
  const displayLabel = label.startsWith("SLIDE TO ") ? label.substring(9) : label;

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`w-full h-14 rounded-2xl flex items-center justify-center font-bold text-sm tracking-wide transition-all shadow-md active:scale-[0.98] ${
        isLoading ? "bg-gray-400 cursor-not-allowed opacity-80" : bgColor
      } text-white`}
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin mr-2" size={20} />
          {isReturn ? "Requesting OTP..." : "Generating OTP..."}
        </>
      ) : (
        displayLabel
      )}
    </button>
  );
};

export default DeliverySlideButton;
