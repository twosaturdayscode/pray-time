import { FormattedHours, Sun } from '@duesabati/sundial'
import { AsrFactor, Method } from './concepts.ts'

type ClassOf<T, A> = new (...args: A[]) => T

interface Config {
  date?: Date
  location?: [number, number]
  timezone?: number
  method?: Method
  maghribOffset?: number
  asrFactor?: AsrFactor
}

export class Time {
  protected date: Date = new Date()
  protected location: [number, number] = [0, 0]
  protected timezone: number = 0
  protected method: Method = Method.MWL
  protected maghribOffset: number = 0
  protected asrFactor: AsrFactor = AsrFactor.One

  constructor(config: Config = {}) {
    this.date = config.date ?? this.date
    this.location = config.location ?? this.location
    this.timezone = config.timezone ?? this.timezone
    this.method = config.method ?? this.method
    this.maghribOffset = config.maghribOffset ?? this.maghribOffset
    this.asrFactor = config.asrFactor ?? this.asrFactor
  }

  static For<T extends Time>(this: ClassOf<T, Config>, date: Date): T {
    return new this({ date })
  }

  static At<T extends Time>(
    this: ClassOf<T, Config>,
    location: [number, number],
  ): T {
    return new this({ location })
  }

  static InTimezone<T extends Time>(
    this: ClassOf<T, Config>,
    timezone: number,
  ): T {
    return new this({ timezone })
  }

  static Using<T extends Time>(this: ClassOf<T, Config>, method: Method): T {
    return new this({ method })
  }

  At<T extends Time>(this: T, location: [number, number]): T {
    return new (this.constructor as ClassOf<T, Config>)({
      ...this.config,
      location,
    })
  }

  InTimezone<T extends Time>(this: T, timezone: number): T {
    return new (this.constructor as ClassOf<T, Config>)({
      ...this.config,
      timezone,
    })
  }

  Using<T extends Time>(this: T, method: Method): T {
    return new (this.constructor as ClassOf<T, Config>)({
      ...this.config,
      method,
    })
  }

  MaghribOffsetBy<T extends Time>(this: T, minutes: number): T {
    return new (this.constructor as ClassOf<T, Config>)({
      ...this.config,
      maghribOffset: minutes,
    })
  }

  WithAsrFactor<T extends Time>(this: T, ratio: AsrFactor): T {
    return new (this.constructor as ClassOf<T, Config>)({
      ...this.config,
      asrFactor: ratio,
    })
  }

  protected get config(): Config {
    return {
      date: this.date,
      location: this.location,
      timezone: this.timezone,
      method: this.method,
      maghribOffset: this.maghribOffset,
      asrFactor: this.asrFactor,
    }
  }

  protected get sun(): { times: Sun.Times; angle: Sun.Angle } {
    return {
      times: Sun.Times.On(this.date).At(...this.location),
      angle: Sun.Angle.On(this.date, [this.location[0]]),
    }
  }

  Of<P extends Time>(prayer: { new (config?: Config): P }): P {
    return new prayer(this.config)
  }

  get All(): [Fajr, Dhuhr, Asr, Maghrib, Isha] {
    return [
      new Fajr(this.config),
      new Dhuhr(this.config),
      new Asr(this.config),
      new Maghrib(this.config),
      new Isha(this.config),
    ] as const
  }

  get Remaining(): ReadonlyArray<Fajr | Dhuhr | Asr | Maghrib | Isha> {
    return this.All.filter((prayer) =>
      new Date(this.date).setHours(0, 0, 0, 0) +
          prayer.Time.Milliseconds > this.date.getTime()
    )
  }

  get Upcoming(): Fajr | Dhuhr | Asr | Maghrib | Isha | undefined {
    return this.Remaining.at(0)
  }

  get Past(): ReadonlyArray<Fajr | Dhuhr | Asr | Maghrib | Isha> {
    return this.All.filter((prayer) =>
      new Date(this.date).setHours(0, 0, 0, 0) +
          prayer.Time.Milliseconds < this.date.getTime()
    )
  }

  get Previous(): Fajr | Dhuhr | Asr | Maghrib | Isha | undefined {
    return this.Past.at(-1)
  }
}

export class Fajr extends Time {
  get Time(): FormattedHours {
    const angle = this.ChosenAngle

    const h = this.sun.times.Noon.Hours -
      this.sun.angle.HourAt(angle) / 15 +
      this.timezone / 60

    return FormattedHours.FromDecimal(h)
  }

  // deno-lint-ignore getter-return
  get ChosenAngle(): number {
    switch (this.method) {
      case Method.ISNA:
        return 15
      case Method.EGYPT:
        return 19.5
      case Method.MAKKAH:
        return 18.5
      case Method.KARACHI:
        return 18
      case Method.TEHRAN:
        return 17.7
      case Method.MWL:
      default:
        return 18
    }
  }
}

export class Dhuhr extends Time {
  get Time(): FormattedHours {
    const h = this.sun.times.Noon.Hours + this.timezone / 60

    return FormattedHours.FromDecimal(h)
  }
}

export class Asr extends Time {
  get Time(): FormattedHours {
    const angle = this.sun.angle.AtShadow(this.asrFactor)
    const h = this.sun.times.Noon.Hours + angle / 15 + this.timezone / 60

    return FormattedHours.FromDecimal(h)
  }
}

export class Maghrib extends Time {
  get Time(): FormattedHours {
    const h = this.sun.times.Sunset.Hours + this.timezone / 60 +
      this.maghribOffset / 60

    return FormattedHours.FromDecimal(h)
  }
}

export class Isha extends Time {
  get Time(): FormattedHours {
    if (this.method === Method.MAKKAH) {
      const h = this.sun.times.Noon.Hours + this.timezone / 60 + 90 / 60

      return FormattedHours.FromDecimal(h)
    }

    const angle = this.ChosenAngle

    const h = this.sun.times.Noon.Hours + this.timezone / 60 +
      this.sun.angle.HourAt(angle) / 15

    return FormattedHours.FromDecimal(h)
  }

  // deno-lint-ignore getter-return
  get ChosenAngle(): number {
    switch (this.method) {
      case Method.ISNA:
        return 15
      case Method.EGYPT:
        return 17.5
      case Method.KARACHI:
        return 18
      case Method.TEHRAN:
        return 14
      case Method.MWL:
      default:
        return 17
    }
  }
}
