import { expect, describe, it, beforeEach } from 'vitest'
import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { FetchUserCheckInsHistoryUseCase } from './fetch-user-check-ins-history'
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { SearchGymsUseCase } from './search-gyms'

let gymsRepository: InMemoryGymsRepository
let sut: SearchGymsUseCase

describe('Search Gyms Use Case', () => {
  beforeEach(async () => {
    gymsRepository = new InMemoryGymsRepository()
    sut = new SearchGymsUseCase(gymsRepository)
  })

  it('should be able to search for gyms', async () => {
    await gymsRepository.create({
      title: 'First Gym',
      phone: null,
      description: null,
      latitude: 0,
      longitude: 0,
    })

    await gymsRepository.create({
      title: 'Second Gym',
      phone: null,
      description: null,
      latitude: 0,
      longitude: 0,
    })

    const { gyms } = await sut.execute({
      query: 'Gym',
      page: 1,
    })

    expect(gyms).toHaveLength(2)
    expect(gyms).toEqual([
      expect.objectContaining({ title: 'First Gym' }),
      expect.objectContaining({ title: 'Second Gym' }),
    ])
  })

  it('should be able to search paginated gyms', async () => {
    for (let i = 1; i <= 22; i++) {
      await gymsRepository.create({
        title: `My Gym ${i}`,
        phone: null,
        description: null,
        latitude: 0,
        longitude: 0,
      })
    }

    const { gyms } = await sut.execute({
      query: 'Gym',
      page: 2,
    })

    expect(gyms).toHaveLength(2)
    expect(gyms).toEqual([
      expect.objectContaining({ title: 'My Gym 21' }),
      expect.objectContaining({ title: 'My Gym 22' }),
    ])
  })
})
