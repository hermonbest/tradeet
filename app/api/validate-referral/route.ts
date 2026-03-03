import { NextResponse } from 'next/server'
import { validateReferralCode } from '@/lib/affiliate'

export async function POST(request: Request) {
    try {
        const { code } = await request.json()
        const result = await validateReferralCode(code)
        return NextResponse.json(result)
    } catch (err) {
        console.error('validate-referral API error', err)
        return NextResponse.json({ valid: false, isInfluencer: false, discountAmount: 0, finalPrice: 0, message: 'Internal error' }, { status: 500 })
    }
}
