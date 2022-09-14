const grpc = require('@grpc/grpc-js');
const {BlogServiceClient} = require('../proto/blog_grpc_pb');

function main() {
  const creds = grpc.ChannelCredentials.createInsecure();
  const client = new BlogServiceClient('localhost:50051', creds);
  client.close();
}

main();
