# Pray Time!

A library that offers a fluent and intuitive API for calculating Islamic prayer
times. It does one thing and does it well.

## Installation

For now it is published only on [JSR](https://jsr.io/@duesabati/pray-time).

```bash
deno add jsr:@duesabati/pray-time
```

## Features

- [x] Fluent API
- [x] Timezone support
- [x] Support for most widely used calculation methods
- [x] Supports Maghrib offset
- [x] Supports Asr shadow length

## Usage

It offers two ways to calculate prayer times:

Create and configure a Prayer.Time instance and then apply the `Of` method to
the desired Prayer class

```typescript
import * as Prayer from '@duesabati/pray-time'

const TODAY = new Date()
const MILANO: [number, number] = [45.4613, 9.1595]
const CET = 60

const time = Prayer.Time.For(TODAY).At(MILANO).InTimezone(CET)

const fajr = time.Of(Prayer.Fajr).Time.Clock

console.log(fajr) // Output: 05:39
```

Or use directly a Prayer class using the same API:

```typescript
import * as Prayer from '@duesabati/pray-time'

const TODAY = new Date()
const MILANO: [number, number] = [45.4613, 9.1595]
const CET = 60

const fajr = Prayer.Fajr.For(TODAY).At(MILANO).InTimezone(CET).Using(Method.MWL)

console.log(fajr.Time.Clock) // Output: 05:39
```

That's it!

## Development

Upcoming features:

- [ ] Automatic timezone values i.e. instead of accepting an offset in minutes,
      one could provide a timezone string (e.g. "Europe/Rome") and the library
      would automatically determine the offset, using the IANA Time Zone
      Database.

## Contributing and requests

If you have suggestions for new features or improvements, please open an issue
or submit a pull request. Contributions are welcome!

But beware that I'd like to keep the API surface and scope minimal.

---

Praise be to God, the Lord of the worlds.
