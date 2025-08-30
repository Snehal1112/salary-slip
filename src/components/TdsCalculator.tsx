import React, { useEffect, useState } from 'react'
import { Box, TextField, MenuItem, FormControlLabel, Switch, Select, InputLabel, FormControl, Button } from '@mui/material'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import type { LineItem } from '../features/salary/types'
import { estimateAnnualTax, annualToMonthly } from '../utils/tax'
import { computeProfessionalTax } from '../utils/professionalTax'
import { setDeductions } from '../features/salary/salarySlice'

const states = ['Gujarat', 'Maharashtra', 'Karnataka', 'Delhi', 'Tamil Nadu']

const TdsCalculator: React.FC = React.memo(() => {
  const dispatch = useAppDispatch()
  const current = useAppSelector((s) => s.salary.current)

  const gross: number = current.totalIncome || (current.income || []).reduce((s: number, i: { amount?: number }) => s + (Number(i.amount) || 0), 0)

  const [regime, setRegime] = useState<'old' | 'new'>('old')
  const [annual80C, setAnnual80C] = useState(0)
  const [annual80D, setAnnual80D] = useState(0)
  const [hraExemption, setHraExemption] = useState(0)
  const [stateName, setStateName] = useState('Gujarat')
  const [applyESI, setApplyESI] = useState(false)

  useEffect(() => {
    // compute employee PF from income (Basic Salary)
    const basicItem = (current.income || []).find((it: LineItem) => /basic/i.test(it.particular))
    const basic = basicItem ? Number(basicItem.amount) || 0 : Math.round(gross * 0.5)
    const employeePF = Math.round(basic * 0.12)

    const annualGross = gross * 12
    const stdDeduction = 50000
    const annualTaxable = Math.max(0, annualGross - stdDeduction - annual80C - annual80D - hraExemption - employeePF)
    const annualTax = estimateAnnualTax(annualTaxable, regime)
    const monthlyTDS = annualToMonthly(annualTax)

    // Professional tax
    const professionalTax = computeProfessionalTax(stateName, gross)

    // ESI: compute if opted and threshold
    const esiThreshold = 21000
    const esiEmployee = applyESI && gross <= esiThreshold ? Math.round(gross * 0.0075) : 0

    // Build new deductions array based on existing deductions, replacing TDS, PT, ESI values
    const newDeductions: LineItem[] = (current.deductions || []).map((d: LineItem) => {
      const key = d.particular.toLowerCase()
      if (key.includes('tds')) return { particular: 'TDS', amount: monthlyTDS }
      if (key.includes('professional tax') || key.includes('prof')) return { particular: 'Professional Tax', amount: professionalTax }
      if (key.includes('esi')) return { particular: 'ESI', amount: esiEmployee }
      if (key.includes('pf')) return d
      return d
    })

    // ensure TDS present
    if (!newDeductions.some((d: LineItem) => /tds/i.test(d.particular))) {
      newDeductions.push({ particular: 'TDS', amount: monthlyTDS })
    }
    if (!newDeductions.some((d: LineItem) => /professional tax/i.test(d.particular))) {
      newDeductions.push({ particular: 'Professional Tax', amount: professionalTax })
    }
    if (esiEmployee && !newDeductions.some((d: LineItem) => /esi/i.test(d.particular))) {
      newDeductions.push({ particular: 'ESI', amount: esiEmployee })
    }

    dispatch(setDeductions(newDeductions))
  }, [regime, annual80C, annual80D, hraExemption, stateName, applyESI, current.income, current.deductions, current.totalIncome, gross, dispatch])

  return (
    <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
      <FormControl sx={{ minWidth: 140 }} size="small">
        <InputLabel>Tax Regime</InputLabel>
        <Select value={regime} label="Tax Regime" onChange={(e) => setRegime(e.target.value as 'old' | 'new')}>
          <MenuItem value="old">Old</MenuItem>
          <MenuItem value="new">New</MenuItem>
        </Select>
      </FormControl>

      <TextField label="80C (annual)" size="small" type="number" value={annual80C} onChange={(e) => setAnnual80C(Number(e.target.value || 0))} sx={{ width: 140 }} />
      <TextField label="80D (annual)" size="small" type="number" value={annual80D} onChange={(e) => setAnnual80D(Number(e.target.value || 0))} sx={{ width: 140 }} />
      <TextField label="HRA exempt (annual)" size="small" type="number" value={hraExemption} onChange={(e) => setHraExemption(Number(e.target.value || 0))} sx={{ width: 160 }} />

      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel>State (PT)</InputLabel>
        <Select value={stateName} label="State (PT)" onChange={(e) => setStateName(e.target.value)}>
          {states.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </Select>
      </FormControl>

      <FormControlLabel control={<Switch checked={applyESI} onChange={(e) => setApplyESI(e.target.checked)} />} label="Auto ESI" />

      <Button variant="outlined" onClick={() => {
        // quick reset
        setAnnual80C(0); setAnnual80D(0); setHraExemption(0); setRegime('old'); setApplyESI(false)
      }}>Reset</Button>
    </Box>
  )
});

TdsCalculator.displayName = 'TdsCalculator';

export default TdsCalculator
