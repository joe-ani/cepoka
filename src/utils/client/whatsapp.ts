"use client";

export const sendWhatsAppMessage = (
  productName: string,
  productImage: string
): boolean => {
  const phoneNumber = "2347016027618";
  const message =
    `*New Order Inquiry*\n\n` +
    `I would like to order: *${productName}*\n\n` +
    `You can view the product at:\n${productImage}`;

  try {
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    // Only execute if we're in the browser
    if (typeof window !== "undefined") {
      window.open(whatsappURL, "_blank");
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return false;
  }
};
