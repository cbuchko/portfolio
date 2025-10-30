export enum PlayerIds {
  Biden,
  Mock,
}

export type Player = {
  name: string
  fullName: string
  birthCity: string
  zodiac: string
  taxReturn: {
    lastName: string
    firstName: string
    dob: string
  }
}

export const PlayerInformation: Record<PlayerIds, Player> = {
  [PlayerIds.Biden]: {
    name: 'Joe Biden',
    fullName: 'Joseph Robinette Biden Jr.',
    birthCity: 'scranton',
    zodiac: 'scorpio-taurus-sagittarius',
    taxReturn: {
      lastName: 'Biden',
      firstName: 'Joseph R',
      dob: '1942/11/20',
    },
  },
  [PlayerIds.Mock]: {
    name: 'Connor Buchko',
    fullName: 'Connor Andrew Buchko',
    birthCity: 'winnipeg',
    zodiac: 'leo-leo-pisces',
    taxReturn: {
      lastName: 'Buchko',
      firstName: 'Connor A',
      dob: '1999/07/31',
    },
  },
}
