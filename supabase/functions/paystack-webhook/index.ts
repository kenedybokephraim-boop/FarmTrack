import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY")!

if (!supabaseUrl || !supabaseServiceRoleKey || !paystackSecretKey) {
  console.error("Missing required environment variables")
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

// Helper function to derive crypto key from secret
async function getKey(): Promise<CryptoKey> {
  const keyData = new TextEncoder().encode(paystackSecretKey)
  return await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["verify"]
  )
}

serve(async (req) => {
  // Get the Paystack signature from headers
  const signature = req.headers.get("x-paystack-signature")
  if (!signature) {
    return new Response(JSON.stringify({ error: "Missing x-paystack-signature header" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    })
  }

  // Parse the request body as JSON; keep a raw copy for HMAC verification
  const rawBody = await req.clone().text()
  let eventData
  try {
    eventData = await req.json()
  } catch (e) {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    })
  }

  // Verify the signature using HMAC-SHA512
  const key = await getKey()
  const signatureBuffer = new Uint8Array(
    signature.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
  )
  
  const isValid = await crypto.subtle.verify(
    "HMAC",
    key,
    signatureBuffer,
    new TextEncoder().encode(rawBody)
  )

  if (!isValid) {
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    })
  }

  // Only process charge.success events
  if (eventData.event !== "charge.success") {
    return new Response(JSON.stringify({ received: true, message: "Event not charge.success" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  }

  const eventDataData = eventData?.data ?? {}
  const { data: payloadData = {}, metadata } = eventDataData

  if (!metadata || !metadata.userId) {
    return new Response(JSON.stringify({ error: "Missing userId in metadata" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    })
  }

  const userId = metadata.userId as string
  const customerEmail = payloadData.customer?.email ?? payloadData.customer?.customer_email ?? null

  // Verify that the customer email matches the user's email in the database
  const { data: farmerData, error: farmerError } = await supabase
    .from("farmers")
    .select("id, email")
    .eq("id", userId)
    .single()

  if (farmerError) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    })
  }

  // Strict 1-to-1 match: email from Paystack must match user's email in database
  if (customerEmail && farmerData.email !== customerEmail) {
    return new Response(JSON.stringify({ error: "Email mismatch: Paystack customer email does not match user's email" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    })
  }

  try {
    // Update the farmer's record
    const { error } = await supabase
      .from("farmers")
      .update({
        is_premium: true,
        subscription_date: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      throw error
    }

    return new Response(JSON.stringify({ received: true, message: "Farmer updated successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  } catch (err) {
    console.error("Error updating farmer:", err)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
})

// Helper function for constant time comparison to prevent timing attacks
function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}