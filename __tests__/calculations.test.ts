import { describe, it, expect } from 'vitest'
import {
    calculateWinRate,
    calculateProfitFactor,
    calculateExpectancy,
    calculateDrawdown,
    calculateNetPnL,
    calculateAverageWin,
    calculateAverageLoss,
    calculatePerformanceScore,
} from '../lib/calculations'

// ── Helpers ────────────────────────────────────────────────────────
const trade = (profit_usd: number) => ({
    profit_usd,
    trade_date: '2024-01-01',
    created_at: new Date().toISOString(),
})

const win = (n: number) => trade(Math.abs(n))
const loss = (n: number) => trade(-Math.abs(n))
const be = () => trade(0)

// ── calculateWinRate ───────────────────────────────────────────────
describe('calculateWinRate', () => {
    it('returns 0 for empty array', () => {
        expect(calculateWinRate([])).toBe(0)
    })
    it('returns 100 for all winners', () => {
        expect(calculateWinRate([win(10), win(20), win(5)])).toBe(100)
    })
    it('returns 0 for all losers', () => {
        expect(calculateWinRate([loss(10), loss(5), loss(15)])).toBe(0)
    })
    it('calculates correctly for mixed trades', () => {
        // 2 wins, 2 losses — 50% decisive win rate
        expect(calculateWinRate([win(10), win(20), loss(5), loss(15)])).toBe(50)
    })
    it('excludes breakeven trades from win rate calculation', () => {
        // 2 wins, 1 loss, 2 breakevens → 66.66...% (not 40%)
        const result = calculateWinRate([win(10), win(20), loss(5), be(), be()])
        expect(result).toBeCloseTo(66.67, 0)
    })
    it('returns 0 when only breakeven trades', () => {
        expect(calculateWinRate([be(), be()])).toBe(0)
    })
})

// ── calculateProfitFactor ─────────────────────────────────────────
describe('calculateProfitFactor', () => {
    it('returns 0 for empty array', () => {
        expect(calculateProfitFactor([])).toBe(0)
    })
    it('returns Infinity when all trades are winners (no losses)', () => {
        expect(calculateProfitFactor([win(10), win(20)])).toBe(Infinity)
    })
    it('returns 0 when no wins but losses exist', () => {
        expect(calculateProfitFactor([loss(10), loss(5)])).toBe(0)
    })
    it('calculates correctly for mixed trades', () => {
        // gross profit=30, gross loss=10 → PF = 3
        expect(calculateProfitFactor([win(30), loss(10)])).toBe(3)
    })
    it('handles breakeven trades gracefully', () => {
        // BE trades contribute 0 to both sides
        const pf = calculateProfitFactor([win(30), loss(10), be()])
        expect(pf).toBe(3)
    })
})

// ── calculateExpectancy ───────────────────────────────────────────
describe('calculateExpectancy', () => {
    it('returns 0 for empty array', () => {
        expect(calculateExpectancy([])).toBe(0)
    })
    it('calculates positive expectancy', () => {
        // win rate=0.5, avgWin=20, lossRate=0.5, avgLoss=10 → 0.5*20 - 0.5*10 = 5
        const result = calculateExpectancy([win(20), loss(10)])
        expect(result).toBe(5)
    })
    it('calculates negative expectancy', () => {
        const result = calculateExpectancy([win(5), loss(20)])
        expect(result).toBe(-7.5)
    })
})

// ── calculateDrawdown ──────────────────────────────────────────────
describe('calculateDrawdown', () => {
    it('returns 0 for empty array', () => {
        expect(calculateDrawdown([])).toBe(0)
    })
    it('returns 0 for all-winning trades (no drawdown)', () => {
        const trades = [
            { profit_usd: 10, trade_date: '2024-01-01', created_at: '' },
            { profit_usd: 20, trade_date: '2024-01-02', created_at: '' },
        ]
        expect(calculateDrawdown(trades)).toBe(0)
    })
    it('correctly calculates maximum drawdown', () => {
        // equity goes 10, 30, 20, 25 → peak=30, min trough=20 → drawdown=10
        const trades = [
            { profit_usd: 10, trade_date: '2024-01-01', created_at: '' },
            { profit_usd: 20, trade_date: '2024-01-02', created_at: '' },
            { profit_usd: -10, trade_date: '2024-01-03', created_at: '' },
            { profit_usd: 5, trade_date: '2024-01-04', created_at: '' },
        ]
        expect(calculateDrawdown(trades)).toBe(10)
    })
})

// ── calculateNetPnL ───────────────────────────────────────────────
describe('calculateNetPnL', () => {
    it('returns 0 for empty array', () => {
        expect(calculateNetPnL([])).toBe(0)
    })
    it('sums all profit correctly', () => {
        expect(calculateNetPnL([win(10), win(20), loss(5)])).toBe(25)
    })
    it('handles all losses', () => {
        expect(calculateNetPnL([loss(10), loss(5)])).toBe(-15)
    })
    it('treats missing profit_usd as 0', () => {
        expect(calculateNetPnL([{ profit_usd: null }, { profit_usd: 10 }] as any[])).toBe(10)
    })
})

// ── calculateAverageWin ────────────────────────────────────────────
describe('calculateAverageWin', () => {
    it('returns 0 when no winning trades', () => {
        expect(calculateAverageWin([loss(10), loss(5)])).toBe(0)
    })
    it('computes average win', () => {
        expect(calculateAverageWin([win(10), win(20), loss(5)])).toBe(15)
    })
})

// ── calculateAverageLoss ───────────────────────────────────────────
describe('calculateAverageLoss', () => {
    it('returns 0 when no losing trades', () => {
        expect(calculateAverageLoss([win(10), win(5)])).toBe(0)
    })
    it('computes average loss (negative value)', () => {
        expect(calculateAverageLoss([win(10), loss(10), loss(20)])).toBe(-15)
    })
})

// ── calculatePerformanceScore ─────────────────────────────────────
describe('calculatePerformanceScore', () => {
    it('returns a score between 0 and 100', () => {
        const score = calculatePerformanceScore({
            winRate: 60,
            profitFactor: 2,
            consistency: 70,
            rrRatio: 1.5,
            tradeCount: 20,
        })
        expect(score).toBeGreaterThanOrEqual(0)
        expect(score).toBeLessThanOrEqual(100)
    })
    it('applies penalty below 5 trades', () => {
        const base = calculatePerformanceScore({
            winRate: 60, profitFactor: 2, consistency: 70, rrRatio: 1.5, tradeCount: 10
        })
        const penalised = calculatePerformanceScore({
            winRate: 60, profitFactor: 2, consistency: 70, rrRatio: 1.5, tradeCount: 3
        })
        expect(penalised).toBeLessThan(base)
    })
    it('applies 80% penalty for 5-9 trades vs ≥10', () => {
        const full = calculatePerformanceScore({
            winRate: 60, profitFactor: 2, consistency: 70, rrRatio: 1.5, tradeCount: 10
        })
        const partial = calculatePerformanceScore({
            winRate: 60, profitFactor: 2, consistency: 70, rrRatio: 1.5, tradeCount: 7
        })
        expect(partial).toBeLessThan(full)
    })
    it('returns 0 for zero stats', () => {
        expect(calculatePerformanceScore({
            winRate: 0, profitFactor: 0, consistency: 0, rrRatio: 0, tradeCount: 0
        })).toBe(0)
    })
})
