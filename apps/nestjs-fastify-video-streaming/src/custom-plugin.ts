import * as fastify from 'fastify';
const fastifyCustomPlugin = (instance: fastify.FastifyInstance, options: fastify.FastifyPluginAsync, done) => {
  // here create a response decorator to make sure that all responses have 'app-name' sent along
  instance.addHook('onResponse', async (req, res) => {
    console.log('inside custom plugin');
    res.headers['hook-header-name'] = 'App';
  });
  done();
};

export default fastifyCustomPlugin;
