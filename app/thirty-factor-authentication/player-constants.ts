export enum PlayerIds {
  Biden,
  Mock,
}

export type Player = {
  name: string
  fullName: string
  birthCity: string
  zodiac: string
}

export const PlayerInformation: Record<PlayerIds, Player> = {
  [PlayerIds.Biden]: {
    name: 'Joe Biden',
    fullName: 'Joseph Robinette Biden Jr.',
    birthCity: 'scranton',
    zodiac: 'scorpio-taurus-sagittarius',
  },
  [PlayerIds.Mock]: {
    name: 'Connor Buchko',
    fullName: 'Connor Andrew Buchko',
    birthCity: 'winnipeg',
    zodiac: 'leo-leo-pisces',
  },
}
