const config = {
  env: process.env.NODE_ENV || 'dev',
  port: parseInt(process.env.PORT, 10) || 3000,
  username: process.env.USERNAME,
  password: process.env.PASSWORD
};

export default config;
