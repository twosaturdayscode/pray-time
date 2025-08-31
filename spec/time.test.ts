import { expect } from 'jsr:@std/expect'

import { FormattedHours, Sun } from '@duesabati/sundial'

import { Method } from '../src/concepts.ts'
import * as Prayer from '../src/time.ts'

const REFERENCE_DAY = new Date('2025-02-19T16:31:00Z')
const MILANO: [number, number] = [45.4613, 9.1595]
const CET = 60

/**
 * Reference values from https://www.edarabia.com/prayer-times-milan/?date=2025-02-19
 * Calculation Method: Muslim World League
 * Location: Milan, Italy (45.4613°N, 9.1595°E)
 * Timezone: UTC+1 (Central European Time)
 */
const reference = {
  fajr: '05:39',
  sunrise: '07:18',
  dhuhr: '12:37',
  sunset: '17:56',
  maghrib: '17:56',
  ishaa: '19:29',
  asr: '15:27',
}

const PrayerTime = Prayer.Time.For(REFERENCE_DAY).At(MILANO).InTimezone(CET)
  .Using(Method.MWL)

Deno.test('Fajr', () => {
  const fajr = PrayerTime.Of(Prayer.Fajr)

  expect(fajr.Time.Clock).toBe(reference.fajr)
})

Deno.test('Sunrise', () => {
  const sunrise = Sun.Times.On(REFERENCE_DAY).At(...MILANO).Sunrise

  const adjusted = sunrise.Hours + 1 // 1h timezone offset
  expect(FormattedHours.FromDecimal(adjusted).Clock).toBe(
    reference.sunrise,
  )
})

Deno.test('Dhuhr', () => {
  const dhuhr = PrayerTime.Of(Prayer.Dhuhr)

  expect(dhuhr.Time.Clock).toBe(reference.dhuhr)
})

Deno.test('Asr', () => {
  const asr = PrayerTime.Of(Prayer.Asr)

  expect(asr.Time.Clock).toBe(reference.asr)
})

Deno.test('Maghrib', () => {
  const maghrib = PrayerTime.Of(Prayer.Maghrib)

  expect(maghrib.Time.Clock).toBe(reference.maghrib)
})

Deno.test('Isha', () => {
  const isha = PrayerTime.Of(Prayer.Isha)

  expect(isha.Time.Clock).toBe(reference.ishaa)
})

Deno.test('Fajr fluent', () => {
  const fajr = Prayer.Fajr.For(REFERENCE_DAY).At(MILANO).InTimezone(60)
    .Using(Method.MWL)

  expect(fajr.Time.Clock).toBe(reference.fajr)
})

Deno.test('Generic time', () => {
  const time = Prayer.Time.For(REFERENCE_DAY).At(MILANO).InTimezone(60)
    .Using(Method.MWL)

  expect(time.Of(Prayer.Dhuhr).Time.Clock).toBe(reference.dhuhr)
})
