'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { submitPayment } from '@/app/(dashboard)/actions'
import { createClient } from '@/utils/supabase/client'
import { Check, Upload } from 'lucide-react'
import { formatPrice } from '@/lib/constants'

interface PaymentFormProps {
    amount: number
    referralCode?: string
}

export function PaymentForm({ amount, referralCode }: PaymentFormProps) {
    const [phone, setPhone] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file || !phone) return alert('Phone number and receipt screenshot are required')

        setLoading(true)

        // Diagnostic: List buckets to see what's visible
        const { data: buckets, error: listError } = await supabase.storage.listBuckets()
        console.log('Available buckets:', buckets, 'List error:', listError)

        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `receipts/${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('payments')
            .upload(filePath, file)

        if (uploadError) {
            let message = uploadError.message
            if (message.includes('Bucket not found')) {
                message = "Storage Bucket 'payments' not found. Please create it in your Supabase Dashboard -> Storage and set it to Public."
            }
            alert('Error: ' + message)
            setLoading(false)
            return
        }

        const { data: publicData } = supabase.storage.from('payments').getPublicUrl(filePath)

        const result = await submitPayment({
            phone_number: phone,
            screenshot_url: publicData.publicUrl,
            amount: amount,
            referral_code: referralCode
        })

        if (!result.success) {
            alert(result.error || 'An error occurred while submitting payment.')
        } else {
            setSuccess(true)
        }

        setLoading(false)
    }

    if (success) {
        return (
            <div className="tradeet-card p-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#22c55e]/20 flex items-center justify-center mx-auto">
                    <Check className="w-7 h-7 text-[#22c55e]" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Request Submitted!</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                    We are reviewing your payment receipt. Your account will be automatically upgraded to Pro within 24 hours.
                </p>
                {referralCode && (
                    <p className="text-xs text-[#22c55e]">
                        Referral code <strong>{referralCode}</strong> has been recorded.
                    </p>
                )}
            </div>
        )
    }

    return (
        <div className="tradeet-card p-6 space-y-5">
            <div>
                <h3 className="font-semibold text-foreground">Payment Details</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                    Amount to pay: <strong className="text-primary">{formatPrice(amount)}</strong>
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label className="stat-label">Your Phone Number</Label>
                    <Input
                        type="tel"
                        placeholder="e.g. 0911 234 567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="bg-background border-border"
                    />
                    <p className="text-xs text-muted-foreground">The number you used to make the transfer.</p>
                </div>

                <div className="space-y-2">
                    <Label className="stat-label">Payment Screenshot</Label>
                    <div className={`border-2 border-dashed rounded-xl p-4 transition-colors ${file ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/30'}`}>
                        <label htmlFor="receipt-upload" className="flex flex-col items-center gap-2 cursor-pointer">
                            {file ? (
                                <>
                                    <Check className="w-6 h-6 text-primary" />
                                    <span className="text-sm text-primary font-medium truncate max-w-full">{file.name}</span>
                                    <span className="text-xs text-muted-foreground">Click to change</span>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-6 h-6 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Click to upload receipt</span>
                                    <span className="text-xs text-muted-foreground">PNG, JPG, JPEG accepted</span>
                                </>
                            )}
                        </label>
                        <input
                            id="receipt-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/25"
                    disabled={loading || !file || !phone}
                >
                    {loading ? 'Uploading...' : `⚡ Submit Payment (${formatPrice(amount)})`}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                    We verify manually within 24 hours. No automated system.
                </p>
            </form>
        </div>
    )
}
