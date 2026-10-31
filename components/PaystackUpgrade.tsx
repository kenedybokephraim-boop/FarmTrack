"use client"

import { useCallback } from "react"
import { usePaystackPayment } from "react-paystack"
import { toast } from "sonner"

interface PaystackUpgradeProps {
  email: string
  userId: string
}

export function PaystackUpgrade({ email, userId }: PaystackUpgradeProps) {
  const amount = 250000 // ₦2,500 in kobo

  // 1. Put payment config with userId in metadata and empty custom_fields
  const initializePayment = usePaystackPayment({
    amount,
    email,
    metadata: { custom_fields: [], userId },
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "",
  })

  // 2. Secure success handler - only shows toast, webhook handles DB update
  const handleSuccess = () => {
    toast.success("Payment successful! Your subscription will be activated shortly via webhook.")
  }

  // 3. Cancel handler
  const handleClose = () => {
    toast.error("Payment cancelled. Please try again.")
  }

  // 4. Trigger payment
  const handleUpgrade = useCallback(() => {
    initializePayment({
      config: {
        reference: `FT-${Date.now()}`,
      } as any,
      onSuccess: handleSuccess,
      onClose: handleClose,
    })
  }, [initializePayment])

  return (
    <button
      onClick={handleUpgrade}
      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all duration-200"
    >
      Upgrade to Premium — ₦2,500
    </button>
  )
}