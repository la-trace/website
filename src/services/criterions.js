export const criterions = [
  {
    name: 'sport',
    type: 'enum',
    values: ['-', 'mountain bike', 'hiking / running', 'other']
  },
  {
    name: 'technical',
    type: 'star'
  },
  {
    name: 'landscape_quality',
    type: 'star'
  },
  {
    name: 'fun',
    type: 'star'
  },
  {
    name: 'physical',
    type: 'star'
  },
  {
    name: 'organized',
    type: 'enum',
    values: ['-', 'yes', 'no']
  },
  {
    name: 'average_duration',
    type: 'enum',
    values: ['-', '<1h', '1h', '2h', '3h', '4h', '5h', '>5h']
  }
]
