import { StrapiUserPermissionsPlugin } from '@strapi/strapi'; // se hai i tipi
export default ({ env }) => ({
  'users-permissions': {
    config: {
      jwtSecret: env('JWT_SECRET'),
    },
  },
} as StrapiUserPermissionsPlugin);

