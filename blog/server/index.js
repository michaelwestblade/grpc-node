const grpc = require('@grpc/grpc-js');
const serviceImpl = require('./service_impl');
const {BlogServiceService} = require('../proto/blog_grpc_pb');
const {MongoClient} = require('mongodb')

const addr = 'localhost:50051';

const uri = 'mongodb://root:root@localhost:27017/';
const mongoClient = new MongoClient(uri);

global.collection = undefined;

async function cleanup(server) {
  console.log("Cleanup");

  if (server) {
    await mongoClient.close();
    server.forceShutdown();
  }
}

async function main() {
  const server = new grpc.Server();
  const creds = grpc.ServerCredentials.createInsecure();

  process.on('SIGINT', () => {
    console.log('Caught interrupt signal');
    cleanup(server);
  })

  await mongoClient.connect();

  const database = mongoClient.db('blogdb');
  collection = database.collection('blog');

  server.addService(BlogServiceService, serviceImpl);
  server.bindAsync(addr, creds, (error, _) => {
    if (error) {
      return cleanup(server);
    }

    server.start();
  });

  console.log(`Listening on ${addr}`);
}

main().catch((cleanup));
