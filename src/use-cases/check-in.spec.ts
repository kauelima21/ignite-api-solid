import { expect, describe, it, beforeEach, afterEach, vi } from 'vitest'
import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { CheckInUseCase } from './check-in'
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { MaxDistanceReached } from './erros/max-distance-error'
import { MaxNumberOfCheckIns } from './erros/max-number-of-check-ins-error'

let checkInsRepository: InMemoryCheckInsRepository
let gymsRepository: InMemoryGymsRepository
let sut: CheckInUseCase

describe('Check In Use Case', () => {
  beforeEach(async () => {
    checkInsRepository = new InMemoryCheckInsRepository()
    gymsRepository = new InMemoryGymsRepository()
    sut = new CheckInUseCase(checkInsRepository, gymsRepository)
    vi.useFakeTimers()
    await gymsRepository.create({
      id: 'gym-id',
      title: 'my Gym',
      description: 'gym description',
      phone: '',
      latitude: 0,
      longitude: 0,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to check in', async () => {
    const { checkIn } = await sut.execute({
      gymId: 'gym-id',
      userId: 'id',
      userLatitude: 0,
      userLongitude: 0,
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })

  it('should not be able to check in twice on the same day', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0))

    await sut.execute({
      gymId: 'gym-id',
      userId: 'id',
      userLatitude: 0,
      userLongitude: 0,
    })

    await expect(async () => {
      await sut.execute({
        gymId: 'gym-id',
        userId: 'id',
        userLatitude: 0,
        userLongitude: 0,
      })
    }).rejects.toBeInstanceOf(MaxNumberOfCheckIns)
  })

  it('should be able to check in twice on different days', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0))

    const firstCheckIn = await sut.execute({
      gymId: 'gym-id',
      userId: 'id',
      userLatitude: 0,
      userLongitude: 0,
    })

    expect(firstCheckIn.checkIn.id).toEqual(expect.any(String))

    vi.setSystemTime(new Date(2022, 0, 21, 8, 0, 0))

    const { checkIn } = await sut.execute({
      gymId: 'gym-id',
      userId: 'id',
      userLatitude: 0,
      userLongitude: 0,
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })

  it('should not be able to check in on distant gym', async () => {
    gymsRepository.create({
      id: 'gym-id-1',
      title: 'my Gym',
      description: 'gym description',
      phone: '',
      latitude: 10,
      longitude: 10,
    })

    await expect(() =>
      sut.execute({
        gymId: 'gym-id-1',
        userId: 'id',
        userLatitude: 0,
        userLongitude: 0,
      }),
    ).rejects.toBeInstanceOf(MaxDistanceReached)
  })
})
