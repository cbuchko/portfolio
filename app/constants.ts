import { NovaProjectProps } from './components/NovaProject'
import { ProjectProps } from './components/Project'

export const NovaProjects: NovaProjectProps[] = [
  {
    title: 'PDF Generator',
    points: [
      'Converts map layers to a georeferenced PDF export with QGIS',
      'Multiple size, layout and orientation options',
      'Add or remove items to the legend',
      'Shareable with QR Code',
    ],
    imageUrl: '/projects/pdf.png',
  },
  {
    title: 'Workspace File Manager',
    points: [
      'Google drive inspired file manager',
      'Create workspaces, folders and projects',
      'Reorganize files in any way needed',
    ],
    imageUrl: '/projects/workspace.png',
  },
  {
    title: 'Map Annotations',
    points: [
      'Side Panel interface for management of map layers',
      'Place icons, draw lines or write text',
      'Group map layers for easy organization',
      'CRUD controls for all layer types',
    ],
    imageUrl: '/projects/layers.png',
  },
  {
    title: 'Collaborative Permissions',
    points: [
      'Email invitations for collaborating in Nova',
      'Role based access for restricting actions',
      'Secured API routes to prevent permission breaching',
      'Share specific folders or projects directly',
    ],
    imageUrl: '/projects/permissions.png',
  },
  {
    title: 'User Onboarding',
    points: [
      'Redesigned onboarding with a sleek look',
      'Registers users through AWS Cognito',
      'Sends temporary password to verify email',
      'Increased user conversions by 400%',
    ],
    imageUrl: '/projects/onboarding.png',
  },
  {
    title: 'Stripe Payments',
    points: [
      'Integrated the Stripe API',
      'Added data usage tracking',
      'Restricted app after usage was exceeded',
      'Worked with Sales to accomodate their workflows',
    ],
    imageUrl: '/projects/payment.png',
  },
]

export const Projects: ProjectProps[] = [
  {
    img: '/mazegamestatic.PNG',
    body: 'A procedural maze solving game made with C# and Unity. Playable on itch.io.',
    link: 'https://cbuchko.itch.io/maze-game',
  },
  {
    img: '/motherload.PNG',
    body: 'My first published Unity project: a mining arcade game. Playable on itch.io.',
    link: 'https://cbuchko.itch.io/drillgame',
  },
]
